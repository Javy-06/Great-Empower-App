import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ENGINE2_TECHNICAL_LIMITS,
  calculateEngine2Claim,
  validateEngine2Request,
  type Engine2Failure,
  type Engine2PublicRequest,
  type Engine2Success,
} from './engine-2.ts'

function gatedRequest(): Engine2PublicRequest {
  return {
    calculation_mode: 'GENERIC_EDUCATIONAL',
    engine_id: 'E2',
    engine_version: '2.0.0-prototype',
    scenario_id: 'test-gated',
    as_of_date: '2026-11-22',
    currency: 'MYR',
    inputs: {
      total_bill_myr: '1000.00',
      charge_lines: [{ line_id: 'line-1', amount_myr: '1000.00', category: 'hospital', eligibility: 'ELIGIBLE_ASSUMED' }],
      coverage_gate: 'APPLY_WAITING_PERIOD',
      care_setting: 'INPATIENT',
      employer_coordination: { path: 'GATED', external_employer_confirmed_payment_myr: '125.50' },
    },
    assumptions: [],
  }
}

function nonGatedRequest(): Engine2PublicRequest {
  const request = gatedRequest()
  request.scenario_id = 'test-non-gated'
  request.inputs.coverage_gate = 'PROCEED_WITHOUT_GATE_ASSUMPTION'
  request.inputs.employer_coordination = {
    path: 'NON_GATED', employer_scenario_max_myr: '0.00', employer_reduces_deductible: false,
    deductible_remaining_myr: '0.00',
  }
  Object.assign(request.inputs, {
    r_and_b: { mode: 'NOT_MODELED' },
    sub_limits: [],
    room_upgrade: { mode: 'EXCESS_ONLY' },
    cost_sharing_order: 'DEDUCTIBLE_FIRST',
    share_components: { co_payment: { rate: '0.2', cap: 'NO_CAP' }, co_insurance: null },
    exemption: 'NONE',
    limits: { annual: { status: 'NO_LIMIT' }, lifetime: { status: 'NO_LIMIT' } },
  })
  return request
}

type CalculationOptions = {
  bill?: string
  eligible?: string
  nonEligible?: string
  employer?: string
  employerCredit?: boolean
  deductible?: string
  shareType?: 'CO_PAYMENT' | 'CO_INSURANCE'
  rate?: string
  order?: 'DEDUCTIBLE_FIRST' | 'COPAY_FIRST'
  exemption?: 'NONE' | 'EXEMPT_SELECTED_COPAY_ONLY' | 'EXEMPT_COPAY_AND_DEDUCTIBLE_AS_ASSUMPTION'
  annual?: { status: 'NO_LIMIT' } | { status: 'MODELED'; remaining_amount_myr: string }
  lifetime?: { status: 'NO_LIMIT' } | { status: 'MODELED'; remaining_amount_myr: string }
  gate?: 'APPLY_WAITING_PERIOD' | 'APPLY_EXCLUSION'
  externalPayment?: string
}

function calculationRequest(options: CalculationOptions = {}): Record<string, any> {
  const request = nonGatedRequest() as unknown as Record<string, any>
  const bill = BigInt(options.bill ?? '100000')
  const nonEligible = BigInt(options.nonEligible ?? '0')
  const eligible = BigInt(options.eligible ?? (bill - nonEligible).toString())
  request.inputs.total_bill_myr = myrFromSen(bill)
  request.inputs.charge_lines = [
    { line_id: 'eligible', amount_myr: myrFromSen(eligible), category: 'medical', eligibility: 'ELIGIBLE_ASSUMED' },
    ...(nonEligible > 0n ? [{ line_id: 'noneligible', amount_myr: myrFromSen(nonEligible), category: 'other', eligibility: 'NON_ELIGIBLE_ASSUMED' }] : []),
  ]
  if (options.gate) {
    request.inputs.coverage_gate = options.gate
    request.inputs.employer_coordination = {
      path: 'GATED', external_employer_confirmed_payment_myr: myrFromSen(BigInt(options.externalPayment ?? '0')),
    }
    for (const field of ['r_and_b', 'sub_limits', 'room_upgrade', 'cost_sharing_order', 'share_components', 'exemption', 'limits']) {
      delete request.inputs[field]
    }
  } else {
    request.inputs.employer_coordination = {
      path: 'NON_GATED',
      employer_scenario_max_myr: myrFromSen(BigInt(options.employer ?? '0')),
      employer_reduces_deductible: options.employerCredit ?? false,
      deductible_remaining_myr: myrFromSen(BigInt(options.deductible ?? '0')),
    }
    request.inputs.cost_sharing_order = options.order ?? 'DEDUCTIBLE_FIRST'
    request.inputs.exemption = options.exemption ?? 'NONE'
    const shareType = options.shareType ?? 'CO_INSURANCE'
    const component = { rate: options.rate ?? '0', cap: 'NO_CAP' }
    request.inputs.share_components = {
      co_payment: shareType === 'CO_PAYMENT' ? component : null,
      co_insurance: shareType === 'CO_INSURANCE' ? component : null,
    }
    request.inputs.limits = {
      annual: options.annual ?? { status: 'NO_LIMIT' },
      lifetime: options.lifetime ?? { status: 'NO_LIMIT' },
    }
  }
  return request
}

function calculationSuccess(request: unknown, id: string): Engine2Success {
  const result = calculateEngine2Claim(request)
  assert.equal(result.kind, 'success', `${id} discriminant`)
  if (result.kind !== 'success') throw new Error(`${id} did not produce a calculation result`)
  assert.equal(result.result_status, 'CALCULATED_EDUCATIONAL', `${id} status`)
  assert.equal(result.outputs.unallocated_amount.sen, '0', `${id} reconciliation`)
  return result
}

function assertNoFinancialFailure(request: unknown, status: string, code: string): void {
  const result = calculateEngine2Claim(request)
  assert.equal(result.kind, 'failure')
  if (result.kind !== 'failure') return
  assert.equal(result.result_status, status)
  assert.equal(result.outputs, null)
  assert.ok(result.validation_errors.some((error) => error.code === code))
  assert.doesNotThrow(() => JSON.stringify(result))
}

function myrFromSen(sen: bigint | string): string {
  const amount = BigInt(sen)
  return `${amount / 100n}.${(amount % 100n).toString().padStart(2, '0')}`
}

function assertAmountMatchesSen(amount: { sen: string; display_myr: string }): void {
  const sen = BigInt(amount.sen)
  assert.equal(
    amount.display_myr,
    `RM${sen / 100n}.${(sen % 100n).toString().padStart(2, '0')}`,
  )
  assert.equal(BigInt(amount.sen).toString(), amount.sen)
}

function assertSuccessSettlement(result: Engine2Success): void {
  const outputs = result.outputs
  const gross = BigInt(outputs.gross_bill.sen)
  const employer = BigInt(outputs.employer_payment.amount.sen)
  const personal = BigInt(outputs.personal_insurer_payment.sen)
  const patient = BigInt(outputs.patient_payable.sen)
  const waivedCopayment = BigInt(outputs.WAIVED_COPAYMENT.sen)
  const waivedDeductible = BigInt(outputs.WAIVED_DEDUCTIBLE.sen)
  const unallocated = BigInt(outputs.unallocated_amount.sen)

  assert.equal(
    gross,
    employer + personal + patient + waivedCopayment + waivedDeductible,
  )
  assert.equal(unallocated, 0n)
  assert.equal(
    BigInt(outputs.user_out_of_pocket.sen),
    patient + waivedCopayment + waivedDeductible,
  )
  assertAmountMatchesSen(outputs.gross_bill)
  assertAmountMatchesSen(outputs.employer_payment.amount)
  assertAmountMatchesSen(outputs.personal_insurer_payment)
  assertAmountMatchesSen(outputs.user_out_of_pocket)
  assertAmountMatchesSen(outputs.patient_payable)
  assertAmountMatchesSen(outputs.WAIVED_COPAYMENT)
  assertAmountMatchesSen(outputs.WAIVED_DEDUCTIBLE)
  assertAmountMatchesSen(outputs.unallocated_amount)
}

function failure(result: ReturnType<typeof validateEngine2Request>): Engine2Failure {
  assert.equal(result.kind, 'failure')
  if (result.kind !== 'failure') throw new Error('Expected validation failure')
  assert.equal(result.outputs, null)
  assert.equal('normalized' in result, false)
  return result
}

test('accepts and exactly normalizes the supported gated path without calculating outputs', () => {
  const result = validateEngine2Request(gatedRequest())
  assert.equal(result.kind, 'valid')
  if (result.kind !== 'valid') return
  assert.equal(result.normalized.path, 'GATED')
  assert.equal(result.normalized.total_bill.sen, 100_000n)
  assert.equal(result.normalized.charge_lines[0]?.amount.sen, 100_000n)
  assert.equal(result.normalized.external_employer_confirmed_payment.sen, 12_550n)
  assert.equal('outputs' in result, false)
})

test('accepts a supported non-gated request using scalar NO_CAP at maximum supported object depth', () => {
  const result = validateEngine2Request(nonGatedRequest())
  assert.equal(ENGINE2_TECHNICAL_LIMITS.maxDepth, 4)
  assert.equal(result.kind, 'valid')
  if (result.kind !== 'valid') return
  assert.equal(result.normalized.path, 'NON_GATED')
  if (result.normalized.path !== 'NON_GATED') return
  assert.equal(result.normalized.share_rate.numerator, 2n)
  assert.equal(result.normalized.share_rate.denominator, 10n)
})

test('requires the inactive share component to be explicitly null', () => {
  const request = nonGatedRequest() as unknown as Record<string, any>
  delete request.inputs.share_components.co_insurance
  const result = failure(validateEngine2Request(request))
  assert.ok(result.validation_errors.some((item) => item.code === 'MISSING_REQUIRED_FIELD'
    && item.field === '/inputs/share_components/co_insurance'))

  const bothActive = nonGatedRequest() as unknown as Record<string, any>
  bothActive.inputs.share_components.co_insurance = { rate: '0.1', cap: 'NO_CAP' }
  const mutualExclusion = failure(validateEngine2Request(bothActive))
  assert.ok(mutualExclusion.validation_errors.some((item) => item.code === 'MUTUALLY_EXCLUSIVE_SHARE_TYPES'
    && item.field === '/inputs/share_components'))
})

test('rejects a missing active cap at its required-field path', () => {
  const request = nonGatedRequest() as unknown as Record<string, any>
  delete request.inputs.share_components.co_payment.cap
  const result = failure(validateEngine2Request(request))
  assert.equal(result.result_status, 'INCOMPLETE_INPUT')
  assert.ok(result.validation_errors.some((item) => item.code === 'MISSING_REQUIRED_FIELD'
    && item.field === '/inputs/share_components/co_payment/cap'))
})

test('rejects an unknown cap string as an unsupported enum', () => {
  const request = nonGatedRequest() as unknown as Record<string, any>
  request.inputs.share_components.co_payment.cap = 'LIMITLESS'
  const result = failure(validateEngine2Request(request))
  assert.equal(result.result_status, 'INVALID_CONFIGURATION')
  assert.ok(result.validation_errors.some((item) => item.code === 'UNSUPPORTED_ENUM'
    && item.field === '/inputs/share_components/co_payment/cap'))
})

test('rejects a legacy nested cap object at the earlier structural-depth group', () => {
  const request = nonGatedRequest() as unknown as Record<string, any>
  request.inputs.share_components.co_payment.cap = { kind: 'NO_CAP' }
  const result = failure(validateEngine2Request(request))
  assert.equal(result.result_status, 'INVALID_INPUT')
  assert.ok(result.validation_errors.some((item) => item.code === 'INPUT_TOO_LONG'
    && item.field === '/inputs/share_components/co_payment/cap'))
})

test('rejects a numeric cap as an invalid configuration', () => {
  const request = nonGatedRequest() as unknown as Record<string, any>
  request.inputs.share_components.co_payment.cap = 0
  const result = failure(validateEngine2Request(request))
  assert.equal(result.result_status, 'INVALID_CONFIGURATION')
  assert.ok(result.validation_errors.some((item) => item.code === 'INVALID_CONFIGURATION'
    && item.field === '/inputs/share_components/co_payment/cap'))
})

test('rejects capped sharing without coercing it to uncapped', () => {
  const request = nonGatedRequest() as unknown as Record<string, any>
  request.inputs.share_components.co_payment.cap = 'CAPPED'
  const result = failure(validateEngine2Request(request))
  assert.ok(result.validation_errors.some((item) => item.code === 'INVALID_CONFIGURATION'
    && item.field === '/inputs/share_components/co_payment/cap'))
})

test('preserves explicit zero amounts as zero sen rather than treating them as missing', () => {
  const request = gatedRequest()
  request.inputs.total_bill_myr = '0.00'
  request.inputs.charge_lines[0]!.amount_myr = '0.00'
  request.inputs.employer_coordination = { path: 'GATED', external_employer_confirmed_payment_myr: '0.00' }
  const result = validateEngine2Request(request)
  assert.equal(result.kind, 'valid')
  if (result.kind !== 'valid') return
  assert.equal(result.normalized.path, 'GATED')
  if (result.normalized.path !== 'GATED') return
  assert.equal(result.normalized.total_bill.sen, 0n)
  assert.equal(result.normalized.charge_lines[0]?.amount.sen, 0n)
  assert.equal(result.normalized.external_employer_confirmed_payment.sen, 0n)
})

test('E2-025 and E2-064 distinguish missing current-claim limits from explicit zero', () => {
  const missingAnnual = calculationRequest({ bill: '100000', deductible: '0', rate: '0' })
  delete missingAnnual.inputs.limits.annual
  const missingAnnualResult = failure(validateEngine2Request(missingAnnual))
  assert.equal(missingAnnualResult.result_status, 'INCOMPLETE_INPUT')
  assert.ok(missingAnnualResult.validation_errors.some((item) =>
    item.code === 'MISSING_REQUIRED_FIELD' && item.field === '/inputs/limits/annual'))

  const missing = calculationRequest({ bill: '100000', deductible: '0', rate: '0' })
  delete missing.inputs.limits.lifetime
  const missingResult = failure(validateEngine2Request(missing))
  assert.equal(missingResult.result_status, 'INCOMPLETE_INPUT')
  assert.ok(missingResult.validation_errors.some((item) =>
    item.code === 'MISSING_REQUIRED_FIELD' && item.field === '/inputs/limits/lifetime'))

  const zero = calculationSuccess(calculationRequest({
    bill: '100000',
    deductible: '0',
    rate: '0',
    lifetime: { status: 'MODELED', remaining_amount_myr: '0.00' },
  }), 'E2-064-zero-limit')
  assert.equal(zero.outputs.limit?.effective_limit_sen, '0')
  assert.equal(zero.outputs.personal_insurer_payment.sen, '0')
  assert.equal(zero.outputs.user_out_of_pocket.sen, '100000')
})

test('rejects null, undefined, and primitive roots as structured malformed requests', () => {
  for (const input of [null, undefined, 'request', 1]) {
    const result = failure(validateEngine2Request(input))
    assert.equal(result.result_status, 'INVALID_REQUEST')
    assert.equal(result.validation_errors[0]?.code, 'MALFORMED_REQUEST')
    assert.equal(result.validation_errors[0]?.field, '/')
  }
})

test('aggregates missing required fields deterministically and returns no financial output', () => {
  const result = failure(validateEngine2Request({}))
  assert.equal(result.result_status, 'INCOMPLETE_INPUT')
  assert.deepEqual(result.validation_errors.map((item) => item.field), [
    '/as_of_date', '/assumptions', '/calculation_mode', '/currency', '/engine_id', '/engine_version', '/inputs', '/scenario_id',
  ])
})

test('rejects unknown fields with escaped JSON Pointer and does not echo submitted values', () => {
  const request = gatedRequest() as unknown as Record<string, unknown>
  request['private/token'] = 'do-not-echo'
  const result = failure(validateEngine2Request(request))
  assert.equal(result.validation_errors[0]?.code, 'UNKNOWN_FIELD')
  assert.equal(result.validation_errors[0]?.field, '/private~1token')
  assert.equal(JSON.stringify(result).includes('do-not-echo'), false)
})

test('E2-022 and E2-056 reject negative and unsupported MYR representations', () => {
  for (const value of ['1.234', '1e3', 'NaN', ' 10.00', 'RM10', 10, 1000.01, 1000n, Number.NaN, '1.000']) {
    const request = gatedRequest()
    request.inputs.total_bill_myr = value as unknown as string
    const result = failure(validateEngine2Request(request))
    assert.equal(result.result_status, 'INVALID_INPUT')
    assert.ok(result.validation_errors.some((item) =>
      item.field === '/inputs/total_bill_myr' && item.code === 'INVALID_MONEY_FORMAT'))
  }

  const negative = gatedRequest()
  negative.inputs.total_bill_myr = '-0.01'
  const negativeResult = failure(validateEngine2Request(negative))
  assert.equal(negativeResult.result_status, 'INVALID_INPUT')
  assert.ok(negativeResult.validation_errors.some((item) =>
    item.field === '/inputs/total_bill_myr' && item.code === 'NEGATIVE_NOT_ALLOWED'))
})

test('E2-054 and E2-055 accept 128 whole digits and reject 129 digits', () => {
  const accepted = gatedRequest()
  accepted.inputs.total_bill_myr = `${'9'.repeat(ENGINE2_TECHNICAL_LIMITS.maxMoneyWholeDigits)}.99`
  accepted.inputs.charge_lines[0]!.amount_myr = accepted.inputs.total_bill_myr
  assert.equal(validateEngine2Request(accepted).kind, 'valid')

  const rejected = gatedRequest()
  rejected.inputs.total_bill_myr = `${'9'.repeat(ENGINE2_TECHNICAL_LIMITS.maxMoneyWholeDigits + 1)}.00`
  rejected.inputs.charge_lines[0]!.amount_myr = rejected.inputs.total_bill_myr
  const result = failure(validateEngine2Request(rejected))
  assert.equal(result.result_status, 'INVALID_INPUT')
  assert.ok(result.validation_errors.some((item) => item.code === 'INPUT_TOO_LONG'))
})

test('rejects charge-line arrays above the approved structural count', () => {
  const request = gatedRequest()
  request.inputs.charge_lines = Array.from({ length: 257 }, (_, index) => ({
    line_id: `line-${index}`,
    amount_myr: index === 0 ? '1000.00' : '0.00',
    category: 'hospital',
    eligibility: 'ELIGIBLE_ASSUMED' as const,
  }))
  const result = failure(validateEngine2Request(request))
  assert.ok(result.validation_errors.some((item) => item.code === 'INPUT_TOO_LONG'))
})

test('rejects unsupported enum values and disabled product-specific mode', () => {
  const invalid = gatedRequest()
  invalid.inputs.care_setting = 'AIRPORT' as never
  assert.ok(failure(validateEngine2Request(invalid)).validation_errors.some((item) => item.code === 'UNSUPPORTED_ENUM'))

  const productSpecific = gatedRequest()
  productSpecific.calculation_mode = 'PRODUCT_SPECIFIC'
  assert.equal(failure(validateEngine2Request(productSpecific)).result_status, 'MODE_DISABLED')
})

test('E2-057 through E2-059 enforce inclusive share-rate boundaries', () => {
  for (const rate of ['-0.01', '1.01']) {
    const invalid = calculationRequest({ bill: '100', deductible: '0', rate })
    const result = calculateEngine2Claim(invalid)
    assert.equal(result.kind, 'failure')
    if (result.kind !== 'failure') continue
    assert.equal(result.result_status, 'INVALID_CONFIGURATION')
    assert.equal(result.outputs, null)
    assert.ok(result.validation_errors.some((item) => item.code === 'INVALID_CONFIGURATION'))
  }

  const maximum = calculationSuccess(calculationRequest({
    bill: '100',
    deductible: '0',
    rate: '1',
  }), 'E2-059')
  assert.equal(maximum.outputs.personal_insurer_payment.sen, '0')
  assert.equal(maximum.outputs.user_out_of_pocket.sen, '100')
})

test('E2-063 rejects an unsupported cost-sharing order without calculating outputs', () => {
  const request = calculationRequest()
  request.inputs.cost_sharing_order = 'DEDUCTIBLE_THIRD'
  const result = failure(validateEngine2Request(request))
  assert.equal(result.result_status, 'INVALID_CONFIGURATION')
  assert.ok(result.validation_errors.some((item) =>
    item.code === 'INVALID_CONFIGURATION' && item.field === '/inputs/cost_sharing_order'))
})

test('rejects unknown eligibility using the approved rule-configuration error', () => {
  const request = gatedRequest()
  request.inputs.charge_lines[0]!.eligibility = 'UNKNOWN'
  const result = failure(validateEngine2Request(request))
  assert.equal(result.result_status, 'RULE_CONFIGURATION_REQUIRED')
  assert.ok(result.validation_errors.some((item) => item.field === '/inputs/charge_lines/0/eligibility'))
})

test('rejects bill and charge-line total mismatch', () => {
  const request = gatedRequest()
  request.inputs.charge_lines[0]!.amount_myr = '999.99'
  const result = failure(validateEngine2Request(request))
  assert.equal(result.result_status, 'INPUT_RECONCILIATION_REQUIRED')
  assert.ok(result.validation_errors.some((item) => item.code === 'BILL_TOTAL_MISMATCH'))
})

test('E2-068 and E2-070 reject mismatched gate and employer branches', () => {
  const mixedGatedBranch = gatedRequest() as unknown as Record<string, any>
  mixedGatedBranch.inputs.employer_coordination = {
    path: 'GATED',
    external_employer_confirmed_payment_myr: '0.00',
    employer_scenario_max_myr: '0.00',
    employer_reduces_deductible: false,
    deductible_remaining_myr: '0.00',
  }
  const mixedResult = failure(validateEngine2Request(mixedGatedBranch))
  assert.equal(mixedResult.result_status, 'INVALID_CONFIGURATION')
  assert.ok(mixedResult.validation_errors.some((item) => item.code === 'BRANCH_MISMATCH'))

  const nonGatedOnGate = gatedRequest()
  nonGatedOnGate.inputs.employer_coordination = {
    path: 'NON_GATED',
    employer_scenario_max_myr: '0.00',
    employer_reduces_deductible: false,
    deductible_remaining_myr: '0.00',
  } as never
  const nonGatedResult = failure(validateEngine2Request(nonGatedOnGate))
  assert.equal(nonGatedResult.result_status, 'INVALID_CONFIGURATION')
  assert.ok(nonGatedResult.validation_errors.some((item) => item.code === 'BRANCH_MISMATCH'))

  const gatedOnNonGated = calculationRequest()
  gatedOnNonGated.inputs.employer_coordination = {
    path: 'GATED',
    external_employer_confirmed_payment_myr: '0.00',
  }
  const gatedResult = failure(validateEngine2Request(gatedOnNonGated))
  assert.equal(gatedResult.result_status, 'INVALID_CONFIGURATION')
  assert.ok(gatedResult.validation_errors.some((item) => item.code === 'BRANCH_MISMATCH'))
})

test('rejects excessive nesting and oversized collections under the unchanged depth and count limits', () => {
  const deeplyNested = nonGatedRequest() as unknown as Record<string, any>
  deeplyNested.inputs.share_components.co_payment.cap = { kind: { nested: true } }
  const deepResult = failure(validateEngine2Request(deeplyNested))
  assert.equal(deepResult.validation_errors[0]?.code, 'INPUT_TOO_LONG')
  assert.equal(deepResult.validation_errors[0]?.field, '/inputs/share_components/co_payment/cap')

  const oversized = gatedRequest()
  oversized.inputs.charge_lines = Array.from({ length: 257 }, (_, index) => ({
    line_id: `line-${index}`,
    amount_myr: index === 0 ? '1000.00' : '0.00',
    category: 'hospital',
    eligibility: 'ELIGIBLE_ASSUMED' as const,
  }))
  assert.ok(failure(validateEngine2Request(oversized)).validation_errors.some((item) => item.code === 'INPUT_TOO_LONG'))
})

test('rejects extra share component properties using the strict unknown-field path', () => {
  const request = nonGatedRequest() as unknown as Record<string, any>
  request.inputs.share_components.co_payment.extra = 'unsupported'
  const result = failure(validateEngine2Request(request))
  assert.equal(result.validation_errors[0]?.code, 'UNKNOWN_FIELD')
  assert.equal(result.validation_errors[0]?.field, '/inputs/share_components/co_payment/extra')
})

test('rejects unsupported configured Room and Board, sub-limits, capped shares, and unavailable limits', () => {
  const request = gatedRequest() as unknown as Record<string, any>
  Object.assign(request.inputs, {
    coverage_gate: 'PROCEED_WITHOUT_GATE_ASSUMPTION',
    employer_coordination: {
      path: 'NON_GATED', employer_scenario_max_myr: '0.00', employer_reduces_deductible: false,
      deductible_remaining_myr: '0.00',
    },
    r_and_b: { mode: 'MODELED', hospital_days: 1, actual_daily_rate_myr: '10.00', entitled_daily_limit_myr: '10.00', room_charge_line_ids: ['line-1'] },
    sub_limits: [{ sub_limit_id: 's1', category: 'surgery', limit_myr: '10.00', charge_line_ids: ['line-1'] }],
    room_upgrade: { mode: 'PRO_RATA_RATIO' },
    cost_sharing_order: 'DEDUCTIBLE_FIRST',
    share_components: { co_payment: { rate: '0.2', cap: 'CAPPED' }, co_insurance: null },
    exemption: 'NONE',
    limits: { annual: { status: 'NOT_MODELED' }, lifetime: { status: 'NO_LIMIT' } },
  })
  const result = failure(validateEngine2Request(request))
  assert.ok(result.validation_errors.length > 0)
  assert.ok(result.validation_errors.every((item) => item.code !== 'INTERNAL_ERROR'))
})

test('E2-060 through E2-062 validate modeled inpatient day-count boundaries before scope rejection', () => {
  const withDays = (hospitalDays: number): Record<string, any> => {
    const request = calculationRequest()
    request.inputs.r_and_b = {
      mode: 'MODELED',
      hospital_days: hospitalDays,
      actual_daily_rate_myr: '10.00',
      entitled_daily_limit_myr: '20.00',
      room_charge_line_ids: ['eligible'],
    }
    return request
  }

  const negative = failure(validateEngine2Request(withDays(-1)))
  assert.equal(negative.result_status, 'INVALID_INPUT')
  assert.ok(negative.validation_errors.some((item) =>
    item.code === 'NEGATIVE_NOT_ALLOWED' && item.field === '/inputs/r_and_b/hospital_days'))

  const fractional = failure(validateEngine2Request(withDays(1.5)))
  assert.equal(fractional.result_status, 'INVALID_INPUT')
  assert.ok(fractional.validation_errors.some((item) =>
    item.code === 'INVALID_INTEGER' && item.field === '/inputs/r_and_b/hospital_days'))

  const zeroDays = failure(validateEngine2Request(withDays(0)))
  assert.equal(zeroDays.result_status, 'INVALID_INPUT')
  assert.ok(zeroDays.validation_errors.some((item) =>
    item.code === 'ZERO_DAYS_NOT_ALLOWED_FOR_MODELED_INPATIENT_RNB'
    && item.field === '/inputs/r_and_b/hospital_days'))
})

const applicableBaselineCases: Array<{
  id: string
  options: CalculationOptions
  employer: string
  personal: string
  oop: string
  deductible?: string | null
  share?: string | null
  waivedCopayment?: string
  waivedDeductible?: string
}> = [
  { id: 'E2-001', options: { bill: '100000', deductible: '30000', rate: '0' }, employer: '0', personal: '70000', oop: '30000', deductible: '30000', share: '0' },
  { id: 'E2-002', options: { bill: '100000', deductible: '10000', rate: '0.10' }, employer: '0', personal: '81000', oop: '19000', deductible: '10000', share: '9000' },
  { id: 'E2-003', options: { bill: '10000', deductible: '8000', shareType: 'CO_PAYMENT', order: 'COPAY_FIRST', rate: '0.50' }, employer: '0', personal: '0', oop: '10000', deductible: '5000', share: '5000' },
  { id: 'E2-004', options: { bill: '100000', deductible: '60000', rate: '0' }, employer: '0', personal: '40000', oop: '60000', deductible: '60000', share: '0' },
  { id: 'E2-007', options: { bill: '100000', eligible: '0', nonEligible: '100000', rate: '0.20' }, employer: '0', personal: '0', oop: '100000', deductible: '0', share: '0' },
  { id: 'E2-008', options: { bill: '100000', rate: '0', annual: { status: 'MODELED', remaining_amount_myr: '0.00' }, lifetime: { status: 'MODELED', remaining_amount_myr: '5000.00' } }, employer: '0', personal: '0', oop: '100000' },
  { id: 'E2-009', options: { bill: '120000', rate: '0', annual: { status: 'MODELED', remaining_amount_myr: '800.00' }, lifetime: { status: 'MODELED', remaining_amount_myr: '1000.00' } }, employer: '0', personal: '80000', oop: '40000' },
  { id: 'E2-010', options: { bill: '100000', rate: '0', annual: { status: 'MODELED', remaining_amount_myr: '500.00' }, lifetime: { status: 'MODELED', remaining_amount_myr: '300.00' } }, employer: '0', personal: '30000', oop: '70000' },
  { id: 'E2-011', options: { bill: '100000', employer: '40000', deductible: '10000', rate: '0' }, employer: '40000', personal: '50000', oop: '10000', deductible: '10000', share: '0' },
  { id: 'E2-017', options: { bill: '100000', deductible: '10000', rate: '0.10', annual: { status: 'MODELED', remaining_amount_myr: '500.00' }, lifetime: { status: 'MODELED', remaining_amount_myr: '800.00' } }, employer: '0', personal: '50000', oop: '50000' },
  { id: 'E2-018', options: { bill: '1', deductible: '0', rate: '0.50' }, employer: '0', personal: '0', oop: '1', deductible: '0', share: '1' },
  { id: 'E2-021', options: { bill: '0', eligible: '0', rate: '0' }, employer: '0', personal: '0', oop: '0', deductible: '0', share: '0' },
  { id: 'E2-029', options: { bill: '100000', deductible: '10000', shareType: 'CO_PAYMENT', rate: '0.10', exemption: 'EXEMPT_SELECTED_COPAY_ONLY' }, employer: '0', personal: '81000', oop: '19000', deductible: '10000', share: '0', waivedCopayment: '9000' },
  { id: 'E2-030', options: { bill: '100000', deductible: '10000', shareType: 'CO_PAYMENT', rate: '0.10', exemption: 'NONE' }, employer: '0', personal: '81000', oop: '19000', deductible: '10000', share: '9000' },
  { id: 'E2-031', options: { bill: '4500000', nonEligible: '100000', eligible: '4400000', employer: '2000000', employerCredit: true, deductible: '2000000', rate: '0.20' }, employer: '2000000', personal: '1920000', oop: '580000', deductible: '0', share: '480000' },
  { id: 'E2-032', options: { bill: '100000', employer: '100000', rate: '0' }, employer: '100000', personal: '0', oop: '0' },
  { id: 'E2-033', options: { bill: '100000', employer: '120000', rate: '0' }, employer: '100000', personal: '0', oop: '0' },
  { id: 'E2-038', options: { bill: '4500000', nonEligible: '100000', eligible: '4400000', employer: '2000000', employerCredit: false, deductible: '2000000', rate: '0.20' }, employer: '2000000', personal: '320000', oop: '2180000', deductible: '2000000', share: '80000' },
  { id: 'E2-039', options: { bill: '100000', rate: '0', lifetime: { status: 'MODELED', remaining_amount_myr: '0.00' } }, employer: '0', personal: '0', oop: '100000' },
  { id: 'E2-040', options: { bill: '100000', deductible: '10000', shareType: 'CO_PAYMENT', rate: '0.10', exemption: 'EXEMPT_COPAY_AND_DEDUCTIBLE_AS_ASSUMPTION' }, employer: '0', personal: '81000', oop: '19000', deductible: '0', share: '0', waivedCopayment: '9000', waivedDeductible: '10000' },
]

for (const baseline of applicableBaselineCases) {
  test(`${baseline.id} supported-scope calculation regression`, () => {
    const result = calculationSuccess(calculationRequest(baseline.options), baseline.id)
    assert.equal(result.outputs.employer_payment.amount.sen, baseline.employer)
    assert.equal(result.outputs.personal_insurer_payment.sen, baseline.personal)
    assert.equal(result.outputs.user_out_of_pocket.sen, baseline.oop)
    if (baseline.deductible !== undefined) assert.equal(result.outputs.deductible_applied?.sen ?? null, baseline.deductible)
    if (baseline.share !== undefined) assert.equal(result.outputs.patient_cost_share.amount?.sen ?? null, baseline.share)
    assert.equal(result.outputs.WAIVED_COPAYMENT.sen, baseline.waivedCopayment ?? '0')
    assert.equal(result.outputs.WAIVED_DEDUCTIBLE.sen, baseline.waivedDeductible ?? '0')
    assert.equal(result.outputs.eligible_claim_base?.sen, (BigInt(baseline.options.bill ?? '100000') - BigInt(baseline.options.nonEligible ?? '0')).toString())
    assert.deepEqual(result.formula_trace.map((step) => step.stage), [
      'waiting_period_exclusion_gate', 'non_eligible_charges', 'room_and_board_sub_limits',
      'room_upgrade_proration', 'employer_coordination', 'patient_cost_sharing', 'current_claim_limits', 'settlement',
    ])
    assert.match(result.outputs.disclosure, /Illustrative educational scenario/)
    assert.doesNotThrow(() => JSON.stringify(result))
  })
}

const gatedBaselineCases: Array<{ id: string; gate: 'APPLY_WAITING_PERIOD' | 'APPLY_EXCLUSION'; bill: string; nonEligible?: string; external: string; employer: string; personal: string; oop: string }> = [
  { id: 'E2-020', gate: 'APPLY_WAITING_PERIOD', bill: '100000', external: '0', employer: '0', personal: '0', oop: '100000' },
  { id: 'E2-028', gate: 'APPLY_EXCLUSION', bill: '100000', external: '0', employer: '0', personal: '0', oop: '100000' },
  { id: 'E2-042', gate: 'APPLY_WAITING_PERIOD', bill: '100000', external: '30000', employer: '30000', personal: '0', oop: '70000' },
  { id: 'E2-043', gate: 'APPLY_EXCLUSION', bill: '100000', external: '30000', employer: '30000', personal: '0', oop: '70000' },
  { id: 'E2-050', gate: 'APPLY_WAITING_PERIOD', bill: '1000000', external: '1200000', employer: '1000000', personal: '0', oop: '0' },
  { id: 'E2-051', gate: 'APPLY_EXCLUSION', bill: '1000000', external: '1200000', employer: '1000000', personal: '0', oop: '0' },
  { id: 'E2-052', gate: 'APPLY_EXCLUSION', bill: '1000000', nonEligible: '200000', external: '900000', employer: '900000', personal: '0', oop: '100000' },
  { id: 'E2-053', gate: 'APPLY_WAITING_PERIOD', bill: '1000000', external: '300000', employer: '300000', personal: '0', oop: '700000' },
]

for (const baseline of gatedBaselineCases) {
  test(`${baseline.id} gated calculation regression`, () => {
    const result = calculationSuccess(calculationRequest({
      bill: baseline.bill,
      eligible: (BigInt(baseline.bill) - BigInt(baseline.nonEligible ?? '0')).toString(),
      nonEligible: baseline.nonEligible,
      gate: baseline.gate,
      externalPayment: baseline.external,
    }), baseline.id)
    assert.equal(result.outputs.employer_payment.kind, 'EXTERNAL_EMPLOYER_PAYMENT')
    assert.equal(result.outputs.employer_payment.amount.sen, baseline.employer)
    assert.equal(result.outputs.personal_insurer_payment.sen, baseline.personal)
    assert.equal(result.outputs.user_out_of_pocket.sen, baseline.oop)
    assert.equal(result.outputs.deductible_applied, null)
    assert.equal(result.outputs.limit, null)
    assert.equal(result.outputs.room_and_board, null)
    assert.ok(result.outputs.stage_results.slice(1).every((stage) => stage.status === 'SKIPPED_GATE'))
    assert.deepEqual(result.formula_trace.map((step) => step.formula_id), ['E2.STAGE_1_GATE', 'E2.GATED_SETTLEMENT'])
  })
}

test('calculation API preserves structured validation failures with no financial output', () => {
  const unsupported = calculationRequest()
  unsupported.inputs.share_components.co_payment = { rate: '0.2', cap: 'NO_CAP' }
  assertNoFinancialFailure(unsupported, 'INVALID_CONFIGURATION', 'MUTUALLY_EXCLUSIVE_SHARE_TYPES')

  const malformed = calculationRequest()
  malformed.inputs.charge_lines[0].eligibility = 'UNKNOWN'
  assertNoFinancialFailure(malformed, 'RULE_CONFIGURATION_REQUIRED', 'RULE_CONFIGURATION_REQUIRED')
})

test('E2-067 reconciles payer totals against the gross-bill remainder', () => {
  const result = calculationSuccess(calculationRequest({
    bill: '100000',
    eligible: '80000',
    nonEligible: '20000',
    employer: '30000',
    deductible: '10000',
    rate: '0',
  }), 'E2-067')
  assert.equal(result.outputs.employer_payment.amount.sen, '30000')
  assert.equal(result.outputs.personal_insurer_payment.sen, '40000')
  assert.equal(result.outputs.user_out_of_pocket.sen, '30000')
  assert.equal(
    BigInt(result.outputs.employer_payment.amount.sen) + BigInt(result.outputs.personal_insurer_payment.sen),
    70000n,
  )
})

test('E2-006 reconciles eligible and non-eligible charge lines once', () => {
  const result = calculationSuccess(calculationRequest({
    bill: '200000',
    eligible: '150000',
    nonEligible: '50000',
    deductible: '30000',
    rate: '0',
  }), 'E2-006')
  assert.equal(result.outputs.non_eligible_amount.sen, '50000')
  assert.equal(result.outputs.eligible_claim_base?.sen, '150000')
  assert.equal(result.outputs.personal_insurer_payment.sen, '120000')
  assert.equal(result.outputs.user_out_of_pocket.sen, '80000')
})

test('E2-027 compares both cost-sharing orders with identical inputs', () => {
  const deductibleFirst = calculationSuccess(calculationRequest({
    bill: '10000',
    deductible: '8000',
    shareType: 'CO_INSURANCE',
    rate: '0.50',
    order: 'DEDUCTIBLE_FIRST',
  }), 'E2-027-deductible-first')
  const copayFirst = calculationSuccess(calculationRequest({
    bill: '10000',
    deductible: '8000',
    shareType: 'CO_INSURANCE',
    rate: '0.50',
    order: 'COPAY_FIRST',
  }), 'E2-027-copay-first')
  assert.equal(deductibleFirst.outputs.patient_cost_share.amount?.sen, '1000')
  assert.equal(deductibleFirst.outputs.personal_insurer_payment.sen, '1000')
  assert.equal(deductibleFirst.outputs.user_out_of_pocket.sen, '9000')
  assert.equal(copayFirst.outputs.patient_cost_share.amount?.sen, '5000')
  assert.equal(copayFirst.outputs.deductible_applied?.sen, '5000')
  assert.equal(copayFirst.outputs.personal_insurer_payment.sen, '0')
  assert.equal(copayFirst.outputs.user_out_of_pocket.sen, '10000')
})

const employerBaselineCases: Array<{
  id: string
  bill: string
  eligible?: string
  nonEligible?: string
  employer: string
  employerPayment: string
  deductible: string
  employerCredit: boolean
  personal: string
  oop: string
}> = [
  { id: 'E2-044', bill: '1000000', employer: '300000', employerPayment: '300000', deductible: '500000', employerCredit: true, personal: '500000', oop: '200000' },
  { id: 'E2-045', bill: '1000000', employer: '500000', employerPayment: '500000', deductible: '500000', employerCredit: true, personal: '500000', oop: '0' },
  { id: 'E2-046', bill: '1000000', employer: '800000', employerPayment: '800000', deductible: '500000', employerCredit: true, personal: '200000', oop: '0' },
  { id: 'E2-047', bill: '500000', employer: '800000', employerPayment: '500000', deductible: '700000', employerCredit: true, personal: '0', oop: '0' },
  { id: 'E2-048', bill: '1000000', eligible: '800000', nonEligible: '200000', employer: '900000', employerPayment: '800000', deductible: '0', employerCredit: false, personal: '0', oop: '200000' },
]

for (const baseline of employerBaselineCases) {
  test(`${baseline.id} employer-coordination calculation regression`, () => {
    const result = calculationSuccess(calculationRequest({
      bill: baseline.bill,
      eligible: baseline.eligible,
      nonEligible: baseline.nonEligible,
      employer: baseline.employer,
      employerCredit: baseline.employerCredit,
      deductible: baseline.deductible,
      rate: '0',
    }), baseline.id)
    assert.equal(result.outputs.employer_payment.amount.sen, baseline.employerPayment)
    assert.equal(result.outputs.personal_insurer_payment.sen, baseline.personal)
    assert.equal(result.outputs.user_out_of_pocket.sen, baseline.oop)
  })
}

test('E2-069 distinguishes missing and explicit zero employer amounts', () => {
  const missing = calculationRequest({ bill: '100000', deductible: '0', rate: '0' })
  delete missing.inputs.employer_coordination.employer_scenario_max_myr
  const missingResult = failure(validateEngine2Request(missing))
  assert.equal(missingResult.result_status, 'INCOMPLETE_INPUT')
  assert.ok(missingResult.validation_errors.some((item) =>
    item.code === 'MISSING_REQUIRED_FIELD'
    && item.field === '/inputs/employer_coordination/employer_scenario_max_myr'))

  const zero = calculationSuccess(calculationRequest({
    bill: '100000',
    employer: '0',
    deductible: '0',
    rate: '0',
  }), 'E2-069-zero-employer')
  assert.equal(zero.outputs.employer_payment.amount.sen, '0')
  assert.equal(zero.outputs.personal_insurer_payment.sen, '100000')
  assert.equal(zero.outputs.user_out_of_pocket.sen, '0')
})

test('E2-071 accepts the configuration length boundary and rejects one byte over', () => {
  const boundaryRate = `0.1${'0'.repeat(125)}`
  assert.equal(new TextEncoder().encode(boundaryRate).length, ENGINE2_TECHNICAL_LIMITS.maxConfigurationUtf8Bytes)
  const boundary = calculationSuccess(calculationRequest({
    bill: '100',
    deductible: '0',
    rate: boundaryRate,
  }), 'E2-071-boundary')
  assert.equal(boundary.outputs.patient_cost_share.amount?.sen, '10')
  assert.equal(boundary.outputs.personal_insurer_payment.sen, '90')
  assert.equal(boundary.outputs.user_out_of_pocket.sen, '10')

  const overlong = calculationRequest({
    bill: '100',
    deductible: '0',
    rate: `${boundaryRate}0`,
  })
  const result = failure(validateEngine2Request(overlong))
  assert.equal(result.result_status, 'INVALID_CONFIGURATION')
  assert.ok(result.validation_errors.some((item) =>
    item.code === 'INPUT_TOO_LONG' && item.field === '/inputs/share_components/co_insurance/rate'))
})

test('gated public outputs reconcile once and expose the gated stage statuses', () => {
  const result = calculationSuccess(calculationRequest({
    bill: '100000',
    gate: 'APPLY_WAITING_PERIOD',
    externalPayment: '30000',
  }), 'gated-public-reconciliation')

  assertSuccessSettlement(result)
  assert.equal(result.outputs.employer_payment.kind, 'EXTERNAL_EMPLOYER_PAYMENT')
  assert.equal(result.outputs.employer_payment.amount.sen, '30000')
  assert.equal(result.outputs.personal_insurer_payment.sen, '0')
  assert.equal(result.outputs.user_out_of_pocket.sen, '70000')
  assert.equal(result.outputs.patient_payable.sen, '70000')
  assert.equal(result.outputs.WAIVED_COPAYMENT.sen, '0')
  assert.equal(result.outputs.WAIVED_DEDUCTIBLE.sen, '0')
  assert.equal(result.outputs.stage_results[0]?.stage, 'waiting_period_exclusion_gate')
  assert.equal(result.outputs.stage_results[0]?.status, 'APPLIED')
  assert.ok(result.outputs.stage_results.slice(1).every((stage) => stage.status === 'SKIPPED_GATE'))
  assert.deepEqual(
    result.outputs.stage_results.map((stage) => stage.stage),
    [
      'waiting_period_exclusion_gate',
      'non_eligible_charges',
      'room_and_board_sub_limits',
      'room_upgrade_proration',
      'employer_coordination',
      'patient_cost_sharing',
      'current_claim_limits',
    ],
  )
})

test('non-gated public outputs reconcile waivers separately from payer amounts', () => {
  const result = calculationSuccess(calculationRequest({
    bill: '100000',
    deductible: '10000',
    shareType: 'CO_PAYMENT',
    rate: '0.10',
    exemption: 'EXEMPT_COPAY_AND_DEDUCTIBLE_AS_ASSUMPTION',
  }), 'nongated-waiver-public-reconciliation')

  assertSuccessSettlement(result)
  assert.equal(result.outputs.employer_payment.kind, 'EMPLOYER_COORDINATION')
  assert.equal(result.outputs.employer_payment.amount.sen, '0')
  assert.equal(result.outputs.personal_insurer_payment.sen, '81000')
  assert.equal(result.outputs.user_out_of_pocket.sen, '19000')
  assert.equal(result.outputs.WAIVED_COPAYMENT.sen, '9000')
  assert.equal(result.outputs.WAIVED_DEDUCTIBLE.sen, '10000')
  assert.equal(result.outputs.patient_payable.sen, '0')
  assert.equal(result.outputs.limit_shortfall?.sen, '0')
  assert.deepEqual(
    result.formula_trace.map((step) => step.stage),
    [
      'waiting_period_exclusion_gate',
      'non_eligible_charges',
      'room_and_board_sub_limits',
      'room_upgrade_proration',
      'employer_coordination',
      'patient_cost_sharing',
      'current_claim_limits',
      'settlement',
    ],
  )
})

test('public money serialization is exact for zero and large integer-sen values', () => {
  const zero = calculationSuccess(calculationRequest({
    bill: '0',
    eligible: '0',
    deductible: '0',
    rate: '0',
  }), 'zero-public-money')
  assertSuccessSettlement(zero)
  assert.equal(zero.outputs.gross_bill.display_myr, 'RM0.00')

  const wholeDigits = '9'.repeat(128)
  const largeSen = (BigInt(wholeDigits) * 100n) + 99n
  const large = calculationSuccess(calculationRequest({
    bill: largeSen.toString(),
    eligible: largeSen.toString(),
    deductible: '0',
    rate: '0',
  }), 'large-public-money')
  assertSuccessSettlement(large)
  assert.equal(large.outputs.gross_bill.sen, largeSen.toString())
  assert.equal(large.outputs.personal_insurer_payment.sen, largeSen.toString())
  assert.equal(large.outputs.user_out_of_pocket.sen, '0')
  assert.equal(
    large.outputs.gross_bill.display_myr,
    `RM${wholeDigits}.99`,
  )
})

test('post-calculation settlement invariant failure has a safe failure envelope', () => {
  const originalBigInt = globalThis.BigInt
  const originalBigIntDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'BigInt')
  assert.ok(originalBigIntDescriptor)
  // Corrupt one normalized MYR component only so the real post-calculation invariant has a deterministic negative value to reject.
  let result: Engine2Failure | Engine2Success
  try {
    Object.defineProperty(globalThis, 'BigInt', {
      configurable: true,
      writable: true,
      value: (value: bigint | boolean | number | string): bigint =>
        value === '125' ? -125n : originalBigInt(value),
    })
    result = calculateEngine2Claim(gatedRequest())
  } finally {
    Object.defineProperty(globalThis, 'BigInt', originalBigIntDescriptor)
  }

  assert.equal(result.kind, 'failure')
  if (result.kind !== 'failure') return
  assert.equal(result.result_status, 'INTERNAL_ERROR')
  assert.equal(result.outputs, null)
  assert.deepEqual(Object.keys(result).sort(), ['kind', 'outputs', 'result_status', 'validation_errors'].sort())
  assert.equal(result.validation_errors.length, 1)
  assert.deepEqual(result.validation_errors[0], {
    code: 'SETTLEMENT_INVARIANT_VIOLATION',
    field: '/outputs',
    message: 'The calculation could not satisfy its approved settlement invariants.',
  })

  const serialized = JSON.stringify(result)
  assert.doesNotMatch(serialized, /-12450|-125|12550|TypeError|stack|exception|internal calculation error/i)
  assert.doesNotMatch(serialized, /gross_bill|patient_payable|unallocated_amount|formula_trace|intermediate_values_sen/)
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateEngine1, formatMyrFromSen, type Engine1Failure, type Engine1Request, type Engine1Success, type Engine1MoneyField } from './engine-1.ts'

const moneyFields: Engine1MoneyField[] = [
  'net_monthly_income_myr',
  'essential_outflows_myr',
  'debt_commitments_myr',
  'family_support_myr',
  'existing_protection_commitments_myr',
  'liquid_savings_myr',
]

function myrFromSen(sen: string): string {
  const amount = BigInt(sen)
  const negative = amount < 0n
  const absolute = negative ? -amount : amount
  return `${negative ? '-' : ''}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, '0')}`
}

function requestFor(
  scenarioId: string,
  sen: Partial<Record<Engine1MoneyField, string>> = {},
  configuration: { target?: unknown; cap?: unknown } = {},
): Engine1Request {
  const defaults: Record<Engine1MoneyField, string> = {
    net_monthly_income_myr: '200000',
    essential_outflows_myr: '100000',
    debt_commitments_myr: '0',
    family_support_myr: '0',
    existing_protection_commitments_myr: '0',
    liquid_savings_myr: '300000',
  }
  const inputs = Object.fromEntries(
    moneyFields.map((field) => {
      const value = sen[field] ?? defaults[field]
      return [field, /^-?\d+$/.test(value) ? myrFromSen(value) : value]
    }),
  ) as Record<Engine1MoneyField, string>
  return {
    calculation_mode: 'GENERIC_EDUCATIONAL',
    engine_id: 'E1',
    engine_version: '1.0.0',
    scenario_id: scenarioId,
    as_of_date: '2026-11-22',
    currency: 'MYR',
    inputs,
    ...(Object.prototype.hasOwnProperty.call(configuration, 'target') ? { target_runway_months: configuration.target } : {}),
    ...(Object.prototype.hasOwnProperty.call(configuration, 'cap') ? { protection_cap_ratio: configuration.cap } : {}),
  }
}

type ExpectedCase = {
  id: string
  sen: Partial<Record<Engine1MoneyField, string>>
  target?: string
  cap?: string
  outflows: string
  signed: string
  surplus: string
  disposable: string
  runway: { kind: 'FINITE'; numerator_sen: string; denominator_sen: string; display_months: string } | { kind: 'UNBOUNDED'; display: 'UNBOUNDED' }
  gap: string
  tier: Engine1Success['outputs']['liquidity_classification']
  alpha: string
  remainingCap: string
  safe: string
  stretch: string
  safeRatio: string | null
}

const numericCases: ExpectedCase[] = [
  { id: 'E1-001', sen: { net_monthly_income_myr: '80000', essential_outflows_myr: '72000', liquid_savings_myr: '120000' }, outflows: '72000', signed: '8000', surplus: '8000', disposable: '8000', runway: { kind: 'FINITE', numerator_sen: '120000', denominator_sen: '72000', display_months: '1.67' }, gap: '96000', tier: 'BUILD_BUFFER_ALONGSIDE', alpha: '0.50', remainingCap: '8000', safe: '4000', stretch: '8000', safeRatio: '5.00%' },
  { id: 'E1-002', sen: { net_monthly_income_myr: '320000', essential_outflows_myr: '240000', liquid_savings_myr: '400000' }, outflows: '240000', signed: '80000', surplus: '80000', disposable: '80000', runway: { kind: 'FINITE', numerator_sen: '400000', denominator_sen: '240000', display_months: '1.67' }, gap: '320000', tier: 'BUILD_BUFFER_ALONGSIDE', alpha: '0.50', remainingCap: '32000', safe: '32000', stretch: '38400', safeRatio: '10.00%' },
  { id: 'E1-003', sen: { net_monthly_income_myr: '580000', essential_outflows_myr: '380000', existing_protection_commitments_myr: '18000', liquid_savings_myr: '2400000' }, outflows: '380000', signed: '200000', surplus: '200000', disposable: '182000', runway: { kind: 'FINITE', numerator_sen: '2400000', denominator_sen: '380000', display_months: '6.32' }, gap: '0', tier: 'BUFFER_ADEQUATE', alpha: '0.60', remainingCap: '40000', safe: '40000', stretch: '51600', safeRatio: '10.00%' },
  { id: 'E1-004', sen: { net_monthly_income_myr: '200000', essential_outflows_myr: '230000', existing_protection_commitments_myr: '10000', liquid_savings_myr: '50000' }, outflows: '230000', signed: '-30000', surplus: '0', disposable: '0', runway: { kind: 'FINITE', numerator_sen: '50000', denominator_sen: '230000', display_months: '0.22' }, gap: '640000', tier: 'PRIORITY_EMERGENCY_BUFFER', alpha: '0.25', remainingCap: '10000', safe: '0', stretch: '0', safeRatio: '5.00%' },
  { id: 'E1-005', sen: { net_monthly_income_myr: '0', essential_outflows_myr: '30000', liquid_savings_myr: '90000' }, outflows: '30000', signed: '-30000', surplus: '0', disposable: '0', runway: { kind: 'FINITE', numerator_sen: '90000', denominator_sen: '30000', display_months: '3.00' }, gap: '0', tier: 'BUFFER_ADEQUATE', alpha: '0.60', remainingCap: '0', safe: '0', stretch: '0', safeRatio: null },
  { id: 'E1-007', sen: { net_monthly_income_myr: '300000', essential_outflows_myr: '150000', debt_commitments_myr: '30000', family_support_myr: '20000', existing_protection_commitments_myr: '25000', liquid_savings_myr: '400000' }, outflows: '200000', signed: '100000', surplus: '100000', disposable: '75000', runway: { kind: 'FINITE', numerator_sen: '400000', denominator_sen: '200000', display_months: '2.00' }, gap: '200000', tier: 'BUILD_BUFFER_ALONGSIDE', alpha: '0.50', remainingCap: '5000', safe: '5000', stretch: '11000', safeRatio: '10.00%' },
  { id: 'E1-008', sen: { net_monthly_income_myr: '350000', essential_outflows_myr: '180000', debt_commitments_myr: '20000', liquid_savings_myr: '500000' }, outflows: '200000', signed: '150000', surplus: '150000', disposable: '150000', runway: { kind: 'FINITE', numerator_sen: '500000', denominator_sen: '200000', display_months: '2.50' }, gap: '100000', tier: 'BUILD_BUFFER_ALONGSIDE', alpha: '0.50', remainingCap: '35000', safe: '35000', stretch: '42000', safeRatio: '10.00%' },
  { id: 'E1-009', sen: { net_monthly_income_myr: '500000', essential_outflows_myr: '200000', debt_commitments_myr: '250000', liquid_savings_myr: '225000' }, outflows: '450000', signed: '50000', surplus: '50000', disposable: '50000', runway: { kind: 'FINITE', numerator_sen: '225000', denominator_sen: '450000', display_months: '0.50' }, gap: '1125000', tier: 'PRIORITY_EMERGENCY_BUFFER', alpha: '0.25', remainingCap: '50000', safe: '12500', stretch: '50000', safeRatio: '2.50%' },
  { id: 'E1-010', sen: { net_monthly_income_myr: '500000', essential_outflows_myr: '0', liquid_savings_myr: '1000000' }, outflows: '0', signed: '500000', surplus: '500000', disposable: '500000', runway: { kind: 'UNBOUNDED', display: 'UNBOUNDED' }, gap: '0', tier: 'BUFFER_ADEQUATE', alpha: '0.60', remainingCap: '50000', safe: '50000', stretch: '60000', safeRatio: '10.00%' },
  { id: 'E1-011', sen: { net_monthly_income_myr: '500000', essential_outflows_myr: '0', liquid_savings_myr: '0' }, outflows: '0', signed: '500000', surplus: '500000', disposable: '500000', runway: { kind: 'FINITE', numerator_sen: '0', denominator_sen: '1', display_months: '0.00' }, gap: '0', tier: 'PRIORITY_EMERGENCY_BUFFER', alpha: '0.25', remainingCap: '50000', safe: '50000', stretch: '60000', safeRatio: '10.00%' },
  { id: 'E1-012', sen: { net_monthly_income_myr: '200000', essential_outflows_myr: '100000', liquid_savings_myr: '99000' }, outflows: '100000', signed: '100000', surplus: '100000', disposable: '100000', runway: { kind: 'FINITE', numerator_sen: '99000', denominator_sen: '100000', display_months: '0.99' }, gap: '201000', tier: 'PRIORITY_EMERGENCY_BUFFER', alpha: '0.25', remainingCap: '20000', safe: '20000', stretch: '24000', safeRatio: '10.00%' },
  { id: 'E1-013', sen: { net_monthly_income_myr: '200000', essential_outflows_myr: '100000', liquid_savings_myr: '100000' }, outflows: '100000', signed: '100000', surplus: '100000', disposable: '100000', runway: { kind: 'FINITE', numerator_sen: '100000', denominator_sen: '100000', display_months: '1.00' }, gap: '200000', tier: 'BUILD_BUFFER_ALONGSIDE', alpha: '0.50', remainingCap: '20000', safe: '20000', stretch: '24000', safeRatio: '10.00%' },
  { id: 'E1-014', sen: { net_monthly_income_myr: '200000', essential_outflows_myr: '100000', liquid_savings_myr: '299000' }, outflows: '100000', signed: '100000', surplus: '100000', disposable: '100000', runway: { kind: 'FINITE', numerator_sen: '299000', denominator_sen: '100000', display_months: '2.99' }, gap: '1000', tier: 'BUILD_BUFFER_ALONGSIDE', alpha: '0.50', remainingCap: '20000', safe: '20000', stretch: '24000', safeRatio: '10.00%' },
  { id: 'E1-015', sen: { net_monthly_income_myr: '200000', essential_outflows_myr: '100000', liquid_savings_myr: '300000' }, outflows: '100000', signed: '100000', surplus: '100000', disposable: '100000', runway: { kind: 'FINITE', numerator_sen: '300000', denominator_sen: '100000', display_months: '3.00' }, gap: '0', tier: 'BUFFER_ADEQUATE', alpha: '0.60', remainingCap: '20000', safe: '20000', stretch: '24000', safeRatio: '10.00%' },
  { id: 'E1-016', sen: { net_monthly_income_myr: '400000', essential_outflows_myr: '100000', liquid_savings_myr: '400000' }, outflows: '100000', signed: '300000', surplus: '300000', disposable: '300000', runway: { kind: 'FINITE', numerator_sen: '400000', denominator_sen: '100000', display_months: '4.00' }, gap: '0', tier: 'BUFFER_ADEQUATE', alpha: '0.60', remainingCap: '40000', safe: '40000', stretch: '48000', safeRatio: '10.00%' },
  { id: 'E1-017', sen: { net_monthly_income_myr: '100000', essential_outflows_myr: '50000', liquid_savings_myr: '300000' }, target: '6', cap: '0.12', outflows: '50000', signed: '50000', surplus: '50000', disposable: '50000', runway: { kind: 'FINITE', numerator_sen: '300000', denominator_sen: '50000', display_months: '6.00' }, gap: '0', tier: 'BUFFER_ADEQUATE', alpha: '0.60', remainingCap: '12000', safe: '12000', stretch: '12000', safeRatio: '12.00%' },
  { id: 'E1-018', sen: { net_monthly_income_myr: '10005', essential_outflows_myr: '10000', liquid_savings_myr: '10000' }, outflows: '10000', signed: '5', surplus: '5', disposable: '5', runway: { kind: 'FINITE', numerator_sen: '10000', denominator_sen: '10000', display_months: '1.00' }, gap: '20000', tier: 'BUILD_BUFFER_ALONGSIDE', alpha: '0.50', remainingCap: '1001', safe: '3', stretch: '5', safeRatio: '0.03%' },
  { id: 'E1-021', sen: { net_monthly_income_myr: '200000', essential_outflows_myr: '100000', liquid_savings_myr: '0' }, outflows: '100000', signed: '100000', surplus: '100000', disposable: '100000', runway: { kind: 'FINITE', numerator_sen: '0', denominator_sen: '100000', display_months: '0.00' }, gap: '300000', tier: 'PRIORITY_EMERGENCY_BUFFER', alpha: '0.25', remainingCap: '20000', safe: '20000', stretch: '24000', safeRatio: '10.00%' },
  { id: 'E1-024', sen: { net_monthly_income_myr: '200000', essential_outflows_myr: '100000', liquid_savings_myr: '300000' }, target: '3', cap: '0.08', outflows: '100000', signed: '100000', surplus: '100000', disposable: '100000', runway: { kind: 'FINITE', numerator_sen: '300000', denominator_sen: '100000', display_months: '3.00' }, gap: '0', tier: 'BUFFER_ADEQUATE', alpha: '0.60', remainingCap: '16000', safe: '16000', stretch: '24000', safeRatio: '8.00%' },
  { id: 'E1-025', sen: { net_monthly_income_myr: '300000', essential_outflows_myr: '250000', liquid_savings_myr: '750000' }, outflows: '250000', signed: '50000', surplus: '50000', disposable: '50000', runway: { kind: 'FINITE', numerator_sen: '750000', denominator_sen: '250000', display_months: '3.00' }, gap: '0', tier: 'BUFFER_ADEQUATE', alpha: '0.60', remainingCap: '30000', safe: '30000', stretch: '36000', safeRatio: '10.00%' },
  { id: 'E1-026', sen: { net_monthly_income_myr: '300000', essential_outflows_myr: '250002', liquid_savings_myr: '750006' }, outflows: '250002', signed: '49998', surplus: '49998', disposable: '49998', runway: { kind: 'FINITE', numerator_sen: '750006', denominator_sen: '250002', display_months: '3.00' }, gap: '0', tier: 'BUFFER_ADEQUATE', alpha: '0.60', remainingCap: '30000', safe: '29999', stretch: '36000', safeRatio: '10.00%' },
  { id: 'E1-027', sen: { net_monthly_income_myr: '300000', essential_outflows_myr: '249998', liquid_savings_myr: '749994' }, outflows: '249998', signed: '50002', surplus: '50002', disposable: '50002', runway: { kind: 'FINITE', numerator_sen: '749994', denominator_sen: '249998', display_months: '3.00' }, gap: '0', tier: 'BUFFER_ADEQUATE', alpha: '0.60', remainingCap: '30000', safe: '30000', stretch: '36000', safeRatio: '10.00%' },
  { id: 'E1-029', sen: { net_monthly_income_myr: '300000', essential_outflows_myr: '250000', existing_protection_commitments_myr: '50001', liquid_savings_myr: '750000' }, outflows: '250000', signed: '50000', surplus: '50000', disposable: '0', runway: { kind: 'FINITE', numerator_sen: '750000', denominator_sen: '250000', display_months: '3.00' }, gap: '0', tier: 'BUFFER_ADEQUATE', alpha: '0.60', remainingCap: '0', safe: '0', stretch: '0', safeRatio: '16.67%' },
]

function success(result: ReturnType<typeof calculateEngine1>, id: string): Engine1Success {
  assert.equal(result.kind, 'success', `${id} discriminant`)
  assert.equal(result.result_status, 'CALCULATED_EDUCATIONAL', `${id} result status`)
  return result as Engine1Success
}

function assertFailureEnvelope(result: ReturnType<typeof calculateEngine1>, status: string): asserts result is Engine1Failure {
  assert.equal(result.kind, 'failure')
  assert.equal(result.result_status, status)
  if (result.kind !== 'failure') return
  assert.equal(result.outputs, null)
  assert.deepEqual(result.inputs_snapshot, {})
  assert.deepEqual(result.selected_configuration, {})
  assert.deepEqual(result.intermediate_values_sen, {})
  assert.deepEqual(result.assumptions, [])
  assert.deepEqual(result.warnings, [])
  assert.deepEqual(result.formula_trace, [])
  assert.doesNotThrow(() => JSON.stringify(result))
}

for (const expected of numericCases) {
  test(expected.id, () => {
    const result = success(calculateEngine1(requestFor(expected.id, expected.sen, { target: expected.target, cap: expected.cap })), expected.id)
    assert.deepEqual(result.intermediate_values_sen, {
      total_monthly_outflows: expected.outflows,
      signed_cashflow_balance: expected.signed,
      cash_surplus: expected.surplus,
      disposable_cash: expected.disposable,
      emergency_fund_gap: expected.gap,
      remaining_protection_cap: expected.remainingCap,
      safe_protection_budget: expected.safe,
      stretch_protection_budget: expected.stretch,
    })
    assert.deepEqual(result.outputs.emergency_runway, expected.runway)
    assert.equal(result.outputs.liquidity_classification, expected.tier)
    assert.equal(result.outputs.allocation_factor, expected.alpha)
    assert.equal(result.outputs.safe_total_ratio?.display_percent ?? null, expected.safeRatio)
    if (expected.id === 'E1-005') assert.equal(result.outputs.safe_total_ratio_reason, 'ZERO_INCOME')
    else assert.equal(result.outputs.safe_total_ratio_reason, null)
    assert.equal(result.outputs.emergency_fund_gap.display_myr, myrFromSen(expected.gap).replace(/^/, 'RM'))
    assert.equal(result.outputs.signed_cashflow_balance.display_myr, expectedMyr(expected.signed))
    assert.equal(result.outputs.cash_surplus.display_myr, expectedMyr(expected.surplus))
    assert.equal(result.outputs.disposable_cash.display_myr, expectedMyr(expected.disposable))
    assert.equal(result.outputs.remaining_protection_cap.display_myr, expectedMyr(expected.remainingCap))
    assert.equal(result.outputs.safe_protection_budget.display_myr, expectedMyr(expected.safe))
    assert.equal(result.outputs.stretch_protection_budget.display_myr, expectedMyr(expected.stretch))
    assert.match(result.outputs.disclosure, /Illustrative educational scenario/)
    assert.match(result.outputs.budget_interpretation, /not recommendations, premiums, or proof of affordability/)
    assert.deepEqual(result.formula_trace.map((step) => step.formula_id), [
      'E1.OUTFLOWS', 'E1.CASHFLOW', 'E1.RUNWAY', 'E1.CLASSIFICATION', 'E1.EMERGENCY_GAP', 'E1.PROTECTION_BUDGETS', 'E1.RESULT',
    ])
    assert.equal(result.formula_trace[0]?.inputs.Eess, result.inputs_snapshot.essential_outflows_myr)
    assert.equal(result.formula_trace[0]?.result.Ototal, expected.outflows)
    assert.equal(result.formula_trace[5]?.inputs.rcap, result.selected_configuration.protection_cap_ratio)
    assert.equal(result.formula_trace[5]?.result.safe_budget_sen, expected.safe)
    assert.equal(result.formula_trace[6]?.result.result_status, result.result_status)
    assert.equal(result.formula_trace[6]?.result.safe_protection_budget_sen, expected.safe)
    assert.equal(result.assumptions.find((item) => item.assumption_id === 'target_runway_months')?.value, result.selected_configuration.target_runway_months)
  })
}

function expectedMyr(sen: string): string {
  const value = BigInt(sen)
  const absolute = value < 0n ? -value : value
  return `${value < 0n ? '-' : ''}RM${absolute / 100n}.${(absolute % 100n).toString().padStart(2, '0')}`
}

test('E1-006', () => {
  const result = calculateEngine1(requestFor('E1-006', { net_monthly_income_myr: '-0.01' }))
  assertFailureEnvelope(result, 'INVALID_INPUT')
  assert.equal(result.validation_errors[0]?.code, 'NEGATIVE_NOT_ALLOWED')
  assert.equal(result.validation_errors[0]?.field, 'net_monthly_income_myr')
})

test('E1-019', () => {
  const valid = success(calculateEngine1(requestFor('E1-019-valid-sen', { net_monthly_income_myr: '100001' })), 'E1-019 valid sen')
  assert.equal(valid.inputs_snapshot.net_monthly_income_myr, '100001')
  const invalid = calculateEngine1({
    ...requestFor('E1-019-excess-precision'),
    inputs: { ...requestFor('E1-019-excess-precision').inputs, net_monthly_income_myr: '1000.001' },
  })
  assertFailureEnvelope(invalid, 'INVALID_INPUT')
  assert.equal(invalid.validation_errors[0]?.code, 'INVALID_MONEY_FORMAT')
})

test('E1-020', () => {
  for (const target of ['2.99', '6.01']) {
    const result = calculateEngine1(requestFor(`E1-020-target-${target}`, {}, { target }))
    assertFailureEnvelope(result, 'INVALID_CONFIGURATION')
    assert.equal(result.validation_errors[0]?.field, 'target_runway_months')
  }
  for (const cap of ['0.079', '0.121']) {
    const result = calculateEngine1(requestFor(`E1-020-cap-${cap}`, {}, { cap }))
    assertFailureEnvelope(result, 'INVALID_CONFIGURATION')
    assert.equal(result.validation_errors[0]?.field, 'protection_cap_ratio')
  }
})

test('E1-022', () => {
  const result = calculateEngine1(requestFor('E1-022', { liquid_savings_myr: '-0.01' }))
  assertFailureEnvelope(result, 'INVALID_INPUT')
  assert.equal(result.validation_errors[0]?.code, 'NEGATIVE_NOT_ALLOWED')
})

test('E1-023', () => {
  const result = calculateEngine1(requestFor('E1-023', { debt_commitments_myr: '-0.01' }))
  assertFailureEnvelope(result, 'INVALID_INPUT')
  assert.equal(result.validation_errors[0]?.code, 'NEGATIVE_NOT_ALLOWED')
})

test('E1-028', () => {
  const result = calculateEngine1(requestFor('E1-028', { net_monthly_income_myr: 'NaN' }))
  assertFailureEnvelope(result, 'INVALID_INPUT')
  assert.equal(result.validation_errors[0]?.code, 'INVALID_MONEY_FORMAT')
})

test('E1-VALIDATION-MISSING-INPUT', () => {
  const request = requestFor('E1-VALIDATION-MISSING-INPUT')
  request.inputs.liquid_savings_myr = undefined
  const result = calculateEngine1(request)
  assertFailureEnvelope(result, 'INCOMPLETE_INPUT')
  assert.equal(result.validation_errors[0]?.code, 'MISSING_REQUIRED_FIELD')
})

test('E1-VALIDATION-BINARY-FLOAT', () => {
  const request = requestFor('E1-VALIDATION-BINARY-FLOAT')
  request.inputs.net_monthly_income_myr = 1000.01
  const result = calculateEngine1(request)
  assertFailureEnvelope(result, 'INVALID_INPUT')
  assert.equal(result.validation_errors[0]?.code, 'INVALID_MONEY_FORMAT')
})

test('E1-VALIDATION-PRODUCT-MODE-DISABLED', () => {
  const result = calculateEngine1({ ...requestFor('E1-VALIDATION-PRODUCT-MODE-DISABLED'), calculation_mode: 'PRODUCT_SPECIFIC' })
  assertFailureEnvelope(result, 'MODE_DISABLED')
})

test('E1-HARDEN-NULL-UNDEFINED-MALFORMED-REQUESTS', () => {
  for (const raw of [null, undefined, 'request', 42, []]) {
    const result = calculateEngine1(raw)
    assertFailureEnvelope(result, 'INVALID_REQUEST')
    if (result.kind === 'failure') assert.equal(result.validation_errors[0]?.code, 'INVALID_REQUEST')
  }
})

test('E1-HARDEN-MALFORMED-INPUT-OBJECTS', () => {
  const missingInputs = calculateEngine1({ ...requestFor('missing-input-object'), inputs: null })
  assertFailureEnvelope(missingInputs, 'INCOMPLETE_INPUT')
  const arrayInputs = calculateEngine1({ ...requestFor('array-input-object'), inputs: [] })
  assertFailureEnvelope(arrayInputs, 'INVALID_REQUEST')
  const extraInput = requestFor('unsupported-input-field')
  ;(extraInput.inputs as Record<string, unknown>).account_balance = '5000.00'
  const unsupported = calculateEngine1(extraInput)
  assertFailureEnvelope(unsupported, 'INVALID_REQUEST')
  if (unsupported.kind === 'failure') assert.equal(unsupported.validation_errors[0]?.code, 'UNSUPPORTED_FIELD')
})

test('E1-HARDEN-MONEY-INPUT-LENGTH-BOUNDARY-AND-BIGINT', () => {
  const whole = '9'.repeat(128)
  const maxMoneyText = `${whole}.99`
  assert.equal(whole.length, 128)
  assert.equal(maxMoneyText.length, 131)
  const request = requestFor('maximum-technical-input-length')
  request.inputs.net_monthly_income_myr = maxMoneyText
  request.inputs.essential_outflows_myr = '0.00'
  request.inputs.liquid_savings_myr = '0.00'
  const result = success(calculateEngine1(request), 'maximum technical input length')
  const expectedIncomeSen = (BigInt(whole) * 100n + 99n).toString()
  assert.equal(result.inputs_snapshot.net_monthly_income_myr, expectedIncomeSen)
  assert.equal(result.intermediate_values_sen.signed_cashflow_balance, expectedIncomeSen)
  assert.doesNotThrow(() => JSON.stringify(result))
  assert.match(result.outputs.safe_protection_budget.display_myr, /^RM\d+\.\d{2}$/)
})

test('E1-HARDEN-OVERLONG-MONEY-AND-CONFIGURATION', () => {
  const moneyRequest = requestFor('overlong-money')
  moneyRequest.inputs.net_monthly_income_myr = '9'.repeat(129)
  const overlongMoney = calculateEngine1(moneyRequest)
  assertFailureEnvelope(overlongMoney, 'INVALID_INPUT')
  if (overlongMoney.kind === 'failure') assert.equal(overlongMoney.validation_errors[0]?.code, 'INPUT_TOO_LONG')

  const atLimitConfiguration = requestFor('max-config-length', {}, { target: `3.${'0'.repeat(126)}` })
  const acceptedConfiguration = success(calculateEngine1(atLimitConfiguration), 'configuration length boundary')
  assert.equal(acceptedConfiguration.selected_configuration.target_runway_months, '3')

  const configRequest = requestFor('overlong-config')
  configRequest.target_runway_months = `3.${'0'.repeat(127)}`
  const overlongConfig = calculateEngine1(configRequest)
  assertFailureEnvelope(overlongConfig, 'INVALID_CONFIGURATION')
  if (overlongConfig.kind === 'failure') assert.equal(overlongConfig.validation_errors[0]?.code, 'INPUT_TOO_LONG')
})

test('E1-HARDEN-UNSUPPORTED-NUMERIC-REPRESENTATIONS', () => {
  for (const value of [1000.01, Number.NaN, Number.POSITIVE_INFINITY, '1e3', '1.000', '', {}, ['1000']]) {
    const request = requestFor('unsupported-numeric-representation')
    request.inputs.net_monthly_income_myr = value
    const result = calculateEngine1(request)
    assertFailureEnvelope(result, 'INVALID_INPUT')
  }
})

test('E1-HARDEN-CURRENCY-AND-RUNWAY-DISPLAY', () => {
  assert.equal(formatMyrFromSen(0n), 'RM0.00')
  assert.equal(formatMyrFromSen(-0n), 'RM0.00')
  assert.equal(formatMyrFromSen(1n), 'RM0.01')
  assert.equal(formatMyrFromSen(-1n), '-RM0.01')
  assert.equal(formatMyrFromSen(123456789012345n), 'RM1234567890123.45')

  const zeroSigned = requestFor('zero-signed-display', {
    net_monthly_income_myr: '0', essential_outflows_myr: '0', liquid_savings_myr: '100',
  })
  const zeroResult = success(calculateEngine1(zeroSigned), 'zero signed display')
  assert.equal(zeroResult.outputs.signed_cashflow_balance.display_myr, 'RM0.00')
  assert.deepEqual(zeroResult.outputs.emergency_runway, { kind: 'UNBOUNDED', display: 'UNBOUNDED' })

  const rounded = success(calculateEngine1(requestFor('E1-018-display', {
    net_monthly_income_myr: '10005', essential_outflows_myr: '10000', liquid_savings_myr: '10000',
  })), 'E1-018 display')
  assert.equal(rounded.outputs.safe_protection_budget.display_myr, 'RM0.03')
  assert.equal(rounded.outputs.stretch_protection_budget.display_myr, 'RM0.05')
  assert.equal(rounded.outputs.remaining_protection_cap.display_myr, 'RM10.01')
})

test('E1-HARDEN-CALCULATION-TRACE-DETAIL', () => {
  const result = success(calculateEngine1(requestFor('trace-detail', {
    net_monthly_income_myr: '10005', essential_outflows_myr: '10000', liquid_savings_myr: '10000',
  })), 'trace detail')
  const trace = Object.fromEntries(result.formula_trace.map((step) => [step.formula_id, step]))
  assert.deepEqual(trace['E1.OUTFLOWS']?.inputs, { Eess: '10000', Ddebt: '0', Fsup: '0' })
  assert.deepEqual(trace['E1.OUTFLOWS']?.result, { Ototal: '10000' })
  assert.deepEqual(trace['E1.CASHFLOW']?.result, { signedBalance: '5', Csurplus: '5', Cdisp: '5' })
  assert.equal(trace['E1.EMERGENCY_GAP']?.inputs.Mtarget, '3.0')
  assert.equal(trace['E1.PROTECTION_BUDGETS']?.result.safe_demand_rounded_sen, '3')
  assert.equal(trace['E1.PROTECTION_BUDGETS']?.result.cap_before_existing_rounded_sen, '1001')
  assert.equal(trace['E1.PROTECTION_BUDGETS']?.result.safe_budget_sen, result.outputs.safe_protection_budget.sen)
  assert.equal(trace['E1.RESULT']?.result.safe_protection_budget_sen, result.outputs.safe_protection_budget.sen)
  assert.deepEqual(result.assumptions.map((assumption) => assumption.assumption_id), [
    'calculation_mode', 'target_runway_months', 'protection_cap_ratio',
  ])
})

test('E1-HARDEN-UNEXPECTED-ERROR-NO-DATA-LEAK', () => {
  const hostile = Object.defineProperty({}, 'calculation_mode', {
    get() { throw new Error('private financial input marker') },
  })
  const result = calculateEngine1(hostile)
  assertFailureEnvelope(result, 'INTERNAL_ERROR')
  if (result.kind === 'failure') {
    assert.equal(result.validation_errors[0]?.code, 'UNEXPECTED_INTERNAL_ERROR')
    assert.doesNotMatch(JSON.stringify(result), /private financial input marker/)
  }
})

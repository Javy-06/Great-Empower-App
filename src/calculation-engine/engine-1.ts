/**
 * GREAT EMPOWER Engine 1: deterministic educational affordability and liquidity.
 * Money enters as decimal MYR strings and is normalized once to BigInt sen.
 * This module has no UI, network, persistence, or Product Master dependency.
 */

export type Engine1Mode = 'GENERIC_EDUCATIONAL' | 'PRODUCT_SPECIFIC'

export type Engine1MoneyField =
  | 'net_monthly_income_myr'
  | 'essential_outflows_myr'
  | 'debt_commitments_myr'
  | 'family_support_myr'
  | 'existing_protection_commitments_myr'
  | 'liquid_savings_myr'

export interface Engine1Request {
  calculation_mode: Engine1Mode | string
  engine_id: string
  engine_version: string
  scenario_id: string
  as_of_date: string
  currency: string
  inputs: Partial<Record<Engine1MoneyField, unknown>>
  target_runway_months?: unknown
  protection_cap_ratio?: unknown
}

export type Engine1ErrorCode =
  | 'INVALID_REQUEST'
  | 'UNSUPPORTED_FIELD'
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_METADATA'
  | 'INVALID_MONEY_FORMAT'
  | 'NEGATIVE_NOT_ALLOWED'
  | 'INPUT_TOO_LONG'
  | 'UNEXPECTED_INTERNAL_ERROR'
  | 'INVALID_CONFIGURATION'

export interface Engine1ValidationError {
  code: Engine1ErrorCode
  field: string
  message: string
}

export interface Engine1Runway {
  kind: 'FINITE'
  numerator_sen: string
  denominator_sen: string
  display_months: string
}

export type Engine1ErrorStatus =
  | 'INVALID_REQUEST'
  | 'INCOMPLETE_INPUT'
  | 'INVALID_INPUT'
  | 'INVALID_CONFIGURATION'
  | 'MODE_DISABLED'
  | 'INTERNAL_ERROR'

interface Engine1ResponseBase {
  engine_id: 'E1'
  engine_version: string | null
  scenario_id: string | null
  as_of_date: string | null
  currency: string | null
  inputs_snapshot: Record<string, string>
  selected_configuration: Record<string, string>
  intermediate_values_sen: Record<string, string>
  assumptions: Array<{ assumption_id: string; value: string; unit: 'enum' | 'month' | 'ratio'; origin: 'USER_SELECTED' | 'SOURCE_ILLUSTRATION'; explanation: string }>
  warnings: string[]
  formula_trace: Array<{ formula_id: string; stage: string; formula: string; inputs: Record<string, string>; result: Record<string, string> }>
}

export interface Engine1Success extends Engine1ResponseBase {
  kind: 'success'
  calculation_mode: 'GENERIC_EDUCATIONAL'
  engine_id: 'E1'
  engine_version: string
  scenario_id: string
  as_of_date: string
  currency: 'MYR'
  result_status: 'CALCULATED_EDUCATIONAL'
  inputs_snapshot: Record<Engine1MoneyField, string>
  selected_configuration: {
    target_runway_months: string
    protection_cap_ratio: string
  }
  intermediate_values_sen: {
    total_monthly_outflows: string
    signed_cashflow_balance: string
    cash_surplus: string
    disposable_cash: string
    emergency_fund_gap: string
    remaining_protection_cap: string
    safe_protection_budget: string
    stretch_protection_budget: string
  }
  outputs: {
    emergency_runway: Engine1Runway | { kind: 'UNBOUNDED'; display: 'UNBOUNDED' }
    liquidity_classification: 'PRIORITY_EMERGENCY_BUFFER' | 'BUILD_BUFFER_ALONGSIDE' | 'BUFFER_ADEQUATE'
    allocation_factor: string
    signed_cashflow_balance: { sen: string; display_myr: string }
    cash_surplus: { sen: string; display_myr: string }
    disposable_cash: { sen: string; display_myr: string }
    emergency_fund_gap: { sen: string; display_myr: string }
    remaining_protection_cap: { sen: string; display_myr: string }
    safe_protection_budget: { sen: string; display_myr: string }
    stretch_protection_budget: { sen: string; display_myr: string }
    safe_total_ratio: { display_percent: string; numerator: string; denominator: string } | null
    safe_total_ratio_reason: 'ZERO_INCOME' | null
    disclosure: string
    budget_interpretation: string
  }
  assumptions: Array<{
    assumption_id: string
    value: string
    unit: 'enum' | 'month' | 'ratio'
    origin: 'USER_SELECTED' | 'SOURCE_ILLUSTRATION'
    explanation: string
  }>
  warnings: string[]
  formula_trace: Array<{
    formula_id: string
    stage: string
    formula: string
    inputs: Record<string, string>
    result: Record<string, string>
  }>
}

export interface Engine1Failure {
  kind: 'failure'
  calculation_mode: string
  engine_id: 'E1'
  engine_version: string | null
  scenario_id: string | null
  as_of_date: string | null
  currency: string | null
  result_status: Engine1ErrorStatus
  inputs_snapshot: Record<string, string>
  selected_configuration: Record<string, string>
  intermediate_values_sen: Record<string, string>
  outputs: null
  assumptions: []
  warnings: []
  formula_trace: []
  validation_errors: Engine1ValidationError[]
}

export type Engine1Result = Engine1Success | Engine1Failure

type Rational = { numerator: bigint; denominator: bigint }
type ParsedMoney = { field: Engine1MoneyField; sen: bigint }

const DISCLOSURE =
  'Illustrative educational scenario. This does not reproduce any specific insurance or Takaful product, establish coverage, predict claim acceptance, or provide financial advice.'
const MONEY_FIELDS: Engine1MoneyField[] = [
  'net_monthly_income_myr',
  'essential_outflows_myr',
  'debt_commitments_myr',
  'family_support_myr',
  'existing_protection_commitments_myr',
  'liquid_savings_myr',
]
export const ENGINE1_TECHNICAL_INPUT_LIMITS = {
  maxMoneyIntegerDigits: 128,
  maxConfigurationCharacters: 128,
} as const

function failure(
  request: unknown,
  resultStatus: Engine1Failure['result_status'],
  errors: Engine1ValidationError[] = [],
): Engine1Failure {
  const metadata = isRecord(request) ? request : {}
  return {
    kind: 'failure',
    calculation_mode: typeof metadata.calculation_mode === 'string' ? metadata.calculation_mode : 'UNKNOWN',
    engine_id: 'E1',
    engine_version: typeof metadata.engine_version === 'string' ? metadata.engine_version : null,
    scenario_id: typeof metadata.scenario_id === 'string' ? metadata.scenario_id : null,
    as_of_date: typeof metadata.as_of_date === 'string' ? metadata.as_of_date : null,
    currency: typeof metadata.currency === 'string' ? metadata.currency : null,
    result_status: resultStatus,
    inputs_snapshot: {},
    selected_configuration: {},
    intermediate_values_sen: {},
    outputs: null,
    assumptions: [],
    warnings: [],
    formula_trace: [],
    validation_errors: errors,
  }
}

function validationError(code: Engine1ErrorCode, field: string, message: string): Engine1ValidationError {
  return { code, field, message }
}

function parseMyr(value: unknown, field: Engine1MoneyField): { sen?: bigint; error?: Engine1ValidationError } {
  if (value === undefined || value === null) {
    return { error: validationError('MISSING_REQUIRED_FIELD', field, 'A required monetary input is missing.') }
  }
  if (typeof value !== 'string') {
    return { error: validationError('INVALID_MONEY_FORMAT', field, 'Money must be a finite decimal MYR string with at most two decimal places.') }
  }
  if (value.split('.')[0].length > ENGINE1_TECHNICAL_INPUT_LIMITS.maxMoneyIntegerDigits) {
    return { error: validationError('INPUT_TOO_LONG', field, 'Money input exceeds the documented technical parsing limit.') }
  }
  if (value.startsWith('-')) {
    return { error: validationError('NEGATIVE_NOT_ALLOWED', field, 'Negative monetary inputs are not permitted.') }
  }
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    return { error: validationError('INVALID_MONEY_FORMAT', field, 'Money must be a finite decimal MYR string with at most two decimal places.') }
  }

  const [ringgit, cents = ''] = value.split('.')
  const sen = BigInt(ringgit) * 100n + BigInt(cents.padEnd(2, '0') || '0')
  return { sen }
}

function parseDecimal(value: unknown, field: string): { rational?: Rational; canonical?: string; error?: Engine1ValidationError } {
  if (value === undefined) return {}
  if (value === null) {
    return { error: validationError('MISSING_REQUIRED_FIELD', field, 'An explicitly null configuration is unknown; omit it to use the documented default.') }
  }
  if (typeof value !== 'string') {
    return { error: validationError('INVALID_CONFIGURATION', field, 'Configuration must be an exact non-negative decimal string.') }
  }
  if (value.length > ENGINE1_TECHNICAL_INPUT_LIMITS.maxConfigurationCharacters) {
    return { error: validationError('INPUT_TOO_LONG', field, 'Configuration input exceeds the documented technical parsing limit.') }
  }
  if (!/^\d+(?:\.\d+)?$/.test(value)) return { error: validationError('INVALID_CONFIGURATION', field, 'Configuration must be an exact non-negative decimal string.') }
  const [whole, fractional = ''] = value.split('.')
  const denominator = 10n ** BigInt(fractional.length)
  const numerator = BigInt(whole) * denominator + BigInt(fractional || '0')
  const divisor = gcd(numerator, denominator)
  const canonicalFraction = fractional.replace(/0+$/, '')
  const canonical = `${whole.replace(/^0+(?=\d)/, '')}${canonicalFraction ? `.${canonicalFraction}` : ''}`
  return {
    rational: { numerator: numerator / divisor, denominator: denominator / divisor },
    canonical,
  }
}

function gcd(a: bigint, b: bigint): bigint {
  let left = a < 0n ? -a : a
  let right = b < 0n ? -b : b
  while (right !== 0n) [left, right] = [right, left % right]
  return left || 1n
}

/** Round a rational number to the nearest integer, with exact half-up ties. */
function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new RangeError('Denominator must be positive.')
  const negative = numerator < 0n
  const magnitude = negative ? -numerator : numerator
  const rounded = (magnitude * 2n + denominator) / (2n * denominator)
  return negative ? -rounded : rounded
}

function multiplyRound(value: bigint, factor: Rational): bigint {
  return roundHalfUp(value * factor.numerator, factor.denominator)
}

function maxZero(value: bigint): bigint {
  return value > 0n ? value : 0n
}

function compareRatioToRational(valueNumerator: bigint, valueDenominator: bigint, other: Rational): number {
  const left = valueNumerator * other.denominator
  const right = valueDenominator * other.numerator
  return left < right ? -1 : left > right ? 1 : 0
}

export function formatMyrFromSen(sen: bigint): string {
  const negative = sen < 0n
  const absolute = negative ? -sen : sen
  const prefix = negative ? '-' : ''
  return `${prefix}RM${(absolute / 100n).toString()}.${(absolute % 100n).toString().padStart(2, '0')}`
}

function formatRoundedDecimal(numerator: bigint, denominator: bigint, decimalPlaces: number): string {
  const scale = 10n ** BigInt(decimalPlaces)
  const rounded = roundHalfUp(numerator * scale, denominator)
  const whole = rounded / scale
  const fraction = (rounded % scale).toString().padStart(decimalPlaces, '0')
  return decimalPlaces > 0 ? `${whole}.${fraction}` : whole.toString()
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function makeAssumption(
  assumptionId: string,
  value: string,
  unit: 'enum' | 'month' | 'ratio',
  origin: 'USER_SELECTED' | 'SOURCE_ILLUSTRATION',
  explanation: string,
) {
  return { assumption_id: assumptionId, value, unit, origin, explanation }
}

/** Validation completes before normalized values enter this calculation body. */
function calculateValidatedRequest(rawRequest: unknown): Engine1Result {
  if (!isRecord(rawRequest)) {
    return failure(null, 'INVALID_REQUEST', [validationError('INVALID_REQUEST', 'request', 'Request must be a non-null object.')])
  }
  const request = rawRequest as unknown as Engine1Request
  if (request.calculation_mode === 'PRODUCT_SPECIFIC') return failure(request, 'MODE_DISABLED')
  if (request.calculation_mode !== 'GENERIC_EDUCATIONAL') {
    return failure(request, 'INVALID_CONFIGURATION', [
      validationError('INVALID_CONFIGURATION', 'calculation_mode', 'Only GENERIC_EDUCATIONAL mode is supported by Engine 1.'),
    ])
  }

  const metadataErrors: Engine1ValidationError[] = []
  if (request.engine_id !== 'E1') metadataErrors.push(validationError('INVALID_METADATA', 'engine_id', 'Engine ID must be E1.'))
  if (typeof request.engine_version !== 'string' || request.engine_version.trim() === '') {
    metadataErrors.push(validationError('MISSING_REQUIRED_FIELD', 'engine_version', 'Engine version is required.'))
  }
  if (typeof request.scenario_id !== 'string' || request.scenario_id.trim() === '') {
    metadataErrors.push(validationError('MISSING_REQUIRED_FIELD', 'scenario_id', 'Scenario ID is required.'))
  }
  if (typeof request.as_of_date !== 'string' || !validDate(request.as_of_date)) {
    metadataErrors.push(validationError('INVALID_METADATA', 'as_of_date', 'As-of date must be a valid YYYY-MM-DD date.'))
  }
  if (request.currency !== 'MYR') metadataErrors.push(validationError('INVALID_METADATA', 'currency', 'Engine 1 supports MYR only.'))
  if (request.inputs === undefined || request.inputs === null) {
    metadataErrors.push(validationError('MISSING_REQUIRED_FIELD', 'inputs', 'Engine 1 inputs are required.'))
  } else if (!isRecord(request.inputs)) {
    metadataErrors.push(validationError('INVALID_REQUEST', 'inputs', 'Inputs must be an object with named Engine 1 values.'))
  }
  if (metadataErrors.length > 0) {
    const status: Engine1ErrorStatus = metadataErrors.some((error) => error.code === 'INVALID_REQUEST')
      ? 'INVALID_REQUEST'
      : metadataErrors.some((error) => error.code === 'MISSING_REQUIRED_FIELD')
        ? 'INCOMPLETE_INPUT'
        : 'INVALID_INPUT'
    return failure(request, status, metadataErrors)
  }

  const unsupportedFields = Object.keys(request.inputs).filter((field) => !MONEY_FIELDS.includes(field as Engine1MoneyField))
  if (unsupportedFields.length > 0) {
    return failure(request, 'INVALID_REQUEST', unsupportedFields.map((field) => validationError('UNSUPPORTED_FIELD', `inputs.${field}`, 'Input field is not supported by Engine 1.')))
  }

  const parsedMoney = MONEY_FIELDS.map((field) => ({ field, ...parseMyr(request.inputs[field], field) }))
  const moneyErrors = parsedMoney.flatMap((item) => (item.error ? [item.error] : []))
  if (moneyErrors.length > 0) {
    const status = moneyErrors.some((error) => error.code === 'MISSING_REQUIRED_FIELD') ? 'INCOMPLETE_INPUT' : 'INVALID_INPUT'
    return failure(request, status, moneyErrors)
  }
  const money = Object.fromEntries(parsedMoney.map((item) => [item.field, item.sen])) as Record<Engine1MoneyField, bigint>

  const parsedTarget = parseDecimal(request.target_runway_months, 'target_runway_months')
  const parsedCap = parseDecimal(request.protection_cap_ratio, 'protection_cap_ratio')
  const configErrors = [parsedTarget.error, parsedCap.error].filter((error): error is Engine1ValidationError => Boolean(error))
  if (configErrors.length > 0) {
    const status = configErrors.some((error) => error.code === 'MISSING_REQUIRED_FIELD') ? 'INCOMPLETE_INPUT' : 'INVALID_CONFIGURATION'
    return failure(request, status, configErrors)
  }

  const target = parsedTarget.rational ?? { numerator: 3n, denominator: 1n }
  const capRatio = parsedCap.rational ?? { numerator: 10n, denominator: 100n }
  const targetDisplay = parsedTarget.canonical ?? '3.0'
  const capDisplay = parsedCap.canonical ?? '0.10'
  const targetIsValid = target.numerator >= 3n * target.denominator && target.numerator <= 6n * target.denominator
  const capIsValid = capRatio.numerator * 100n >= 8n * capRatio.denominator && capRatio.numerator * 100n <= 12n * capRatio.denominator
  if (!targetIsValid || !capIsValid) {
    const errors: Engine1ValidationError[] = []
    if (!targetIsValid) errors.push(validationError('INVALID_CONFIGURATION', 'target_runway_months', 'Target runway must be within the inclusive range 3.0–6.0 months.'))
    if (!capIsValid) errors.push(validationError('INVALID_CONFIGURATION', 'protection_cap_ratio', 'Protection cap ratio must be within the inclusive range 0.08–0.12.'))
    return failure(request, 'INVALID_CONFIGURATION', errors)
  }

  const income = money.net_monthly_income_myr
  const essential = money.essential_outflows_myr
  const debt = money.debt_commitments_myr
  const family = money.family_support_myr
  const existing = money.existing_protection_commitments_myr
  const savings = money.liquid_savings_myr
  const outflows = essential + debt + family
  const signedBalance = income - outflows
  const cashSurplus = maxZero(signedBalance)
  const disposableCash = maxZero(cashSurplus - existing)

  let runway: Engine1Runway | { kind: 'UNBOUNDED'; display: 'UNBOUNDED' }
  let runwayRatio: Rational | null = null
  if (outflows > 0n) {
    runwayRatio = { numerator: savings, denominator: outflows }
    runway = {
      kind: 'FINITE',
      numerator_sen: savings.toString(),
      denominator_sen: outflows.toString(),
      display_months: formatRoundedDecimal(savings, outflows, 2),
    }
  } else if (savings > 0n) {
    runway = { kind: 'UNBOUNDED', display: 'UNBOUNDED' }
  } else {
    runwayRatio = { numerator: 0n, denominator: 1n }
    runway = { kind: 'FINITE', numerator_sen: '0', denominator_sen: '1', display_months: '0.00' }
  }

  const oneMonth = { numerator: 1n, denominator: 1n }
  const tier = runway.kind === 'UNBOUNDED' || (runwayRatio && compareRatioToRational(runwayRatio.numerator, runwayRatio.denominator, target) >= 0)
    ? 'BUFFER_ADEQUATE'
    : runwayRatio && compareRatioToRational(runwayRatio.numerator, runwayRatio.denominator, oneMonth) >= 0
      ? 'BUILD_BUFFER_ALONGSIDE'
      : 'PRIORITY_EMERGENCY_BUFFER'
  const allocationFactor: Rational = tier === 'BUFFER_ADEQUATE'
    ? { numerator: 60n, denominator: 100n }
    : tier === 'BUILD_BUFFER_ALONGSIDE'
      ? { numerator: 50n, denominator: 100n }
      : { numerator: 25n, denominator: 100n }

  const targetOutflow = multiplyRound(outflows, target)
  const emergencyGap = maxZero(targetOutflow - savings)
  const capBeforeExisting = multiplyRound(income, capRatio)
  const remainingCap = maxZero(capBeforeExisting - existing)
  const safeDemand = multiplyRound(disposableCash, allocationFactor)
  const safeBudget = safeDemand < remainingCap ? safeDemand : remainingCap
  const stretchGross = multiplyRound(income, { numerator: 12n, denominator: 100n })
  const stretchBeforeFloor = stretchGross - existing
  const stretchCeiling = maxZero(stretchBeforeFloor)
  const stretchBudget = disposableCash < stretchCeiling ? disposableCash : stretchCeiling
  const safeTotalRatio = income === 0n
    ? null
    : { numerator: existing + safeBudget, denominator: income }

  const amounts: Engine1Success['intermediate_values_sen'] = {
    total_monthly_outflows: outflows.toString(),
    signed_cashflow_balance: signedBalance.toString(),
    cash_surplus: cashSurplus.toString(),
    disposable_cash: disposableCash.toString(),
    emergency_fund_gap: emergencyGap.toString(),
    remaining_protection_cap: remainingCap.toString(),
    safe_protection_budget: safeBudget.toString(),
    stretch_protection_budget: stretchBudget.toString(),
  }
  const inputsSnapshot = Object.fromEntries(MONEY_FIELDS.map((field) => [field, money[field].toString()])) as Record<Engine1MoneyField, string>
  const assumptions = [
    makeAssumption('calculation_mode', 'GENERIC_EDUCATIONAL', 'enum', 'USER_SELECTED', 'The calculation uses only generic user-entered inputs and illustrative rules.'),
    makeAssumption('target_runway_months', targetDisplay, 'month', parsedTarget.rational ? 'USER_SELECTED' : 'SOURCE_ILLUSTRATION', 'Visible V2 educational target; not universal financial advice.'),
    makeAssumption('protection_cap_ratio', capDisplay, 'ratio', parsedCap.rational ? 'USER_SELECTED' : 'SOURCE_ILLUSTRATION', 'Visible V2 educational cap; not an affordable-premium recommendation.'),
  ]
  const warnings: string[] = []
  if (signedBalance < 0n) warnings.push('Monthly outflows exceed net income in this illustrative scenario.')
  if (existing > cashSurplus) warnings.push('Existing protection commitments exceed cashflow surplus; no additional budget headroom is shown.')
  if (outflows === 0n && savings > 0n) warnings.push('UNBOUNDED means no modeled outflow denominator; it does not establish financial security.')
  if (outflows === 0n && savings === 0n) warnings.push('The source-defined zero runway is a scoring convention for zero savings and zero modeled outflows.')

  return {
    kind: 'success',
    calculation_mode: 'GENERIC_EDUCATIONAL',
    engine_id: 'E1',
    engine_version: request.engine_version,
    scenario_id: request.scenario_id,
    as_of_date: request.as_of_date,
    currency: 'MYR',
    result_status: 'CALCULATED_EDUCATIONAL',
    inputs_snapshot: inputsSnapshot,
    selected_configuration: { target_runway_months: targetDisplay, protection_cap_ratio: capDisplay },
    intermediate_values_sen: amounts,
    outputs: {
      emergency_runway: runway,
      liquidity_classification: tier,
      allocation_factor: formatRoundedDecimal(allocationFactor.numerator, allocationFactor.denominator, 2),
      signed_cashflow_balance: { sen: signedBalance.toString(), display_myr: formatMyrFromSen(signedBalance) },
      cash_surplus: { sen: cashSurplus.toString(), display_myr: formatMyrFromSen(cashSurplus) },
      disposable_cash: { sen: disposableCash.toString(), display_myr: formatMyrFromSen(disposableCash) },
      emergency_fund_gap: { sen: emergencyGap.toString(), display_myr: formatMyrFromSen(emergencyGap) },
      remaining_protection_cap: { sen: remainingCap.toString(), display_myr: formatMyrFromSen(remainingCap) },
      safe_protection_budget: { sen: safeBudget.toString(), display_myr: formatMyrFromSen(safeBudget) },
      stretch_protection_budget: { sen: stretchBudget.toString(), display_myr: formatMyrFromSen(stretchBudget) },
      safe_total_ratio: safeTotalRatio
        ? {
            display_percent: `${formatRoundedDecimal(safeTotalRatio.numerator * 100n, safeTotalRatio.denominator, 2)}%`,
            numerator: safeTotalRatio.numerator.toString(),
            denominator: safeTotalRatio.denominator.toString(),
          }
        : null,
      safe_total_ratio_reason: income === 0n ? 'ZERO_INCOME' : null,
      disclosure: DISCLOSURE,
      budget_interpretation: 'Safe and stretch values are illustrative educational ceilings, not recommendations, premiums, or proof of affordability.',
    },
    assumptions,
    warnings,
    formula_trace: [
      { formula_id: 'E1.OUTFLOWS', stage: 'monthly_outflows', formula: 'Ototal = Eess + Ddebt + Fsup', inputs: { Eess: essential.toString(), Ddebt: debt.toString(), Fsup: family.toString() }, result: { Ototal: outflows.toString() } },
      { formula_id: 'E1.CASHFLOW', stage: 'cashflow', formula: 'signedBalance = Inet - Ototal; Csurplus = max(0, signedBalance); Cdisp = max(0, Csurplus - Pexist)', inputs: { Inet: income.toString(), Ototal: outflows.toString(), Pexist: existing.toString() }, result: { signedBalance: signedBalance.toString(), Csurplus: cashSurplus.toString(), Cdisp: disposableCash.toString() } },
      { formula_id: 'E1.RUNWAY', stage: 'runway', formula: 'Ototal>0 ? Sliq/Ototal : (Sliq>0 ? UNBOUNDED : 0)', inputs: { Sliq: savings.toString(), Ototal: outflows.toString() }, result: { runway: runway.kind === 'UNBOUNDED' ? 'UNBOUNDED' : `${runway.numerator_sen}/${runway.denominator_sen}` } },
      { formula_id: 'E1.CLASSIFICATION', stage: 'classification', formula: 'runway<1 => 0.25; runway<Mtarget => 0.50; otherwise => 0.60', inputs: { runway: runway.kind === 'UNBOUNDED' ? 'UNBOUNDED' : `${runway.numerator_sen}/${runway.denominator_sen}`, Mtarget: targetDisplay }, result: { tier, alpha: formatRoundedDecimal(allocationFactor.numerator, allocationFactor.denominator, 2) } },
      { formula_id: 'E1.EMERGENCY_GAP', stage: 'emergency_gap', formula: 'Gapemerg = max(0, roundHalfUp(Mtarget * Ototal) - Sliq)', inputs: { Mtarget: targetDisplay, Ototal: outflows.toString(), Sliq: savings.toString() }, result: { target_outflow_rounded_sen: targetOutflow.toString(), Gapemerg: emergencyGap.toString() } },
      { formula_id: 'E1.PROTECTION_BUDGETS', stage: 'protection_budgets', formula: 'Capremaining=max(0, roundHalfUp(rcap*Inet)-Pexist); Safe=min(roundHalfUp(alpha*Cdisp),Capremaining); Stretch=min(Cdisp,max(0,roundHalfUp(0.12*Inet)-Pexist))', inputs: { Inet: income.toString(), Pexist: existing.toString(), Cdisp: disposableCash.toString(), rcap: capDisplay, alpha: formatRoundedDecimal(allocationFactor.numerator, allocationFactor.denominator, 2) }, result: { cap_before_existing_rounded_sen: capBeforeExisting.toString(), remaining_cap_sen: remainingCap.toString(), safe_demand_rounded_sen: safeDemand.toString(), safe_budget_sen: safeBudget.toString(), stretch_gross_rounded_sen: stretchGross.toString(), stretch_before_floor_sen: stretchBeforeFloor.toString(), stretch_budget_sen: stretchBudget.toString() } },
      { formula_id: 'E1.RESULT', stage: 'final_result', formula: 'Return validated Engine 1 outputs without further monetary transformation', inputs: { calculation_mode: 'GENERIC_EDUCATIONAL', target_runway_months: targetDisplay, protection_cap_ratio: capDisplay }, result: { result_status: 'CALCULATED_EDUCATIONAL', runway: runway.kind === 'UNBOUNDED' ? 'UNBOUNDED' : runway.display_months, tier, emergency_fund_gap_sen: emergencyGap.toString(), safe_protection_budget_sen: safeBudget.toString(), stretch_protection_budget_sen: stretchBudget.toString() } },
    ],
  }
}

/**
 * Public boundary for untrusted callers. Unexpected exceptions are converted
 * to a generic failure without returning intermediate financial values or
 * exposing exception text that could contain caller data.
 */
export function calculateEngine1(request: unknown): Engine1Result {
  try {
    return calculateValidatedRequest(request)
  } catch {
    return failure(null, 'INTERNAL_ERROR', [
      validationError('UNEXPECTED_INTERNAL_ERROR', 'request', 'Engine 1 could not complete this request. No calculation result was produced.'),
    ])
  }
}

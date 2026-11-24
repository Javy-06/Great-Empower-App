/**
 * Engine 2 public request types and validation boundary.
 *
 * This module validates and calculates the scope-locked educational prototype.
 * Public MYR strings are normalized once to exact integer-sen values.
 */

export type Engine2CalculationMode = 'GENERIC_EDUCATIONAL' | 'PRODUCT_SPECIFIC'
export type Engine2CoverageGate =
  | 'APPLY_WAITING_PERIOD'
  | 'APPLY_EXCLUSION'
  | 'PROCEED_WITHOUT_GATE_ASSUMPTION'
export type Engine2CareSetting = 'INPATIENT' | 'DAY_SURGERY' | 'OUTPATIENT' | 'EMERGENCY'
export type Engine2Eligibility = 'ELIGIBLE_ASSUMED' | 'NON_ELIGIBLE_ASSUMED' | 'UNKNOWN'
export type Engine2RoomUpgradeMode = 'EXCESS_ONLY' | 'PRO_RATA_COINSURANCE' | 'PRO_RATA_RATIO'
export type Engine2Exemption =
  | 'NONE'
  | 'EXEMPT_SELECTED_COPAY_ONLY'
  | 'EXEMPT_COPAY_AND_DEDUCTIBLE_AS_ASSUMPTION'

export interface Engine2ChargeLineInput {
  line_id: string
  amount_myr: string
  category: string
  eligibility: Engine2Eligibility
}

export interface Engine2AssumptionInput {
  assumption_id: string
  value: string
  unit: 'MYR' | 'month' | 'year' | 'ratio' | 'enum' | 'boolean'
  origin: 'USER_ENTERED' | 'USER_SELECTED' | 'SOURCE_ILLUSTRATION'
  explanation: string
}

export interface Engine2NoRoomModelInput {
  mode: 'NOT_MODELED'
}

export interface Engine2ModeledRoomInput {
  mode: 'MODELED'
  hospital_days: number
  actual_daily_rate_myr: string
  entitled_daily_limit_myr: string
  room_charge_line_ids: string[]
}

export type Engine2RoomInput = Engine2NoRoomModelInput | Engine2ModeledRoomInput

export interface Engine2SubLimitInput {
  sub_limit_id: string
  category: string
  limit_myr: string
  charge_line_ids: string[]
}

export type Engine2ShareCapInput = 'NO_CAP'

export interface Engine2ShareComponentInput {
  rate: string
  cap: Engine2ShareCapInput
}

export interface Engine2ShareComponentsInput {
  co_payment: Engine2ShareComponentInput | null
  co_insurance: Engine2ShareComponentInput | null
}

export interface Engine2LimitAmountInput {
  status: 'MODELED'
  remaining_amount_myr: string
}

export interface Engine2NoLimitInput {
  status: 'NO_LIMIT'
}

export interface Engine2NotModeledLimitInput {
  status: 'NOT_MODELED'
}

export type Engine2LimitStateInput =
  | Engine2LimitAmountInput
  | Engine2NoLimitInput
  | Engine2NotModeledLimitInput

export interface Engine2LimitsInput {
  annual: Engine2LimitStateInput
  lifetime: Engine2LimitStateInput
}

export interface Engine2GatedEmployerInput {
  path: 'GATED'
  external_employer_confirmed_payment_myr: string
}

export interface Engine2NonGatedEmployerInput {
  path: 'NON_GATED'
  employer_scenario_max_myr: string
  employer_reduces_deductible: boolean
  deductible_remaining_myr: string
}

export type Engine2EmployerInput = Engine2GatedEmployerInput | Engine2NonGatedEmployerInput

export interface Engine2CommonInputs {
  total_bill_myr: string
  charge_lines: Engine2ChargeLineInput[]
  coverage_gate: Engine2CoverageGate
  care_setting: Engine2CareSetting
  employer_coordination: Engine2EmployerInput
}

export interface Engine2GatedInputs extends Engine2CommonInputs {
  coverage_gate: 'APPLY_WAITING_PERIOD' | 'APPLY_EXCLUSION'
  employer_coordination: Engine2GatedEmployerInput
  r_and_b?: never
  sub_limits?: never
  room_upgrade?: never
  cost_sharing_order?: never
  share_components?: never
  exemption?: never
  limits?: never
}

export interface Engine2NonGatedInputs extends Engine2CommonInputs {
  coverage_gate: 'PROCEED_WITHOUT_GATE_ASSUMPTION'
  employer_coordination: Engine2NonGatedEmployerInput
  r_and_b: Engine2RoomInput
  sub_limits: Engine2SubLimitInput[]
  room_upgrade: { mode: Engine2RoomUpgradeMode }
  cost_sharing_order: 'DEDUCTIBLE_FIRST' | 'COPAY_FIRST'
  share_components: Engine2ShareComponentsInput
  exemption: Engine2Exemption
  limits: Engine2LimitsInput
}

export type Engine2Inputs = Engine2GatedInputs | Engine2NonGatedInputs

export interface Engine2PublicRequest {
  calculation_mode: Engine2CalculationMode
  engine_id: 'E2'
  engine_version: string
  scenario_id: string
  as_of_date: string
  currency: 'MYR'
  inputs: Engine2Inputs
  assumptions: Engine2AssumptionInput[]
}

export type Engine2ErrorStatus =
  | 'INVALID_REQUEST'
  | 'INCOMPLETE_INPUT'
  | 'INVALID_INPUT'
  | 'INVALID_CONFIGURATION'
  | 'INPUT_RECONCILIATION_REQUIRED'
  | 'RULE_CONFIGURATION_REQUIRED'
  | 'MODE_DISABLED'
  | 'INTERNAL_ERROR'

export type Engine2ErrorCode =
  | 'MALFORMED_REQUEST'
  | 'UNKNOWN_FIELD'
  | 'INPUT_TOO_LONG'
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_MONEY_FORMAT'
  | 'INVALID_INTEGER'
  | 'UNSAFE_INTEGER'
  | 'NEGATIVE_NOT_ALLOWED'
  | 'ZERO_DAYS_NOT_ALLOWED_FOR_MODELED_INPATIENT_RNB'
  | 'UNSUPPORTED_ENUM'
  | 'INVALID_CONFIGURATION'
  | 'MUTUALLY_EXCLUSIVE_SHARE_TYPES'
  | 'DAY_SURGERY_MODELED_ZERO_DAYS_UNSUPPORTED'
  | 'BRANCH_MISMATCH'
  | 'BILL_TOTAL_MISMATCH'
  | 'ROOM_CHARGE_EXCEEDS_ELIGIBLE_BILL'
  | 'OVERLAPPING_SUBLIMIT_ALLOCATION'
  | 'RULE_CONFIGURATION_REQUIRED'
  | 'MODE_DISABLED'
  | 'SETTLEMENT_INVARIANT_VIOLATION'
  | 'INTERNAL_ERROR'

export interface Engine2ValidationError {
  code: Engine2ErrorCode
  field: string
  message: string
}

export interface Engine2Failure {
  kind: 'failure'
  result_status: Engine2ErrorStatus
  outputs: null
  validation_errors: Engine2ValidationError[]
}

export interface Engine2MoneyValue {
  original_myr: string
  sen: bigint
}

export interface Engine2NormalizedChargeLine {
  line_id: string
  amount: Engine2MoneyValue
  category: string
  eligibility: Exclude<Engine2Eligibility, 'UNKNOWN'>
}

export interface Engine2NormalizedAssumption {
  assumption_id: string
  value: string
  unit: Engine2AssumptionInput['unit']
  origin: Engine2AssumptionInput['origin']
  explanation: string
}

export interface Engine2NormalizedLimit {
  status: 'MODELED'
  remaining_amount: Engine2MoneyValue
}

export interface Engine2NormalizedNoLimit {
  status: 'NO_LIMIT'
}

export type Engine2NormalizedLimitState = Engine2NormalizedLimit | Engine2NormalizedNoLimit

export interface Engine2NormalizedBase {
  calculation_mode: 'GENERIC_EDUCATIONAL'
  engine_id: 'E2'
  engine_version: string
  scenario_id: string
  as_of_date: string
  currency: 'MYR'
  total_bill: Engine2MoneyValue
  charge_lines: Engine2NormalizedChargeLine[]
  care_setting: Engine2CareSetting
  assumptions: Engine2NormalizedAssumption[]
}

export interface Engine2NormalizedGatedRequest extends Engine2NormalizedBase {
  path: 'GATED'
  coverage_gate: 'APPLY_WAITING_PERIOD' | 'APPLY_EXCLUSION'
  external_employer_confirmed_payment: Engine2MoneyValue
}

export interface Engine2NormalizedNonGatedRequest extends Engine2NormalizedBase {
  path: 'NON_GATED'
  coverage_gate: 'PROCEED_WITHOUT_GATE_ASSUMPTION'
  employer_scenario_max: Engine2MoneyValue
  employer_reduces_deductible: boolean
  deductible_remaining: Engine2MoneyValue
  cost_sharing_order: 'DEDUCTIBLE_FIRST' | 'COPAY_FIRST'
  share_type: 'CO_PAYMENT' | 'CO_INSURANCE'
  share_rate: { numerator: bigint; denominator: bigint; original: string }
  exemption: Engine2Exemption
  annual_limit: Engine2NormalizedLimitState
  lifetime_limit: Engine2NormalizedLimitState
}

export type Engine2NormalizedRequest = Engine2NormalizedGatedRequest | Engine2NormalizedNonGatedRequest

export type Engine2ValidationResult =
  | { kind: 'valid'; normalized: Engine2NormalizedRequest }
  | Engine2Failure

export interface Engine2AmountOutput {
  sen: string
  display_myr: string
}

export interface Engine2FormulaTraceStep {
  formula_id: string
  stage: string
  formula: string
  inputs: Record<string, string>
  result: Record<string, string>
}

export type Engine2StageName =
  | 'waiting_period_exclusion_gate'
  | 'non_eligible_charges'
  | 'room_and_board_sub_limits'
  | 'room_upgrade_proration'
  | 'employer_coordination'
  | 'patient_cost_sharing'
  | 'current_claim_limits'

export interface Engine2StageResult {
  stage: Engine2StageName
  status: 'CALCULATED' | 'APPLIED' | 'SKIPPED_GATE'
  values: Record<string, string>
}

export interface Engine2LimitOutput {
  annual: { status: 'MODELED'; remaining_sen: string } | { status: 'NO_LIMIT' }
  lifetime: { status: 'MODELED'; remaining_sen: string } | { status: 'NO_LIMIT' }
  effective_limit_sen: string | null
  effective_limit_status: 'FINITE' | 'UNBOUNDED'
  applied_sen: string
}

export interface Engine2CalculatedOutputs {
  gross_bill: Engine2AmountOutput
  non_eligible_amount: Engine2AmountOutput
  eligible_claim_base: Engine2AmountOutput | null
  employer_cap_base: Engine2AmountOutput | null
  employer_payment: {
    kind: 'EMPLOYER_COORDINATION' | 'EXTERNAL_EMPLOYER_PAYMENT'
    amount: Engine2AmountOutput
  }
  personal_insurer_payment: Engine2AmountOutput
  user_out_of_pocket: Engine2AmountOutput
  patient_payable: Engine2AmountOutput
  deductible_applied: Engine2AmountOutput | null
  patient_cost_share: {
    type: 'CO_PAYMENT' | 'CO_INSURANCE' | 'NOT_APPLICABLE'
    amount: Engine2AmountOutput | null
  }
  WAIVED_COPAYMENT: Engine2AmountOutput
  WAIVED_DEDUCTIBLE: Engine2AmountOutput
  limit: Engine2LimitOutput | null
  limit_shortfall: Engine2AmountOutput | null
  room_and_board: {
    status: 'NOT_MODELED'
    billed: null
    entitled: null
    excess: null
  } | null
  sub_limit_excess: Engine2AmountOutput | null
  room_upgrade: {
    mode: 'EXCESS_ONLY' | 'NOT_APPLICABLE'
    penalty: Engine2AmountOutput
  } | null
  unallocated_amount: Engine2AmountOutput
  stage_results: Engine2StageResult[]
  disclosure: string
}

export interface Engine2Success {
  kind: 'success'
  calculation_mode: 'GENERIC_EDUCATIONAL'
  engine_id: 'E2'
  engine_version: string
  scenario_id: string
  as_of_date: string
  currency: 'MYR'
  result_status: 'CALCULATED_EDUCATIONAL'
  selected_configuration: Record<string, string>
  intermediate_values_sen: Record<string, string>
  outputs: Engine2CalculatedOutputs
  assumptions: Engine2NormalizedAssumption[]
  warnings: string[]
  formula_trace: Engine2FormulaTraceStep[]
}

export type Engine2Result = Engine2Success | Engine2Failure

export const ENGINE2_TECHNICAL_LIMITS = {
  maxMoneyWholeDigits: 128,
  maxConfigurationUtf8Bytes: 128,
  maxIdentifierCodePoints: 64,
  maxEnumUtf8Bytes: 32,
  maxExplanationCodePoints: 512,
  maxDepth: 4,
  maxPropertiesPerObject: 64,
  maxChargeLines: 256,
  maxAssumptions: 64,
} as const

type Group = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
interface GroupedError extends Engine2ValidationError {
  group: Group
  status: Engine2ErrorStatus
}

type ObjectKind =
  | 'root'
  | 'inputs'
  | 'chargeLines'
  | 'chargeLine'
  | 'employer'
  | 'rAndB'
  | 'subLimits'
  | 'subLimit'
  | 'roomUpgrade'
  | 'shareComponents'
  | 'shareComponent'
  | 'limits'
  | 'limitState'
  | 'assumptions'
  | 'assumption'

const ALLOWED_KEYS: Record<ObjectKind, readonly string[]> = {
  root: ['calculation_mode', 'engine_id', 'engine_version', 'scenario_id', 'as_of_date', 'currency', 'inputs', 'assumptions'],
  inputs: [
    'total_bill_myr', 'charge_lines', 'coverage_gate', 'care_setting', 'r_and_b', 'employer_coordination',
    'sub_limits', 'room_upgrade', 'cost_sharing_order', 'share_components', 'exemption', 'limits',
  ],
  chargeLines: [],
  chargeLine: ['line_id', 'amount_myr', 'category', 'eligibility'],
  employer: ['path', 'employer_scenario_max_myr', 'employer_reduces_deductible', 'deductible_remaining_myr', 'external_employer_confirmed_payment_myr'],
  rAndB: ['mode', 'hospital_days', 'actual_daily_rate_myr', 'entitled_daily_limit_myr', 'room_charge_line_ids'],
  subLimits: [],
  subLimit: ['sub_limit_id', 'category', 'limit_myr', 'charge_line_ids'],
  roomUpgrade: ['mode', 'coinsurance_rate'],
  shareComponents: ['co_payment', 'co_insurance'],
  shareComponent: ['rate', 'cap'],
  limits: ['annual', 'lifetime'],
  limitState: ['status', 'remaining_amount_myr'],
  assumptions: [],
  assumption: ['assumption_id', 'value', 'unit', 'origin', 'explanation'],
}

function pointer(parent: string, segment: string | number): string {
  const escaped = String(segment).replace(/~/g, '~0').replace(/\//g, '~1')
  return parent === '/' ? `/${escaped}` : `${parent}/${escaped}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function utf8Length(value: string): number {
  return new TextEncoder().encode(value).length
}

function codePointLength(value: string): number {
  return Array.from(value).length
}

function compareOrdinal(a: string, b: string): number {
  const left = Array.from(a, (char) => char.codePointAt(0) ?? 0)
  const right = Array.from(b, (char) => char.codePointAt(0) ?? 0)
  const length = Math.min(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0)
    if (difference !== 0) return difference
  }
  return left.length - right.length
}

function statusForCode(code: Engine2ErrorCode): Engine2ErrorStatus {
  switch (code) {
    case 'MALFORMED_REQUEST':
      return 'INVALID_REQUEST'
    case 'MISSING_REQUIRED_FIELD':
      return 'INCOMPLETE_INPUT'
    case 'INVALID_MONEY_FORMAT':
    case 'INVALID_INTEGER':
    case 'UNSAFE_INTEGER':
    case 'NEGATIVE_NOT_ALLOWED':
    case 'ZERO_DAYS_NOT_ALLOWED_FOR_MODELED_INPATIENT_RNB':
    case 'UNKNOWN_FIELD':
    case 'INPUT_TOO_LONG':
    case 'BILL_TOTAL_MISMATCH':
    case 'ROOM_CHARGE_EXCEEDS_ELIGIBLE_BILL':
    case 'OVERLAPPING_SUBLIMIT_ALLOCATION':
      return code === 'BILL_TOTAL_MISMATCH' || code === 'ROOM_CHARGE_EXCEEDS_ELIGIBLE_BILL' || code === 'OVERLAPPING_SUBLIMIT_ALLOCATION'
        ? 'INPUT_RECONCILIATION_REQUIRED'
        : 'INVALID_INPUT'
    case 'UNSUPPORTED_ENUM':
    case 'INVALID_CONFIGURATION':
    case 'MUTUALLY_EXCLUSIVE_SHARE_TYPES':
    case 'DAY_SURGERY_MODELED_ZERO_DAYS_UNSUPPORTED':
    case 'BRANCH_MISMATCH':
      return 'INVALID_CONFIGURATION'
    case 'RULE_CONFIGURATION_REQUIRED':
      return 'RULE_CONFIGURATION_REQUIRED'
    case 'MODE_DISABLED':
      return 'MODE_DISABLED'
    case 'SETTLEMENT_INVARIANT_VIOLATION':
    case 'INTERNAL_ERROR':
      return 'INTERNAL_ERROR'
  }
}

function grouped(
  group: Group,
  code: Engine2ErrorCode,
  field: string,
  message: string,
  status = statusForCode(code),
): GroupedError {
  return { group, code, field, message, status }
}

function failure(errors: GroupedError[]): Engine2Failure {
  const sorted = [...errors].sort((left, right) => compareOrdinal(left.field, right.field))
  const first = sorted[0]
  return {
    kind: 'failure',
    result_status: first?.status ?? 'INTERNAL_ERROR',
    outputs: null,
    validation_errors: sorted.map(({ code, field, message }) => ({ code, field, message })),
  }
}

function addGroupErrors(
  errors: GroupedError[],
  group: Group,
  code: Engine2ErrorCode,
  field: string,
  message: string,
  status?: Engine2ErrorStatus,
): void {
  errors.push(grouped(group, code, field, message, status))
}

function childKind(parent: ObjectKind, key: string): ObjectKind | undefined {
  if (parent === 'root' && key === 'inputs') return 'inputs'
  if (parent === 'root' && key === 'assumptions') return 'assumptions'
  if (parent === 'inputs') {
    if (key === 'charge_lines') return 'chargeLines'
    if (key === 'employer_coordination') return 'employer'
    if (key === 'r_and_b') return 'rAndB'
    if (key === 'sub_limits') return 'subLimits'
    if (key === 'room_upgrade') return 'roomUpgrade'
    if (key === 'share_components') return 'shareComponents'
    if (key === 'limits') return 'limits'
  }
  if (parent === 'shareComponents' && (key === 'co_payment' || key === 'co_insurance')) return 'shareComponent'
  if (parent === 'limits' && (key === 'annual' || key === 'lifetime')) return 'limitState'
  return undefined
}

function scanArray(
  value: unknown,
  path: string,
  depth: number,
  elementKind: ObjectKind,
  errors: GroupedError[],
  arrayType: 'charge_lines' | 'assumptions' | 'sub_limits' | 'room_charge_line_ids' | 'line_ids',
): void {
  if (!Array.isArray(value)) return
  if (depth > ENGINE2_TECHNICAL_LIMITS.maxDepth) {
    addGroupErrors(errors, 1, 'INPUT_TOO_LONG', path, 'Request nesting exceeds the approved structural limit.')
    return
  }
  const max = arrayType === 'charge_lines'
    ? ENGINE2_TECHNICAL_LIMITS.maxChargeLines
    : arrayType === 'assumptions'
      ? ENGINE2_TECHNICAL_LIMITS.maxAssumptions
      : null
  if (max !== null && value.length > max) {
    addGroupErrors(errors, 1, 'INPUT_TOO_LONG', path, 'Request collection exceeds the approved structural limit.')
  }
  value.forEach((item, index) => {
    const itemPath = pointer(path, index)
    if (elementKind === 'chargeLine' || elementKind === 'assumption' || elementKind === 'subLimit') {
      scanObject(item, itemPath, depth + 1, elementKind, errors)
    }
  })
}

function scanObject(value: unknown, path: string, depth: number, kind: ObjectKind, errors: GroupedError[]): void {
  if (!isRecord(value)) return
  if (depth > ENGINE2_TECHNICAL_LIMITS.maxDepth) {
    addGroupErrors(errors, 1, 'INPUT_TOO_LONG', path, 'Request nesting exceeds the approved structural limit.')
    return
  }
  let keys: string[]
  try {
    keys = Object.keys(value)
  } catch {
    addGroupErrors(errors, 1, 'MALFORMED_REQUEST', path, 'Request object could not be inspected safely.')
    return
  }
  if (keys.length > ENGINE2_TECHNICAL_LIMITS.maxPropertiesPerObject) {
    addGroupErrors(errors, 1, 'INPUT_TOO_LONG', path, 'Request object exceeds the approved property limit.')
  }
  const allowed = ALLOWED_KEYS[kind]
  for (const key of keys) {
    const propertyPath = pointer(path, key)
    if (!allowed.includes(key)) {
      addGroupErrors(errors, 1, 'UNKNOWN_FIELD', propertyPath, 'Request contains an unsupported property.')
      continue
    }
    const child = childKind(kind, key)
    const valueAtKey = value[key]
    if (child === 'chargeLines') scanArray(valueAtKey, propertyPath, depth + 1, 'chargeLine', errors, 'charge_lines')
    else if (child === 'assumptions') scanArray(valueAtKey, propertyPath, depth + 1, 'assumption', errors, 'assumptions')
    else if (child === 'subLimits') scanArray(valueAtKey, propertyPath, depth + 1, 'subLimit', errors, 'sub_limits')
    else if (kind === 'shareComponent' && key === 'cap' && Array.isArray(valueAtKey)) {
      scanArray(valueAtKey, propertyPath, depth + 1, 'shareComponent', errors, 'line_ids')
    } else if (kind === 'shareComponent' && key === 'cap' && isRecord(valueAtKey)) {
      scanObject(valueAtKey, propertyPath, depth + 1, 'shareComponent', errors)
    } else if (child) scanObject(valueAtKey, propertyPath, depth + 1, child, errors)
    else if (kind === 'rAndB' && key === 'room_charge_line_ids') scanArray(valueAtKey, propertyPath, depth + 1, 'chargeLines', errors, 'room_charge_line_ids')
    else if (kind === 'subLimit' && key === 'charge_line_ids') scanArray(valueAtKey, propertyPath, depth + 1, 'chargeLines', errors, 'line_ids')
  }
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key)
}

function missing(errors: GroupedError[], object: Record<string, unknown>, key: string, path: string): void {
  if (!hasOwn(object, key)) {
    addGroupErrors(errors, 2, 'MISSING_REQUIRED_FIELD', pointer(path, key), 'A required field is missing.')
  }
}

function missingObjectFields(
  errors: GroupedError[],
  parent: Record<string, unknown>,
  key: string,
  parentPath: string,
  fields: readonly string[],
): Record<string, unknown> | null {
  missing(errors, parent, key, parentPath)
  const value = parent[key]
  if (!isRecord(value)) return null
  const path = pointer(parentPath, key)
  for (const field of fields) missing(errors, value, field, path)
  return value
}

function parseMyrString(value: unknown, path: string, errors: GroupedError[]): bigint | undefined {
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value)) {
    if (typeof value === 'string' && /^-\d+(?:\.\d{1,2})?$/.test(value)) {
      addGroupErrors(errors, 4, 'NEGATIVE_NOT_ALLOWED', path, 'Negative monetary values are not permitted.')
    } else {
      addGroupErrors(errors, 3, 'INVALID_MONEY_FORMAT', path, 'Money must be a nonnegative MYR decimal string with at most two fractional digits.')
    }
    return undefined
  }
  const [ringgit, cents = ''] = value.split('.')
  return BigInt(ringgit ?? '0') * 100n + BigInt(cents.padEnd(2, '0') || '0')
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function parseRate(value: unknown, path: string, errors: GroupedError[]): { numerator: bigint; denominator: bigint; original: string } | undefined {
  if (typeof value !== 'string' || !/^\d+(?:\.\d+)?$/.test(value)) {
    addGroupErrors(errors, 3, 'INVALID_CONFIGURATION', path, 'Share rate must be an exact decimal string.')
    return undefined
  }
  const [whole, fractional = ''] = value.split('.')
  const denominator = 10n ** BigInt(fractional.length)
  const numerator = BigInt(whole ?? '0') * denominator + BigInt(fractional || '0')
  if (numerator > denominator) {
    addGroupErrors(errors, 5, 'INVALID_CONFIGURATION', path, 'Share rate must be within the inclusive range 0 to 1.')
    return undefined
  }
  return { numerator, denominator, original: value }
}

function collectRequiredFields(raw: Record<string, unknown>, errors: GroupedError[]): void {
  const rootFields = ['calculation_mode', 'engine_id', 'engine_version', 'scenario_id', 'as_of_date', 'currency', 'inputs', 'assumptions']
  for (const field of rootFields) missing(errors, raw, field, '/')
  const inputs = raw.inputs
  if (!isRecord(inputs)) return
  const inputPath = '/inputs'
  for (const field of ['total_bill_myr', 'charge_lines', 'coverage_gate', 'care_setting', 'employer_coordination']) {
    missing(errors, inputs, field, inputPath)
  }
  const gate = inputs.coverage_gate
  if (gate === 'PROCEED_WITHOUT_GATE_ASSUMPTION') {
    for (const field of ['r_and_b', 'sub_limits', 'room_upgrade', 'cost_sharing_order', 'share_components', 'exemption', 'limits']) {
      missing(errors, inputs, field, inputPath)
    }
  }
  const employer = inputs.employer_coordination
  if (isRecord(employer)) {
    missing(errors, employer, 'path', '/inputs/employer_coordination')
    if (employer.path === 'NON_GATED') {
      for (const field of ['employer_scenario_max_myr', 'employer_reduces_deductible', 'deductible_remaining_myr']) {
        missing(errors, employer, field, '/inputs/employer_coordination')
      }
    } else if (employer.path === 'GATED') {
      missing(errors, employer, 'external_employer_confirmed_payment_myr', '/inputs/employer_coordination')
    }
  }
  if (gate === 'PROCEED_WITHOUT_GATE_ASSUMPTION') {
    const rnb = inputs.r_and_b
    if (isRecord(rnb)) missing(errors, rnb, 'mode', '/inputs/r_and_b')
    const upgrade = inputs.room_upgrade
    if (isRecord(upgrade)) missing(errors, upgrade, 'mode', '/inputs/room_upgrade')
    const shares = inputs.share_components
    if (isRecord(shares)) {
      missing(errors, shares, 'co_payment', '/inputs/share_components')
      missing(errors, shares, 'co_insurance', '/inputs/share_components')
      for (const componentName of ['co_payment', 'co_insurance']) {
        const component = shares[componentName]
        if (component !== null && isRecord(component)) {
          missing(errors, component, 'rate', pointer('/inputs/share_components', componentName))
          missing(errors, component, 'cap', pointer('/inputs/share_components', componentName))
        }
      }
    }
    const limits = inputs.limits
    if (isRecord(limits)) {
      for (const name of ['annual', 'lifetime']) {
        missing(errors, limits, name, '/inputs/limits')
        const state = limits[name]
        if (isRecord(state)) {
          missing(errors, state, 'status', pointer('/inputs/limits', name))
          if (state.status === 'MODELED') {
            missing(errors, state, 'remaining_amount_myr', pointer('/inputs/limits', name))
          }
        }
      }
    }
  }
  const lines = inputs.charge_lines
  if (Array.isArray(lines)) {
    lines.forEach((line, index) => {
      if (!isRecord(line)) return
      const linePath = pointer('/inputs/charge_lines', index)
      for (const field of ['line_id', 'amount_myr', 'category', 'eligibility']) missing(errors, line, field, linePath)
    })
  }
  const assumptions = raw.assumptions
  if (Array.isArray(assumptions)) {
    assumptions.forEach((item, index) => {
      if (!isRecord(item)) return
      const path = pointer('/assumptions', index)
      for (const field of ['assumption_id', 'value', 'unit', 'origin', 'explanation']) missing(errors, item, field, path)
    })
  }
}

function malformed(errors: GroupedError[], value: unknown, path: string, expected: string): void {
  if (value === undefined) return
  if (typeof value !== expected) {
    addGroupErrors(errors, 3, 'MALFORMED_REQUEST', path, 'A request field has an invalid structural type.')
  }
}

function validateTypesAndSyntax(raw: Record<string, unknown>, errors: GroupedError[]): void {
  for (const field of ['calculation_mode', 'engine_id', 'engine_version', 'scenario_id', 'as_of_date', 'currency']) {
    malformed(errors, raw[field], pointer('/', field), 'string')
  }
  if (raw.inputs !== undefined && !isRecord(raw.inputs)) {
    addGroupErrors(errors, 3, 'MALFORMED_REQUEST', '/inputs', 'Inputs must be an object.')
    return
  }
  const inputs = raw.inputs as Record<string, unknown>
  if (!inputs) return
  for (const field of ['total_bill_myr']) {
    const value = inputs[field]
    if (value !== undefined && (typeof value !== 'string' || !/^-?\d+(?:\.\d+)?$/.test(value))) {
      addGroupErrors(errors, 3, 'INVALID_MONEY_FORMAT', pointer('/inputs', field), 'Money must be an exact MYR decimal string.')
    }
  }
  if (inputs.charge_lines !== undefined && !Array.isArray(inputs.charge_lines)) {
    addGroupErrors(errors, 3, 'MALFORMED_REQUEST', '/inputs/charge_lines', 'Charge lines must be an array.')
  }
  if (inputs.charge_lines !== undefined && Array.isArray(inputs.charge_lines)) {
    inputs.charge_lines.forEach((line, index) => {
      const path = pointer('/inputs/charge_lines', index)
      if (!isRecord(line)) {
        addGroupErrors(errors, 3, 'MALFORMED_REQUEST', path, 'Each charge line must be an object.')
        return
      }
      for (const field of ['line_id', 'category', 'eligibility']) {
        if (line[field] !== undefined && typeof line[field] !== 'string') {
          addGroupErrors(errors, 3, 'MALFORMED_REQUEST', pointer(path, field), 'A charge line field has an invalid type.')
        }
      }
      if (line.amount_myr !== undefined && (typeof line.amount_myr !== 'string' || !/^-?\d+(?:\.\d+)?$/.test(line.amount_myr))) {
        addGroupErrors(errors, 3, 'INVALID_MONEY_FORMAT', pointer(path, 'amount_myr'), 'Money must be an exact MYR decimal string.')
      }
    })
  }
  for (const field of ['coverage_gate', 'care_setting']) {
    if (inputs[field] !== undefined && typeof inputs[field] !== 'string') {
      addGroupErrors(errors, 3, 'MALFORMED_REQUEST', pointer('/inputs', field), 'A request enum has an invalid type.')
    }
  }
  if (inputs.employer_coordination !== undefined) {
    const employer = inputs.employer_coordination
    if (!isRecord(employer)) {
      addGroupErrors(errors, 3, 'MALFORMED_REQUEST', '/inputs/employer_coordination', 'Employer coordination must be an object.')
    } else {
      for (const field of ['path', 'employer_scenario_max_myr', 'deductible_remaining_myr', 'external_employer_confirmed_payment_myr']) {
        if (employer[field] !== undefined && !['path'].includes(field)
          && (typeof employer[field] !== 'string' || !/^-?\d+(?:\.\d+)?$/.test(employer[field] as string))) {
          addGroupErrors(errors, 3, 'INVALID_MONEY_FORMAT', pointer('/inputs/employer_coordination', field), 'Money must be an exact MYR decimal string.')
        }
      }
      if (employer.employer_reduces_deductible !== undefined && typeof employer.employer_reduces_deductible !== 'boolean') {
        addGroupErrors(errors, 3, 'MALFORMED_REQUEST', '/inputs/employer_coordination/employer_reduces_deductible', 'Employer deductible setting must be boolean.')
      }
    }
  }
  if (inputs.r_and_b !== undefined) validateRnbTypes(inputs.r_and_b, errors)
  if (inputs.sub_limits !== undefined && !Array.isArray(inputs.sub_limits)) {
    addGroupErrors(errors, 3, 'MALFORMED_REQUEST', '/inputs/sub_limits', 'Sub-limits must be an array.')
  }
  if (inputs.room_upgrade !== undefined && !isRecord(inputs.room_upgrade)) {
    addGroupErrors(errors, 3, 'MALFORMED_REQUEST', '/inputs/room_upgrade', 'Room upgrade must be an object.')
  }
  if (inputs.share_components !== undefined) validateShareTypes(inputs.share_components, errors)
  if (inputs.limits !== undefined) validateLimitTypes(inputs.limits, errors)
  for (const field of ['cost_sharing_order', 'exemption']) {
    if (inputs[field] !== undefined && typeof inputs[field] !== 'string') {
      addGroupErrors(errors, 3, 'MALFORMED_REQUEST', pointer('/inputs', field), 'A request configuration has an invalid type.')
    }
  }
  if (raw.assumptions !== undefined && !Array.isArray(raw.assumptions)) {
    addGroupErrors(errors, 3, 'MALFORMED_REQUEST', '/assumptions', 'Assumptions must be an array.')
  }
  if (Array.isArray(raw.assumptions)) {
    raw.assumptions.forEach((item, index) => {
      const path = pointer('/assumptions', index)
      if (!isRecord(item)) {
        addGroupErrors(errors, 3, 'MALFORMED_REQUEST', path, 'Each assumption must be an object.')
        return
      }
      for (const field of ['assumption_id', 'value', 'unit', 'origin', 'explanation']) {
        if (item[field] !== undefined && typeof item[field] !== 'string') {
          addGroupErrors(errors, 3, 'MALFORMED_REQUEST', pointer(path, field), 'An assumption field has an invalid type.')
        }
      }
    })
  }
}

function validateRnbTypes(value: unknown, errors: GroupedError[]): void {
  if (!isRecord(value)) {
    addGroupErrors(errors, 3, 'MALFORMED_REQUEST', '/inputs/r_and_b', 'Room and Board must be an object.')
    return
  }
  for (const field of ['mode', 'actual_daily_rate_myr', 'entitled_daily_limit_myr']) {
    if (value[field] !== undefined && typeof value[field] !== 'string') {
      addGroupErrors(errors, 3, field.endsWith('_myr') ? 'INVALID_MONEY_FORMAT' : 'MALFORMED_REQUEST',
        pointer('/inputs/r_and_b', field), 'A Room and Board field has an invalid type.')
    } else if (typeof value[field] === 'string' && field.endsWith('_myr') && !/^-?\d+(?:\.\d+)?$/.test(value[field] as string)) {
      addGroupErrors(errors, 3, 'INVALID_MONEY_FORMAT', pointer('/inputs/r_and_b', field), 'Money must be an exact MYR decimal string.')
    }
  }
  if (value.hospital_days !== undefined && typeof value.hospital_days !== 'number') {
    addGroupErrors(errors, 3, 'INVALID_INTEGER', '/inputs/r_and_b/hospital_days', 'Hospital days must be an integer JSON number.')
  }
  if (value.room_charge_line_ids !== undefined && (!Array.isArray(value.room_charge_line_ids)
    || value.room_charge_line_ids.some((id) => typeof id !== 'string'))) {
    addGroupErrors(errors, 3, 'MALFORMED_REQUEST', '/inputs/r_and_b/room_charge_line_ids', 'Room charge line references must be an array of strings.')
  }
}

function validateShareTypes(value: unknown, errors: GroupedError[]): void {
  if (!isRecord(value)) {
    addGroupErrors(errors, 3, 'MALFORMED_REQUEST', '/inputs/share_components', 'Share components must be an object.')
    return
  }
  for (const name of ['co_payment', 'co_insurance']) {
    const component = value[name]
    if (component !== undefined && component !== null && !isRecord(component)) {
      addGroupErrors(errors, 3, 'MALFORMED_REQUEST', pointer('/inputs/share_components', name), 'A configured share component must be an object or null.')
      continue
    }
    if (isRecord(component)) {
      const path = pointer('/inputs/share_components', name)
      if (component.rate !== undefined && typeof component.rate !== 'string') {
        addGroupErrors(errors, 3, 'INVALID_CONFIGURATION', pointer(path, 'rate'), 'Share rate must be an exact decimal string.')
      }
    }
  }
}

function validateLimitTypes(value: unknown, errors: GroupedError[]): void {
  if (!isRecord(value)) {
    addGroupErrors(errors, 3, 'MALFORMED_REQUEST', '/inputs/limits', 'Limits must be an object.')
    return
  }
  for (const name of ['annual', 'lifetime']) {
    const state = value[name]
    if (state !== undefined && !isRecord(state)) {
      addGroupErrors(errors, 3, 'MALFORMED_REQUEST', pointer('/inputs/limits', name), 'A limit state must be an object.')
    } else if (isRecord(state)) {
      if (state.status !== undefined && typeof state.status !== 'string') {
        addGroupErrors(errors, 3, 'MALFORMED_REQUEST', pointer(pointer('/inputs/limits', name), 'status'), 'Limit status must be a string.')
      }
      if (state.remaining_amount_myr !== undefined
        && (typeof state.remaining_amount_myr !== 'string' || !/^-?\d+(?:\.\d+)?$/.test(state.remaining_amount_myr as string))) {
        addGroupErrors(errors, 3, 'INVALID_MONEY_FORMAT', pointer(pointer('/inputs/limits', name), 'remaining_amount_myr'), 'Money must be an exact MYR decimal string.')
      }
    }
  }
}

function validateBoundaries(raw: Record<string, unknown>, errors: GroupedError[]): Map<string, bigint> {
  const parsed = new Map<string, bigint>()
  const parse = (value: unknown, path: string) => {
    if (typeof value !== 'string') return
    const integerPart = value.startsWith('-') ? value.slice(1).split('.')[0] ?? '' : value.split('.')[0] ?? ''
    if (integerPart.length > ENGINE2_TECHNICAL_LIMITS.maxMoneyWholeDigits) {
      addGroupErrors(errors, 4, 'INPUT_TOO_LONG', path, 'Money exceeds the approved 128-digit technical limit.')
      return
    }
    const sen = parseMyrString(value, path, errors)
    if (sen !== undefined) parsed.set(path, sen)
  }
  const inputs = isRecord(raw.inputs) ? raw.inputs : {}
  parse(inputs.total_bill_myr, '/inputs/total_bill_myr')
  if (Array.isArray(inputs.charge_lines)) inputs.charge_lines.forEach((line, index) => {
    if (isRecord(line)) parse(line.amount_myr, pointer(pointer('/inputs', 'charge_lines'), index) + '/amount_myr')
  })
  if (isRecord(inputs.employer_coordination)) {
    for (const field of ['employer_scenario_max_myr', 'deductible_remaining_myr', 'external_employer_confirmed_payment_myr']) {
      parse(inputs.employer_coordination[field], pointer('/inputs/employer_coordination', field))
    }
  }
  if (isRecord(inputs.r_and_b)) {
    parse(inputs.r_and_b.actual_daily_rate_myr, '/inputs/r_and_b/actual_daily_rate_myr')
    parse(inputs.r_and_b.entitled_daily_limit_myr, '/inputs/r_and_b/entitled_daily_limit_myr')
    if (typeof inputs.r_and_b.hospital_days === 'number') {
      if (!Number.isInteger(inputs.r_and_b.hospital_days)) {
        addGroupErrors(errors, 3, 'INVALID_INTEGER', '/inputs/r_and_b/hospital_days', 'Hospital days must be an integer.')
      } else if (!Number.isSafeInteger(inputs.r_and_b.hospital_days)) {
        addGroupErrors(errors, 4, 'UNSAFE_INTEGER', '/inputs/r_and_b/hospital_days', 'Hospital days must be a safe integer.')
      } else if (inputs.r_and_b.hospital_days < 0) {
        addGroupErrors(errors, 4, 'NEGATIVE_NOT_ALLOWED', '/inputs/r_and_b/hospital_days', 'Hospital days cannot be negative.')
      } else if (inputs.care_setting === 'INPATIENT' && inputs.r_and_b.mode === 'MODELED' && inputs.r_and_b.hospital_days === 0) {
        addGroupErrors(errors, 4, 'ZERO_DAYS_NOT_ALLOWED_FOR_MODELED_INPATIENT_RNB', '/inputs/r_and_b/hospital_days', 'Modeled inpatient Room and Board requires a positive day count.')
      }
    }
  }
  if (isRecord(inputs.share_components)) {
    for (const name of ['co_payment', 'co_insurance']) {
      const component = inputs.share_components[name]
      if (isRecord(component)) {
        const rate = component.rate
        if (typeof rate === 'string') {
          if (utf8Length(rate) > ENGINE2_TECHNICAL_LIMITS.maxConfigurationUtf8Bytes) {
            addGroupErrors(errors, 4, 'INPUT_TOO_LONG', pointer(pointer('/inputs/share_components', name), 'rate'), 'Share-rate text exceeds the approved configuration-string limit.', 'INVALID_CONFIGURATION')
          } else if (/^-\d+(?:\.\d+)?$/.test(rate)) {
            addGroupErrors(errors, 4, 'INVALID_CONFIGURATION', pointer(pointer('/inputs/share_components', name), 'rate'), 'Share rate must be within the inclusive range 0 to 1.')
          }
        }
      }
    }
  }
  if (isRecord(inputs.limits)) {
    for (const name of ['annual', 'lifetime']) {
      const state = inputs.limits[name]
      if (isRecord(state)) parse(state.remaining_amount_myr, pointer(pointer('/inputs/limits', name), 'remaining_amount_myr'))
    }
  }
  if (Array.isArray(raw.assumptions)) raw.assumptions.forEach((item, index) => {
    if (!isRecord(item)) return
    const path = pointer('/assumptions', index)
    for (const field of ['assumption_id', 'value']) {
      const value = item[field]
      if (typeof value === 'string' && utf8Length(value) > ENGINE2_TECHNICAL_LIMITS.maxConfigurationUtf8Bytes) {
        addGroupErrors(errors, 4, 'INPUT_TOO_LONG', pointer(path, field), 'Configuration text exceeds the approved byte limit.', 'INVALID_CONFIGURATION')
      }
    }
    const explanation = item.explanation
    if (typeof explanation === 'string' && codePointLength(explanation) > ENGINE2_TECHNICAL_LIMITS.maxExplanationCodePoints) {
      addGroupErrors(errors, 4, 'INPUT_TOO_LONG', pointer(path, 'explanation'), 'Explanation exceeds the approved code-point limit.', 'INVALID_INPUT')
    }
    const id = item.assumption_id
    if (typeof id === 'string' && codePointLength(id) > ENGINE2_TECHNICAL_LIMITS.maxIdentifierCodePoints) {
      addGroupErrors(errors, 4, 'INPUT_TOO_LONG', pointer(path, 'assumption_id'), 'Identifier exceeds the approved code-point limit.', 'INVALID_INPUT')
    }
  })
  return parsed
}

function validateConfiguration(raw: Record<string, unknown>, errors: GroupedError[]): void {
  const inputs = isRecord(raw.inputs) ? raw.inputs : {}
  for (const [field, allowed] of [
    ['calculation_mode', ['GENERIC_EDUCATIONAL', 'PRODUCT_SPECIFIC']],
    ['engine_id', ['E2']],
    ['currency', ['MYR']],
  ] as const) {
    const value = raw[field]
    if (typeof value === 'string' && !allowed.includes(value as never)) {
      addGroupErrors(errors, 5, 'UNSUPPORTED_ENUM', pointer('/', field), 'Request contains an unsupported value.')
    }
  }
  if (raw.calculation_mode === 'PRODUCT_SPECIFIC') {
    addGroupErrors(errors, 5, 'MODE_DISABLED', '/calculation_mode', 'PRODUCT_SPECIFIC calculations are disabled.')
  }
  for (const [field, allowed] of [
    ['coverage_gate', ['APPLY_WAITING_PERIOD', 'APPLY_EXCLUSION', 'PROCEED_WITHOUT_GATE_ASSUMPTION']],
    ['care_setting', ['INPATIENT', 'DAY_SURGERY', 'OUTPATIENT', 'EMERGENCY']],
  ] as const) {
    const value = inputs[field]
    if (typeof value === 'string' && !allowed.includes(value as never)) {
      addGroupErrors(errors, 5, 'UNSUPPORTED_ENUM', pointer('/inputs', field), 'Request contains an unsupported value.')
    }
  }
  if (typeof raw.as_of_date === 'string' && !validDate(raw.as_of_date)) {
    addGroupErrors(errors, 5, 'INVALID_CONFIGURATION', '/as_of_date', 'As-of date must be a valid ISO calendar date.')
  }
  for (const field of ['engine_version', 'scenario_id']) {
    const value = raw[field]
    if (typeof value === 'string' && (value.trim() === '' || codePointLength(value) > ENGINE2_TECHNICAL_LIMITS.maxIdentifierCodePoints)) {
      addGroupErrors(errors, 4, value.trim() === '' ? 'MISSING_REQUIRED_FIELD' : 'INPUT_TOO_LONG', pointer('/', field),
        'Identifier is empty or exceeds the approved identifier limit.')
    }
  }
  if (typeof raw.engine_version === 'string' && utf8Length(raw.engine_version) > ENGINE2_TECHNICAL_LIMITS.maxConfigurationUtf8Bytes) {
    addGroupErrors(errors, 4, 'INPUT_TOO_LONG', '/engine_version', 'Engine version exceeds the approved configuration-string limit.', 'INVALID_CONFIGURATION')
  }
  if (typeof inputs.coverage_gate === 'string' && typeof inputs.care_setting === 'string') {
    const gate = inputs.coverage_gate
    const care = inputs.care_setting
    if (isRecord(inputs.r_and_b)) {
      const mode = inputs.r_and_b.mode
      if (typeof mode !== 'string' || !['MODELED', 'NOT_MODELED'].includes(mode)) {
        addGroupErrors(errors, 5, 'UNSUPPORTED_ENUM', '/inputs/r_and_b/mode', 'Room and Board mode is unsupported.')
      } else if (mode === 'NOT_MODELED') {
        const roomFields = ['hospital_days', 'actual_daily_rate_myr', 'entitled_daily_limit_myr', 'room_charge_line_ids']
        if (roomFields.some((field) => hasOwn(inputs.r_and_b as Record<string, unknown>, field))) {
          addGroupErrors(errors, 6, 'INVALID_CONFIGURATION', '/inputs/r_and_b', 'NOT_MODELED requires room, day, rate and room-line fields to be absent.')
        }
      } else if (care === 'DAY_SURGERY' && inputs.r_and_b.hospital_days === 0) {
        addGroupErrors(errors, 6, 'DAY_SURGERY_MODELED_ZERO_DAYS_UNSUPPORTED', '/inputs/r_and_b/hospital_days', 'Day-surgery zero-day R&B is unsupported.')
      } else {
        addGroupErrors(errors, 6, 'INVALID_CONFIGURATION', '/inputs/r_and_b', 'MODELED Room and Board is outside the locked prototype scope.')
      }
    }
    if (gate !== 'PROCEED_WITHOUT_GATE_ASSUMPTION') {
      // R&B and personal-rule fields are rejected by the gate/employer consistency pass.
    }
  }
  if (isRecord(inputs.room_upgrade) && inputs.room_upgrade.mode !== 'EXCESS_ONLY') {
    addGroupErrors(errors, 6, 'INVALID_CONFIGURATION', '/inputs/room_upgrade/mode', 'Only EXCESS_ONLY is supported when R&B is not modeled.')
  }
  if (Array.isArray(inputs.sub_limits) && inputs.sub_limits.length > 0) {
    addGroupErrors(errors, 6, 'INVALID_CONFIGURATION', '/inputs/sub_limits', 'Configured sub-limits are outside the locked prototype scope.')
  }
  if (typeof inputs.cost_sharing_order === 'string'
    && !['DEDUCTIBLE_FIRST', 'COPAY_FIRST'].includes(inputs.cost_sharing_order)) {
    addGroupErrors(errors, 5, 'INVALID_CONFIGURATION', '/inputs/cost_sharing_order', 'Cost-sharing order is unsupported.')
  }
  if (typeof inputs.exemption === 'string'
    && !['NONE', 'EXEMPT_SELECTED_COPAY_ONLY', 'EXEMPT_COPAY_AND_DEDUCTIBLE_AS_ASSUMPTION'].includes(inputs.exemption)) {
    addGroupErrors(errors, 5, 'UNSUPPORTED_ENUM', '/inputs/exemption', 'Exemption selection is unsupported.')
  }
  const shares = inputs.share_components
  if (isRecord(shares)) {
    const copay = shares.co_payment
    const coinsurance = shares.co_insurance
    if (copay !== null && coinsurance !== null) {
      addGroupErrors(errors, 6, 'MUTUALLY_EXCLUSIVE_SHARE_TYPES', '/inputs/share_components', 'Configure exactly one patient share type.')
    } else if (copay === null && coinsurance === null) {
      addGroupErrors(errors, 2, 'MISSING_REQUIRED_FIELD', '/inputs/share_components', 'Configure exactly one patient share type.')
    }
    const activeName = copay === null ? 'co_insurance' : 'co_payment'
    const active = shares[activeName]
    if (isRecord(active)) {
      const rate = parseRate(active.rate, pointer(pointer('/inputs/share_components', activeName), 'rate'), errors)
      const capPath = pointer(pointer('/inputs/share_components', activeName), 'cap')
      if (active.cap === 'CAPPED') {
        addGroupErrors(errors, 6, 'INVALID_CONFIGURATION', capPath, 'CAPPED sharing is outside the locked prototype scope.')
      } else if (typeof active.cap !== 'string') {
        addGroupErrors(errors, 6, 'INVALID_CONFIGURATION', capPath, 'Share cap must use the supported scalar representation.')
      } else if (active.cap !== 'NO_CAP') {
        addGroupErrors(errors, 5, 'UNSUPPORTED_ENUM', capPath, 'Share cap value is unsupported.')
      }
      if (inputs.exemption !== 'NONE' && activeName === 'co_insurance') {
        addGroupErrors(errors, 6, 'INVALID_CONFIGURATION', '/inputs/exemption', 'Copayment exemptions cannot be selected with coinsurance.')
      }
      void rate
    }
  }
  if (isRecord(inputs.limits)) {
    for (const name of ['annual', 'lifetime']) {
      const state = inputs.limits[name]
      if (isRecord(state)) {
        if (!['MODELED', 'NO_LIMIT', 'NOT_MODELED'].includes(String(state.status))) {
          addGroupErrors(errors, 5, 'UNSUPPORTED_ENUM', pointer(pointer('/inputs/limits', name), 'status'), 'Limit state is unsupported.')
        } else if (state.status === 'NOT_MODELED') {
          addGroupErrors(errors, 9, 'RULE_CONFIGURATION_REQUIRED', pointer(pointer('/inputs/limits', name), 'status'), 'A current-claim limit must be modeled or explicitly unlimited.')
        } else if (state.status === 'NO_LIMIT' && hasOwn(state, 'remaining_amount_myr')) {
          addGroupErrors(errors, 6, 'INVALID_CONFIGURATION', pointer('/inputs/limits', name), 'NO_LIMIT does not accept a remaining amount.')
        }
      }
    }
  }
  if (Array.isArray(raw.assumptions)) {
    const ids = new Set<string>()
    raw.assumptions.forEach((item, index) => {
      if (!isRecord(item)) return
      const path = pointer('/assumptions', index)
      if (typeof item.assumption_id === 'string') {
        if (ids.has(item.assumption_id)) addGroupErrors(errors, 6, 'INVALID_CONFIGURATION', pointer(path, 'assumption_id'), 'Assumption identifiers must be unique.')
        ids.add(item.assumption_id)
      }
      if (typeof item.unit === 'string' && !['MYR', 'month', 'year', 'ratio', 'enum', 'boolean'].includes(item.unit)) {
        addGroupErrors(errors, 5, 'UNSUPPORTED_ENUM', pointer(path, 'unit'), 'Assumption unit is unsupported.')
      }
      if (typeof item.origin === 'string' && !['USER_ENTERED', 'USER_SELECTED', 'SOURCE_ILLUSTRATION'].includes(item.origin)) {
        addGroupErrors(errors, 5, 'UNSUPPORTED_ENUM', pointer(path, 'origin'), 'Assumption origin is unsupported.')
      }
    })
  }
}

function validateEmployerBranch(raw: Record<string, unknown>, errors: GroupedError[]): void {
  const inputs = isRecord(raw.inputs) ? raw.inputs : {}
  const gate = inputs.coverage_gate
  const employer = inputs.employer_coordination
  if (gate !== 'APPLY_WAITING_PERIOD' && gate !== 'APPLY_EXCLUSION' && gate !== 'PROCEED_WITHOUT_GATE_ASSUMPTION') return
  if (!isRecord(employer)) return
  if (gate === 'PROCEED_WITHOUT_GATE_ASSUMPTION') {
    if (employer.path !== 'NON_GATED'
      || hasOwn(employer, 'external_employer_confirmed_payment_myr')) {
      addGroupErrors(errors, 7, 'BRANCH_MISMATCH', '/inputs/employer_coordination', 'Non-gated request requires only the NON_GATED employer branch.')
    }
    return
  }
  const personalFields = ['r_and_b', 'sub_limits', 'room_upgrade', 'cost_sharing_order', 'share_components', 'exemption', 'limits']
  if (employer.path !== 'GATED'
    || hasOwn(employer, 'employer_scenario_max_myr')
    || hasOwn(employer, 'employer_reduces_deductible')
    || hasOwn(employer, 'deductible_remaining_myr')
    || personalFields.some((field) => hasOwn(inputs, field))) {
    addGroupErrors(errors, 7, 'BRANCH_MISMATCH', '/inputs/employer_coordination', 'Gated requests must use the GATED employer branch and omit personal-policy inputs.')
  }
}

function validateReconciliation(
  raw: Record<string, unknown>,
  parsed: Map<string, bigint>,
  errors: GroupedError[],
): void {
  const total = parsed.get('/inputs/total_bill_myr')
  const inputs = isRecord(raw.inputs) ? raw.inputs : {}
  if (total === undefined || !Array.isArray(inputs.charge_lines)) return
  let sum = 0n
  let complete = true
  const lineIds = new Set<string>()
  inputs.charge_lines.forEach((line, index) => {
    if (!isRecord(line)) {
      complete = false
      return
    }
    const path = pointer(pointer('/inputs', 'charge_lines'), index)
    const amount = parsed.get(`${path}/amount_myr`)
    if (amount === undefined) complete = false
    else sum += amount
    if (typeof line.line_id === 'string') {
      if (lineIds.has(line.line_id)) {
        addGroupErrors(errors, 8, 'BILL_TOTAL_MISMATCH', pointer(path, 'line_id'), 'Charge line identifiers must be unique.')
      }
      lineIds.add(line.line_id)
    }
  })
  if (complete && sum !== total) {
    addGroupErrors(errors, 8, 'BILL_TOTAL_MISMATCH', '/inputs/charge_lines', 'Charge lines must sum exactly to total_bill_myr.')
  }
}

function buildNormalized(
  raw: Record<string, unknown>,
  parsed: Map<string, bigint>,
): Engine2NormalizedRequest {
  const inputs = raw.inputs as Record<string, unknown>
  const lines = inputs.charge_lines as Record<string, unknown>[]
  const base: Engine2NormalizedBase = {
    calculation_mode: 'GENERIC_EDUCATIONAL',
    engine_id: 'E2',
    engine_version: raw.engine_version as string,
    scenario_id: raw.scenario_id as string,
    as_of_date: raw.as_of_date as string,
    currency: 'MYR',
    total_bill: { original_myr: inputs.total_bill_myr as string, sen: parsed.get('/inputs/total_bill_myr') ?? 0n },
    charge_lines: lines.map((line, index) => {
      const path = pointer(pointer('/inputs', 'charge_lines'), index)
      return {
        line_id: line.line_id as string,
        amount: { original_myr: line.amount_myr as string, sen: parsed.get(`${path}/amount_myr`) ?? 0n },
        category: line.category as string,
        eligibility: line.eligibility as Exclude<Engine2Eligibility, 'UNKNOWN'>,
      }
    }),
    care_setting: inputs.care_setting as Engine2CareSetting,
    assumptions: (raw.assumptions as Engine2AssumptionInput[]).map((assumption) => ({ ...assumption })),
  }
  const employer = inputs.employer_coordination as Record<string, unknown>
  if (inputs.coverage_gate === 'APPLY_WAITING_PERIOD' || inputs.coverage_gate === 'APPLY_EXCLUSION') {
    return {
      ...base,
      path: 'GATED',
      coverage_gate: inputs.coverage_gate,
      external_employer_confirmed_payment: {
        original_myr: employer.external_employer_confirmed_payment_myr as string,
        sen: parsed.get('/inputs/employer_coordination/external_employer_confirmed_payment_myr') ?? 0n,
      },
    }
  }
  const shares = inputs.share_components as Record<string, unknown>
  const shareType = shares.co_payment === null ? 'CO_INSURANCE' : 'CO_PAYMENT'
  const share = shares[shareType === 'CO_PAYMENT' ? 'co_payment' : 'co_insurance'] as Record<string, unknown>
  const [whole, fraction = ''] = (share.rate as string).split('.')
  const denominator = 10n ** BigInt(fraction.length)
  const rateNumerator = BigInt(whole ?? '0') * denominator + BigInt(fraction || '0')
  const limits = inputs.limits as Record<string, Record<string, unknown>>
  const normalizedLimit = (name: string): Engine2NormalizedLimitState => {
    const state = limits[name]
    return state.status === 'NO_LIMIT'
      ? { status: 'NO_LIMIT' }
      : {
          status: 'MODELED',
          remaining_amount: {
            original_myr: state.remaining_amount_myr as string,
            sen: parsed.get(`/inputs/limits/${name}/remaining_amount_myr`) ?? 0n,
          },
        }
  }
  return {
    ...base,
    path: 'NON_GATED',
    coverage_gate: 'PROCEED_WITHOUT_GATE_ASSUMPTION',
    employer_scenario_max: {
      original_myr: employer.employer_scenario_max_myr as string,
      sen: parsed.get('/inputs/employer_coordination/employer_scenario_max_myr') ?? 0n,
    },
    employer_reduces_deductible: employer.employer_reduces_deductible as boolean,
    deductible_remaining: {
      original_myr: employer.deductible_remaining_myr as string,
      sen: parsed.get('/inputs/employer_coordination/deductible_remaining_myr') ?? 0n,
    },
    cost_sharing_order: inputs.cost_sharing_order as 'DEDUCTIBLE_FIRST' | 'COPAY_FIRST',
    share_type: shareType,
    share_rate: { numerator: rateNumerator, denominator, original: share.rate as string },
    exemption: inputs.exemption as Engine2Exemption,
    annual_limit: normalizedLimit('annual'),
    lifetime_limit: normalizedLimit('lifetime'),
  }
}

function validateInternal(raw: unknown): Engine2ValidationResult {
  if (!isRecord(raw)) {
    return {
      kind: 'failure',
      result_status: 'INVALID_REQUEST',
      outputs: null,
      validation_errors: [{ code: 'MALFORMED_REQUEST', field: '/', message: 'Request root must be an object.' }],
    }
  }
  const group1: GroupedError[] = []
  scanObject(raw, '/', 1, 'root', group1)
  if (group1.length > 0) return failure(group1)

  const group2: GroupedError[] = []
  collectRequiredFields(raw, group2)
  if (group2.length > 0) return failure(group2)

  const group3: GroupedError[] = []
  validateTypesAndSyntax(raw, group3)
  if (group3.length > 0) return failure(group3)

  const group4: GroupedError[] = []
  const parsed = validateBoundaries(raw, group4)
  if (group4.length > 0) return failure(group4)

  const group5and6: GroupedError[] = []
  validateConfiguration(raw, group5and6)
  const firstConfigGroup = group5and6.length > 0 ? Math.min(...group5and6.map((item) => item.group)) as Group : null
  if (firstConfigGroup !== null) return failure(group5and6.filter((item) => item.group === firstConfigGroup))

  const group7: GroupedError[] = []
  validateEmployerBranch(raw, group7)
  if (group7.length > 0) return failure(group7)

  const group8: GroupedError[] = []
  validateReconciliation(raw, parsed, group8)
  if (group8.length > 0) return failure(group8)

  const group9: GroupedError[] = []
  const inputs = raw.inputs as Record<string, unknown>
  if (Array.isArray(inputs.charge_lines)) {
    inputs.charge_lines.forEach((line, index) => {
      if (isRecord(line) && line.eligibility === 'UNKNOWN') {
        addGroupErrors(group9, 9, 'RULE_CONFIGURATION_REQUIRED', pointer(pointer('/inputs', 'charge_lines'), index) + '/eligibility',
          'UNKNOWN eligibility is not supported by this prototype.')
      }
    })
  }
  if (group9.length > 0) return failure(group9)
  return { kind: 'valid', normalized: buildNormalized(raw, parsed) }
}

/** Validates and normalizes an Engine 2 request; this function never calculates outputs. */
export function validateEngine2Request(request: unknown): Engine2ValidationResult {
  try {
    return validateInternal(request)
  } catch {
    return {
      kind: 'failure',
      result_status: 'INTERNAL_ERROR',
      outputs: null,
      validation_errors: [{ code: 'INTERNAL_ERROR', field: '/', message: 'An internal validation error occurred.' }],
    }
  }
}

const ENGINE2_DISCLOSURE =
  'Illustrative educational scenario. This does not reproduce any specific insurance or Takaful product, establish coverage, predict claim acceptance, or provide financial advice.'

function maxZero(value: bigint): bigint {
  return value > 0n ? value : 0n
}

function minAmount(...values: bigint[]): bigint {
  return values.reduce((current, value) => value < current ? value : current)
}

/** Exact non-negative half-up rounding for a rational sen amount. */
function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new RangeError('Denominator must be positive.')
  if (numerator < 0n) throw new RangeError('Monetary percentage numerator must be non-negative.')
  return (numerator * 2n + denominator) / (denominator * 2n)
}

function amountOutput(sen: bigint): Engine2AmountOutput {
  if (sen < 0n) throw new RangeError('A public amount cannot be negative.')
  return {
    sen: sen.toString(),
    display_myr: `RM${sen / 100n}.${(sen % 100n).toString().padStart(2, '0')}`,
  }
}

function traceStep(
  formulaId: string,
  stage: string,
  formula: string,
  inputs: Record<string, string>,
  result: Record<string, string>,
): Engine2FormulaTraceStep {
  return { formula_id: formulaId, stage, formula, inputs, result }
}

function stageResult(stage: Engine2StageName, status: Engine2StageResult['status'], values: Record<string, string>): Engine2StageResult {
  return { stage, status, values }
}

function limitOutput(limit: Engine2NormalizedLimitState): Engine2LimitOutput['annual'] {
  return limit.status === 'NO_LIMIT'
    ? { status: 'NO_LIMIT' }
    : { status: 'MODELED', remaining_sen: limit.remaining_amount.sen.toString() }
}

function settlementFailure(): Engine2Failure {
  return {
    kind: 'failure',
    result_status: 'INTERNAL_ERROR',
    outputs: null,
    validation_errors: [{
      code: 'SETTLEMENT_INVARIANT_VIOLATION',
      field: '/outputs',
      message: 'The calculation could not satisfy its approved settlement invariants.',
    }],
  }
}

function calculateGated(normalized: Engine2NormalizedGatedRequest): Engine2Result {
  const bill = normalized.total_bill.sen
  const nonEligible = normalized.charge_lines
    .filter((line) => line.eligibility === 'NON_ELIGIBLE_ASSUMED')
    .reduce((sum, line) => sum + line.amount.sen, 0n)
  const externalPayment = minAmount(bill, normalized.external_employer_confirmed_payment.sen)
  const personalPayment = 0n
  const userOop = bill - externalPayment - personalPayment
  const patientPayable = userOop
  const waivedCopayment = 0n
  const waivedDeductible = 0n
  const unallocated = bill - externalPayment - personalPayment - patientPayable
    - waivedCopayment - waivedDeductible

  if (externalPayment < 0n || userOop < 0n || patientPayable < 0n || unallocated !== 0n) return settlementFailure()

  const stageResults = [
    stageResult('waiting_period_exclusion_gate', 'APPLIED', {
      coverage_gate: normalized.coverage_gate,
      external_payment_capped_at_bill: externalPayment.toString(),
      personal_policy_payment: '0',
      deductible_credit: 'NOT_APPLICABLE',
      non_eligible_subtotal_trace_only: nonEligible.toString(),
    }),
    ...([
      'non_eligible_charges', 'room_and_board_sub_limits', 'room_upgrade_proration',
      'employer_coordination', 'patient_cost_sharing', 'current_claim_limits',
    ] as Engine2StageName[]).map((stage) => stageResult(stage, 'SKIPPED_GATE', { reason: 'Personal-policy stage skipped by selected gate.' })),
  ]

  return {
    kind: 'success',
    calculation_mode: 'GENERIC_EDUCATIONAL',
    engine_id: 'E2',
    engine_version: normalized.engine_version,
    scenario_id: normalized.scenario_id,
    as_of_date: normalized.as_of_date,
    currency: 'MYR',
    result_status: 'CALCULATED_EDUCATIONAL',
    selected_configuration: {
      path: 'GATED',
      coverage_gate: normalized.coverage_gate,
      care_setting: normalized.care_setting,
      employer_payment_source: 'EXTERNAL_EMPLOYER_PAYMENT',
    },
    intermediate_values_sen: {
      gross_bill: bill.toString(),
      non_eligible_trace_subtotal: nonEligible.toString(),
      external_payment_before_cap: normalized.external_employer_confirmed_payment.sen.toString(),
      P_emp: externalPayment.toString(),
      P_personal: personalPayment.toString(),
      UserOOP: userOop.toString(),
      patient_payable: patientPayable.toString(),
      WAIVED_COPAYMENT: waivedCopayment.toString(),
      WAIVED_DEDUCTIBLE: waivedDeductible.toString(),
      unallocated_amount: unallocated.toString(),
    },
    outputs: {
      gross_bill: amountOutput(bill),
      non_eligible_amount: amountOutput(nonEligible),
      eligible_claim_base: null,
      employer_cap_base: null,
      employer_payment: { kind: 'EXTERNAL_EMPLOYER_PAYMENT', amount: amountOutput(externalPayment) },
      personal_insurer_payment: amountOutput(personalPayment),
      user_out_of_pocket: amountOutput(userOop),
      patient_payable: amountOutput(patientPayable),
      deductible_applied: null,
      patient_cost_share: { type: 'NOT_APPLICABLE', amount: null },
      WAIVED_COPAYMENT: amountOutput(waivedCopayment),
      WAIVED_DEDUCTIBLE: amountOutput(waivedDeductible),
      limit: null,
      limit_shortfall: null,
      room_and_board: null,
      sub_limit_excess: null,
      room_upgrade: null,
      unallocated_amount: amountOutput(unallocated),
      stage_results: stageResults,
      disclosure: ENGINE2_DISCLOSURE,
    },
    assumptions: normalized.assumptions,
    warnings: ['Personal-policy stages are skipped by the selected gate; the external employer amount is a generic educational input.'],
    formula_trace: [
      traceStep('E2.STAGE_1_GATE', 'waiting_period_exclusion_gate',
        'P_external=min(B_total, external_employer_confirmed_payment); P_personal=0',
        { B_total: bill.toString(), external_employer_confirmed_payment: normalized.external_employer_confirmed_payment.sen.toString() },
        { P_external: externalPayment.toString(), P_personal: '0', non_eligible_trace_subtotal: nonEligible.toString() }),
      traceStep('E2.GATED_SETTLEMENT', 'settlement',
        'UserOOP=B_total-P_emp-P_personal; patient_payable=UserOOP; residual=B_total-P_emp-patient_payable',
        { B_total: bill.toString(), P_emp: externalPayment.toString(), P_personal: '0' },
        { UserOOP: userOop.toString(), patient_payable: patientPayable.toString(), unallocated_amount: unallocated.toString() }),
    ],
  }
}

function calculateNonGated(normalized: Engine2NormalizedNonGatedRequest): Engine2Result {
  const bill = normalized.total_bill.sen

  // Stage 1 — no coverage gate was selected.
  const gate = 'PROCEED_WITHOUT_GATE_ASSUMPTION'
  const s1 = stageResult('waiting_period_exclusion_gate', 'CALCULATED', {
    coverage_gate: gate,
    personal_stages: 'CONTINUE',
  })

  // Stage 2 — line eligibility is explicit; the validator has reconciled all lines to the bill.
  const nonEligible = normalized.charge_lines
    .filter((line) => line.eligibility === 'NON_ELIGIBLE_ASSUMED')
    .reduce((sum, line) => sum + line.amount.sen, 0n)
  const rawEligible = maxZero(bill - minAmount(bill, nonEligible))
  const s2 = stageResult('non_eligible_charges', 'CALCULATED', {
    non_eligible_amount: nonEligible.toString(),
    B_raw_eligible: rawEligible.toString(),
  })

  // Stage 3 — the only supported non-gated R&B shape is NOT_MODELED and sub_limits is empty.
  const subLimitExcess = 0n
  const eligibleSubLimit = rawEligible
  const s3 = stageResult('room_and_board_sub_limits', 'CALCULATED', {
    room_and_board: 'NOT_MODELED',
    sub_limits_count: '0',
    B_eligible_sub: eligibleSubLimit.toString(),
  })

  // Stage 4 — EXCESS_ONLY adds no second room penalty; R&B itself is not modeled.
  const upgradePenalty = 0n
  const netClaimBase = maxZero(eligibleSubLimit - upgradePenalty)
  const s4 = stageResult('room_upgrade_proration', 'CALCULATED', {
    mode: 'EXCESS_ONLY',
    upgrade_penalty: upgradePenalty.toString(),
    C_net: netClaimBase.toString(),
  })

  // Stage 5 — cap employer payment at C_net; only this actual payment may credit D_eff.
  const employerPayment = minAmount(netClaimBase, normalized.employer_scenario_max.sen)
  const personalBase = maxZero(netClaimBase - employerPayment)
  const deductibleRemaining = normalized.employer_reduces_deductible
    ? maxZero(normalized.deductible_remaining.sen - employerPayment)
    : normalized.deductible_remaining.sen
  const deductibleCredit = normalized.employer_reduces_deductible
    ? minAmount(normalized.deductible_remaining.sen, employerPayment)
    : 0n
  const s5 = stageResult('employer_coordination', 'CALCULATED', {
    C_net: netClaimBase.toString(),
    employer_scenario_max: normalized.employer_scenario_max.sen.toString(),
    P_emp: employerPayment.toString(),
    B_personal: personalBase.toString(),
    D_eff: normalized.deductible_remaining.sen.toString(),
    employer_deductible_credit: deductibleCredit.toString(),
    D_rem: deductibleRemaining.toString(),
  })

  // Stage 6 — calculate the approved selected order with exact rational share arithmetic.
  const shareBase = normalized.cost_sharing_order === 'DEDUCTIBLE_FIRST'
    ? maxZero(personalBase - minAmount(personalBase, deductibleRemaining))
    : personalBase
  const shareAppliedCounterfactual = roundHalfUp(
    shareBase * normalized.share_rate.numerator,
    normalized.share_rate.denominator,
  )
  const deductibleAppliedCounterfactual = normalized.cost_sharing_order === 'DEDUCTIBLE_FIRST'
    ? minAmount(personalBase, deductibleRemaining)
    : minAmount(maxZero(personalBase - shareAppliedCounterfactual), deductibleRemaining)
  const netAfterCostSharing = maxZero(personalBase - deductibleAppliedCounterfactual - shareAppliedCounterfactual)
  const copaymentWaived = normalized.exemption !== 'NONE'
  const waivedCopayment = copaymentWaived ? shareAppliedCounterfactual : 0n
  const waivedDeductible = normalized.exemption === 'EXEMPT_COPAY_AND_DEDUCTIBLE_AS_ASSUMPTION'
    ? deductibleAppliedCounterfactual
    : 0n
  const actualShare = copaymentWaived ? 0n : shareAppliedCounterfactual
  const actualDeductible = normalized.exemption === 'EXEMPT_COPAY_AND_DEDUCTIBLE_AS_ASSUMPTION'
    ? 0n
    : deductibleAppliedCounterfactual
  const s6 = stageResult('patient_cost_sharing', 'CALCULATED', {
    order: normalized.cost_sharing_order,
    share_type: normalized.share_type,
    share_rate_numerator: normalized.share_rate.numerator.toString(),
    share_rate_denominator: normalized.share_rate.denominator.toString(),
    D_rem: deductibleRemaining.toString(),
    deductible_applied_counterfactual: deductibleAppliedCounterfactual.toString(),
    share_base: shareBase.toString(),
    share_applied_counterfactual: shareAppliedCounterfactual.toString(),
    net_after_cost_sharing_counterfactual: netAfterCostSharing.toString(),
    actual_deductible_applied: actualDeductible.toString(),
    actual_patient_share: actualShare.toString(),
    WAIVED_COPAYMENT: waivedCopayment.toString(),
    WAIVED_DEDUCTIBLE: waivedDeductible.toString(),
    share_cap_consumption: '0',
  })

  // Stage 7 — current-claim limits only; NO_LIMIT is explicitly unbounded.
  const finiteLimits = [normalized.annual_limit, normalized.lifetime_limit]
    .filter((limit): limit is Engine2NormalizedLimit => limit.status === 'MODELED')
    .map((limit) => limit.remaining_amount.sen)
  const effectiveLimit = finiteLimits.length > 0 ? minAmount(...finiteLimits) : null
  const personalInsurerPayment = effectiveLimit === null
    ? netAfterCostSharing
    : minAmount(netAfterCostSharing, effectiveLimit)
  const limitShortfall = maxZero(netAfterCostSharing - personalInsurerPayment)
  const userOop = bill - employerPayment - personalInsurerPayment
  const waiverTotal = waivedCopayment + waivedDeductible
  const patientPayable = userOop - waiverTotal
  const unallocated = bill - employerPayment - personalInsurerPayment - patientPayable - waiverTotal

  if (personalInsurerPayment < 0n || userOop < 0n || patientPayable < 0n
    || waiverTotal > userOop || unallocated !== 0n
    || employerPayment + personalInsurerPayment > bill) {
    return settlementFailure()
  }

  const s7 = stageResult('current_claim_limits', 'CALCULATED', {
    annual_limit_sen: normalized.annual_limit.status === 'MODELED' ? normalized.annual_limit.remaining_amount.sen.toString() : 'NO_LIMIT',
    lifetime_limit_sen: normalized.lifetime_limit.status === 'MODELED' ? normalized.lifetime_limit.remaining_amount.sen.toString() : 'NO_LIMIT',
    effective_limit_sen: effectiveLimit?.toString() ?? 'UNBOUNDED',
    net_after_cost_sharing_counterfactual: netAfterCostSharing.toString(),
    P_personal: personalInsurerPayment.toString(),
    limit_shortfall: limitShortfall.toString(),
  })

  const annualOutput = limitOutput(normalized.annual_limit)
  const lifetimeOutput = limitOutput(normalized.lifetime_limit)
  const results: Engine2StageResult[] = [s1, s2, s3, s4, s5, s6, s7]
  const traces: Engine2FormulaTraceStep[] = [
    traceStep('E2.STAGE_1_GATE', 'waiting_period_exclusion_gate',
      'PROCEED_WITHOUT_GATE_ASSUMPTION continues to personal-policy stages', { coverage_gate: gate }, { path: 'NON_GATED' }),
    traceStep('E2.STAGE_2_ELIGIBILITY', 'non_eligible_charges',
      'N=min(B_total,sum(non-eligible lines)); B_raw_eligible=max(0,B_total-N)',
      { B_total: bill.toString(), non_eligible_line_sum: nonEligible.toString() },
      { N: nonEligible.toString(), B_raw_eligible: rawEligible.toString() }),
    traceStep('E2.STAGE_3_BASE', 'room_and_board_sub_limits',
      'R&B=NOT_MODELED; sub_limits=[]; B_eligible_sub=B_raw_eligible',
      { B_raw_eligible: rawEligible.toString(), r_and_b: 'NOT_MODELED', sub_limits_count: '0' },
      { B_eligible_sub: eligibleSubLimit.toString(), sub_limit_excess: subLimitExcess.toString() }),
    traceStep('E2.STAGE_4_UPGRADE', 'room_upgrade_proration',
      'EXCESS_ONLY: PenRB=0; C_net=max(0,B_eligible_sub-PenRB)',
      { B_eligible_sub: eligibleSubLimit.toString(), room_upgrade_mode: 'EXCESS_ONLY' },
      { PenRB: upgradePenalty.toString(), C_net: netClaimBase.toString() }),
    traceStep('E2.STAGE_5_EMPLOYER', 'employer_coordination',
      'P_emp=min(C_net,employer_scenario_max); B_personal=max(0,C_net-P_emp); D_rem=employer_reduces_deductible?max(0,D_eff-P_emp):D_eff',
      { C_net: netClaimBase.toString(), employer_scenario_max: normalized.employer_scenario_max.sen.toString(), D_eff: normalized.deductible_remaining.sen.toString(), employer_reduces_deductible: String(normalized.employer_reduces_deductible) },
      { P_emp: employerPayment.toString(), B_personal: personalBase.toString(), deductible_credit: deductibleCredit.toString(), D_rem: deductibleRemaining.toString() }),
    traceStep('E2.STAGE_6_COST_SHARING', 'patient_cost_sharing',
      normalized.cost_sharing_order === 'DEDUCTIBLE_FIRST'
        ? 'DedApplied=min(B_personal,D_rem); ShareBase=max(0,B_personal-DedApplied); ShareApplied=roundHalfUp(ShareBase*rate); Net=max(0,B_personal-DedApplied-ShareApplied)'
        : 'ShareApplied=roundHalfUp(B_personal*rate); DedApplied=min(max(0,B_personal-ShareApplied),D_rem); Net=max(0,B_personal-DedApplied-ShareApplied)',
      { order: normalized.cost_sharing_order, B_personal: personalBase.toString(), D_rem: deductibleRemaining.toString(), share_rate_numerator: normalized.share_rate.numerator.toString(), share_rate_denominator: normalized.share_rate.denominator.toString(), exemption: normalized.exemption },
      { DedApplied_counterfactual: deductibleAppliedCounterfactual.toString(), ShareApplied_counterfactual: shareAppliedCounterfactual.toString(), NetAfterCostSharing_counterfactual: netAfterCostSharing.toString(), actual_deductible: actualDeductible.toString(), actual_share: actualShare.toString(), WAIVED_COPAYMENT: waivedCopayment.toString(), WAIVED_DEDUCTIBLE: waivedDeductible.toString() }),
    traceStep('E2.STAGE_7_LIMIT', 'current_claim_limits',
      'P_personal=min(NetAfterCostSharing_counterfactual,minimum(finite current-claim limits))',
      { NetAfterCostSharing_counterfactual: netAfterCostSharing.toString(), annual_limit_sen: normalized.annual_limit.status === 'MODELED' ? normalized.annual_limit.remaining_amount.sen.toString() : 'NO_LIMIT', lifetime_limit_sen: normalized.lifetime_limit.status === 'MODELED' ? normalized.lifetime_limit.remaining_amount.sen.toString() : 'NO_LIMIT' },
      { effective_limit_sen: effectiveLimit?.toString() ?? 'UNBOUNDED', P_personal: personalInsurerPayment.toString(), LimitShortfall: limitShortfall.toString() }),
    traceStep('E2.SETTLEMENT', 'settlement',
      'UserOOP=B_total-P_emp-P_personal; patient_payable=UserOOP-WAIVED_COPAYMENT-WAIVED_DEDUCTIBLE; unallocated=B_total-P_emp-P_personal-patient_payable-waivers',
      { B_total: bill.toString(), P_emp: employerPayment.toString(), P_personal: personalInsurerPayment.toString(), WAIVED_COPAYMENT: waivedCopayment.toString(), WAIVED_DEDUCTIBLE: waivedDeductible.toString() },
      { UserOOP: userOop.toString(), patient_payable: patientPayable.toString(), unallocated_amount: unallocated.toString() }),
  ]

  return {
    kind: 'success',
    calculation_mode: 'GENERIC_EDUCATIONAL',
    engine_id: 'E2',
    engine_version: normalized.engine_version,
    scenario_id: normalized.scenario_id,
    as_of_date: normalized.as_of_date,
    currency: 'MYR',
    result_status: 'CALCULATED_EDUCATIONAL',
    selected_configuration: {
      path: 'NON_GATED',
      coverage_gate: gate,
      care_setting: normalized.care_setting,
      room_and_board: 'NOT_MODELED',
      sub_limits: 'NONE',
      room_upgrade: 'EXCESS_ONLY',
      cost_sharing_order: normalized.cost_sharing_order,
      share_type: normalized.share_type,
      share_rate: normalized.share_rate.original,
      share_cap: 'NO_CAP',
      exemption: normalized.exemption,
    },
    intermediate_values_sen: {
      gross_bill: bill.toString(),
      non_eligible_amount: nonEligible.toString(),
      B_raw_eligible: rawEligible.toString(),
      B_eligible_sub: eligibleSubLimit.toString(),
      PenRB: upgradePenalty.toString(),
      C_net: netClaimBase.toString(),
      P_emp: employerPayment.toString(),
      B_personal: personalBase.toString(),
      D_eff: normalized.deductible_remaining.sen.toString(),
      deductible_credit: deductibleCredit.toString(),
      D_rem: deductibleRemaining.toString(),
      DedApplied_counterfactual: deductibleAppliedCounterfactual.toString(),
      ShareApplied_counterfactual: shareAppliedCounterfactual.toString(),
      NetAfterCostSharing_counterfactual: netAfterCostSharing.toString(),
      effective_limit_sen: effectiveLimit?.toString() ?? 'UNBOUNDED',
      P_personal: personalInsurerPayment.toString(),
      LimitShortfall: limitShortfall.toString(),
      UserOOP: userOop.toString(),
      WAIVED_COPAYMENT: waivedCopayment.toString(),
      WAIVED_DEDUCTIBLE: waivedDeductible.toString(),
      patient_payable: patientPayable.toString(),
      unallocated_amount: unallocated.toString(),
    },
    outputs: {
      gross_bill: amountOutput(bill),
      non_eligible_amount: amountOutput(nonEligible),
      eligible_claim_base: amountOutput(eligibleSubLimit),
      employer_cap_base: amountOutput(netClaimBase),
      employer_payment: { kind: 'EMPLOYER_COORDINATION', amount: amountOutput(employerPayment) },
      personal_insurer_payment: amountOutput(personalInsurerPayment),
      user_out_of_pocket: amountOutput(userOop),
      patient_payable: amountOutput(patientPayable),
      deductible_applied: amountOutput(actualDeductible),
      patient_cost_share: { type: normalized.share_type, amount: amountOutput(actualShare) },
      WAIVED_COPAYMENT: amountOutput(waivedCopayment),
      WAIVED_DEDUCTIBLE: amountOutput(waivedDeductible),
      limit: {
        annual: annualOutput,
        lifetime: lifetimeOutput,
        effective_limit_sen: effectiveLimit?.toString() ?? null,
        effective_limit_status: effectiveLimit === null ? 'UNBOUNDED' : 'FINITE',
        applied_sen: personalInsurerPayment.toString(),
      },
      limit_shortfall: amountOutput(limitShortfall),
      room_and_board: { status: 'NOT_MODELED', billed: null, entitled: null, excess: null },
      sub_limit_excess: amountOutput(subLimitExcess),
      room_upgrade: { mode: 'EXCESS_ONLY', penalty: amountOutput(upgradePenalty) },
      unallocated_amount: amountOutput(unallocated),
      stage_results: results,
      disclosure: ENGINE2_DISCLOSURE,
    },
    assumptions: normalized.assumptions,
    warnings: ['Room and Board and sub-limit calculations are not modeled in this prototype.'],
    formula_trace: traces,
  }
}

/**
 * Validates then calculates an explicitly generic educational claim. The
 * normalized calculation functions are deterministic and use integer sen only.
 */
export function calculateEngine2Claim(request: unknown): Engine2Result {
  const validation = validateEngine2Request(request)
  if (validation.kind === 'failure') return validation
  try {
    return validation.normalized.path === 'GATED'
      ? calculateGated(validation.normalized)
      : calculateNonGated(validation.normalized)
  } catch {
    return {
      kind: 'failure',
      result_status: 'INTERNAL_ERROR',
      outputs: null,
      validation_errors: [{ code: 'INTERNAL_ERROR', field: '/', message: 'An internal calculation error occurred.' }],
    }
  }
}

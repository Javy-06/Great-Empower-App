export type LifeTrackResourceId = 'cash' | 'health' | 'emergencyFund' | 'protection' | 'stability'

export type LifeTrackResources = Record<LifeTrackResourceId, number>
export type LifeTrackEffect = Partial<Record<LifeTrackResourceId, number>>

export type LifeTrackChoice = {
  id: string
  label: string
  consequence: string
  effect: LifeTrackEffect
}

export type LifeTrackEvent = {
  id: string
  title: string
  category: string
  scenario: string
  choices: [LifeTrackChoice, LifeTrackChoice]
  protectionExplanation: string
  reflection: string
}

export type LifeTrackSpace = {
  index: number
  label: string
  event?: LifeTrackEvent
}

export const initialLifeTrackResources: LifeTrackResources = {
  cash: 62,
  health: 80,
  emergencyFund: 35,
  protection: 48,
  stability: 55,
}

const events: LifeTrackEvent[] = [
  {
    id: 'first-salary', title: 'Your first salary', category: 'Opportunity',
    scenario: 'Your first full payslip arrives. Rent, bills and family commitments all need a place in your monthly plan.',
    choices: [
      { id: 'salary-plan', label: 'Set a simple monthly plan', consequence: 'You give each priority a place before the month gets busy.', effect: { cash: 2, emergencyFund: 6, stability: 5 } },
      { id: 'salary-flex', label: 'Keep the month flexible', consequence: 'You enjoy more freedom now, with less set aside for surprises.', effect: { cash: 5, emergencyFund: -2, stability: -1 } },
    ],
    protectionExplanation: 'A salary is income, not a protection benefit. Savings and protection arrangements serve different purposes.',
    reflection: 'Which regular expense would you plan for first after a new job?',
  },
  {
    id: 'housing-costs', title: 'Housing expenses', category: 'Life planning',
    scenario: 'Your rental renewal comes with a higher deposit and monthly rent. You need to decide how to handle the increase.',
    choices: [
      { id: 'housing-review', label: 'Review your budget and negotiate', consequence: 'You make room for the new cost and protect your monthly buffer.', effect: { cash: -3, emergencyFund: 1, stability: 4 } },
      { id: 'housing-savings', label: 'Use part of your emergency savings', consequence: 'The deposit is manageable, but your reserve becomes smaller.', effect: { cash: 4, emergencyFund: -7, stability: -1 } },
    ],
    protectionExplanation: 'Insurance is not a substitute for planned housing costs. Keep near-term commitments in your budget.',
    reflection: 'How much notice would help you prepare for a large housing payment?',
  },
  {
    id: 'ptptn', title: 'Study loan repayment', category: 'Long-term planning',
    scenario: 'Your study-loan repayment begins. You want to stay current while still making progress on other goals.',
    choices: [
      { id: 'loan-auto', label: 'Add the payment to your monthly plan', consequence: 'Your cash is lower this month, but your repayment routine is clearer.', effect: { cash: -3, stability: 5 } },
      { id: 'loan-check', label: 'Check your account and repayment options', consequence: 'You spend time clarifying the amount and avoid guessing.', effect: { cash: -1, stability: 3, protection: 1 } },
    ],
    protectionExplanation: 'Protection products do not automatically cancel debt. Understand the loan terms and any separate benefits that may apply.',
    reflection: 'Which account or reminder would help you avoid missing a repayment?',
  },
  {
    id: 'employer-benefit', title: 'Employer medical benefit', category: 'Work and benefits',
    scenario: 'Your new job includes a medical benefit. You are reviewing what it covers and what happens if you change jobs.',
    choices: [
      { id: 'benefit-check', label: 'Read the benefit limits and process', consequence: 'You know where to check eligibility and who to contact.', effect: { protection: 5, stability: 2 } },
      { id: 'benefit-assume', label: 'Rely on the benefit without checking', consequence: 'You save time now but may not know the limits when you need them.', effect: { protection: -3, stability: -2 } },
    ],
    protectionExplanation: 'Employer benefits depend on the scheme and employment terms. They are not guaranteed lifelong protection and may not follow you to another job.',
    reflection: 'What would you want to know about a work benefit before relying on it?',
  },
  {
    id: 'medical-bill', title: 'Unexpected medical expenses', category: 'Health',
    scenario: 'A sudden illness brings clinic and hospital expenses. Some costs may be eligible under a medical plan, subject to its terms.',
    choices: [
      { id: 'medical-check', label: 'Check the plan and claim steps', consequence: 'You use the right process and keep a reserve for costs outside the plan.', effect: { cash: -2, health: 1, emergencyFund: -2, protection: 5, stability: 2 } },
      { id: 'medical-savings', label: 'Pay from savings and ask questions later', consequence: 'You can act quickly, though your emergency reserve takes a larger hit.', effect: { cash: -5, health: 1, emergencyFund: -7, stability: -2 } },
    ],
    protectionExplanation: 'Medical coverage generally addresses eligible healthcare costs, within its limits and exclusions. It does not automatically replace income while you recover.',
    reflection: 'Which documents or contact details would make a claim easier to understand?',
  },
  {
    id: 'family-responsibility', title: 'A family responsibility', category: 'Family',
    scenario: 'A family member needs short-term support with transport and household costs. Your own monthly plan is already set.',
    choices: [
      { id: 'family-discuss', label: 'Agree on a support amount together', consequence: 'You help while keeping your own essentials visible.', effect: { cash: -3, stability: 4, health: 1 } },
      { id: 'family-extend', label: 'Offer more from this month’s cash', consequence: 'Your family receives more support, leaving less room for your own buffer.', effect: { cash: -7, emergencyFund: -2, stability: -2 } },
    ],
    protectionExplanation: 'Family support is a real planning need. Coverage may address specified events, but it does not replace an agreed household budget.',
    reflection: 'How can you set a supportive limit that is clear to everyone?',
  },
  {
    id: 'vehicle-repair', title: 'Vehicle repair', category: 'Unexpected cost',
    scenario: 'Your scooter needs a repair to stay roadworthy. The mechanic gives you an estimate before starting work.',
    choices: [
      { id: 'repair-compare', label: 'Compare the quote and repair essentials', consequence: 'You spend time checking options and keep more cash available.', effect: { cash: -3, stability: 3 } },
      { id: 'repair-now', label: 'Approve the repair today', consequence: 'You get moving sooner, using more of this month’s cash.', effect: { cash: -6, health: 2, stability: 1 } },
    ],
    protectionExplanation: 'Routine wear and repairs are usually budgeting matters. Motor cover has its own scope, terms and claim conditions.',
    reflection: 'Would a small vehicle-maintenance fund change this decision?',
  },
  {
    id: 'side-hustle', title: 'A side-hustle opportunity', category: 'Opportunity',
    scenario: 'A friend offers a weekend project with uncertain hours and a small upfront cost for materials.',
    choices: [
      { id: 'hustle-test', label: 'Try a small, capped pilot', consequence: 'You explore the opportunity while limiting the upfront cost.', effect: { cash: 4, stability: 3, health: -1 } },
      { id: 'hustle-scale', label: 'Commit to more hours straight away', consequence: 'Potential income rises, but the time and energy commitment is higher.', effect: { cash: 7, stability: 1, health: -5 } },
    ],
    protectionExplanation: 'Extra income can help with goals, but it is not guaranteed. Keep time, health and reliable income in view.',
    reflection: 'What would tell you it is time to pause or change this opportunity?',
  },
  {
    id: 'emergency-savings', title: 'Building emergency savings', category: 'Saving',
    scenario: 'You have a quieter month and can choose how much to add to your emergency reserve.',
    choices: [
      { id: 'saving-regular', label: 'Move a manageable amount aside', consequence: 'Your reserve grows steadily without using all your spare cash.', effect: { cash: -2, emergencyFund: 7, stability: 4 } },
      { id: 'saving-hold', label: 'Keep the spare cash accessible', consequence: 'You retain more flexibility now, while the reserve stays the same.', effect: { cash: 3, stability: -1 } },
    ],
    protectionExplanation: 'Emergency savings are accessible funds for many unexpected costs. Insurance responds only to covered events under its terms.',
    reflection: 'What small regular amount could fit your own budget?',
  },
  {
    id: 'income-reduction', title: 'Income is reduced', category: 'Work and income',
    scenario: 'Your employer reduces shifts for a short period. Your essential expenses remain due on their usual dates.',
    choices: [
      { id: 'income-prioritize', label: 'Prioritise essentials and contact providers', consequence: 'You make a plan for the shortfall and protect the most important payments.', effect: { cash: -4, emergencyFund: -2, stability: 4 } },
      { id: 'income-buffer', label: 'Use your emergency fund for the gap', consequence: 'The reserve helps with income disruption but is reduced.', effect: { cash: 2, emergencyFund: -6, stability: 1 } },
    ],
    protectionExplanation: 'Medical cover is for eligible medical expenses. Income replacement, if available, is a separate benefit with its own eligibility and terms.',
    reflection: 'Which essential expense would you review first during a temporary shortfall?',
  },
  {
    id: 'job-loss', title: 'A job transition', category: 'Work and income',
    scenario: 'Your role ends unexpectedly. You are reviewing immediate expenses and the support available during your job search.',
    choices: [
      { id: 'job-plan', label: 'Create a short-term essentials plan', consequence: 'You reduce optional costs and use your reserve deliberately.', effect: { cash: -4, emergencyFund: -3, stability: 5, health: -1 } },
      { id: 'job-network', label: 'Contact your network and check support options', consequence: 'You spend time finding leads and practical help while cash stays tight.', effect: { cash: -2, stability: 4, protection: 1 } },
    ],
    protectionExplanation: 'Employer medical benefits may change when employment ends. Personal coverage also has specific terms; neither should be assumed to replace salary.',
    reflection: 'What would you want in a job-transition checklist before you need one?',
  },
  {
    id: 'accident', title: 'An accident', category: 'Health',
    scenario: 'A minor accident interrupts your week. There are treatment costs and a few workdays you may need to miss.',
    choices: [
      { id: 'accident-document', label: 'Get care and keep the relevant documents', consequence: 'You focus on recovery and understand which costs may be claimable.', effect: { cash: -3, health: -1, emergencyFund: -1, protection: 4 } },
      { id: 'accident-rest', label: 'Rest and use savings for immediate costs', consequence: 'You handle the immediate disruption, drawing more from your reserve.', effect: { cash: -4, health: 2, emergencyFund: -4 } },
    ],
    protectionExplanation: 'Medical benefits can help with eligible treatment costs; income benefits are separate and depend on the cover and claim terms.',
    reflection: 'Which details would you record after an unexpected incident?',
  },
  {
    id: 'claim-terms', title: 'Understanding a claim', category: 'Protection literacy',
    scenario: 'You are comparing two benefit summaries. The headlines sound similar, but limits, exclusions and steps differ.',
    choices: [
      { id: 'terms-ask', label: 'Ask for the definitions and claim steps', consequence: 'You learn what questions to ask before relying on either summary.', effect: { protection: 7, stability: 2 } },
      { id: 'terms-guess', label: 'Choose based on the headline only', consequence: 'You decide quickly but may miss important conditions.', effect: { protection: -4, stability: -1 } },
    ],
    protectionExplanation: 'A benefit label alone does not tell you what is payable. Definitions, exclusions, limits and claim requirements matter.',
    reflection: 'Which term in a benefit summary would you look up first?',
  },
  {
    id: 'planning-opportunity', title: 'A planning opportunity', category: 'Opportunity',
    scenario: 'A year-end bonus is confirmed. You can use it for a near-term goal or split it across several priorities.',
    choices: [
      { id: 'bonus-split', label: 'Split it between goals and reserves', consequence: 'You make progress on more than one priority.', effect: { cash: 4, emergencyFund: 4, stability: 5 } },
      { id: 'bonus-goal', label: 'Use most of it for a planned goal', consequence: 'Your goal moves forward while reserves grow less this month.', effect: { cash: 7, stability: 2, emergencyFund: -1 } },
    ],
    protectionExplanation: 'A bonus is not recurring income. Avoid treating one-off money as guaranteed support for ongoing commitments.',
    reflection: 'What would make a one-off bonus useful to your longer-term plans?',
  },
  {
    id: 'critical-illness', title: 'Critical illness protection', category: 'Protection literacy',
    scenario: 'A friend asks whether a critical illness benefit would keep their salary arriving during treatment.',
    choices: [
      { id: 'ci-verify', label: 'Check what the benefit actually pays', consequence: 'You distinguish a defined benefit from a monthly salary.', effect: { protection: 6, stability: 2 } },
      { id: 'ci-assume', label: 'Assume the benefit replaces monthly pay', consequence: 'You may overestimate the support available.', effect: { protection: -3, stability: -3 } },
    ],
    protectionExplanation: 'A critical illness benefit may pay a lump sum if the policy definition and claim conditions are met. It is not automatically regular salary or income replacement.',
    reflection: 'What distinction would you explain to your friend in one sentence?',
  },
  {
    id: 'rent-increase', title: 'Housing costs rise again', category: 'Life planning',
    scenario: 'A utility and rent increase arrives in the same month as an annual deposit. You need to adjust your plan.',
    choices: [
      { id: 'rent-adjust', label: 'Update your monthly spending plan', consequence: 'You make the new costs visible and adjust flexible spending.', effect: { cash: -3, stability: 4 } },
      { id: 'rent-reserve', label: 'Use savings for the one-off deposit', consequence: 'You handle the deposit with less pressure on this month’s cash.', effect: { cash: 2, emergencyFund: -5, stability: 1 } },
    ],
    protectionExplanation: 'Known housing costs belong in planning. An insurance policy should not be treated as a fund for predictable bills.',
    reflection: 'Which housing cost could you set aside for before renewal time?',
  },
  {
    id: 'caregiving', title: 'Supporting someone who needs care', category: 'Family',
    scenario: 'A parent needs help getting to appointments. The extra travel time changes your usual work and rest routine.',
    choices: [
      { id: 'care-share', label: 'Coordinate support with family', consequence: 'You share the practical load and protect time for rest.', effect: { cash: -2, health: 2, stability: 3 } },
      { id: 'care-solo', label: 'Handle the visits yourself this week', consequence: 'Your family member gets support, but your energy and schedule are stretched.', effect: { cash: -3, health: -4, stability: -1 } },
    ],
    protectionExplanation: 'Care responsibilities can affect time and income even when medical bills are covered. Discuss practical support separately from insurance benefits.',
    reflection: 'Who could you ask to share one part of a care routine?',
  },
  {
    id: 'personal-cover', title: 'Personal coverage review', category: 'Protection literacy',
    scenario: 'Your work situation has changed. You want to understand what cover is personal, what is employer-linked, and what gaps matter to you.',
    choices: [
      { id: 'cover-inventory', label: 'Make an inventory of current benefits', consequence: 'You create a clearer picture before making any future decision.', effect: { protection: 6, stability: 4 } },
      { id: 'cover-questions', label: 'Write down questions for a qualified adviser', consequence: 'You identify the details that still need a reliable answer.', effect: { protection: 4, stability: 3 } },
    ],
    protectionExplanation: 'This activity does not recommend a purchase. Personal and employer benefits differ; review definitions and terms, and seek qualified advice for individual decisions.',
    reflection: 'Which part of your coverage picture is still unclear?',
  },
  {
    id: 'long-term-plan', title: 'Planning beyond this month', category: 'Long-term planning',
    scenario: 'You have a few minutes to review your goals for the year: skills, savings, family commitments and future housing.',
    choices: [
      { id: 'long-review', label: 'Choose one goal and a next step', consequence: 'A small action makes a long-term goal feel more manageable.', effect: { cash: -1, emergencyFund: 3, stability: 6 } },
      { id: 'long-learn', label: 'Learn more before changing your plan', consequence: 'You improve your understanding without committing money today.', effect: { protection: 2, stability: 4 } },
    ],
    protectionExplanation: 'Long-term plans combine income, savings, benefits and personal circumstances. No single protection product guarantees a particular outcome.',
    reflection: 'What is one realistic next step you can revisit in a month?',
  },
]

export const lifeTrackSpaces: LifeTrackSpace[] = [
  { index: 0, label: 'Start' },
  ...events.map((event, index) => ({ index: index + 1, label: event.title, event })),
]

export function rollLifeTrackDie(random = Math.random): number {
  return Math.floor(random() * 6) + 1
}

export function moveLifeTrackPlayer(position: number, roll: number): number {
  return Math.min(lifeTrackSpaces.length - 1, position + roll)
}

export function applyLifeTrackEffect(resources: LifeTrackResources, effect: LifeTrackEffect): LifeTrackResources {
  return {
    cash: clampResource(resources.cash + (effect.cash ?? 0)),
    health: clampResource(resources.health + (effect.health ?? 0)),
    emergencyFund: clampResource(resources.emergencyFund + (effect.emergencyFund ?? 0)),
    protection: clampResource(resources.protection + (effect.protection ?? 0)),
    stability: clampResource(resources.stability + (effect.stability ?? 0)),
  }
}

function clampResource(value: number): number {
  return Math.min(100, Math.max(0, value))
}

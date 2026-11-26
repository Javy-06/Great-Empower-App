/**
 * Reward quizzes. A lesson or infographic pays its points only after a PERFECT score on its quiz.
 *
 * Every question is written strictly from the content it belongs to:
 *  - lessons: the "Key points" shown on the lesson page (src/app/LearnDashboard.tsx → lessonKeyPoints)
 *  - infographics: the text printed on the infographic image itself
 *
 * The answer key is mirrored server-side in ge_private.quiz_answer_key
 * (supabase/migrations/20261127000000_rewards_learning_verification.sql); for cloud accounts the
 * server grades the submitted answers and the key here is only used to explain results.
 * seed.test.ts / verification.test.ts check that both copies match.
 */
import type { QuizKind } from "../rewards/catalogue.ts";

export interface QuizOption {
  id: "a" | "b" | "c" | "d";
  text: string;
}
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  answer: QuizOption["id"];
  explanation: string;
}
export interface Quiz {
  kind: QuizKind;
  contentId: string;
  questions: QuizQuestion[];
}

type Q = [prompt: string, options: [string, string, string, string], answer: QuizOption["id"], explanation: string];
const ids = ["a", "b", "c", "d"] as const;
const build = (kind: QuizKind, contentId: string, qs: Q[]): Quiz => ({
  kind,
  contentId,
  questions: qs.map(([prompt, opts, answer, explanation], i) => ({
    id: `q${i + 1}`,
    prompt,
    options: opts.map((text, j) => ({ id: ids[j], text })),
    answer,
    explanation,
  })),
});

const L = (id: string, qs: Q[]) => build("lesson-complete", id, qs);
const I = (id: string, qs: Q[]) => build("infographic-viewed", id, qs);

export const quizzes: Quiz[] = [
  /* ------------------------------------------------------------------ lessons */
  L("money-talks", [
    ["Before making shared plans with friends, what should you agree on first?",
      ["A budget, with room for different spending limits", "Who will pay for everyone this time", "The most expensive option, so no one feels left out", "Nothing — sort out the costs afterwards"],
      "a", "Agreeing on a budget first, and allowing for different spending limits, avoids awkward surprises later."],
    ["Which way of splitting a shared cost does the lesson describe?",
      ["Always an exact equal split, with no exceptions", "Whoever earns the most pays for everything", "Equal, or based on what each person can comfortably contribute", "Whoever suggested the plan pays"],
      "c", "A clear split can be equal or based on what each person can comfortably contribute — both can be fair."],
    ["What should you do when someone's circumstances change?",
      ["Keep the original arrangement no matter what", "Keep it practical and revisit the arrangement", "Stop making shared plans altogether", "Let one person quietly cover the difference"],
      "b", "Keep the conversation practical and revisit the arrangement when circumstances change."],
  ]),
  L("medical-cards", [
    ["What is medical and health cover generally designed for?",
      ["Eligible healthcare costs, subject to the policy or certificate", "Any expense you have while you are unwell", "Replacing your monthly salary", "Savings that grow over time"],
      "a", "Medical cover is generally designed for eligible healthcare costs, and what counts as eligible depends on the policy or certificate."],
    ["Which of these can affect what a medical plan pays?",
      ["Only the hospital you choose", "Nothing — every bill is paid in full", "Only your age", "Limits, exclusions, waiting periods, deductibles or co-payments"],
      "d", "Benefits can have limits, exclusions, waiting periods, deductibles or co-payments, so the exact terms matter."],
    ["Does medical cover automatically replace your salary if you cannot work?",
      ["Yes, always", "No — medical cover does not automatically replace income", "Yes, after a waiting period", "Only for young adults"],
      "b", "Medical cover relates to healthcare costs. It does not automatically replace salary or other income."],
  ]),
  L("emergency-fund", [
    ["What can an emergency reserve help with?",
      ["Unexpected costs or a temporary change in income", "Buying things while they are on sale", "Long-term investing for retirement only", "Paying insurance premiums years in advance"],
      "a", "An emergency reserve can help cover unexpected costs or a temporary change in income."],
    ["What does a useful emergency fund target depend on?",
      ["One fixed amount that suits everyone", "Your personal circumstances, essential costs and available support", "How much your friends have saved", "Your monthly entertainment spending"],
      "b", "There is no single right number: it depends on your circumstances, essential costs and the support available to you."],
    ["What does the lesson say about the emergency fund calculator?",
      ["It guarantees how much you will need", "It assesses your personal situation", "It is illustrative and does not guarantee an outcome", "It is a bank's official recommendation"],
      "c", "The calculator is illustrative. It does not assess your situation or guarantee an outcome."],
  ]),
  L("hospital-bills", [
    ["Which of these can appear on a hospital bill?",
      ["Accommodation, treatment, procedures and other services", "Only the doctor's consultation fee", "Only medicine", "Only the room charge"],
      "a", "Hospital bills can include accommodation, treatment, procedures and other services."],
    ["What decides whether a hospital cost is covered?",
      ["How busy the hospital is", "How large the total bill is", "The specific plan terms, limits, exclusions and claim assessment", "Whether you paid in cash"],
      "c", "Whether a cost is covered depends on the plan's terms, limits and exclusions, and on the claim assessment."],
    ["Is medical cover automatically a replacement for your income?",
      ["Yes, it always pays your salary", "Only if you stay in hospital overnight", "Only for surgery", "No — it relates to eligible healthcare costs, not income"],
      "d", "Medical cover relates to eligible healthcare costs; it is not automatically income replacement."],
  ]),
  L("income-replacement", [
    ["How does the lesson describe income protection?",
      ["One single product that pays your exact salary", "A broad planning purpose — different benefits have different qualifying events and payment methods", "Something that only applies at retirement", "The same thing as a medical card"],
      "b", "Income protection is a broad planning purpose. Different benefits qualify and pay in different ways."],
    ["If the policy conditions are met, how may a critical illness benefit be paid?",
      ["As a defined lump sum, which does not automatically match your salary", "As your exact monthly salary", "As free hospital stays only", "As a refund of all premiums paid"],
      "a", "A critical illness benefit may be a defined lump sum; it does not automatically match salary."],
    ["Medical reimbursement, hospital income and disability income are…",
      ["The same benefit with different names", "Only available through employers", "Always paid together", "Different benefit types — review each one's terms and limits"],
      "d", "They are different benefit types, so it is important to review the relevant terms and limits for each."],
  ]),
  L("first-salary", [
    ["What is a first payslip a good place to identify?",
      ["How much your colleagues earn", "Take-home pay, regular commitments and near-term goals", "Your credit score", "Your investment returns"],
      "b", "Your first payslip helps you see your take-home pay, regular commitments and near-term goals."],
    ["Before deciding what is affordable, what does the lesson suggest?",
      ["Copy a friend's budget", "Spend first and budget later", "Track your actual spending", "Plan around your highest-paid month"],
      "c", "Budgets are personal. Track your actual spending before making assumptions about what is affordable."],
    ["The figures used in this demo are…",
      ["Personal financial recommendations", "Official salary guidelines", "Guaranteed outcomes", "Examples, not personal financial recommendations"],
      "d", "The figures are examples only and are not personal financial recommendations."],
  ]),
  L("deductibles", [
    ["What is a deductible?",
      ["An amount you may need to pay before some benefits apply", "A bonus the insurer pays you", "A discount on your premium", "A refund after a claim"],
      "a", "A deductible is an amount you may need to pay before some benefits apply."],
    ["What is a co-payment?",
      ["The full bill, which you pay yourself", "A share of eligible costs that you pay", "A payment from your employer", "A fee for changing plans"],
      "b", "A co-payment is a share of the eligible costs that you pay."],
    ["Where should you check the definitions and amounts for a specific plan?",
      ["Social media posts", "A friend's policy", "The policy or certificate wording", "Any insurer's website — they are all the same"],
      "c", "Definitions and amounts vary, so check the policy or certificate wording for the specific arrangement."],
  ]),

  /* ------------------------------------------------------------- infographics */
  I("insurance-safety-net", [
    ["In the insurance contract shown, what do you pay to the insurer?",
      ["A one-off deposit you get back later", "Regular premiums", "Interest on a loan", "Nothing until you make a claim"],
      "b", "You pay regular premiums to an insurer, who agrees to reimburse covered losses if an unexpected event occurs."],
    ["What does pooling policyholders' premiums achieve?",
      ["Each person pays only for their own losses", "The insurer saves the money for you personally", "Individual financial burdens are shared across a large group", "Premiums rise every time someone claims"],
      "c", "Premiums are pooled so that individual financial burdens are shared across a large group."],
    ["According to the infographic, what does general insurance protect?",
      ["Physical assets like cars and homes", "Death and disability income", "Only medical bills", "Your savings account balance"],
      "a", "Asset protection (general insurance) covers physical assets like cars and homes; life insurance covers death and disability income."],
  ]),
  I("medical-insurance-malaysia", [
    ["What does presenting your medical card at a panel hospital enable?",
      ["A free annual health check", "A cash payout when you are admitted", "Direct billing via a Guarantee Letter (GL), avoiding upfront cash payments", "Lower hospital prices for everyone"],
      "c", "At panel hospitals, the medical card enables direct billing through a Guarantee Letter, so you avoid paying cash upfront."],
    ["What does Bank Negara Malaysia require insurers to offer?",
      ["Only full-coverage plans", "Plans with a minimum 5% co-payment option, alongside full-coverage plans", "Plans with no co-payment at all", "A 50% co-payment on every plan"],
      "b", "Insurers must offer plans with a minimum 5% co-payment option alongside full-coverage plans."],
    ["Why does the infographic suggest applying for a medical plan early?",
      ["Lower premiums when young, and cover secured before pre-existing conditions lead to exclusions", "Plans are only sold to people under 25", "Early applicants get cash back", "Older applicants are not allowed to apply"],
      "a", "Basic plans start around RM40/month for young adults, and applying early secures cover before pre-existing conditions lead to exclusions."],
  ]),
  I("life-insurance-malaysia", [
    ["When does life insurance pay its lump sum, according to the infographic?",
      ["Whenever you visit a clinic", "Every year on your birthday", "When you change jobs", "Upon death or total permanent disability"],
      "d", "It pays a lump sum upon death or total permanent disability, to cover living expenses, debts and future family goals."],
    ["How does term life differ from whole life?",
      ["Term: lifelong cover with savings; whole life: protection for fixed years", "Term: affordable pure protection for fixed years; whole life: lifelong cover with a cash savings component", "They are exactly the same", "Term life only covers accidents"],
      "b", "Term life is affordable pure protection for a fixed number of years; whole life is lifelong cover paired with a cash savings component."],
    ["Up to how much are eligible life insurance benefits protected by PIDM if an insurer fails?",
      ["RM50,000", "RM250,000", "RM500,000", "They are not protected"],
      "c", "Eligible benefits are protected up to RM500,000 by Perbadanan Insurans Deposit Malaysia (PIDM) under the TIPS scheme."],
  ]),
  I("critical-illness-malaysia", [
    ["Unlike medical insurance, how does critical illness insurance pay?",
      ["Directly to the hospital only", "A cash lump sum on diagnosis, for recovery, living expenses or debt", "Your monthly salary for life", "Only by reimbursing receipts"],
      "b", "It pays a cash lump sum on diagnosis that you can use for recovery, living expenses or debt."],
    ["How many major illnesses do standard plans cover, according to the infographic?",
      ["12", "36", "100", "180"],
      "b", "Standard plans cover 36 major illnesses such as cancer, stroke and heart attack; expanded options cover up to 180 conditions."],
    ["How can critical illness cover be taken up?",
      ["Only as a standalone policy", "Only through an employer", "Only as part of a medical card", "As a standalone policy or as a rider attached to life insurance"],
      "d", "It is available as a standalone policy or as an accelerated or non-accelerated rider attached to life insurance."],
  ]),
  I("personal-accident-malaysia", [
    ["Personal accident insurance compensates for death or disability caused by…",
      ["Accidental events only", "Any illness", "Old age", "Pre-existing conditions"],
      "a", "It reimburses medical expenses and compensates for death or disability caused solely by accidental events."],
    ["What does the infographic say about medical exams and where you are covered?",
      ["A full medical exam is always required", "Cover applies only in Malaysia during working hours", "Generally no medical exam, with round-the-clock protection anywhere in the world", "Cover applies on weekends only"],
      "c", "Policies generally require no medical examination and provide round-the-clock protection anywhere in the world."],
    ["How are cash benefits for injuries paid?",
      ["A flat amount for every injury", "Based on your salary", "Only on death", "As percentages of the sum insured, depending on the extent of disability"],
      "d", "Payouts are tiered: specific percentages of the sum insured, depending on how severe the disability is."],
  ]),
];

export const findQuiz = (kind: QuizKind, contentId: string) =>
  quizzes.find((q) => q.kind === kind && q.contentId === contentId);

import { Calculator, GraduationCap, ShieldCheck } from 'lucide-react'

export const demoActivities = [
  { title: 'Completed “Medical cards, explained simply”', detail: 'Learn · 5 min · Demo progress', icon: GraduationCap, tone: 'teal' as const },
  { title: 'Explored the emergency fund calculator', detail: 'Simulate · Today · Demo activity', icon: Calculator, tone: 'navy' as const },
  { title: 'Viewed your protection awareness summary', detail: 'Analyze · Yesterday · Demo activity', icon: ShieldCheck, tone: 'crimson' as const },
] as const

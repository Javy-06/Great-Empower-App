import { Languages } from "lucide-react";
import { cn } from "@/lib/cn";
import { languageLabels, type MediaLanguage } from "@/data/learn-media";
import { learnActions, useLearnProgress } from "@/state/learnProgress";

const order: MediaLanguage[] = ["en", "ms", "zh", "ta"];

/** Lesson language chips. Only content that exists in the chosen language changes. */
export function LanguageSelector({ dark, className }: { dark?: boolean; className?: string }) {
  const { language } = useLearnProgress();
  return (
    <div role="radiogroup" aria-label="Lesson language" className={cn("flex items-center gap-1.5", className)}>
      <Languages size={18} className={cn("shrink-0", dark ? "text-white/70" : "text-navy-800")} aria-hidden />
      <div className="-mr-5 flex gap-1.5 overflow-x-auto pr-5 scrollbar-none">
        {order.map((lang) => {
          const selected = language === lang;
          return (
            <button
              key={lang}
              type="button"
              role="radio"
              aria-checked={selected}
              lang={languageLabels[lang].htmlLang}
              onClick={() => learnActions.setLanguage(lang)}
              className={cn(
                "inline-flex h-10 shrink-0 items-center rounded-full px-3.5 text-caption font-semibold transition-colors",
                selected
                  ? dark
                    ? "bg-white text-navy-950"
                    : "bg-navy-900 text-white"
                  : dark
                    ? "bg-white/10 text-white ring-1 ring-white/15"
                    : "bg-surface text-navy-900 ring-1 ring-ink/10",
              )}
            >
              {languageLabels[lang].native}
            </button>
          );
        })}
      </div>
    </div>
  );
}

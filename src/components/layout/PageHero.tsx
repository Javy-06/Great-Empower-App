import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Container } from "./Editorial";
import { cn } from "@/lib/cn";

/**
 * Text-first navy page hero used by every destination. Photography is secondary: a cropped,
 * masked layer on the right that dissolves into the navy, never deciding the hero's height.
 */
export function PageHero({
  eyebrow,
  title,
  text,
  image,
  imagePosition = "50% 30%",
  backLabel,
  onBack,
  titleId,
  children,
  className,
  fadeTo = "var(--color-canvas)",
}: {
  eyebrow: string;
  title: ReactNode;
  text?: ReactNode;
  image?: string;
  imagePosition?: string;
  /** Page name shown beside the back arrow on phones (e.g. "Simulate"). */
  backLabel?: string;
  onBack?: () => void;
  titleId?: string;
  children?: ReactNode;
  className?: string;
  /** Colour of the section that follows; image heroes fade into it. Defaults to the page canvas. */
  fadeTo?: string;
}) {
  const hasArt = Boolean(image);
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <section
      aria-labelledby={titleId}
      className={cn("ge-pagehero relative isolate overflow-hidden text-white", className)}
      style={hasArt ? ({ "--ge-fade-to": fadeTo } as CSSProperties) : undefined}
    >
      {image && !imageFailed && (
        <div className="ge-pagehero-art pointer-events-none absolute inset-y-0 right-0 -z-10 w-[56%] md:w-[46%]" aria-hidden>
          <img
            src={image}
            alt=""
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover brightness-[0.8] saturate-[0.9]"
            style={{ objectPosition: imagePosition }}
          />
        </div>
      )}
      {/* As on Home: the bottom of an image hero (photo + navy) melts into the next section. */}
      {hasArt && <div className="ge-pagehero-fade pointer-events-none absolute inset-x-0 bottom-0 -z-[5]" aria-hidden />}
      <Container className={cn("relative pt-3 md:pt-12", hasArt ? "pb-20 sm:pb-24 md:pb-28" : "pb-8 sm:pb-10 md:pb-14")}>
        {backLabel && (
          <button
            type="button"
            onClick={onBack}
            className="-ml-2 inline-flex min-h-11 items-center gap-3 rounded-lg px-2 text-[1.0625rem] font-semibold text-white md:hidden"
          >
            <ArrowLeft size={22} aria-hidden />
            {backLabel}
          </button>
        )}
        <div className={cn("max-w-[64%] sm:max-w-[30rem]", backLabel ? "mt-3" : "mt-3 md:mt-0")}>
          <p className="text-overline uppercase tracking-[0.22em] text-teal-200">{eyebrow}</p>
          <h1
            id={titleId}
            className="mt-2 font-brand text-[2.125rem] font-semibold leading-[1.02] tracking-[-0.01em] text-white sm:text-[2.75rem] md:text-[3.5rem]"
          >
            {title}
          </h1>
          {text && (
            <p className="mt-2.5 text-body-sm leading-relaxed text-white/80 sm:text-body">{text}</p>
          )}
        </div>
        {children}
      </Container>
    </section>
  );
}

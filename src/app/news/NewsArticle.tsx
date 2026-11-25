import { useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Maximize2 } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import type { NewsStory } from "@/data/news";
import { InfographicDialog } from "./InfographicDialog";

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * News detail: an editorial article page. The infographic is the centrepiece; reported facts and
 * GREAT EMPOWER's own explanations are kept in clearly labelled, separate parts.
 */
export function NewsArticle({ story, onBack }: { story: NewsStory; onBack: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [imageUnavailable, setImageUnavailable] = useState(false);

  return (
    <article aria-labelledby="news-title" className="bg-canvas pb-16 sm:pb-24">
      {/* Masthead */}
      <header className="bg-navy-950 pb-24 pt-6 text-white sm:pb-28 sm:pt-10">
        <Container>
          <div className="mx-auto max-w-[720px]">
            <button
              type="button"
              onClick={onBack}
              className="-ml-1 hidden min-h-11 items-center gap-2 text-body-sm font-semibold text-white/70 hover:text-white md:inline-flex"
            >
              <ArrowLeft size={16} aria-hidden /> Home
            </button>
            <p className="text-overline uppercase tracking-[0.2em] text-teal-200 md:mt-6">
              News · Medical protection
            </p>
            <h1
              id="news-title"
              className="mt-4 font-brand text-[2rem] font-semibold leading-[1.08] text-white sm:text-[2.75rem]"
            >
              {story.headline}
            </h1>
            <p className="mt-5 text-body-sm text-white/70">
              <span className="font-semibold text-white">{story.publication}</span> · By{" "}
              {story.byline} ·{" "}
              <time dateTime={story.publishedOn}>{formatDate(story.publishedOn)}</time>
            </p>
          </div>
        </Container>
      </header>

      <Container>
        <div className="mx-auto max-w-[720px]">
          {/* Infographic — the centrepiece; overlaps the masthead and opens full-size on tap. */}
          <figure className="-mt-16 sm:-mt-20">
            {imageUnavailable ? (
              <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-navy-900 p-8 text-center text-body-sm text-white/70">
                The MediAsas infographic is not available yet.
              </div>
            ) : (
              <button
                type="button"
                onClick={() => dialogRef.current?.showModal()}
                className="group relative block w-full overflow-hidden rounded-2xl bg-surface shadow-e3 ring-1 ring-ink/5"
                aria-label="Enlarge the MediAsas infographic"
              >
                <img
                  src={story.infographic.inline}
                  alt={story.infographic.alt}
                  width={story.infographic.width}
                  height={story.infographic.height}
                  decoding="async"
                  fetchPriority="high"
                  onError={() => setImageUnavailable(true)}
                  className="block h-auto w-full"
                />
              </button>
            )}
            <figcaption className="mt-3 flex items-start justify-between gap-4 text-caption text-ink-muted">
              <span>
                Key figures as reported by {story.publication}. Final MediAsas terms may change
                before launch.
              </span>
              {!imageUnavailable && (
                <button
                  type="button"
                  onClick={() => dialogRef.current?.showModal()}
                  className="-my-3 inline-flex min-h-11 shrink-0 items-center gap-1.5 font-semibold text-navy-900 hover:underline"
                >
                  <Maximize2 size={14} aria-hidden /> Enlarge
                </button>
              )}
            </figcaption>
          </figure>

          {/* Summary (reported) */}
          <p className="mt-8 text-body-lg text-ink sm:text-lede">{story.summary}</p>

          {/* What the article reports */}
          <section aria-labelledby="reported-title" className="mt-12">
            <h2
              id="reported-title"
              className="font-brand text-[1.75rem] font-semibold text-navy-950"
            >
              What was reported
            </h2>
            <p className="mt-1 text-caption text-ink-muted">
              From the {story.publication} article. Details are as reported, not final policy terms.
            </p>
            <dl className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
              {story.reported.map(({ label, text }) => (
                <div key={label} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="text-body-sm font-semibold text-navy-950">{label}</dt>
                  <dd className="text-body-sm text-ink-secondary">{text}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* GREAT EMPOWER explainer */}
          <section aria-labelledby="concepts-title" className="mt-12">
            <p className="text-overline uppercase tracking-[0.2em] text-teal-700">
              GREAT EMPOWER explainer
            </p>
            <h2
              id="concepts-title"
              className="mt-2 font-brand text-[1.75rem] font-semibold text-navy-950"
            >
              Key ideas, simply
            </h2>
            <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {story.concepts.map(({ term, text }) => (
                <div key={term} className="border-l-2 border-teal-600 pl-4">
                  <dt className="text-body font-semibold text-navy-950">{term}</dt>
                  <dd className="mt-1 text-body-sm text-ink-secondary">{text}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* What this means for you */}
          <section
            aria-labelledby="for-you-title"
            className="mt-12 rounded-2xl bg-navy-950 p-6 text-white sm:p-8"
          >
            <p className="text-overline uppercase tracking-[0.2em] text-teal-200">
              GREAT EMPOWER explainer
            </p>
            <h2 id="for-you-title" className="mt-2 font-brand text-[1.75rem] font-semibold">
              What this means for you
            </h2>
            <ol className="mt-5 grid gap-4">
              {story.forYou.map((point, index) => (
                <li key={point} className="grid grid-cols-[1.75rem_1fr] text-body-sm text-white/80">
                  <span className="font-brand text-[1.25rem] leading-5 text-teal-200 tabular-nums">
                    {index + 1}
                  </span>
                  {point}
                </li>
              ))}
            </ol>
            <p className="mt-6 text-caption text-white/60">
              General education only — not financial advice or a product recommendation.
            </p>
          </section>

          {/* Source */}
          <div className="mt-10 flex flex-col gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-caption text-ink-muted">
              Source: {story.publication}, {formatDate(story.publishedOn)}. GREAT EMPOWER is
              independent and not affiliated with the publisher or any insurer.
            </p>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-navy-900/20 px-5 text-body-sm font-semibold text-navy-900 transition-colors hover:border-navy-900"
            >
              Read on {story.publication}
              <ArrowUpRight size={16} aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </Container>

      <InfographicDialog story={story} dialogRef={dialogRef} />
    </article>
  );
}

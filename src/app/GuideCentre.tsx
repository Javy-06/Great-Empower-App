import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronDown } from "lucide-react";
import { SearchField } from "@/components/ui/Field";
import { Band, Chapter, Container } from "@/components/layout/Editorial";
import { cn } from "@/lib/cn";

const guideArticles = [
  {
    id: "protection-purposes",
    category: "Protection",
    title: "Understanding financial protection purposes",
    minutes: 6,
    summary: "A plain-language overview of different protection purposes and benefit types.",
    points: [
      "Protection products can be designed for different purposes and may pay benefits in different ways.",
      "Medical reimbursement, critical illness benefits and income-style benefits are different and are not interchangeable.",
      "Eligibility, limits, exclusions and claim conditions depend on the relevant policy or certificate.",
    ],
  },
  {
    id: "hospital-costs",
    category: "Health",
    title: "How hospital costs affect planning",
    minutes: 4,
    summary:
      "Understand how eligible healthcare costs, policy terms and personal savings can fit together.",
    points: [
      "Medical and health cover is generally designed for eligible healthcare costs, subject to the policy or certificate.",
      "Exclusions, limits, waiting periods, deductibles and co-payments can affect benefits and out-of-pocket costs.",
      "Medical cover is not automatically salary replacement. Check the specific terms and claim requirements.",
    ],
  },
  {
    id: "emergency-fund",
    category: "Saving",
    title: "Building an emergency fund",
    minutes: 5,
    summary:
      "Explore how a cash reserve may help with unexpected expenses or a temporary disruption.",
    points: [
      "A cash reserve can help meet unexpected costs without relying immediately on credit.",
      "A suitable amount depends on personal circumstances, essential expenses and available support.",
      "The GREAT EMPOWER calculator is illustrative and does not assess or recommend a personal target.",
    ],
  },
] as const;

type GuideCategory = "All" | (typeof guideArticles)[number]["category"];
type ArticleCategory = Exclude<GuideCategory, "All">;

/**
 * Local Pexels photographs for categories with live articles (UI 6.3).
 * Source, contributor and licence for each file are recorded in
 * docs/ui-enhancement/pexels-image-register.csv. "Money basics" has no
 * articles and intentionally stays image-free.
 */
const guideCategoryImages: Record<ArticleCategory, string> = {
  Protection: "/images/pexels/family-protection-conversation.webp",
  Health: "/images/pexels/everyday-health-wellbeing.webp",
  Saving: "/images/pexels/young-professional-savings-planning.webp",
};

function readArticleId() {
  const match = /^#app\/guide\/article\/([^/?#]+)$/.exec(window.location.hash);
  return match?.[1];
}

function openGuide() {
  window.location.hash = "app/guide";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Photo({ src, className, eager }: { src: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={cn("bg-sand-100", className)} aria-hidden />;
  return (
    <img
      src={src}
      alt=""
      width={1200}
      height={800}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

const tabs: GuideCategory[] = ["All", "Protection", "Health", "Saving"];
const FEATURED_ID = "hospital-costs";

export function GuideCentre() {
  const [articleId, setArticleId] = useState(readArticleId);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GuideCategory>("All");
  const [faqOpen, setFaqOpen] = useState(false);

  useEffect(() => {
    const updateArticle = () => setArticleId(readArticleId());
    window.addEventListener("hashchange", updateArticle);
    return () => window.removeEventListener("hashchange", updateArticle);
  }, []);

  const article = guideArticles.find((item) => item.id === articleId);
  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return guideArticles.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const searchableText =
        `${item.title} ${item.category} ${item.summary} ${item.points.join(" ")}`.toLocaleLowerCase();
      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [category, query]);

  /* ---------- Article: a reading layout ---------- */
  if (articleId && article) {
    return (
      <article>
        <div className="relative h-[38vh] min-h-[260px] overflow-hidden bg-sand-100 sm:h-[46vh]">
          <Photo
            src={guideCategoryImages[article.category]}
            eager
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <Band tone="paper" label={article.title} className="!pt-10 sm:!pt-14">
          <Container className="max-w-[820px]">
            <button
              type="button"
              onClick={openGuide}
              className="inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-navy-800 hover:text-navy-950"
            >
              <ArrowLeft size={16} aria-hidden /> Back to Guide
            </button>
            <p className="mt-8 text-overline uppercase text-teal-700">
              {article.category} · {article.minutes} min read
            </p>
            <h1 className="mt-4 font-brand text-mega text-navy-950">{article.title}</h1>
            <p className="mt-6 text-lede text-ink-secondary">{article.summary}</p>
            <h2 className="mt-12 text-caption font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Key ideas
            </h2>
            <ol className="mt-4 border-t border-ink/15">
              {article.points.map((point, index) => (
                <li
                  key={point}
                  className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-ink/15 py-6"
                >
                  <span className="font-brand text-chapter leading-none text-teal-700 tabular-nums">
                    {index + 1}
                  </span>
                  <span className="text-lede text-ink">{point}</span>
                </li>
              ))}
            </ol>
            {article.id === "hospital-costs" && (
              <div className="mt-8 flex flex-col gap-2 text-body-sm">
                <p className="text-caption font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Further reading
                </p>
                <a
                  className="font-semibold text-navy-800 underline underline-offset-4"
                  href="https://www.bnm.gov.my/faqs/ins-tkf/life-family"
                  target="_blank"
                  rel="noreferrer"
                >
                  Bank Negara Malaysia: MHIT overview
                </a>
                <a
                  className="font-semibold text-navy-800 underline underline-offset-4"
                  href="https://insuranceinfo.com.my/learn-the-basics/types-of-insurance/medical-health-insurance/"
                  target="_blank"
                  rel="noreferrer"
                >
                  InsuranceInfo: medical and health cover
                </a>
              </div>
            )}
            <p className="mt-12 border-t border-ink/15 pt-4 text-caption text-ink-muted">
              Educational demo content only. It is not personal financial, insurance or medical
              advice, and does not recommend buying a product.
            </p>
          </Container>
        </Band>
      </article>
    );
  }

  /* ---------- Guide: featured story + index ---------- */
  const featured = guideArticles.find((item) => item.id === FEATURED_ID)!;
  return (
    <>
      <Band tone="paper" labelledBy="guide-title" className="!pb-12">
        <Container className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:items-end">
          <div>
            <Chapter
              as="h1"
              label="Guide"
              id="guide-title"
              title="Plain answers to money questions."
            />
            <div className="mt-8 max-w-md">
              <SearchField placeholder="Search guide articles" value={query} onChange={setQuery} />
            </div>
          </div>
          <a href={`#app/guide/article/${featured.id}`} className="ge-zoom group block">
            <span className="block aspect-[16/10] overflow-hidden">
              <Photo src={guideCategoryImages[featured.category]} eager className="h-full w-full" />
            </span>
            <span className="mt-5 block text-overline uppercase text-teal-700">
              Featured · {featured.category} · {featured.minutes} min
            </span>
            <span className="mt-2 block font-brand text-chapter text-navy-950 group-hover:underline group-hover:underline-offset-4">
              {featured.title}
            </span>
          </a>
        </Container>
      </Band>

      <Band tone="canvas" labelledBy="articles-title" className="!pt-12">
        <Container>
          <h2 id="articles-title" className="sr-only">
            Guide articles
          </h2>
          <nav aria-label="Guide categories">
            <ul className="flex flex-wrap gap-1 border-b border-ink/15">
              {tabs.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    aria-pressed={category === label}
                    onClick={() => setCategory(label)}
                    className={cn(
                      "relative inline-flex h-12 items-center px-3 text-body-sm font-semibold",
                      category === label ? "text-navy-950" : "text-ink-muted hover:text-navy-900",
                    )}
                  >
                    {label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-3 -bottom-px h-0.5",
                        category === label ? "bg-crimson-600" : "bg-transparent",
                      )}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {filteredArticles.length > 0 ? (
            <ol className="mt-2">
              {filteredArticles.map((item) => (
                <li key={item.id} className="border-b border-ink/15">
                  <a
                    href={`#app/guide/article/${item.id}`}
                    className="ge-zoom group grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-5 sm:grid-cols-[8rem_1fr_auto] sm:gap-6 sm:py-6"
                  >
                    <span className="block aspect-square overflow-hidden sm:aspect-[4/3]">
                      <Photo src={guideCategoryImages[item.category]} className="h-full w-full" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-caption font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        {item.category} · {item.minutes} min read
                      </span>
                      <p className="mt-1 font-brand text-serif-title font-semibold text-navy-950 group-hover:underline group-hover:underline-offset-4">
                        {item.title}
                      </p>
                    </span>
                    <ArrowUpRight
                      size={22}
                      className="text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-8 text-body text-ink-secondary" role="status">
              No demo guides match that search. Try another word or clear the search.
            </p>
          )}

          <div className="mt-10">
            <button
              type="button"
              aria-expanded={faqOpen}
              onClick={() => setFaqOpen((value) => !value)}
              className="inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-navy-800"
            >
              Is this financial advice?
              <ChevronDown
                size={18}
                className={cn("transition-transform", faqOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            {faqOpen && (
              <p className="mt-1 max-w-xl text-body-sm text-ink-secondary">
                No. These resources are general educational information and are not personalised
                financial or insurance advice.
              </p>
            )}
          </div>
        </Container>
      </Band>
    </>
  );
}

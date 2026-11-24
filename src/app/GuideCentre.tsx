import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, HeartPulse, Landmark, PiggyBank, ShieldCheck } from "lucide-react";
import { ArticleRow, FaqItem } from "@/components/cards/GuideCards";
import { Badge, Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchField } from "@/components/ui/Field";
import { PageHeader } from "@/components/layout/Page";

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

const categoryIcons: Record<ArticleCategory, typeof ShieldCheck> = {
  Protection: ShieldCheck,
  Health: HeartPulse,
  Saving: PiggyBank,
};

function CategoryMediaFallback({ icon: Icon }: { icon: typeof ShieldCheck }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-navy-50"
      aria-hidden="true"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-navy-900 shadow-e1">
        <Icon size={20} />
      </span>
    </div>
  );
}

function GuideCategoryTile({
  label,
  count,
  icon,
  imageSrc,
}: {
  label: string;
  count: number;
  icon: typeof ShieldCheck;
  imageSrc?: string;
}) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  return (
    <Card padding="none" className="flex flex-col overflow-hidden">
      <div className="relative aspect-[3/2] overflow-hidden bg-navy-50">
        {imageSrc && !imageUnavailable ? (
          // Decorative crop: the tile label below already names the category.
          <img
            src={imageSrc}
            alt=""
            width={1200}
            height={800}
            loading="lazy"
            decoding="async"
            onError={() => setImageUnavailable(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <CategoryMediaFallback icon={icon} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <span className="text-body-sm font-semibold text-ink">{label}</span>
        <span className="mt-auto text-caption text-ink-muted">
          {count} demo {count === 1 ? "guide" : "guides"}
        </span>
      </div>
    </Card>
  );
}

function ArticleHeaderImage({ src }: { src: string }) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  if (imageUnavailable) return null;
  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-navy-50 sm:aspect-[21/9]">
      {/* Decorative header: the article title and category follow immediately. */}
      <img
        src={src}
        alt=""
        width={1200}
        height={800}
        loading="eager"
        decoding="async"
        onError={() => setImageUnavailable(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

function readArticleId() {
  const match = /^#app\/guide\/article\/([^/?#]+)$/.exec(window.location.hash);
  return match?.[1];
}

function openGuide() {
  window.location.hash = "app/guide";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function GuideCentre() {
  const [articleId, setArticleId] = useState(readArticleId);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GuideCategory>("All");

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

  if (articleId && article) {
    return (
      <div className="mx-auto flex max-w-[900px] flex-col gap-5">
        <Button
          size="sm"
          variant="ghost"
          leadingIcon={ArrowLeft}
          onClick={openGuide}
          className="w-fit"
        >
          Back to Guide
        </Button>
        <Card padding="none" radius="3xl" className="overflow-hidden">
          <ArticleHeaderImage src={guideCategoryImages[article.category]} />
          <div className="p-5 md:p-6">
            <Badge tone="teal">
              {article.category} · {article.minutes} min read
            </Badge>
            <h1 className="mt-3 font-brand text-serif-title text-navy-900 md:text-serif-hero">{article.title}</h1>
            <p className="mt-2 max-w-2xl text-body text-ink-secondary">{article.summary}</p>
            <h2 className="mt-7 text-heading text-ink">Key ideas</h2>
            <ul className="mt-3 grid gap-3">
              {article.points.map((point) => (
                <li
                  key={point}
                  className="rounded-xl bg-sunken p-4 text-body-sm text-ink-secondary"
                >
                  {point}
                </li>
              ))}
            </ul>
            {article.id === "hospital-costs" && (
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-body-sm">
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
            <p className="mt-7 border-t border-line pt-4 text-caption text-ink-muted">
              Educational demo content only. It is not personal financial, insurance or medical
              advice, and does not recommend buying a product.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const categories: Array<{ label: GuideCategory; icon?: typeof ShieldCheck }> = [
    { label: "All" },
    { label: "Protection", icon: ShieldCheck },
    { label: "Health", icon: HeartPulse },
    { label: "Saving", icon: PiggyBank },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <PageHeader
          eyebrow="Guide"
          tone="gold"
          title="Plain answers to money questions."
          lede="Short, general explainers. Read one in under ten minutes."
        />
        <div className="mt-6 max-w-xl">
          <SearchField placeholder="Search guide articles" value={query} onChange={setQuery} />
        </div>
      </div>

      <section aria-label="Guide categories">
        <div className="flex flex-wrap gap-2">
          {categories.map(({ label, icon: Icon }) => (
            <Chip
              key={label}
              selected={category === label}
              onClick={() => setCategory(label)}
              icon={Icon}
            >
              {label}
            </Chip>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Protection",
              count: 1,
              icon: ShieldCheck,
              imageSrc: guideCategoryImages.Protection,
            },
            { label: "Health", count: 1, icon: HeartPulse, imageSrc: guideCategoryImages.Health },
            { label: "Saving", count: 1, icon: PiggyBank, imageSrc: guideCategoryImages.Saving },
            { label: "Money basics", count: 0, icon: Landmark },
          ].map((tile) => (
            <GuideCategoryTile key={tile.label} {...tile} />
          ))}
        </div>

        <Card padding="sm">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((item) => (
              <ArticleRow
                key={item.id}
                icon={categoryIcons[item.category]}
                imageSrc={guideCategoryImages[item.category]}
                category={item.category}
                title={item.title}
                minutes={item.minutes}
                href={`#app/guide/article/${item.id}`}
              />
            ))
          ) : (
            <div className="p-4 text-body-sm text-ink-secondary" role="status">
              No demo guides match that search. Try another word or clear the search.
            </div>
          )}
          <FaqItem
            q="Is this financial advice?"
            a="No. These resources are general educational information and are not personalised financial or insurance advice."
            defaultOpen
          />
        </Card>
      </div>
    </div>
  );
}

import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";

/** About & legal: the full independence and education notice, kept out of every page footer. */
export function AboutView() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="About GREAT EMPOWER"
        text="Empowering you to protect your tomorrow."
        backLabel="Back"
        onBack={() => history.back()}
        titleId="about-title"
      />
      <Container className="max-w-[44rem] py-8">
        <div className="grid gap-6 text-body text-ink-secondary">
          <section>
            <h2 className="text-heading text-navy-950">Independent education</h2>
            <p className="mt-2">
              GREAT EMPOWER is an independent financial protection education concept for young
              adults in Malaysia. It is not an official Great Eastern insurance product; no
              partnership, authorisation or endorsement is implied.
            </p>
          </section>
          <section>
            <h2 className="text-heading text-navy-950">Not financial advice</h2>
            <p className="mt-2">
              Examples and calculations are illustrative. They are not financial advice, policy
              terms, insurer quotations or claim decisions. Actual coverage depends on the relevant
              policy wording and terms — consult a licensed adviser for personal advice.
            </p>
          </section>
          <section>
            <h2 className="text-heading text-navy-950">Rewards and the Marketplace</h2>
            <p className="mt-2">
              Points, vouchers, Marketplace brands and game benefits are fictional, in-app
              items with no cash value. They are stored on this device only and do not represent
              real merchants, products, insurance cover or real-world redemption.
            </p>
          </section>
          <section>
            <h2 className="text-heading text-navy-950">News content</h2>
            <p className="mt-2">
              News summaries restate published sources, which are linked on each item. Details about
              MediAsas may change before launch — refer to Bank Negara Malaysia and insurers for
              current terms.
            </p>
          </section>
          <a href="#foundation" className="text-body-sm font-semibold text-navy-900 underline-offset-4 hover:underline">
            View the design system
          </a>
        </div>
      </Container>
    </>
  );
}

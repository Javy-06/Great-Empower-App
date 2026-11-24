/** Foundation 2.0 prologue: the brand story and the four principles, before the component reference. */
const principles = [
  {
    title: "Night & Paper",
    text: "Deep navy for moments that matter; warm paper for reading. White is for working surfaces.",
  },
  {
    title: "Type is the layout",
    text: "Cormorant display at scale carries the page; Inter does the work.",
  },
  {
    title: "One accent",
    text: "Crimson appears once per screen — the action or the figure that matters.",
  },
  {
    title: "Rows, not boxes",
    text: "Hairlines and numbered chapters before cards. A box must earn its border.",
  },
];

export function BrandPrologue() {
  return (
    <section
      aria-labelledby="prologue-title"
      className="relative -mx-3 mb-4 overflow-hidden bg-navy-950 text-white sm:-mx-4 md:-mx-8 xl:-mx-12"
    >
      <div className="grid lg:grid-cols-[7fr_5fr]">
        <div className="px-6 py-14 sm:px-10 sm:py-20 lg:px-14">
          <p className="text-overline uppercase tracking-[0.16em] text-teal-200">
            Design Foundation · 2.0
          </p>
          <h2 id="prologue-title" className="mt-5 font-brand text-mega text-white">
            Calm, clear, and on your side.
          </h2>
          <p className="mt-6 max-w-md text-lede text-white/70">
            How GREAT EMPOWER looks and speaks: an editorial product for people taking their first
            steps with money.
          </p>
        </div>
        <div className="relative min-h-[260px] overflow-hidden lg:min-h-0">
          <img
            src="/images/pexels/young-friends-cafe-community.webp"
            alt="Three young women of different backgrounds looking at a smartphone together over coffee in a café"
            width={1600}
            height={1067}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
          />
          <span className="absolute inset-y-0 left-0 w-1.5 bg-crimson-600" aria-hidden />
        </div>
      </div>
      <ol className="grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {principles.map(({ title, text }, index) => (
          <li
            key={title}
            className="border-b border-white/10 px-6 py-8 sm:px-10 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:px-8"
          >
            <span className="font-brand text-chapter text-teal-200">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="mt-3 text-body font-semibold text-white">{title}</p>
            <p className="mt-1 text-body-sm text-white/65">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

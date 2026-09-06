const STEPS = [
  {
    n: '1',
    title: 'Start with the real problem',
    body: "Choose the course and tell us what’s going on: catching up, preparing for a test, or building confidence before the next one.",
  },
  {
    n: '2',
    title: 'See the rate before you commit',
    body: 'The course level and format determine the price. You’ll see the full total before you pick a time or open PayPal.',
  },
  {
    n: '3',
    title: 'Choose a time that fits',
    body: 'Reserve one session or a four-week weekly series, pay securely through PayPal, and get a calendar file for the booking.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-[var(--color-line)] bg-[var(--color-paper-card)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl text-[var(--color-ink)] md:text-4xl">How it works</h2>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative pl-0">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-2xl text-[var(--color-brass)]">{s.n}</span>
                <h3 className="font-display text-xl text-[var(--color-ink)]">{s.title}</h3>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">{s.body}</p>
              {i < STEPS.length - 1 && (
                <div className="mt-8 hidden h-px w-full bg-[var(--color-line)] md:block" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

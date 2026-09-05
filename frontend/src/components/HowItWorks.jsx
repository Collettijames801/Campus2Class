const STEPS = [
  {
    n: '1',
    title: 'Tell us what your kid needs help with',
    body: "A quick survey on the subject, course, and what's actually going on — falling behind, prepping for a test, or just wants to get ahead.",
  },
  {
    n: '2',
    title: 'Get a real price, instantly',
    body: 'No quotes over the phone. The rate is calculated right there based on the course level and format — Zoom or in-person in Monmouth County.',
  },
  {
    n: '3',
    title: 'Pick a time and pay securely',
    body: 'Choose an open slot, pay through PayPal, and you\u2019re booked. A confirmation goes straight to your email.',
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

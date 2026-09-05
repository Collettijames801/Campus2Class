const TIERS = [
  { label: 'Middle school (Math or English)', rate: 35, note: '6th–8th grade, Pre-Algebra' },
  { label: 'High school — standard', rate: 40, note: 'Algebra I/II, Geometry, general English 9–12' },
  { label: 'High school — Honors', rate: 45, note: 'Honors Algebra II, Geometry, Precalc, Honors English' },
  { label: 'High school — AP', rate: 55, note: 'AP Calc AB/BC, AP Stats, AP Lang, AP Lit' },
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-t border-[var(--color-line)] bg-[var(--color-paper-card)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl text-[var(--color-ink)] md:text-4xl">Subjects &amp; pricing</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            Every course from a middle school curriculum through AP is
            covered in both Math and English. Rates are set by course level,
            benchmarked against local tutoring rates so it's fair for both
            sides.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-md border border-[var(--color-line)]">
          {TIERS.map((t, i) => (
            <div
              key={t.label}
              className={`flex flex-col justify-between gap-2 px-6 py-5 sm:flex-row sm:items-center ${
                i % 2 === 0 ? 'bg-[var(--color-paper)]' : 'bg-[var(--color-paper-card)]'
              } ${i > 0 ? 'border-t border-[var(--color-line)]' : ''}`}
            >
              <div>
                <p className="font-medium text-[var(--color-ink)]">{t.label}</p>
                <p className="text-sm text-[var(--color-ink-soft)]">{t.note}</p>
              </div>
              <p className="font-display text-2xl text-[var(--color-oxblood)] sm:text-right">
                ${t.rate}
                <span className="text-sm font-sans text-[var(--color-ink-soft)]">/hr</span>
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
          In-person sessions in Monmouth County add $10/hr for travel. Zoom
          sessions have no surcharge. Get an exact quote for your student's
          course below.
        </p>
      </div>
    </section>
  );
}

export default function TutorBio() {
  return (
    <section id="tutor" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-paper-card)] p-8">
          <p className="font-display text-sm text-[var(--color-ink-soft)]">Founder &amp; tutor</p>
          <p className="mt-1 font-display text-2xl text-[var(--color-ink)]">James Colletti</p>
          <ul className="mt-6 space-y-3 text-[15px] text-[var(--color-ink-soft)]">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brass)]" />
              Honors student at Brookdale Community College, in the transfer
              program to Rutgers Business School
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brass)]" />
              Every session goes directly toward tuition — no student loans,
              no accumulating debt
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brass)]" />
              Based in Monmouth County, tutoring Math and English for middle
              and high schoolers
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-3xl text-[var(--color-ink)] md:text-4xl">
            Why a college student, and not a certified teacher?
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            Because it wasn't that long ago that I was sitting where your kid
            is sitting — same textbooks, same tests, same subjects. Honors
            college students remember what actually trips students up in
            Algebra II or a Lit essay, and how to explain it without the
            jargon.
          </p>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            And every hour parents book pays into an honors student's tuition
            instead of a loan balance. As Campus2Class grows, that's the same
            standard every tutor who joins will be held to: honors-level
            students, working toward their own degree, debt-free.
          </p>
        </div>
      </div>
    </section>
  );
}

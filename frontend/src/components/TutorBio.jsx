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
                Every session helps cover tuition without adding another loan
                balance
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
            Because it wasn’t that long ago that I was sitting where your kid
            is sitting: the same textbooks, the same tests, and the same
            moments where one explanation finally makes the lesson click.
            Honors college tutors remember those sticking points and know how
            to explain them without making the room feel more complicated.
          </p>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            Every hour also has a clear purpose beyond the session itself: it
            helps an honors student keep working toward a degree. As
            Campus2Class grows, that remains the standard for every tutor who
            joins.
          </p>
        </div>
      </div>
    </section>
  );
}

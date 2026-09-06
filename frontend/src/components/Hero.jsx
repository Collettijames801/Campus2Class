import { useEffect, useState } from 'react';
import { fetchQuote } from '../lib/api';

export default function Hero({ courses, selection, setSelection }) {
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);

  const subjectCourses = courses?.[selection.subject] || [];

  useEffect(() => {
    if (!selection.courseId) return;
    let cancelled = false;
    fetchQuote(selection)
      .then((q) => {
        if (!cancelled) {
          setQuote(q);
          setError(null);
        }
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.subject, selection.courseId, selection.struggle, selection.format]);

  const scrollToBook = () => {
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="top" className="mx-auto max-w-6xl px-6 pt-14 pb-20 md:pt-20 md:pb-28">
      <div className="grid gap-14 md:grid-cols-[1.15fr_1fr] md:items-start">
        {/* Left: message */}
        <div>
          <h1 className="font-display text-[2.6rem] leading-[1.08] font-medium text-[var(--color-ink)] md:text-[3.4rem]">
            An honors college student, tutoring your kid toward theirs.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--color-ink-soft)]">
            Campus2Class connects Monmouth County families with thoughtful
            honors college tutors for Math and English. Your child gets a
            session built around what they need; your tutor gets a practical
            way to keep moving toward a degree.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={scrollToBook}
              className="rounded-sm bg-[var(--color-brass)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brass-dark)]"
            >
              Get your price
            </button>
            <a
              href="#how-it-works"
              className="rounded-sm border border-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
            >
              See how it works
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--color-line)] pt-8 text-sm sm:grid-cols-4">
            {[
              ['Tutor', 'Brookdale Honors → Rutgers Business'],
              ['Subjects', 'Math & English, grades 6–12'],
              ['Format', 'Zoom anywhere · in-person in Monmouth County'],
              ['Where it goes', 'Straight toward tuition, debt-free'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[var(--color-ink-soft)]">{k}</dt>
                <dd className="mt-1 font-medium text-[var(--color-ink)]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: live quote ledger card */}
        <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 shadow-[0_1px_0_var(--color-line)] md:p-7">
          <p className="font-display text-lg text-[var(--color-ink)]">See what a session costs</p>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Tell us the course and the kind of help your student needs. You’ll
            see the actual rate before you choose a time.
          </p>

          <div className="mt-6 space-y-4">
            <Field label="Subject">
              <select
                className="field"
                value={selection.subject}
                onChange={(e) => {
                  const subject = e.target.value;
                  const firstCourse = courses?.[subject]?.[0]?.id || '';
                  setSelection((s) => ({ ...s, subject, courseId: firstCourse }));
                }}
              >
                <option value="math">Math</option>
                <option value="english">English</option>
              </select>
            </Field>

            <Field label="Course">
              <select
                className="field"
                value={selection.courseId}
                onChange={(e) => setSelection((s) => ({ ...s, courseId: e.target.value }))}
              >
                {subjectCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Student is">
              <select
                className="field"
                value={selection.struggle}
                onChange={(e) => setSelection((s) => ({ ...s, struggle: e.target.value }))}
              >
                <option value="homework-support">Keeping up, wants regular help</option>
                <option value="catching-up">Falling behind, needs to catch up</option>
                <option value="test-prep">Prepping for a specific test/exam</option>
                <option value="enrichment">Doing fine, wants to get ahead</option>
              </select>
            </Field>

            <Field label="Format">
              <select
                className="field"
                value={selection.format}
                onChange={(e) => setSelection((s) => ({ ...s, format: e.target.value }))}
              >
                <option value="zoom">Zoom</option>
                <option value="in-person">In-person (Monmouth County)</option>
              </select>
            </Field>
          </div>

          <div className="mt-6 flex items-baseline justify-between border-t border-dashed border-[var(--color-line)] pt-5">
            <span className="text-sm text-[var(--color-ink-soft)]">Your rate</span>
            <span className="font-display text-3xl text-[var(--color-oxblood)]">
              {quote ? `$${quote.ratePerHour}/hr` : error ? '—' : '…'}
            </span>
          </div>

          <button
            onClick={scrollToBook}
            className="mt-5 w-full rounded-sm bg-[var(--color-ink)] py-3 text-sm font-semibold text-[var(--color-paper)] transition-colors hover:bg-[var(--color-brass-dark)]"
          >
            Continue to booking
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-ink-soft)]">
        {label}
      </span>
      {children}
    </label>
  );
}

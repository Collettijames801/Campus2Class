const FAQS = [
  {
    q: 'Where do you tutor?',
    a: 'Zoom sessions are available anywhere in New Jersey. In-person sessions are currently limited to Monmouth County.',
  },
  {
    q: 'How do I know my child will be in good hands?',
    a: 'Every tutor on Campus2Class is an honors-level college student, vetted before joining. You\u2019ll always know exactly who is tutoring your student before the first session.',
  },
  {
    q: 'What if we need to cancel or reschedule?',
    a: 'Reach out at least 24 hours ahead by email or phone and we\u2019ll move the session to another open slot at no charge.',
  },
  {
    q: 'Do you tutor for specific tests, like an upcoming midterm?',
    a: "Yes — select \u201cPrepping for a specific test/exam\u201d in the booking survey and the session will be built around it.",
  },
  {
    q: 'Can I book recurring weekly sessions?',
    a: 'Yes. Choose a starting time and select weekly for four weeks. The full series is held and paid upfront so those times stay yours.',
  },
];

export default function Faq() {
  return (
    <section id="faq" className="border-t border-[var(--color-line)]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl text-[var(--color-ink)] md:text-4xl">Questions parents ask</h2>

        <div className="mt-10 divide-y divide-[var(--color-line)] border-t border-[var(--color-line)] md:max-w-3xl">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-[var(--color-ink)]">
                {f.q}
                <span className="ml-4 text-[var(--color-brass)] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-soft)]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

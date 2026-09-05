export default function Header() {
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-baseline gap-2" onClick={scrollTo('top')}>
          <span className="font-display text-xl font-medium text-[var(--color-ink)]">
            Campus2Class
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-[var(--color-ink-soft)] md:flex">
          <a href="#how-it-works" onClick={scrollTo('how-it-works')} className="hover:text-[var(--color-ink)]">
            How it works
          </a>
          <a href="#pricing" onClick={scrollTo('pricing')} className="hover:text-[var(--color-ink)]">
            Subjects &amp; pricing
          </a>
          <a href="#tutor" onClick={scrollTo('tutor')} className="hover:text-[var(--color-ink)]">
            About your tutor
          </a>
          <a href="#faq" onClick={scrollTo('faq')} className="hover:text-[var(--color-ink)]">
            FAQ
          </a>
        </nav>

        <a
          href="#book"
          onClick={scrollTo('book')}
          className="rounded-sm bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-[var(--color-paper)] transition-colors hover:bg-[var(--color-brass-dark)]"
        >
          Book a session
        </a>
      </div>
    </header>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-ink)] text-[var(--color-paper)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div>
            <p className="font-display text-lg">Campus2Class</p>
            <p className="mt-2 max-w-xs text-sm text-white/60">
              Local honors college students tutoring Monmouth County middle
              and high schoolers in Math and English.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="text-white/50">Contact</p>
              <p className="mt-2">hello@campus2class.com</p>
            </div>
            <div>
              <p className="text-white/50">Service area</p>
              <p className="mt-2">Zoom: all of NJ</p>
              <p>In-person: Monmouth County</p>
            </div>
            <div>
              <p className="text-white/50">Subjects</p>
              <p className="mt-2">Math &amp; English</p>
              <p>Grades 6–12</p>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Campus2Class. Payments processed securely through PayPal.
        </p>
      </div>
    </footer>
  );
}

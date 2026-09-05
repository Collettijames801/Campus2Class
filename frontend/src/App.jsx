import { useEffect, useState } from 'react';
import { fetchCourses } from './lib/api';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import TutorBio from './components/TutorBio';
import Pricing from './components/Pricing';
import BookingFlow from './components/BookingFlow';
import Faq from './components/Faq';
import Footer from './components/Footer';
import TutorLogin from './components/TutorLogin';
import TutorDashboard from './components/TutorDashboard';

export default function App() {
  const tutorPath = window.location.pathname;
  const [courses, setCourses] = useState(null);
  const [selection, setSelection] = useState({
    subject: 'math',
    courseId: 'algebra-1',
    struggle: 'homework-support',
    format: 'zoom',
  });

  useEffect(() => {
    if (tutorPath === '/tutor-login' || tutorPath === '/tutor-dashboard') return;
    fetchCourses().then(setCourses).catch(() => setCourses(null));
  }, [tutorPath]);

  if (tutorPath === '/tutor-login') return <TutorLogin />;
  if (tutorPath === '/tutor-dashboard') return <TutorDashboard />;

  return (
    <div className="min-h-screen">
      <Header />
      <Hero courses={courses} selection={selection} setSelection={setSelection} />
      <HowItWorks />
      <TutorBio />
      <Pricing />

      <section id="book" className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-display text-3xl text-[var(--color-ink)] md:text-4xl">Book a session</h2>
        <p className="mt-3 max-w-lg text-[15px] text-[var(--color-ink-soft)]">
          Pick up right where the quote left off, choose a time, and pay securely.
        </p>
        <div className="mt-8">
          {courses ? (
            <BookingFlow courses={courses} selection={selection} setSelection={setSelection} />
          ) : (
            <p className="text-sm text-[var(--color-ink-soft)]">Loading booking form…</p>
          )}
        </div>
      </section>

      <Faq />
      <Footer />
    </div>
  );
}

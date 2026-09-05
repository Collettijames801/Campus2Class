import { useEffect, useState } from 'react';
import { fetchTutorAvailability, fetchTutorBookings, saveTutorAvailability } from '../lib/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EMPTY_BLOCK = { dayOfWeek: 1, startTime: '4:00 PM', endTime: '7:00 PM' };

export default function TutorDashboard() {
  const [blocks, setBlocks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [newBlock, setNewBlock] = useState(EMPTY_BLOCK);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchTutorAvailability(), fetchTutorBookings()])
      .then(([availability, upcoming]) => {
        setBlocks(availability.map((block) => ({
          dayOfWeek: block.day_of_week,
          startTime: block.start_time,
          endTime: block.end_time,
        })));
        setBookings(upcoming);
      })
      .catch((loadError) => {
        if (loadError.status === 401) window.location.href = '/tutor-login';
        else setError(loadError.message);
      });
  }, []);

  function addBlock(event) {
    event.preventDefault();
    setBlocks((current) => [...current, { ...newBlock, dayOfWeek: Number(newBlock.dayOfWeek) }]);
  }

  async function save() {
    setError('');
    setMessage('');
    try {
      await saveTutorAvailability(blocks);
      setMessage('Availability saved.');
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  function logout() {
    localStorage.removeItem('tutorToken');
    window.location.href = '/tutor-login';
  }

  return (
    <main className="min-h-screen bg-[var(--color-paper)] px-6 py-10 text-[var(--color-ink)]">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brass-dark)]">Campus2Class</p>
            <h1 className="mt-2 font-display text-3xl">Tutor dashboard</h1>
          </div>
          <button onClick={logout} className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">Sign out</button>
        </header>

        {error && <p className="mt-6 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {message && <p className="mt-6 rounded-sm bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-display text-2xl">Weekly availability</h2>
            <div className="mt-4 space-y-2">
              {blocks.length === 0 && <p className="text-sm text-[var(--color-ink-soft)]">No availability blocks yet.</p>}
              {blocks.map((block, index) => (
                <div key={`${block.dayOfWeek}-${block.startTime}-${index}`} className="flex items-center gap-2 rounded-sm border border-[var(--color-line)] bg-white p-3 text-sm">
                  <span className="min-w-24 font-medium">{DAYS[block.dayOfWeek]}</span>
                  <span>{block.startTime} - {block.endTime}</span>
                  <button onClick={() => setBlocks((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="ml-auto text-red-700" aria-label="Remove availability block">Remove</button>
                </div>
              ))}
            </div>
            <form onSubmit={addBlock} className="mt-5 rounded-sm border border-[var(--color-line)] bg-white p-4">
              <h3 className="text-sm font-semibold">Add time range</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <select className="field" value={newBlock.dayOfWeek} onChange={(event) => setNewBlock({ ...newBlock, dayOfWeek: event.target.value })}>
                  {DAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}
                </select>
                <input className="field" value={newBlock.startTime} onChange={(event) => setNewBlock({ ...newBlock, startTime: event.target.value })} placeholder="4:00 PM" required />
                <input className="field" value={newBlock.endTime} onChange={(event) => setNewBlock({ ...newBlock, endTime: event.target.value })} placeholder="7:00 PM" required />
              </div>
              <button className="mt-4 rounded-sm border border-[var(--color-ink)] px-4 py-2 text-sm font-semibold">Add range</button>
            </form>
            <button onClick={save} className="mt-4 rounded-sm bg-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold text-white">Save availability</button>
          </div>

          <div>
            <h2 className="font-display text-2xl">Upcoming bookings</h2>
            <div className="mt-4 space-y-3">
              {bookings.length === 0 && <p className="text-sm text-[var(--color-ink-soft)]">No bookings yet.</p>}
              {bookings.map((booking) => (
                <article key={booking.id} className="rounded-sm border border-[var(--color-line)] bg-white p-4 text-sm">
                  <div className="flex justify-between gap-4 font-semibold"><span>{booking.session_date} at {booking.session_time}</span><span>${booking.total_price.toFixed(2)}</span></div>
                  <p className="mt-2">{booking.student_name} - {booking.course}</p>
                  <p className="mt-1 text-[var(--color-ink-soft)]">Client: {booking.client_name} ({booking.client_email})</p>
                  <p className="mt-1 text-[var(--color-ink-soft)]">{booking.format}, {booking.session_length} hour{booking.session_length === 1 ? '' : 's'}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
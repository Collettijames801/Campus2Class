import { useEffect, useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { fetchAvailability, fetchQuote, createPaypalOrder, capturePaypalOrder } from '../lib/api';

const GRADES = ['6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SESSION_LENGTHS = [1, 1.5, 2];

const STRUGGLE_LABELS = {
  'homework-support': 'Keeping up, wants regular help',
  'catching-up': 'Falling behind, needs to catch up',
  'test-prep': 'Prepping for a specific test/exam',
  'enrichment': 'Doing fine, wants to get ahead',
};

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

export default function BookingFlow({ courses, selection, setSelection }) {
  const [step, setStep] = useState(1);
  const [quote, setQuote] = useState(null);
  const [sessionLength, setSessionLength] = useState(1);
  const [availability, setAvailability] = useState([]);
  const [chosenDate, setChosenDate] = useState('');
  const [chosenTime, setChosenTime] = useState('');
  const [contact, setContact] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    studentName: '',
    gradeLevel: GRADES[3],
    notes: '',
  });
  const [payError, setPayError] = useState(null);
  const [confirmed, setConfirmed] = useState(null);

  const subjectCourses = courses?.[selection.subject] || [];

  useEffect(() => {
    if (!selection.courseId) return;
    fetchQuote(selection).then(setQuote).catch(() => setQuote(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.subject, selection.courseId, selection.struggle, selection.format]);

  useEffect(() => {
    if (step === 2) {
      fetchAvailability().then(setAvailability).catch(() => setAvailability([]));
    }
  }, [step]);

  const total = quote ? Math.round(quote.ratePerHour * sessionLength * 100) / 100 : 0;

  const contactValid =
    contact.parentName && contact.parentEmail && contact.parentPhone && contact.studentName;

  if (confirmed) {
    return (
      <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-paper-card)] p-8 text-center">
        <p className="font-display text-2xl text-[var(--color-ink)]">You're booked!</p>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-[var(--color-ink-soft)]">
          {confirmed.studentName}'s session is confirmed for {confirmed.date} at{' '}
          {confirmed.time} ({confirmed.sessionLength} hr, {confirmed.format}). A
          confirmation has been sent to {confirmed.parentEmail}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 md:p-10">
      <StepIndicator step={step} />

      {step === 1 && (
        <div className="mt-8">
          <h3 className="font-display text-xl text-[var(--color-ink)]">What does your student need help with?</h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
            <Field label="Grade level">
              <select
                className="field"
                value={contact.gradeLevel}
                onChange={(e) => setContact((c) => ({ ...c, gradeLevel: e.target.value }))}
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g} grade
                  </option>
                ))}
              </select>
            </Field>
            <Field label="What's going on">
              <select
                className="field"
                value={selection.struggle}
                onChange={(e) => setSelection((s) => ({ ...s, struggle: e.target.value }))}
              >
                {Object.entries(STRUGGLE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
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
            <Field label="Session length">
              <select
                className="field"
                value={sessionLength}
                onChange={(e) => setSessionLength(Number(e.target.value))}
              >
                {SESSION_LENGTHS.map((h) => (
                  <option key={h} value={h}>
                    {h} hour{h !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-dashed border-[var(--color-line)] pt-6">
            <div>
              <p className="text-sm text-[var(--color-ink-soft)]">Total for this session</p>
              <p className="font-display text-3xl text-[var(--color-oxblood)]">
                {quote ? `$${total.toFixed(2)}` : '…'}
                <span className="text-sm font-sans text-[var(--color-ink-soft)]">
                  {quote ? ` ($${quote.ratePerHour}/hr)` : ''}
                </span>
              </p>
            </div>
            <NextButton onClick={() => setStep(2)} disabled={!quote}>
              Choose a time
            </NextButton>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-8">
          <h3 className="font-display text-xl text-[var(--color-ink)]">Pick a date &amp; time</h3>
          {availability.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--color-ink-soft)]">Loading open slots…</p>
          ) : (
            <div className="mt-6 space-y-5">
              {availability.map((day) => (
                <div key={day.date}>
                  <p className="text-sm font-medium text-[var(--color-ink)]">{day.label}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {day.slots.map((slot) => {
                      const active = chosenDate === day.date && chosenTime === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => {
                            setChosenDate(day.date);
                            setChosenTime(slot);
                          }}
                          className={`rounded-sm border px-3 py-1.5 text-sm transition-colors ${
                            active
                              ? 'border-[var(--color-brass)] bg-[var(--color-brass)] text-white'
                              : 'border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:border-[var(--color-brass)]'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-dashed border-[var(--color-line)] pt-6">
            <BackButton onClick={() => setStep(1)} />
            <NextButton onClick={() => setStep(3)} disabled={!chosenDate || !chosenTime}>
              Continue
            </NextButton>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8">
          <h3 className="font-display text-xl text-[var(--color-ink)]">Your contact info</h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Parent/guardian name">
              <input
                className="field"
                value={contact.parentName}
                onChange={(e) => setContact((c) => ({ ...c, parentName: e.target.value }))}
              />
            </Field>
            <Field label="Student name">
              <input
                className="field"
                value={contact.studentName}
                onChange={(e) => setContact((c) => ({ ...c, studentName: e.target.value }))}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className="field"
                value={contact.parentEmail}
                onChange={(e) => setContact((c) => ({ ...c, parentEmail: e.target.value }))}
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                className="field"
                value={contact.parentPhone}
                onChange={(e) => setContact((c) => ({ ...c, parentPhone: e.target.value }))}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Anything else worth knowing? (optional)">
                <textarea
                  className="field"
                  rows={3}
                  value={contact.notes}
                  onChange={(e) => setContact((c) => ({ ...c, notes: e.target.value }))}
                />
              </Field>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-dashed border-[var(--color-line)] pt-6">
            <BackButton onClick={() => setStep(2)} />
            <NextButton onClick={() => setStep(4)} disabled={!contactValid}>
              Review &amp; pay
            </NextButton>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-8">
          <h3 className="font-display text-xl text-[var(--color-ink)]">Review &amp; pay</h3>

          <dl className="mt-6 grid grid-cols-2 gap-y-3 rounded-md border border-[var(--color-line)] bg-[var(--color-paper)] p-5 text-sm sm:grid-cols-4">
            <SummaryItem label="Student" value={`${contact.studentName} (${contact.gradeLevel} grade)`} />
            <SummaryItem label="Course" value={quote?.course.label} />
            <SummaryItem label="Focus" value={STRUGGLE_LABELS[selection.struggle]} />
            <SummaryItem label="Format" value={selection.format === 'in-person' ? 'In-person' : 'Zoom'} />
            <SummaryItem label="When" value={`${chosenDate} at ${chosenTime}`} />
            <SummaryItem label="Length" value={`${sessionLength} hr`} />
            <SummaryItem label="Rate" value={`$${quote?.ratePerHour}/hr`} />
            <SummaryItem label="Total" value={`$${total.toFixed(2)}`} emphasize />
          </dl>

          {payError && (
            <p className="mt-4 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-700">{payError}</p>
          )}

          <div className="mt-6 max-w-sm">
            <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
              <PayPalButtons
                style={{ layout: 'vertical', color: 'black', shape: 'rect' }}
                createOrder={async () => {
                  setPayError(null);
                  try {
                    const res = await createPaypalOrder({
                      subject: selection.subject,
                      courseId: selection.courseId,
                      struggle: selection.struggle,
                      format: selection.format,
                      sessionLength,
                      date: chosenDate,
                      time: chosenTime,
                    });
                    return res.orderId;
                  } catch (e) {
                    setPayError(e.message);
                    throw e;
                  }
                }}
                onApprove={async (data) => {
                  try {
                    await capturePaypalOrder(data.orderID, {
                      ...contact,
                      subject: selection.subject,
                      courseId: selection.courseId,
                      struggle: selection.struggle,
                      format: selection.format,
                      sessionLength,
                      date: chosenDate,
                      time: chosenTime,
                    });
                    setConfirmed({ ...contact, date: chosenDate, time: chosenTime, sessionLength, format: selection.format });
                  } catch (e) {
                    setPayError(e.message);
                  }
                }}
                onError={(err) => setPayError(String(err))}
              />
            </PayPalScriptProvider>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-dashed border-[var(--color-line)] pt-6">
            <BackButton onClick={() => setStep(3)} />
            <span className="text-xs text-[var(--color-ink-soft)]">Secured by PayPal</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step }) {
  const labels = ['Survey', 'Time', 'Contact', 'Pay'];
  return (
    <div className="flex items-center gap-2 text-sm">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                active
                  ? 'bg-[var(--color-brass)] text-white'
                  : done
                  ? 'bg-[var(--color-ink)] text-white'
                  : 'bg-[var(--color-line)] text-[var(--color-ink-soft)]'
              }`}
            >
              {n}
            </span>
            <span className={active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-soft)]'}>{label}</span>
            {i < labels.length - 1 && <span className="mx-1 h-px w-6 bg-[var(--color-line)]" />}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-ink-soft)]">{label}</span>
      {children}
    </label>
  );
}

function SummaryItem({ label, value, emphasize }) {
  return (
    <div>
      <dt className="text-[var(--color-ink-soft)]">{label}</dt>
      <dd className={emphasize ? 'font-display text-lg text-[var(--color-oxblood)]' : 'font-medium text-[var(--color-ink)]'}>
        {value}
      </dd>
    </div>
  );
}

function NextButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="rounded-sm bg-[var(--color-ink)] px-6 py-2.5 text-sm font-semibold text-[var(--color-paper)] transition-colors hover:bg-[var(--color-brass-dark)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function BackButton(props) {
  return (
    <button {...props} className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
      ← Back
    </button>
  );
}

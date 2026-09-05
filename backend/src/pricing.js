// Course catalog covering a full MS/HS math + English curriculum.
// Each course has a base tier which maps to an hourly rate.
// Tiers: middle (35), standard (40), honors (45), ap (55)

const COURSES = {
  math: [
    { id: 'ms-math-6', label: '6th Grade Math', tier: 'middle' },
    { id: 'ms-math-7', label: '7th Grade Math', tier: 'middle' },
    { id: 'pre-algebra', label: 'Pre-Algebra', tier: 'middle' },
    { id: 'algebra-1', label: 'Algebra I', tier: 'standard' },
    { id: 'geometry', label: 'Geometry', tier: 'standard' },
    { id: 'algebra-2', label: 'Algebra II', tier: 'standard' },
    { id: 'algebra-2-honors', label: 'Honors Algebra II', tier: 'honors' },
    { id: 'geometry-honors', label: 'Honors Geometry', tier: 'honors' },
    { id: 'precalculus', label: 'Precalculus', tier: 'honors' },
    { id: 'trigonometry', label: 'Trigonometry', tier: 'honors' },
    { id: 'ap-calc-ab', label: 'AP Calculus AB', tier: 'ap' },
    { id: 'ap-calc-bc', label: 'AP Calculus BC', tier: 'ap' },
    { id: 'ap-statistics', label: 'AP Statistics', tier: 'ap' },
  ],
  english: [
    { id: 'ms-ela-6', label: '6th Grade English/Language Arts', tier: 'middle' },
    { id: 'ms-ela-7', label: '7th Grade English/Language Arts', tier: 'middle' },
    { id: 'ms-ela-8', label: '8th Grade English/Language Arts', tier: 'middle' },
    { id: 'english-9', label: '9th Grade English', tier: 'standard' },
    { id: 'english-10', label: '10th Grade English', tier: 'standard' },
    { id: 'english-11', label: '11th Grade English', tier: 'standard' },
    { id: 'english-12', label: '12th Grade English', tier: 'standard' },
    { id: 'essay-writing', label: 'Essay & Writing Skills', tier: 'standard' },
    { id: 'honors-english', label: 'Honors English', tier: 'honors' },
    { id: 'ap-lang', label: 'AP English Language & Composition', tier: 'ap' },
    { id: 'ap-lit', label: 'AP English Literature & Composition', tier: 'ap' },
  ],
};

const TIER_RATES = {
  middle: 35,
  standard: 40,
  honors: 45,
  ap: 55,
};

// Small adjustment based on what the student is struggling with.
// Falling behind / needs to catch up on fundamentals takes slightly more
// prep and patience; enrichment/getting-ahead sessions are the baseline.
const STRUGGLE_ADJUSTMENT = {
  'catching-up': 5,
  'test-prep': 3,
  'homework-support': 0,
  'enrichment': 0,
};

const IN_PERSON_SURCHARGE = 10; // Monmouth County travel

function findCourse(subject, courseId) {
  const list = COURSES[subject];
  if (!list) return null;
  return list.find((c) => c.id === courseId) || null;
}

function getQuote({ subject, courseId, struggle, format }) {
  const course = findCourse(subject, courseId);
  if (!course) {
    throw new Error('Unknown subject/course combination');
  }
  const base = TIER_RATES[course.tier];
  const struggleAdj = STRUGGLE_ADJUSTMENT[struggle] ?? 0;
  const formatAdj = format === 'in-person' ? IN_PERSON_SURCHARGE : 0;
  const ratePerHour = base + struggleAdj + formatAdj;

  return {
    course,
    ratePerHour,
    breakdown: {
      base,
      struggleAdj,
      formatAdj,
    },
  };
}

module.exports = { COURSES, TIER_RATES, STRUGGLE_ADJUSTMENT, IN_PERSON_SURCHARGE, getQuote, findCourse };

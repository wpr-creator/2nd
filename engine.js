// Mission Academy - Shared Engine
// Teacher unlock code: every 6th mission requires this
const TEACHER_CODE = "LAUNCH2024";
const LOCK_EVERY = 6;

// ─── Question Banks ────────────────────────────────────────────────────────

const MATH_MISSIONS = {};

// Helper functions
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── MATH Question Generators ──────────────────────────────────────────────

// Missions 1-5: addition/subtraction within 20, no regrouping
function genAddSubWithin20() {
  const qs = [];
  for (let i = 0; i < 20; i++) {
    if (Math.random() < 0.5) {
      const a = randInt(0, 10), b = randInt(0, 20 - a);
      qs.push({ q: `${a} + ${b} = ?`, answer: String(a + b), type: 'number' });
    } else {
      const b = randInt(0, 10), a = randInt(b, 20);
      qs.push({ q: `${a} − ${b} = ?`, answer: String(a - b), type: 'number' });
    }
  }
  return qs;
}

// Missions 6-10: skip counting, even/odd, word problems within 20
function genSkipCount() {
  const qs = [];
  const bys = [2, 5, 10];
  for (let i = 0; i < 8; i++) {
    const by = bys[i % 3];
    const start = randInt(0, 10) * by;
    const seq = [start, start + by, start + 2 * by, '___', start + 4 * by];
    qs.push({
      q: `Fill in the blank: ${seq.join(', ')}`,
      answer: String(start + 3 * by),
      type: 'number'
    });
  }
  for (let i = 0; i < 6; i++) {
    const n = randInt(0, 999);
    qs.push({
      q: `Is ${n} even or odd?`,
      answer: n % 2 === 0 ? 'even' : 'odd',
      type: 'choice',
      choices: ['even', 'odd']
    });
  }
  const wordProblems = [
    () => { const a = randInt(1, 10), b = randInt(1, 10 - a); return { q: `Mia had ${a} apples. She picked ${b} more. How many does she have now?`, answer: String(a + b), type: 'number' }; },
    () => { const a = randInt(5, 20), b = randInt(1, a); return { q: `There were ${a} birds on a fence. ${b} flew away. How many are left?`, answer: String(a - b), type: 'number' }; },
    () => { const a = randInt(1, 9), b = randInt(1, 9); return { q: `Sam has ${a} red crayons and ${b} blue crayons. How many crayons in all?`, answer: String(a + b), type: 'number' }; },
    () => { const a = randInt(5, 18), b = randInt(1, a - 1); return { q: `There are ${a} kids at recess. ${b} went inside. How many are still outside?`, answer: String(a - b), type: 'number' }; },
    () => { const a = randInt(2, 8), b = randInt(1, 8); return { q: `A jar has ${a} red marbles and ${b} blue marbles. How many marbles total?`, answer: String(a + b), type: 'number' }; },
    () => { const a = randInt(8, 20), b = randInt(1, a - 2); return { q: `Leo picked ${a} strawberries. He ate ${b}. How many are left?`, answer: String(a - b), type: 'number' }; },
  ];
  for (let i = 0; i < 6; i++) qs.push(wordProblems[i]());
  return shuffle(qs).slice(0, 20);
}

// Missions 11-15: place value to hundreds, add/sub within 20, word problems within 50
function genPlaceValue() {
  const qs = [];
  for (let i = 0; i < 8; i++) {
    const n = randInt(100, 999);
    const parts = [
      { q: `What is the hundreds digit of ${n}?`, answer: String(Math.floor(n / 100)) },
      { q: `What is the tens digit of ${n}?`, answer: String(Math.floor((n % 100) / 10)) },
      { q: `What is the ones digit of ${n}?`, answer: String(n % 10) },
    ];
    qs.push({ ...parts[i % 3], type: 'number' });
  }
  for (let i = 0; i < 6; i++) {
    const a = randInt(0, 10), b = randInt(0, 20 - a);
    Math.random() < 0.5
      ? qs.push({ q: `${a} + ${b} = ?`, answer: String(a + b), type: 'number' })
      : qs.push({ q: `${a + b} − ${b} = ?`, answer: String(a), type: 'number' });
  }
  const wps = [
    () => { const a = randInt(10, 30), b = randInt(1, 50 - a); return { q: `A store had ${a} toys. They got ${b} more. How many toys now?`, answer: String(a + b), type: 'number' }; },
    () => { const a = randInt(20, 50), b = randInt(1, a - 5); return { q: `${a} students are at school. ${b} go home early. How many are left?`, answer: String(a - b), type: 'number' }; },
    () => { const a = randInt(10, 25), b = randInt(5, 50 - a); return { q: `Ana read ${a} pages on Monday and ${b} pages on Tuesday. How many pages total?`, answer: String(a + b), type: 'number' }; },
    () => { const a = randInt(20, 50), b = randInt(5, a); return { q: `A bag had ${a} grapes. ${b} were eaten. How many are left?`, answer: String(a - b), type: 'number' }; },
    () => { const a = randInt(5, 20), b = randInt(5, 30); return { q: `Box A has ${a} books. Box B has ${b} books. How many books altogether?`, answer: String(a + b), type: 'number' }; },
    () => { const a = randInt(25, 50), b = randInt(5, a - 5); return { q: `There are ${a} chairs in the room. ${b} are moved out. How many remain?`, answer: String(a - b), type: 'number' }; },
  ];
  for (let i = 0; i < 6; i++) qs.push({ ...wps[i](), type: 'number' });
  return shuffle(qs).slice(0, 20);
}

// Missions 16-20: greater than, less than, equal to up to 999
function genComparison() {
  const qs = [];
  const symbols = ['>', '<', '='];
  for (let i = 0; i < 20; i++) {
    let a = randInt(1, 999), b = randInt(1, 999);
    if (i < 4) b = a; // force some equals
    const correct = a > b ? '>' : a < b ? '<' : '=';
    qs.push({
      q: `${a} ___ ${b}`,
      answer: correct,
      type: 'choice',
      choices: ['>', '<', '=']
    });
  }
  return qs;
}

// Missions 21-25: add/sub with regrouping up to 90
function genRegrouping() {
  const qs = [];
  for (let i = 0; i < 10; i++) {
    const tens = randInt(2, 7), ones = randInt(1, 9);
    const a = tens * 10 + ones;
    const b = randInt(ones + 1, 9); // forces regrouping in subtraction
    qs.push({ q: `${a} − ${b} = ?`, answer: String(a - b), type: 'number' });
  }
  for (let i = 0; i < 10; i++) {
    const a = randInt(10, 45), b = randInt(10, 90 - a);
    const aOnes = a % 10, bOnes = b % 10;
    // make sure it regroups
    const needsRegroup = aOnes + bOnes >= 10;
    const q = needsRegroup
      ? { q: `${a} + ${b} = ?`, answer: String(a + b), type: 'number' }
      : { q: `${a + b} − ${b} = ?`, answer: String(a), type: 'number' };
    qs.push(q);
  }
  return shuffle(qs).slice(0, 20);
}

// Missions 26-30: mixed review
function genMathMixedReview() {
  const pools = [genAddSubWithin20(), genSkipCount(), genPlaceValue(), genComparison(), genRegrouping()];
  const all = pools.flat();
  return shuffle(all).slice(0, 20);
}

const mathGenerators = [
  null, // 0-indexed
  genAddSubWithin20, genAddSubWithin20, genAddSubWithin20, genAddSubWithin20, genAddSubWithin20, // 1-5
  genSkipCount, genSkipCount, genSkipCount, genSkipCount, genSkipCount,                          // 6-10
  genPlaceValue, genPlaceValue, genPlaceValue, genPlaceValue, genPlaceValue,                     // 11-15
  genComparison, genComparison, genComparison, genComparison, genComparison,                     // 16-20
  genRegrouping, genRegrouping, genRegrouping, genRegrouping, genRegrouping,                     // 21-25
  genMathMixedReview, genMathMixedReview, genMathMixedReview, genMathMixedReview, genMathMixedReview // 26-30
];

const mathMissionInfo = [
  null,
  // 1-5
  "Addition & Subtraction Facts within 20", "Addition & Subtraction Facts within 20",
  "Addition & Subtraction Facts within 20", "Addition & Subtraction Facts within 20",
  "Addition & Subtraction Facts within 20",
  // 6-10
  "Skip Counting, Even & Odd, Word Problems", "Skip Counting, Even & Odd, Word Problems",
  "Skip Counting, Even & Odd, Word Problems", "Skip Counting, Even & Odd, Word Problems",
  "Skip Counting, Even & Odd, Word Problems",
  // 11-15
  "Place Value, Add & Subtract, Word Problems", "Place Value, Add & Subtract, Word Problems",
  "Place Value, Add & Subtract, Word Problems", "Place Value, Add & Subtract, Word Problems",
  "Place Value, Add & Subtract, Word Problems",
  // 16-20
  "Greater Than, Less Than, Equal To", "Greater Than, Less Than, Equal To",
  "Greater Than, Less Than, Equal To", "Greater Than, Less Than, Equal To",
  "Greater Than, Less Than, Equal To",
  // 21-25
  "Addition & Subtraction with Regrouping", "Addition & Subtraction with Regrouping",
  "Addition & Subtraction with Regrouping", "Addition & Subtraction with Regrouping",
  "Addition & Subtraction with Regrouping",
  // 26-30
  "Mixed Review", "Mixed Review", "Mixed Review", "Mixed Review", "Mixed Review"
];

// ─── ELA Question Banks ────────────────────────────────────────────────────

// Missions 1-5: nouns
function genNouns() {
  const commonNouns = ['cat', 'city', 'book', 'tree', 'school', 'pencil', 'ocean', 'mountain', 'dog', 'table', 'house', 'flower'];
  const properNouns = ['Emma', 'London', 'Monday', 'January', 'Mr. Lee', 'Amazon', 'California', 'Spot'];
  const singularPlural = [
    { singular: 'cat', plural: 'cats' }, { singular: 'box', plural: 'boxes' },
    { singular: 'baby', plural: 'babies' }, { singular: 'bus', plural: 'buses' },
    { singular: 'dish', plural: 'dishes' }, { singular: 'berry', plural: 'berries' },
    { singular: 'dog', plural: 'dogs' }, { singular: 'fox', plural: 'foxes' },
    { singular: 'city', plural: 'cities' }, { singular: 'book', plural: 'books' },
  ];
  const qs = [];
  for (let i = 0; i < 6; i++) {
    const word = shuffle([...commonNouns, ...properNouns])[0];
    const isProper = properNouns.includes(word);
    qs.push({
      q: `Is "${word}" a common noun or a proper noun?`,
      answer: isProper ? 'proper noun' : 'common noun',
      type: 'choice', choices: ['common noun', 'proper noun']
    });
  }
  for (let i = 0; i < 7; i++) {
    const pair = singularPlural[i % singularPlural.length];
    qs.push({
      q: `What is the plural of "${pair.singular}"?`,
      answer: pair.plural,
      type: 'short'
    });
  }
  const sentences = [
    { s: 'The dog ran fast.', noun: 'dog', type: 'common' },
    { s: 'Emma loves to read.', noun: 'Emma', type: 'proper' },
    { s: 'We went to Paris.', noun: 'Paris', type: 'proper' },
    { s: 'The book was heavy.', noun: 'book', type: 'common' },
    { s: 'My teacher is kind.', noun: 'teacher', type: 'common' },
    { s: 'Jake played outside.', noun: 'Jake', type: 'proper' },
    { s: 'The flower smelled sweet.', noun: 'flower', type: 'common' },
  ];
  for (let i = 0; i < 7; i++) {
    const s = sentences[i % sentences.length];
    qs.push({
      q: `In this sentence: "${s.s}" — Is "${s.noun}" a common or proper noun?`,
      answer: s.type === 'proper' ? 'proper noun' : 'common noun',
      type: 'choice', choices: ['common noun', 'proper noun']
    });
  }
  return shuffle(qs).slice(0, 20);
}

// Missions 6-11: possessive nouns, irregular plurals
function genPossessiveIrregular() {
  const qs = [];
  const possessives = [
    { noun: 'dog', possessive: "dog's" }, { noun: 'Emma', possessive: "Emma's" },
    { noun: 'teacher', possessive: "teacher's" }, { noun: 'child', possessive: "child's" },
    { noun: 'class', possessive: "class'" }, { noun: 'girl', possessive: "girl's" },
    { noun: 'James', possessive: "James'" }, { noun: 'bus', possessive: "bus'" },
  ];
  for (const p of shuffle(possessives).slice(0, 8)) {
    qs.push({ q: `Make "${p.noun}" possessive.`, answer: p.possessive, type: 'short' });
  }
  const irregulars = [
    { s: 'child', p: 'children' }, { s: 'man', p: 'men' }, { s: 'woman', p: 'women' },
    { s: 'tooth', p: 'teeth' }, { s: 'foot', p: 'feet' }, { s: 'mouse', p: 'mice' },
    { s: 'goose', p: 'geese' }, { s: 'ox', p: 'oxen' }, { s: 'sheep', p: 'sheep' },
    { s: 'deer', p: 'deer' }, { s: 'fish', p: 'fish' }, { s: 'leaf', p: 'leaves' },
  ];
  for (const ir of shuffle(irregulars).slice(0, 12)) {
    qs.push({ q: `What is the irregular plural of "${ir.s}"?`, answer: ir.p, type: 'short' });
  }
  return shuffle(qs).slice(0, 20);
}

// Missions 12-15: pronouns, reflexive pronouns, subject/predicate
function genPronouns() {
  const qs = [];
  const pronounSubs = [
    { sentence: 'Maria went to the store.', pronoun: 'She' },
    { sentence: 'The boys played soccer.', pronoun: 'They' },
    { sentence: 'My dad cooked dinner.', pronoun: 'He' },
    { sentence: 'My sister and I like movies.', pronoun: 'We' },
    { sentence: 'The cat sat on the mat.', pronoun: 'It' },
    { sentence: 'Maya and Leah are friends.', pronoun: 'They' },
    { sentence: 'Mr. Park is our teacher.', pronoun: 'He' },
    { sentence: 'My mom sings beautifully.', pronoun: 'She' },
  ];
  for (const p of shuffle(pronounSubs).slice(0, 8)) {
    qs.push({
      q: `Replace the subject with a pronoun: "${p.sentence}"`,
      answer: p.pronoun,
      type: 'choice', choices: ['He', 'She', 'They', 'We', 'It', 'I']
    });
  }
  const reflexive = [
    { subject: 'I', reflexive: 'myself' }, { subject: 'you', reflexive: 'yourself' },
    { subject: 'he', reflexive: 'himself' }, { subject: 'she', reflexive: 'herself' },
    { subject: 'we', reflexive: 'ourselves' }, { subject: 'they', reflexive: 'themselves' },
    { subject: 'it', reflexive: 'itself' },
  ];
  for (const r of shuffle(reflexive).slice(0, 6)) {
    qs.push({ q: `What is the reflexive pronoun for "${r.subject}"?`, answer: r.reflexive, type: 'short' });
  }
  const subpred = [
    { s: 'The big dog barked loudly.', subject: 'The big dog', predicate: 'barked loudly' },
    { s: 'My little sister laughed.', subject: 'My little sister', predicate: 'laughed' },
    { s: 'The yellow bus drove away.', subject: 'The yellow bus', predicate: 'drove away' },
    { s: 'Three birds flew south.', subject: 'Three birds', predicate: 'flew south' },
    { s: 'Our cat sleeps all day.', subject: 'Our cat', predicate: 'sleeps all day' },
    { s: 'The children ran fast.', subject: 'The children', predicate: 'ran fast' },
  ];
  for (const sp of shuffle(subpred).slice(0, 6)) {
    const askSubject = Math.random() < 0.5;
    qs.push({
      q: askSubject
        ? `In "${sp.s}" — what is the SUBJECT?`
        : `In "${sp.s}" — what is the PREDICATE?`,
      answer: askSubject ? sp.subject : sp.predicate,
      type: 'short'
    });
  }
  return shuffle(qs).slice(0, 20);
}

// Missions 16-20: action verbs, verb tense
function genVerbTense() {
  const qs = [];
  const tenses = [
    { base: 'jump', past: 'jumped', future: 'will jump' },
    { base: 'run', past: 'ran', future: 'will run' },
    { base: 'eat', past: 'ate', future: 'will eat' },
    { base: 'play', past: 'played', future: 'will play' },
    { base: 'write', past: 'wrote', future: 'will write' },
    { base: 'walk', past: 'walked', future: 'will walk' },
    { base: 'sing', past: 'sang', future: 'will sing' },
    { base: 'draw', past: 'drew', future: 'will draw' },
    { base: 'cook', past: 'cooked', future: 'will cook' },
    { base: 'fly', past: 'flew', future: 'will fly' },
  ];
  for (const t of shuffle(tenses).slice(0, 10)) {
    qs.push({ q: `What is the PAST tense of "${t.base}"?`, answer: t.past, type: 'short' });
    qs.push({ q: `What is the FUTURE tense of "${t.base}"?`, answer: t.future, type: 'short' });
  }
  const identifyTense = [
    { s: 'She jumped over the puddle.', tense: 'past' },
    { s: 'He will play soccer tomorrow.', tense: 'future' },
    { s: 'They eat breakfast every day.', tense: 'present' },
    { s: 'We will visit grandma soon.', tense: 'future' },
    { s: 'I walked to school this morning.', tense: 'past' },
    { s: 'The birds sing in the morning.', tense: 'present' },
  ];
  for (const it of shuffle(identifyTense).slice(0, 6)) {
    qs.push({ q: `What tense is used? "${it.s}"`, answer: it.tense, type: 'choice', choices: ['past', 'present', 'future'] });
  }
  return shuffle(qs).slice(0, 20);
}

// Missions 21-25: subject/verb agreement
function genSVAgreement() {
  const qs = [];
  const pairs = [
    { subj: 'The dog', verb1: 'barks', verb2: 'bark', correct: 'barks' },
    { subj: 'The dogs', verb1: 'barks', verb2: 'bark', correct: 'bark' },
    { subj: 'She', verb1: 'runs', verb2: 'run', correct: 'runs' },
    { subj: 'They', verb1: 'runs', verb2: 'run', correct: 'run' },
    { subj: 'He', verb1: 'plays', verb2: 'play', correct: 'plays' },
    { subj: 'We', verb1: 'plays', verb2: 'play', correct: 'play' },
    { subj: 'The cat', verb1: 'sleeps', verb2: 'sleep', correct: 'sleeps' },
    { subj: 'The cats', verb1: 'sleeps', verb2: 'sleep', correct: 'sleep' },
    { subj: 'My teacher', verb1: 'reads', verb2: 'read', correct: 'reads' },
    { subj: 'My teachers', verb1: 'reads', verb2: 'read', correct: 'read' },
    { subj: 'It', verb1: 'works', verb2: 'work', correct: 'works' },
    { subj: 'I', verb1: 'works', verb2: 'work', correct: 'work' },
    { subj: 'The bird', verb1: 'flies', verb2: 'fly', correct: 'flies' },
    { subj: 'The birds', verb1: 'flies', verb2: 'fly', correct: 'fly' },
    { subj: 'You', verb1: 'likes', verb2: 'like', correct: 'like' },
    { subj: 'She', verb1: 'likes', verb2: 'like', correct: 'likes' },
    { subj: 'The children', verb1: 'plays', verb2: 'play', correct: 'play' },
    { subj: 'A child', verb1: 'plays', verb2: 'play', correct: 'plays' },
    { subj: 'My friend', verb1: 'helps', verb2: 'help', correct: 'helps' },
    { subj: 'My friends', verb1: 'helps', verb2: 'help', correct: 'help' },
  ];
  for (const p of shuffle(pairs).slice(0, 20)) {
    qs.push({
      q: `Choose the correct verb: "${p.subj} ___ every day."`,
      answer: p.correct,
      type: 'choice', choices: [p.verb1, p.verb2]
    });
  }
  return qs;
}

// Missions 26-30: adjectives, comparative, adverbs
function genAdjectivesAdverbs() {
  const qs = [];
  const comparatives = [
    { adj: 'big', comp: 'bigger', super: 'biggest' },
    { adj: 'fast', comp: 'faster', super: 'fastest' },
    { adj: 'tall', comp: 'taller', super: 'tallest' },
    { adj: 'small', comp: 'smaller', super: 'smallest' },
    { adj: 'smart', comp: 'smarter', super: 'smartest' },
    { adj: 'cold', comp: 'colder', super: 'coldest' },
    { adj: 'hot', comp: 'hotter', super: 'hottest' },
    { adj: 'soft', comp: 'softer', super: 'softest' },
  ];
  for (const c of shuffle(comparatives).slice(0, 8)) {
    qs.push({ q: `What is the comparative form of "${c.adj}"?`, answer: c.comp, type: 'short' });
  }
  const adjOrAdv = [
    { sentence: 'She ran quickly.', word: 'quickly', type: 'adverb' },
    { sentence: 'The big bear roared.', word: 'big', type: 'adjective' },
    { sentence: 'He spoke softly.', word: 'softly', type: 'adverb' },
    { sentence: 'A tiny ant crawled.', word: 'tiny', type: 'adjective' },
    { sentence: 'They worked hard.', word: 'hard', type: 'adverb' },
    { sentence: 'The bright star shone.', word: 'bright', type: 'adjective' },
    { sentence: 'She smiled happily.', word: 'happily', type: 'adverb' },
    { sentence: 'A purple flower grew.', word: 'purple', type: 'adjective' },
    { sentence: 'The dog barked loudly.', word: 'loudly', type: 'adverb' },
    { sentence: 'He wore a warm coat.', word: 'warm', type: 'adjective' },
    { sentence: 'She danced gracefully.', word: 'gracefully', type: 'adverb' },
    { sentence: 'A hungry lion roared.', word: 'hungry', type: 'adjective' },
  ];
  for (const a of shuffle(adjOrAdv).slice(0, 12)) {
    qs.push({
      q: `In "${a.sentence}" — is "${a.word}" an adjective or adverb?`,
      answer: a.type,
      type: 'choice', choices: ['adjective', 'adverb']
    });
  }
  return shuffle(qs).slice(0, 20);
}

// Missions 31-35: sentence types
function genSentenceTypes() {
  const qs = [];
  const sentences = [
    { s: 'What time is it?', type: 'question' },
    { s: 'The sky is blue.', type: 'statement' },
    { s: 'Stop right there!', type: 'command' },
    { s: 'Wow, that is amazing!', type: 'exclamation' },
    { s: 'Please sit down.', type: 'command' },
    { s: 'I love pizza.', type: 'statement' },
    { s: 'How old are you?', type: 'question' },
    { s: 'This is so exciting!', type: 'exclamation' },
    { s: 'Where is my bag?', type: 'question' },
    { s: 'Birds fly south in winter.', type: 'statement' },
    { s: 'Line up quietly, please.', type: 'command' },
    { s: 'I can not believe it!', type: 'exclamation' },
    { s: 'Do you like dogs?', type: 'question' },
    { s: 'We go to school every day.', type: 'statement' },
    { s: 'Be careful!', type: 'command' },
    { s: 'That was the best day ever!', type: 'exclamation' },
    { s: 'Can you help me?', type: 'question' },
    { s: 'Frogs live near water.', type: 'statement' },
    { s: 'Wash your hands now.', type: 'command' },
    { s: 'I am so happy to see you!', type: 'exclamation' },
  ];
  for (const s of shuffle(sentences).slice(0, 20)) {
    qs.push({
      q: `What type of sentence is this? "${s.s}"`,
      answer: s.type,
      type: 'choice', choices: ['statement', 'question', 'command', 'exclamation']
    });
  }
  return qs;
}

// Missions 36-40: ELA review 1
function genELAReview1() {
  return shuffle([...genNouns(), ...genPossessiveIrregular(), ...genPronouns(), ...genVerbTense()]).slice(0, 20);
}

// Missions 41-45: contractions
function genContractions() {
  const qs = [];
  const contractions = [
    { full: "do not", contraction: "don't" }, { full: "can not", contraction: "can't" },
    { full: "is not", contraction: "isn't" }, { full: "I am", contraction: "I'm" },
    { full: "I will", contraction: "I'll" }, { full: "he is", contraction: "he's" },
    { full: "she is", contraction: "she's" }, { full: "they are", contraction: "they're" },
    { full: "we are", contraction: "we're" }, { full: "you are", contraction: "you're" },
    { full: "it is", contraction: "it's" }, { full: "will not", contraction: "won't" },
    { full: "did not", contraction: "didn't" }, { full: "has not", contraction: "hasn't" },
    { full: "are not", contraction: "aren't" }, { full: "I have", contraction: "I've" },
    { full: "would not", contraction: "wouldn't" }, { full: "was not", contraction: "wasn't" },
    { full: "could not", contraction: "couldn't" }, { full: "should not", contraction: "shouldn't" },
  ];
  for (const c of shuffle(contractions).slice(0, 10)) {
    qs.push({ q: `Make a contraction: "${c.full}"`, answer: c.contraction, type: 'short' });
    qs.push({ q: `Expand the contraction: "${c.contraction}"`, answer: c.full, type: 'short' });
  }
  return shuffle(qs).slice(0, 20);
}

// Missions 46-50: compound words, prefixes, suffixes
function genWordStructure() {
  const qs = [];
  const compoundWords = [
    { a: 'sun', b: 'flower', compound: 'sunflower' },
    { a: 'rain', b: 'bow', compound: 'rainbow' },
    { a: 'play', b: 'ground', compound: 'playground' },
    { a: 'fire', b: 'truck', compound: 'firetruck' },
    { a: 'book', b: 'worm', compound: 'bookworm' },
    { a: 'door', b: 'bell', compound: 'doorbell' },
    { a: 'back', b: 'pack', compound: 'backpack' },
  ];
  for (const c of shuffle(compoundWords).slice(0, 7)) {
    qs.push({ q: `Combine "${c.a}" and "${c.b}" to make a compound word.`, answer: c.compound, type: 'short' });
  }
  const prefixWords = [
    { word: 'happy', prefix: 'un', result: 'unhappy', meaning: 'not happy' },
    { word: 'do', prefix: 're', result: 'redo', meaning: 'do again' },
    { word: 'pack', prefix: 'un', result: 'unpack', meaning: 'take out' },
    { word: 'write', prefix: 're', result: 'rewrite', meaning: 'write again' },
    { word: 'kind', prefix: 'un', result: 'unkind', meaning: 'not kind' },
    { word: 'read', prefix: 're', result: 'reread', meaning: 'read again' },
  ];
  for (const p of shuffle(prefixWords).slice(0, 6)) {
    qs.push({ q: `Add the prefix "${p.prefix}-" to "${p.word}". What is the new word?`, answer: p.result, type: 'short' });
  }
  const suffixWords = [
    { word: 'teach', suffix: 'er', result: 'teacher' },
    { word: 'play', suffix: 'ful', result: 'playful' },
    { word: 'help', suffix: 'less', result: 'helpless' },
    { word: 'farm', suffix: 'er', result: 'farmer' },
    { word: 'care', suffix: 'ful', result: 'careful' },
    { word: 'hope', suffix: 'less', result: 'hopeless' },
    { word: 'joy', suffix: 'ful', result: 'joyful' },
  ];
  for (const s of shuffle(suffixWords).slice(0, 7)) {
    qs.push({ q: `Add "-${s.suffix}" to "${s.word}". What is the new word?`, answer: s.result, type: 'short' });
  }
  return shuffle(qs).slice(0, 20);
}

// Missions 51-55: synonyms, antonyms
function genSynonymsAntonyms() {
  const qs = [];
  const synonymPairs = [
    { word: 'happy', syn: 'glad' }, { word: 'big', syn: 'large' },
    { word: 'fast', syn: 'quick' }, { word: 'small', syn: 'tiny' },
    { word: 'sad', syn: 'unhappy' }, { word: 'begin', syn: 'start' },
    { word: 'cold', syn: 'chilly' }, { word: 'pretty', syn: 'beautiful' },
    { word: 'hard', syn: 'difficult' }, { word: 'shout', syn: 'yell' },
  ];
  const antonymPairs = [
    { word: 'hot', ant: 'cold' }, { word: 'up', ant: 'down' },
    { word: 'big', ant: 'small' }, { word: 'happy', ant: 'sad' },
    { word: 'fast', ant: 'slow' }, { word: 'day', ant: 'night' },
    { word: 'open', ant: 'closed' }, { word: 'loud', ant: 'quiet' },
    { word: 'hard', ant: 'soft' }, { word: 'give', ant: 'take' },
  ];
  for (const s of shuffle(synonymPairs).slice(0, 10)) {
    qs.push({ q: `What is a synonym for "${s.word}"?`, answer: s.syn, type: 'short' });
  }
  for (const a of shuffle(antonymPairs).slice(0, 10)) {
    qs.push({ q: `What is an antonym for "${a.word}"?`, answer: a.ant, type: 'short' });
  }
  return shuffle(qs).slice(0, 20);
}

// Missions 56-60: ELA mixed review
function genELAReview2() {
  return shuffle([
    ...genSentenceTypes(), ...genContractions(), ...genWordStructure(), ...genSynonymsAntonyms()
  ]).slice(0, 20);
}

const elaGenerators = [
  null,
  // 1-5: nouns
  genNouns, genNouns, genNouns, genNouns, genNouns,
  // 6-11: possessive, irregular
  genPossessiveIrregular, genPossessiveIrregular, genPossessiveIrregular,
  genPossessiveIrregular, genPossessiveIrregular, genPossessiveIrregular,
  // 12-15: pronouns, subject/predicate
  genPronouns, genPronouns, genPronouns, genPronouns,
  // 16-20: verbs, tense
  genVerbTense, genVerbTense, genVerbTense, genVerbTense, genVerbTense,
  // 21-25: subject/verb agreement
  genSVAgreement, genSVAgreement, genSVAgreement, genSVAgreement, genSVAgreement,
  // 26-30: adjectives, adverbs
  genAdjectivesAdverbs, genAdjectivesAdverbs, genAdjectivesAdverbs, genAdjectivesAdverbs, genAdjectivesAdverbs,
  // 31-35: sentence types
  genSentenceTypes, genSentenceTypes, genSentenceTypes, genSentenceTypes, genSentenceTypes,
  // 36-40: review
  genELAReview1, genELAReview1, genELAReview1, genELAReview1, genELAReview1,
  // 41-45: contractions
  genContractions, genContractions, genContractions, genContractions, genContractions,
  // 46-50: compound, prefix, suffix (note: spec says 45-50 but we use 46-50)
  genWordStructure, genWordStructure, genWordStructure, genWordStructure, genWordStructure,
  // 51-55: synonyms, antonyms
  genSynonymsAntonyms, genSynonymsAntonyms, genSynonymsAntonyms, genSynonymsAntonyms, genSynonymsAntonyms,
  // 56-60: review
  genELAReview2, genELAReview2, genELAReview2, genELAReview2, genELAReview2,
];

const elaMissionInfo = [
  null,
  "Common Nouns & Proper Nouns", "Common Nouns & Proper Nouns", "Singular & Plural Nouns",
  "Singular & Plural Nouns", "Noun Review",
  "Possessive Nouns", "Possessive Nouns", "Irregular Plural Nouns",
  "Irregular Plural Nouns", "Possessive & Irregular Nouns", "Nouns Mixed Review",
  "Pronouns", "Reflexive Pronouns", "Subject & Predicate", "Pronouns & Predicates",
  "Action Verbs", "Verb Tense (Past)", "Verb Tense (Present & Future)", "Mixed Verb Tense", "Verb Review",
  "Subject–Verb Agreement", "Subject–Verb Agreement", "Subject–Verb Agreement",
  "Subject–Verb Agreement", "S–V Agreement Review",
  "Adjectives", "Comparative Adjectives", "Adverbs", "Adjectives vs. Adverbs", "Adjectives & Adverbs Review",
  "Statements & Questions", "Exclamations & Commands", "Sentence Types", "Sentence Types", "Sentence Types Review",
  "ELA Review: Nouns, Pronouns & Verbs", "ELA Review", "ELA Review", "ELA Review", "ELA Review",
  "Contractions", "Contractions", "Contractions", "Contractions", "Contractions Review",
  "Compound Words", "Prefixes", "Suffixes", "Compound Words, Prefixes & Suffixes", "Word Structure Review",
  "Synonyms", "Antonyms", "Synonyms & Antonyms", "Synonyms & Antonyms", "Word Meaning Review",
  "ELA Mixed Review", "ELA Mixed Review", "ELA Mixed Review", "ELA Mixed Review", "ELA Final Review",
];

// ─── State ─────────────────────────────────────────────────────────────────

const STATE_KEY_MATH = 'missionAcademy_math_progress';
const STATE_KEY_ELA  = 'missionAcademy_ela_progress';

function getProgress(subject) {
  try {
    return JSON.parse(sessionStorage.getItem(subject === 'math' ? STATE_KEY_MATH : STATE_KEY_ELA) || '{}');
  } catch { return {}; }
}

function saveProgress(subject, data) {
  sessionStorage.setItem(subject === 'math' ? STATE_KEY_MATH : STATE_KEY_ELA, JSON.stringify(data));
}

function isLocked(missionNum) {
  return missionNum % LOCK_EVERY === 0;
}

function isUnlocked(missionNum, subject) {
  if (!isLocked(missionNum)) return true;
  const progress = getProgress(subject);
  return !!progress[`unlocked_${missionNum}`];
}

function unlockMission(missionNum, subject, code) {
  if (code === TEACHER_CODE) {
    const progress = getProgress(subject);
    progress[`unlocked_${missionNum}`] = true;
    saveProgress(subject, progress);
    return true;
  }
  return false;
}

function markComplete(missionNum, subject, score) {
  const progress = getProgress(subject);
  progress[`score_${missionNum}`] = score;
  progress[`best_${missionNum}`] = Math.max(score, progress[`best_${missionNum}`] || 0);
  saveProgress(subject, progress);
}

function getScore(missionNum, subject) {
  return getProgress(subject)[`score_${missionNum}`] ?? null;
}
function getBest(missionNum, subject) {
  return getProgress(subject)[`best_${missionNum}`] ?? null;
}

// Export for use in html files
if (typeof window !== 'undefined') {
  window.MissionEngine = {
    TEACHER_CODE, LOCK_EVERY,
    mathGenerators, mathMissionInfo,
    elaGenerators, elaMissionInfo,
    getProgress, saveProgress,
    isLocked, isUnlocked, unlockMission,
    markComplete, getScore, getBest,
    randInt, shuffle
  };
}

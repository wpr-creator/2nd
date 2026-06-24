// Mission Academy - Shared Engine v3
const TEACHER_CODE = "LAUNCH2024";

// ─── Audio ─────────────────────────────────────────────────────────────────
const AudioFX = (() => {
  let ctx = null;
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }
  function tone(freq, type, duration, vol = 0.18, delay = 0) {
    try {
      const c = getCtx();
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.001, c.currentTime + delay);
      g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
      o.start(c.currentTime + delay);
      o.stop(c.currentTime + delay + duration + 0.05);
    } catch(e) {}
  }
  return {
    correct()  { if(!isSoundOn()) return; tone(523,'sine',0.12,0.14); tone(659,'sine',0.18,0.14,0.08); tone(784,'sine',0.25,0.12,0.16); },
    wrong()    { if(!isSoundOn()) return; tone(220,'sawtooth',0.18,0.1); tone(180,'sawtooth',0.22,0.08,0.1); },
    streak()   { if(!isSoundOn()) return; [523,659,784,1047].forEach((f,i)=>tone(f,'sine',0.2,0.16,i*0.07)); },
    complete() { if(!isSoundOn()) return; [523,659,784,1047].forEach((f,i)=>tone(f,'sine',0.3,0.14,i*0.09)); },
    perfect()  { if(!isSoundOn()) return; [523,659,784,1047,1319].forEach((f,i)=>tone(f,'sine',0.35,0.14,i*0.08)); },
    hint()     { if(!isSoundOn()) return; tone(440,'sine',0.15,0.1); tone(554,'sine',0.2,0.1,0.12); }
  };
})();

// ─── Student Profile / Falcon Identity ─────────────────────────────────────
const FALCON_AVATARS = [
  { id:'rookie',   emoji:'🦅', name:'Rookie Falcon',   motto:'Ready for takeoff!' },
  { id:'reader',   emoji:'📚', name:'Reading Falcon',  motto:'Strong readers soar.' },
  { id:'math',     emoji:'➕', name:'Math Falcon',     motto:'Number power!' },
  { id:'explorer', emoji:'🧭', name:'Explorer Falcon', motto:'Curious and brave.' },
  { id:'captain',  emoji:'⭐', name:'Captain Falcon',  motto:'Lead the flight!' },
  { id:'sky',      emoji:'☁️', name:'Sky Falcon',      motto:'Keep climbing.' }
];

function safeStudentName(name){ return (name||'student').replace(/[^a-z0-9]/gi,'_').toLowerCase(); }
function profileKey(name){ return `missionAcademy_profile_${safeStudentName(name||getStudentName())}`; }
function getAvatarChoice(id){ return FALCON_AVATARS.find(a=>a.id===id) || FALCON_AVATARS[0]; }

function defaultProfile(name='') {
  return {
    name: (name||'').trim(),
    avatar: 'rookie',
    xp: 0,
    badges: [],
    sound: true,
    readingLevel: localStorage.getItem('missionAcademy_readingLevel') || '2'
  };
}

function getProfile(name=getStudentName()) {
  const cleanName = (name||'').trim();
  if(!cleanName) return defaultProfile('');
  try {
    const saved = JSON.parse(localStorage.getItem(profileKey(cleanName)) || '{}');
    return { ...defaultProfile(cleanName), ...saved, name: cleanName };
  } catch {
    return defaultProfile(cleanName);
  }
}

function saveProfile(profile) {
  const p = { ...defaultProfile(profile?.name), ...(profile||{}) };
  p.name = (p.name || getStudentName() || '').trim();
  if(!p.name) return p;
  localStorage.setItem(profileKey(p.name), JSON.stringify(p));
  return p;
}

function getStudentName() { return localStorage.getItem('missionAcademy_studentName') || ''; }
function setStudentName(name) {
  const clean = (name||'').trim();
  localStorage.setItem('missionAcademy_studentName', clean);
  if(clean) saveProfile(getProfile(clean));
}
function setAvatar(id) { const p=getProfile(); p.avatar=getAvatarChoice(id).id; return saveProfile(p); }
function getAvatar(id=null) { return getAvatarChoice(id || getProfile().avatar); }
function isSoundOn() { return getProfile().sound !== false; }
function setSoundOn(value) { const p=getProfile(); p.sound=!!value; return saveProfile(p); }
function toggleSound() { const p=getProfile(); p.sound = p.sound === false; return saveProfile(p).sound; }
function getReadingLevel(){ return String(getProfile().readingLevel || localStorage.getItem('missionAcademy_readingLevel') || '2'); }
function setReadingLevelPreference(level){ const p=getProfile(); p.readingLevel=String(level); localStorage.setItem('missionAcademy_readingLevel', String(level)); saveProfile(p); return p.readingLevel; }
function getRank(xp=(getProfile().xp||0)) {
  if(xp>=1000) return 'Falcon Legend';
  if(xp>=500) return 'Mountain Soarer';
  if(xp>=250) return 'Sky Explorer';
  if(xp>=100) return 'Falcon Flyer';
  return 'Nest Cadet';
}
function addXP(amount) { const p=getProfile(); p.xp=(p.xp||0)+Number(amount||0); saveProfile(p); return p.xp; }
function awardBadge(id) { const p=getProfile(); p.badges=Array.isArray(p.badges)?p.badges:[]; if(id && !p.badges.includes(id)) p.badges.push(id); saveProfile(p); return p.badges; }

// ─── Helpers ───────────────────────────────────────────────────────────────
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
// Check answer with accepted alternates
function checkAnswer(userAnswer, correct, alternates=[]) {
  const clean = s => s.trim().toLowerCase().replace(/['']/g,"'");
  const u = clean(userAnswer);
  if (u === clean(correct)) return true;
  return alternates.some(a => u === clean(a));
}

// ─── MATH Question Generators ──────────────────────────────────────────────

function genAddSubWithin20() {
  const qs = [];
  for (let i = 0; i < 24; i++) {
    if (Math.random() < 0.5) {
      const a = randInt(0,10), b = randInt(0,20-a);
      qs.push({ q:`${a} + ${b} = ?`, answer:String(a+b), type:'number', hint:`Count up from ${a}` });
    } else {
      const b = randInt(0,10), a = randInt(b,20);
      qs.push({ q:`${a} − ${b} = ?`, answer:String(a-b), type:'number', hint:`Start at ${a} and count back ${b}` });
    }
  }
  return shuffle(qs).slice(0,20);
}

function genSkipCount() {
  const qs = [];
  const bys = [2,5,10];
  for (let i = 0; i < 10; i++) {
    const by = bys[i%3];
    const start = randInt(0,10)*by;
    const seq = [start, start+by, start+2*by, '___', start+4*by];
    qs.push({ q:`Fill in the blank: ${seq.join(', ')}`, answer:String(start+3*by), type:'number', hint:`Count by ${by}s` });
  }
  for (let i = 0; i < 8; i++) {
    const n = randInt(0,999);
    qs.push({ q:`Is ${n} even or odd?`, answer:n%2===0?'even':'odd', type:'choice', choices:['even','odd'], hint:`Even numbers end in 0,2,4,6,8. Odd numbers end in 1,3,5,7,9.` });
  }
  const wps = [
    ()=>{ const a=randInt(1,10),b=randInt(1,10-a); return {q:`Mia had ${a} apples. She picked ${b} more. How many does she have now?`,answer:String(a+b),type:'number',hint:'Add the two numbers together.'}; },
    ()=>{ const a=randInt(5,20),b=randInt(1,a); return {q:`There were ${a} birds on a fence. ${b} flew away. How many are left?`,answer:String(a-b),type:'number',hint:'Subtract — take away the birds that flew.'}; },
    ()=>{ const a=randInt(1,9),b=randInt(1,9); return {q:`Sam has ${a} red crayons and ${b} blue crayons. How many crayons in all?`,answer:String(a+b),type:'number',hint:'In all means add.'}; },
    ()=>{ const a=randInt(5,18),b=randInt(1,a-1); return {q:`There are ${a} kids at recess. ${b} went inside. How many are still outside?`,answer:String(a-b),type:'number',hint:'Subtract the kids who went inside.'}; },
    ()=>{ const a=randInt(2,8),b=randInt(1,8); return {q:`A jar has ${a} red marbles and ${b} blue marbles. How many marbles total?`,answer:String(a+b),type:'number',hint:'Total means add both groups.'}; },
    ()=>{ const a=randInt(8,20),b=randInt(1,a-2); return {q:`Leo picked ${a} strawberries. He ate ${b}. How many are left?`,answer:String(a-b),type:'number',hint:'He ate some, so subtract.'}; },
    ()=>{ const a=randInt(3,9),b=randInt(1,a-1); return {q:`There are ${a} fish in a tank. ${b} are taken out. How many remain?`,answer:String(a-b),type:'number',hint:'Taken out means subtract.'}; },
  ];
  for (let i=0;i<7;i++) qs.push(wps[i%wps.length]());
  return shuffle(qs).slice(0,20);
}

function genPlaceValue() {
  const qs = [];
  for (let i=0;i<9;i++) {
    const n = randInt(100,999);
    const parts = [
      {q:`What is the hundreds digit of ${n}?`, answer:String(Math.floor(n/100)), hint:`The hundreds digit is the first digit.`},
      {q:`What is the tens digit of ${n}?`, answer:String(Math.floor((n%100)/10)), hint:`The tens digit is the middle digit.`},
      {q:`What is the ones digit of ${n}?`, answer:String(n%10), hint:`The ones digit is the last digit.`},
    ];
    qs.push({...parts[i%3], type:'number'});
  }
  // expanded place value questions
  for (let i=0;i<5;i++) {
    const h=randInt(1,9),t=randInt(0,9),o=randInt(0,9);
    const n=h*100+t*10+o;
    qs.push({q:`${h} hundreds + ${t} tens + ${o} ones = ?`, answer:String(n), type:'number', hint:`Hundreds are worth 100 each.`});
  }
  const wps=[
    ()=>{const a=randInt(10,30),b=randInt(1,50-a);return{q:`A store had ${a} toys. They got ${b} more. How many?`,answer:String(a+b),type:'number',hint:'Add to find the total.'};},
    ()=>{const a=randInt(20,50),b=randInt(1,a-5);return{q:`${a} students at school. ${b} go home early. How many left?`,answer:String(a-b),type:'number',hint:'Subtract.'};},
    ()=>{const a=randInt(10,25),b=randInt(5,50-a);return{q:`Ana read ${a} pages Monday and ${b} Tuesday. Total pages?`,answer:String(a+b),type:'number',hint:'Add both days together.'};},
    ()=>{const a=randInt(20,50),b=randInt(5,a);return{q:`A bag had ${a} grapes. ${b} were eaten. How many left?`,answer:String(a-b),type:'number',hint:'Subtract what was eaten.'};},
    ()=>{const a=randInt(5,20),b=randInt(5,30);return{q:`Box A has ${a} books. Box B has ${b} books. Total?`,answer:String(a+b),type:'number',hint:'Add both boxes.'};},
    ()=>{const a=randInt(25,50),b=randInt(5,a-5);return{q:`${a} chairs in a room. ${b} moved out. How many remain?`,answer:String(a-b),type:'number',hint:'Subtract the chairs moved out.'};},
  ];
  for(let i=0;i<6;i++) qs.push({...wps[i]()});
  return shuffle(qs).slice(0,20);
}

function genComparison() {
  const qs = [];
  for (let i=0;i<22;i++) {
    let a=randInt(1,999), b=randInt(1,999);
    if (i<5) b=a;
    const correct=a>b?'>':a<b?'<':'=';
    const hint = a>b?`${a} is greater than ${b}`:a<b?`${a} is less than ${b}`:`Both numbers are equal`;
    qs.push({q:`${a} ___ ${b}`, answer:correct, type:'choice', choices:['>','<','='], hint});
  }
  return shuffle(qs).slice(0,20);
}

function genRegrouping() {
  const qs = [];
  for (let i=0;i<12;i++) {
    const tens=randInt(2,7),ones=randInt(1,9),a=tens*10+ones,b=randInt(ones+1,9);
    qs.push({q:`${a} − ${b} = ?`, answer:String(a-b), type:'number', hint:`Regroup: borrow a ten from the tens place.`});
  }
  for (let i=0;i<12;i++) {
    const a=randInt(10,45),b=randInt(10,90-a);
    const needsRegroup=(a%10)+(b%10)>=10;
    if(needsRegroup) qs.push({q:`${a} + ${b} = ?`,answer:String(a+b),type:'number',hint:`The ones add up to more than 9, so carry a ten.`});
    else qs.push({q:`${a+b} − ${b} = ?`,answer:String(a),type:'number',hint:`Think: what plus ${b} equals ${a+b}?`});
  }
  return shuffle(qs).slice(0,20);
}

function genMathMixedReview() {
  return shuffle([...genAddSubWithin20(),...genSkipCount(),...genPlaceValue(),...genComparison(),...genRegrouping()]).slice(0,20);
}

const mathGenerators=[
  null,
  genAddSubWithin20,genAddSubWithin20,genAddSubWithin20,genAddSubWithin20,genAddSubWithin20,
  genSkipCount,genSkipCount,genSkipCount,genSkipCount,genSkipCount,
  genPlaceValue,genPlaceValue,genPlaceValue,genPlaceValue,genPlaceValue,
  genComparison,genComparison,genComparison,genComparison,genComparison,
  genRegrouping,genRegrouping,genRegrouping,genRegrouping,genRegrouping,
  genMathMixedReview,genMathMixedReview,genMathMixedReview,genMathMixedReview,genMathMixedReview
];

const mathMissionInfo=[
  null,
  "Addition & Subtraction Within 20","Addition & Subtraction Within 20","Addition & Subtraction Within 20","Addition & Subtraction Within 20","Addition & Subtraction Within 20",
  "Skip Counting, Even & Odd, Word Problems","Skip Counting, Even & Odd, Word Problems","Skip Counting, Even & Odd, Word Problems","Skip Counting, Even & Odd, Word Problems","Skip Counting, Even & Odd, Word Problems",
  "Place Value, Add & Subtract, Word Problems","Place Value, Add & Subtract, Word Problems","Place Value, Add & Subtract, Word Problems","Place Value, Add & Subtract, Word Problems","Place Value, Add & Subtract, Word Problems",
  "Greater Than, Less Than, Equal To","Greater Than, Less Than, Equal To","Greater Than, Less Than, Equal To","Greater Than, Less Than, Equal To","Greater Than, Less Than, Equal To",
  "Addition & Subtraction with Regrouping","Addition & Subtraction with Regrouping","Addition & Subtraction with Regrouping","Addition & Subtraction with Regrouping","Addition & Subtraction with Regrouping",
  "Mixed Review","Mixed Review","Mixed Review","Mixed Review","Mixed Review"
];

// ─── ELA Question Generators ───────────────────────────────────────────────

function genNouns() {
  const commonNouns=['cat','city','book','tree','school','pencil','ocean','mountain','dog','table','house','flower','bird','park','river','street','friend','teacher'];
  const properNouns=['Emma','London','Monday','January','Mr. Lee','Amazon River','California','Spot','Maya','Tuesday','March','Dr. Patel'];
  const singularPlural=[
    {singular:'cat',plural:'cats'},{singular:'box',plural:'boxes'},{singular:'baby',plural:'babies'},
    {singular:'bus',plural:'buses'},{singular:'dish',plural:'dishes'},{singular:'berry',plural:'berries'},
    {singular:'dog',plural:'dogs'},{singular:'fox',plural:'foxes'},{singular:'city',plural:'cities'},
    {singular:'book',plural:'books'},{singular:'bird',plural:'birds'},{singular:'bench',plural:'benches'},
    {singular:'puppy',plural:'puppies'},{singular:'class',plural:'classes'},{singular:'brush',plural:'brushes'},
  ];
  const qs=[];
  for(let i=0;i<7;i++){
    const word=shuffle([...commonNouns,...properNouns])[0];
    const isProper=properNouns.includes(word);
    qs.push({q:`Is "${word}" a common noun or a proper noun?`,answer:isProper?'proper noun':'common noun',type:'choice',choices:['common noun','proper noun'],hint:'Proper nouns name specific people, places, or things and start with a capital letter.'});
  }
  for(let i=0;i<7;i++){
    const pair=singularPlural[i%singularPlural.length];
    qs.push({q:`What is the plural of "${pair.singular}"?`,answer:pair.plural,type:'short',hint:`Think about how the word ends — does it need -s, -es, or a spelling change?`});
  }
  const sentences=[
    {s:'The dog ran fast.',noun:'dog',type:'common'},{s:'Emma loves to read.',noun:'Emma',type:'proper'},
    {s:'We went to Paris.',noun:'Paris',type:'proper'},{s:'The book was heavy.',noun:'book',type:'common'},
    {s:'My teacher is kind.',noun:'teacher',type:'common'},{s:'Jake played outside.',noun:'Jake',type:'proper'},
    {s:'The flower smelled sweet.',noun:'flower',type:'common'},{s:'Maya swam at the beach.',noun:'Maya',type:'proper'},
    {s:'The river was cold.',noun:'river',type:'common'},{s:'We visited California.',noun:'California',type:'proper'},
  ];
  for(let i=0;i<6;i++){
    const s=sentences[i%sentences.length];
    qs.push({q:`In: "${s.s}" — Is "${s.noun}" a common or proper noun?`,answer:s.type==='proper'?'proper noun':'common noun',type:'choice',choices:['common noun','proper noun'],hint:'Does the noun name one specific thing, or a general type of thing?'});
  }
  return shuffle(qs).slice(0,20);
}

function genPossessiveIrregular() {
  const qs=[];
  const possessives=[
    {noun:'dog',possessive:"dog's",hint:"Add 's to show ownership."},
    {noun:'Emma',possessive:"Emma's",hint:"Add 's after the name."},
    {noun:'teacher',possessive:"teacher's",hint:"Add 's to show it belongs to the teacher."},
    {noun:'child',possessive:"child's",hint:"Add 's — child is singular."},
    {noun:'class',possessive:"class'",hint:"When a noun ends in s, just add an apostrophe."},
    {noun:'girl',possessive:"girl's",hint:"Add 's to show it belongs to the girl."},
    {noun:'James',possessive:"James'",hint:"Names ending in s: just add an apostrophe."},
    {noun:'bus',possessive:"bus'",hint:"bus ends in s, so just add an apostrophe."},
    {noun:'cat',possessive:"cat's",hint:"Add 's to cat."},
    {noun:'fox',possessive:"fox's",hint:"Add 's to fox."},
  ];
  for(const p of shuffle(possessives).slice(0,8)) qs.push({q:`Make "${p.noun}" possessive.`,answer:p.possessive,type:'short',hint:p.hint});
  const irregulars=[
    {s:'child',p:'children',hint:'This one is irregular — it does not just add -s.'},{s:'man',p:'men',hint:'The vowel changes: man → men.'},
    {s:'woman',p:'women',hint:'The vowel changes: woman → women.'},{s:'tooth',p:'teeth',hint:'The vowel changes: tooth → teeth.'},
    {s:'foot',p:'feet',hint:'The vowel changes: foot → feet.'},{s:'mouse',p:'mice',hint:'Irregular: mouse → mice.'},
    {s:'goose',p:'geese',hint:'Irregular: goose → geese.'},{s:'ox',p:'oxen',hint:'Irregular: ox → oxen.'},
    {s:'sheep',p:'sheep',hint:'Sheep stays the same for singular and plural.'},{s:'deer',p:'deer',hint:'Deer stays the same for singular and plural.'},
    {s:'fish',p:'fish',hint:'Fish can stay the same in plural.'},{s:'leaf',p:'leaves',hint:'Change the f to v and add -es.'},
    {s:'wolf',p:'wolves',hint:'Change the f to v and add -es.'},{s:'knife',p:'knives',hint:'Change the f to v and add -es.'},
  ];
  for(const ir of shuffle(irregulars).slice(0,12)) qs.push({q:`What is the irregular plural of "${ir.s}"?`,answer:ir.p,type:'short',hint:ir.hint});
  return shuffle(qs).slice(0,20);
}

function genPronouns() {
  const qs=[];
  const pronounSubs=[
    {sentence:'Maria went to the store.',pronoun:'She',hint:'Maria is one girl → She'},
    {sentence:'The boys played soccer.',pronoun:'They',hint:'More than one person → They'},
    {sentence:'My dad cooked dinner.',pronoun:'He',hint:'Dad is a man → He'},
    {sentence:'My sister and I like movies.',pronoun:'We',hint:'Two people including yourself → We'},
    {sentence:'The cat sat on the mat.',pronoun:'It',hint:'A thing or animal → It'},
    {sentence:'Maya and Leah are friends.',pronoun:'They',hint:'Two people → They'},
    {sentence:'Mr. Park is our teacher.',pronoun:'He',hint:'Mr. Park is a man → He'},
    {sentence:'My mom sings beautifully.',pronoun:'She',hint:'Mom is a woman → She'},
    {sentence:'The dog chased its tail.',pronoun:'It',hint:'An animal → It'},
    {sentence:'Tom and I went hiking.',pronoun:'We',hint:'Two people including yourself → We'},
  ];
  for(const p of shuffle(pronounSubs).slice(0,8)) qs.push({q:`Replace the subject with a pronoun: "${p.sentence}"`,answer:p.pronoun,type:'choice',choices:['He','She','They','We','It','I'],hint:p.hint});
  const reflexive=[
    {subject:'I',reflexive:'myself',hint:'I → myself'},{subject:'you',reflexive:'yourself',hint:'you → yourself'},
    {subject:'he',reflexive:'himself',hint:'he → himself'},{subject:'she',reflexive:'herself',hint:'she → herself'},
    {subject:'we',reflexive:'ourselves',hint:'we → ourselves'},{subject:'they',reflexive:'themselves',hint:'they → themselves'},
    {subject:'it',reflexive:'itself',hint:'it → itself'},
  ];
  for(const r of shuffle(reflexive).slice(0,6)) qs.push({q:`What is the reflexive pronoun for "${r.subject}"?`,answer:r.reflexive,type:'short',hint:r.hint});
  const subpred=[
    {s:'The big dog barked loudly.',subject:'The big dog',predicate:'barked loudly'},
    {s:'My little sister laughed.',subject:'My little sister',predicate:'laughed'},
    {s:'The yellow bus drove away.',subject:'The yellow bus',predicate:'drove away'},
    {s:'Three birds flew south.',subject:'Three birds',predicate:'flew south'},
    {s:'Our cat sleeps all day.',subject:'Our cat',predicate:'sleeps all day'},
    {s:'The children ran fast.',subject:'The children',predicate:'ran fast'},
    {s:'A red kite flew high.',subject:'A red kite',predicate:'flew high'},
    {s:'The little puppy whimpered.',subject:'The little puppy',predicate:'whimpered'},
  ];
  for(const sp of shuffle(subpred).slice(0,6)){
    const askS=Math.random()<0.5;
    qs.push({q:askS?`In "${sp.s}" — what is the SUBJECT?`:`In "${sp.s}" — what is the PREDICATE?`,answer:askS?sp.subject:sp.predicate,type:'short',hint:askS?'The subject is WHO or WHAT the sentence is about.':'The predicate tells WHAT the subject does or is.'});
  }
  return shuffle(qs).slice(0,20);
}

function genVerbTense() {
  const qs=[];
  const tenses=[
    {base:'jump',past:'jumped',future:'will jump'},{base:'run',past:'ran',future:'will run'},
    {base:'eat',past:'ate',future:'will eat'},{base:'play',past:'played',future:'will play'},
    {base:'write',past:'wrote',future:'will write'},{base:'walk',past:'walked',future:'will walk'},
    {base:'sing',past:'sang',future:'will sing'},{base:'draw',past:'drew',future:'will draw'},
    {base:'cook',past:'cooked',future:'will cook'},{base:'fly',past:'flew',future:'will fly'},
    {base:'swim',past:'swam',future:'will swim'},{base:'ride',past:'rode',future:'will ride'},
    {base:'help',past:'helped',future:'will help'},{base:'talk',past:'talked',future:'will talk'},
  ];
  for(const t of shuffle(tenses).slice(0,10)){
    qs.push({q:`What is the PAST tense of "${t.base}"?`,answer:t.past,type:'short',hint:`Past tense tells what already happened.`});
    qs.push({q:`What is the FUTURE tense of "${t.base}"?`,answer:t.future,type:'short',hint:`Future tense uses "will" before the verb.`});
  }
  const identifyTense=[
    {s:'She jumped over the puddle.',tense:'past'},{s:'He will play soccer tomorrow.',tense:'future'},
    {s:'They eat breakfast every day.',tense:'present'},{s:'We will visit grandma soon.',tense:'future'},
    {s:'I walked to school this morning.',tense:'past'},{s:'The birds sing in the morning.',tense:'present'},
    {s:'Mom cooked a big dinner.',tense:'past'},{s:'We will go to the park later.',tense:'future'},
    {s:'The dog runs in the yard.',tense:'present'},{s:'He drew a picture yesterday.',tense:'past'},
  ];
  for(const it of shuffle(identifyTense).slice(0,6)) qs.push({q:`What tense is used? "${it.s}"`,answer:it.tense,type:'choice',choices:['past','present','future'],hint:'Past = already happened. Present = happening now. Future = will happen.'});
  return shuffle(qs).slice(0,20);
}

function genSVAgreement() {
  const pairs=[
    {subj:'The dog',verb1:'barks',verb2:'bark',correct:'barks',hint:'Singular subject → verb ends in -s'},
    {subj:'The dogs',verb1:'barks',verb2:'bark',correct:'bark',hint:'Plural subject → verb does NOT end in -s'},
    {subj:'She',verb1:'runs',verb2:'run',correct:'runs',hint:'She is singular → runs'},
    {subj:'They',verb1:'runs',verb2:'run',correct:'run',hint:'They is plural → run'},
    {subj:'He',verb1:'plays',verb2:'play',correct:'plays',hint:'He is singular → plays'},
    {subj:'We',verb1:'plays',verb2:'play',correct:'play',hint:'We is plural → play'},
    {subj:'The cat',verb1:'sleeps',verb2:'sleep',correct:'sleeps',hint:'Singular → sleeps'},
    {subj:'The cats',verb1:'sleeps',verb2:'sleep',correct:'sleep',hint:'Plural → sleep'},
    {subj:'My teacher',verb1:'reads',verb2:'read',correct:'reads',hint:'Singular → reads'},
    {subj:'My teachers',verb1:'reads',verb2:'read',correct:'read',hint:'Plural → read'},
    {subj:'It',verb1:'works',verb2:'work',correct:'works',hint:'It is singular → works'},
    {subj:'I',verb1:'works',verb2:'work',correct:'work',hint:'I → work (no -s)'},
    {subj:'The bird',verb1:'flies',verb2:'fly',correct:'flies',hint:'Singular → flies'},
    {subj:'The birds',verb1:'flies',verb2:'fly',correct:'fly',hint:'Plural → fly'},
    {subj:'You',verb1:'likes',verb2:'like',correct:'like',hint:'You → like (no -s)'},
    {subj:'She',verb1:'likes',verb2:'like',correct:'likes',hint:'She is singular → likes'},
    {subj:'The children',verb1:'plays',verb2:'play',correct:'play',hint:'Children is plural → play'},
    {subj:'A child',verb1:'plays',verb2:'play',correct:'plays',hint:'Singular → plays'},
    {subj:'My friend',verb1:'helps',verb2:'help',correct:'helps',hint:'Singular → helps'},
    {subj:'My friends',verb1:'helps',verb2:'help',correct:'help',hint:'Plural → help'},
  ];
  return shuffle(pairs).slice(0,20).map(p=>({q:`Choose the correct verb: "${p.subj} ___ every day."`,answer:p.correct,type:'choice',choices:[p.verb1,p.verb2],hint:p.hint}));
}

function genAdjectivesAdverbs() {
  const qs=[];
  const comparatives=[
    {adj:'big',comp:'bigger',hint:'Add -er. Double the g.'},
    {adj:'fast',comp:'faster',hint:'Add -er to fast.'},
    {adj:'tall',comp:'taller',hint:'Add -er to tall.'},
    {adj:'small',comp:'smaller',hint:'Add -er to small.'},
    {adj:'smart',comp:'smarter',hint:'Add -er to smart.'},
    {adj:'cold',comp:'colder',hint:'Add -er to cold.'},
    {adj:'hot',comp:'hotter',hint:'Add -er. Double the t.'},
    {adj:'soft',comp:'softer',hint:'Add -er to soft.'},
    {adj:'bright',comp:'brighter',hint:'Add -er to bright.'},
    {adj:'dark',comp:'darker',hint:'Add -er to dark.'},
  ];
  for(const c of shuffle(comparatives).slice(0,8)) qs.push({q:`What is the comparative form of "${c.adj}"?`,answer:c.comp,type:'short',hint:c.hint});
  const adjOrAdv=[
    {sentence:'She ran quickly.',word:'quickly',type:'adverb',hint:'Quickly describes HOW she ran → adverb'},
    {sentence:'The big bear roared.',word:'big',type:'adjective',hint:'Big describes the bear (a noun) → adjective'},
    {sentence:'He spoke softly.',word:'softly',type:'adverb',hint:'Softly describes HOW he spoke → adverb'},
    {sentence:'A tiny ant crawled.',word:'tiny',type:'adjective',hint:'Tiny describes the ant (a noun) → adjective'},
    {sentence:'They worked hard.',word:'hard',type:'adverb',hint:'Hard describes HOW they worked → adverb'},
    {sentence:'The bright star shone.',word:'bright',type:'adjective',hint:'Bright describes the star (a noun) → adjective'},
    {sentence:'She smiled happily.',word:'happily',type:'adverb',hint:'Happily describes HOW she smiled → adverb'},
    {sentence:'A purple flower grew.',word:'purple',type:'adjective',hint:'Purple describes the flower (a noun) → adjective'},
    {sentence:'The dog barked loudly.',word:'loudly',type:'adverb',hint:'Loudly describes HOW the dog barked → adverb'},
    {sentence:'He wore a warm coat.',word:'warm',type:'adjective',hint:'Warm describes the coat (a noun) → adjective'},
    {sentence:'She danced gracefully.',word:'gracefully',type:'adverb',hint:'Gracefully describes HOW she danced → adverb'},
    {sentence:'A hungry lion roared.',word:'hungry',type:'adjective',hint:'Hungry describes the lion (a noun) → adjective'},
  ];
  for(const a of shuffle(adjOrAdv).slice(0,12)) qs.push({q:`In "${a.sentence}" — is "${a.word}" an adjective or adverb?`,answer:a.type,type:'choice',choices:['adjective','adverb'],hint:a.hint});
  return shuffle(qs).slice(0,20);
}

function genSentenceTypes() {
  const sentences=[
    {s:'What time is it?',type:'question',hint:'It asks something and ends with ?'},
    {s:'The sky is blue.',type:'statement',hint:'It states a fact and ends with .'},
    {s:'Stop right there!',type:'command',hint:'It gives an order.'},
    {s:'Wow, that is amazing!',type:'exclamation',hint:'It shows strong feeling and ends with !'},
    {s:'Please sit down.',type:'command',hint:'It gives a direction or order.'},
    {s:'I love pizza.',type:'statement',hint:'It states a fact.'},
    {s:'How old are you?',type:'question',hint:'It asks something and ends with ?'},
    {s:'This is so exciting!',type:'exclamation',hint:'It shows strong feeling.'},
    {s:'Where is my bag?',type:'question',hint:'It asks a question.'},
    {s:'Birds fly south in winter.',type:'statement',hint:'It states a fact.'},
    {s:'Line up quietly, please.',type:'command',hint:'It tells someone what to do.'},
    {s:'I can not believe it!',type:'exclamation',hint:'It shows strong feeling.'},
    {s:'Do you like dogs?',type:'question',hint:'It asks something.'},
    {s:'We go to school every day.',type:'statement',hint:'It states a fact.'},
    {s:'Be careful!',type:'command',hint:'It gives a warning or order.'},
    {s:'That was the best day ever!',type:'exclamation',hint:'It shows strong feeling.'},
    {s:'Can you help me?',type:'question',hint:'It asks for help.'},
    {s:'Frogs live near water.',type:'statement',hint:'It states a fact.'},
    {s:'Wash your hands now.',type:'command',hint:'It tells you what to do.'},
    {s:'I am so happy to see you!',type:'exclamation',hint:'It shows strong feeling.'},
    {s:'When does the bus arrive?',type:'question',hint:'It asks something.'},
    {s:'Cats sleep a lot.',type:'statement',hint:'It states a fact.'},
  ];
  return shuffle(sentences).slice(0,20).map(s=>({q:`What type of sentence is this? "${s.s}"`,answer:s.type,type:'choice',choices:['statement','question','command','exclamation'],hint:s.hint}));
}

function genELAReview1() {
  return shuffle([...genNouns(),...genPossessiveIrregular(),...genPronouns(),...genVerbTense()]).slice(0,20);
}

function genContractions() {
  const contractions=[
    {full:"do not",contraction:"don't",hint:"do not → don't (the o in not is replaced by ')"},
    {full:"can not",contraction:"can't",hint:"can not → can't"},
    {full:"is not",contraction:"isn't",hint:"is not → isn't"},
    {full:"I am",contraction:"I'm",hint:"I am → I'm (the a is replaced by ')"},
    {full:"I will",contraction:"I'll",hint:"I will → I'll"},
    {full:"he is",contraction:"he's",hint:"he is → he's"},
    {full:"she is",contraction:"she's",hint:"she is → she's"},
    {full:"they are",contraction:"they're",hint:"they are → they're"},
    {full:"we are",contraction:"we're",hint:"we are → we're"},
    {full:"you are",contraction:"you're",hint:"you are → you're"},
    {full:"it is",contraction:"it's",hint:"it is → it's"},
    {full:"will not",contraction:"won't",hint:"will not → won't (irregular spelling)"},
    {full:"did not",contraction:"didn't",hint:"did not → didn't"},
    {full:"has not",contraction:"hasn't",hint:"has not → hasn't"},
    {full:"are not",contraction:"aren't",hint:"are not → aren't"},
    {full:"I have",contraction:"I've",hint:"I have → I've"},
    {full:"would not",contraction:"wouldn't",hint:"would not → wouldn't"},
    {full:"was not",contraction:"wasn't",hint:"was not → wasn't"},
    {full:"could not",contraction:"couldn't",hint:"could not → couldn't"},
    {full:"should not",contraction:"shouldn't",hint:"should not → shouldn't"},
  ];
  const qs=[];
  for(const c of shuffle(contractions).slice(0,10)){
    qs.push({q:`Make a contraction: "${c.full}"`,answer:c.contraction,type:'short',hint:c.hint});
    qs.push({q:`Expand the contraction: "${c.contraction}"`,answer:c.full,type:'short',hint:`The apostrophe takes the place of the missing letters.`});
  }
  return shuffle(qs).slice(0,20);
}

function genWordStructure() {
  const qs=[];
  const compoundWords=[
    {a:'sun',b:'flower',compound:'sunflower',hint:'Put sun and flower together.'},
    {a:'rain',b:'bow',compound:'rainbow',hint:'Put rain and bow together.'},
    {a:'play',b:'ground',compound:'playground',hint:'Put play and ground together.'},
    {a:'fire',b:'truck',compound:'firetruck',hint:'Put fire and truck together.'},
    {a:'book',b:'worm',compound:'bookworm',hint:'Put book and worm together.'},
    {a:'door',b:'bell',compound:'doorbell',hint:'Put door and bell together.'},
    {a:'back',b:'pack',compound:'backpack',hint:'Put back and pack together.'},
    {a:'snow',b:'flake',compound:'snowflake',hint:'Put snow and flake together.'},
    {a:'sea',b:'shell',compound:'seashell',hint:'Put sea and shell together.'},
  ];
  for(const c of shuffle(compoundWords).slice(0,7)) qs.push({q:`Combine "${c.a}" and "${c.b}" to make a compound word.`,answer:c.compound,type:'short',hint:c.hint});
  const prefixWords=[
    {word:'happy',prefix:'un',result:'unhappy',hint:'un- means "not"'},
    {word:'do',prefix:'re',result:'redo',hint:'re- means "again"'},
    {word:'pack',prefix:'un',result:'unpack',hint:'un- means "not" or "reverse"'},
    {word:'write',prefix:'re',result:'rewrite',hint:'re- means "again"'},
    {word:'kind',prefix:'un',result:'unkind',hint:'un- means "not"'},
    {word:'read',prefix:'re',result:'reread',hint:'re- means "again"'},
    {word:'lock',prefix:'un',result:'unlock',hint:'un- reverses the action'},
    {word:'build',prefix:'re',result:'rebuild',hint:'re- means "again"'},
  ];
  for(const p of shuffle(prefixWords).slice(0,6)) qs.push({q:`Add the prefix "${p.prefix}-" to "${p.word}". What is the new word?`,answer:p.result,type:'short',hint:p.hint});
  const suffixWords=[
    {word:'teach',suffix:'er',result:'teacher',hint:'-er means "one who"'},
    {word:'play',suffix:'ful',result:'playful',hint:'-ful means "full of"'},
    {word:'help',suffix:'less',result:'helpless',hint:'-less means "without"'},
    {word:'farm',suffix:'er',result:'farmer',hint:'-er means "one who"'},
    {word:'care',suffix:'ful',result:'careful',hint:'-ful means "full of"'},
    {word:'hope',suffix:'less',result:'hopeless',hint:'-less means "without"'},
    {word:'joy',suffix:'ful',result:'joyful',hint:'-ful means "full of"'},
    {word:'paint',suffix:'er',result:'painter',hint:'-er means "one who"'},
  ];
  for(const s of shuffle(suffixWords).slice(0,7)) qs.push({q:`Add "-${s.suffix}" to "${s.word}". What is the new word?`,answer:s.result,type:'short',hint:s.hint});
  return shuffle(qs).slice(0,20);
}

// Synonyms with MULTIPLE accepted answers
function genSynonymsAntonyms() {
  const qs=[];
  const synonymPairs=[
    {word:'happy',   primary:'glad',    alternates:['joyful','cheerful','pleased','content'],hint:'Think of another word that means happy.'},
    {word:'big',     primary:'large',   alternates:['huge','giant','great'],hint:'Think of another word that means big.'},
    {word:'fast',    primary:'quick',   alternates:['speedy','rapid','swift'],hint:'Think of another word that means fast.'},
    {word:'small',   primary:'tiny',    alternates:['little','mini','petite'],hint:'Think of another word that means small.'},
    {word:'sad',     primary:'unhappy', alternates:['upset','gloomy','miserable','sorrowful'],hint:'Think of another word that means sad.'},
    {word:'begin',   primary:'start',   alternates:['commence','launch'],hint:'Think of another word that means begin.'},
    {word:'cold',    primary:'chilly',  alternates:['freezing','cool','icy','frosty'],hint:'Think of another word that means cold.'},
    {word:'pretty',  primary:'beautiful',alternates:['lovely','gorgeous','attractive'],hint:'Think of another word that means pretty.'},
    {word:'hard',    primary:'difficult',alternates:['tough','tricky','challenging'],hint:'Think of another word that means hard (not easy).'},
    {word:'shout',   primary:'yell',    alternates:['holler','scream','call'],hint:'Think of another word that means shout.'},
    {word:'scared',  primary:'afraid',  alternates:['frightened','terrified','fearful'],hint:'Think of another word that means scared.'},
    {word:'smart',   primary:'clever',  alternates:['bright','intelligent','wise'],hint:'Think of another word that means smart.'},
  ];
  const antonymPairs=[
    {word:'hot',   primary:'cold',   alternates:['cool','chilly','freezing'],hint:'Think of the opposite of hot.'},
    {word:'up',    primary:'down',   alternates:[],hint:'Think of the opposite of up.'},
    {word:'big',   primary:'small',  alternates:['little','tiny'],hint:'Think of the opposite of big.'},
    {word:'happy', primary:'sad',    alternates:['unhappy','upset'],hint:'Think of the opposite of happy.'},
    {word:'fast',  primary:'slow',   alternates:[],hint:'Think of the opposite of fast.'},
    {word:'day',   primary:'night',  alternates:[],hint:'Think of the opposite of day.'},
    {word:'open',  primary:'closed', alternates:['shut'],hint:'Think of the opposite of open.'},
    {word:'loud',  primary:'quiet',  alternates:['soft','silent'],hint:'Think of the opposite of loud.'},
    {word:'hard',  primary:'soft',   alternates:['easy'],hint:'Think of the opposite of hard.'},
    {word:'give',  primary:'take',   alternates:['receive'],hint:'Think of the opposite of give.'},
    {word:'light', primary:'dark',   alternates:[],hint:'Think of the opposite of light.'},
    {word:'clean', primary:'dirty',  alternates:['messy'],hint:'Think of the opposite of clean.'},
  ];
  for(const s of shuffle(synonymPairs).slice(0,10)) qs.push({q:`What is a synonym for "${s.word}"?`,answer:s.primary,alternates:s.alternates,type:'short',hint:s.hint});
  for(const a of shuffle(antonymPairs).slice(0,10)) qs.push({q:`What is an antonym for "${a.word}"?`,answer:a.primary,alternates:a.alternates,type:'short',hint:a.hint});
  return shuffle(qs).slice(0,20);
}

function genELAReview2() {
  return shuffle([...genSentenceTypes(),...genContractions(),...genWordStructure(),...genSynonymsAntonyms()]).slice(0,20);
}



// ─── ELA Mission Variety Layer ─────────────────────────────────────────────
// These wrappers keep the same standards/topics, but add mission-specific pools
// so missions in the same category do not feel like the exact same quiz.
function qChoice(q, answer, choices, hint){ return {q, answer, type:'choice', choices, hint}; }
function qShort(q, answer, hint, alternates=[]){ return {q, answer, alternates, type:'short', hint}; }
function varied(baseFn, extras){ return shuffle([...(baseFn ? baseFn() : []), ...(extras || [])]).slice(0,20); }

const NOUN_COMMON_PROPER_EXTRA_A = [
  qChoice('Is "library" a common noun or a proper noun?','common noun',['common noun','proper noun'],'Library is a general place, not a specific name.'),
  qChoice('Is "San Diego" a common noun or a proper noun?','proper noun',['common noun','proper noun'],'San Diego names one specific city.'),
  qChoice('Is "school" a common noun or a proper noun?','common noun',['common noun','proper noun'],'School is a general place.'),
  qChoice('Is "Falcon Academy" a common noun or a proper noun?','proper noun',['common noun','proper noun'],'Falcon Academy names one specific school.'),
  qChoice('In "The class visited Balboa Park," what kind of noun is "Balboa Park"?','proper noun',['common noun','proper noun'],'It names one specific place.'),
  qChoice('In "My cousin rides the bus," what kind of noun is "cousin"?','common noun',['common noun','proper noun'],'Cousin is a general person.'),
  qChoice('Choose the proper noun.','Wednesday',['teacher','Wednesday','playground','pencil'],'Days of the week are proper nouns.'),
  qChoice('Choose the common noun.','river',['Colorado River','Maya','river','December'],'River is a general thing.'),
];
const NOUN_COMMON_PROPER_EXTRA_B = [
  qChoice('Is "doctor" a common noun or a proper noun?','common noun',['common noun','proper noun'],'Doctor is a general person.'),
  qChoice('Is "Dr. Ramos" a common noun or a proper noun?','proper noun',['common noun','proper noun'],'Dr. Ramos names one specific person.'),
  qChoice('Is "restaurant" a common noun or a proper noun?','common noun',['common noun','proper noun'],'Restaurant is a general place.'),
  qChoice('Is "In-N-Out" a common noun or a proper noun?','proper noun',['common noun','proper noun'],'It is the name of a specific place.'),
  qChoice('Choose the proper noun.','January',['month','January','calendar','holiday'],'Months are proper nouns.'),
  qChoice('Choose the common noun.','dog',['Spot','California','dog','Monday'],'Dog is a general animal.'),
  qChoice('In "Ava packed her lunch," what kind of noun is "Ava"?','proper noun',['common noun','proper noun'],'Ava names a specific person.'),
  qChoice('In "The team won the game," what kind of noun is "team"?','common noun',['common noun','proper noun'],'Team is a general group.'),
];
const PLURAL_EXTRA_A = [
  qShort('What is the plural of "wish"?','wishes','Words ending in sh usually add -es.'),
  qShort('What is the plural of "lunch"?','lunches','Words ending in ch usually add -es.'),
  qShort('What is the plural of "toy"?','toys','For vowel + y, just add -s.'),
  qShort('What is the plural of "key"?','keys','For vowel + y, just add -s.'),
  qShort('What is the plural of "story"?','stories','Change y to i and add -es.'),
  qShort('What is the plural of "party"?','parties','Change y to i and add -es.'),
  qChoice('Which word is plural?','benches',['bench','benches','class','fox'],'Benches means more than one bench.'),
  qChoice('Which word is singular?','baby',['babies','classes','baby','buses'],'Baby means one.'),
];
const PLURAL_EXTRA_B = [
  qShort('What is the plural of "church"?','churches','Words ending in ch usually add -es.'),
  qShort('What is the plural of "match"?','matches','Words ending in ch usually add -es.'),
  qShort('What is the plural of "tray"?','trays','For vowel + y, just add -s.'),
  qShort('What is the plural of "penny"?','pennies','Change y to i and add -es.'),
  qShort('What is the plural of "family"?','families','Change y to i and add -es.'),
  qShort('What is the plural of "tomato"?','tomatoes','Some words ending in o add -es.'),
  qChoice('Choose the correct plural: one box, two ___.','boxes',['boxs','boxies','boxes','box'],'Box ends in x, so add -es.'),
  qChoice('Choose the correct plural: one puppy, three ___.','puppies',['puppys','puppies','puppy','puppyes'],'Change y to i and add -es.'),
];
function genNounsMission1(){ return varied(null, [...NOUN_COMMON_PROPER_EXTRA_A, ...NOUN_COMMON_PROPER_EXTRA_B, ...shuffle(genNouns()).slice(0,8)]); }
function genNounsMission2(){ return varied(null, [...NOUN_COMMON_PROPER_EXTRA_B, ...NOUN_COMMON_PROPER_EXTRA_A, ...shuffle(genNouns()).slice(0,8)]); }
function genNounsMission3(){ return varied(null, [...PLURAL_EXTRA_A, ...shuffle(genNouns()).slice(0,10)]); }
function genNounsMission4(){ return varied(null, [...PLURAL_EXTRA_B, ...shuffle(genNouns()).slice(0,10)]); }
function genNounsMission5(){ return varied(null, [...NOUN_COMMON_PROPER_EXTRA_A.slice(0,4), ...NOUN_COMMON_PROPER_EXTRA_B.slice(0,4), ...PLURAL_EXTRA_A.slice(0,4), ...PLURAL_EXTRA_B.slice(0,4), ...shuffle(genNouns()).slice(0,8)]); }

const POSSESSIVE_EXTRA = [
  qShort('Make "bird" possessive.','bird\'s','Add apostrophe s to show ownership.'),
  qShort('Make "mom" possessive.','mom\'s','Add apostrophe s.'),
  qShort('Make "students" possessive.','students\'','Plural nouns ending in s usually add only an apostrophe.'),
  qShort('Make "teachers" possessive.','teachers\'','Plural nouns ending in s usually add only an apostrophe.'),
  qChoice('Choose the possessive noun: The ___ backpack is blue.','girl\'s',['girls','girl\'s','girl','girlses'],'The backpack belongs to the girl.'),
  qChoice('Choose the possessive noun: The ___ desks are clean.','students\'',['student','students','students\'','studentes'],'The desks belong to many students.'),
];
const IRREGULAR_EXTRA = [
  qShort('What is the irregular plural of "person"?','people','Person changes to people.'),
  qShort('What is the irregular plural of "child"?','children','Child changes to children.'),
  qShort('What is the irregular plural of "mouse"?','mice','Mouse changes to mice.'),
  qShort('What is the irregular plural of "tooth"?','teeth','Tooth changes to teeth.'),
  qShort('What is the irregular plural of "foot"?','feet','Foot changes to feet.'),
  qChoice('Choose the correct plural: one goose, two ___.','geese',['gooses','geese','goose','goosies'],'Goose changes to geese.'),
];
function genPossessiveA(){ return varied(genPossessiveIrregular, POSSESSIVE_EXTRA); }
function genPossessiveB(){ return varied(null, [...POSSESSIVE_EXTRA, ...shuffle(genPossessiveIrregular()).filter(x=>/possessive|belongs|ownership|apostrophe|Make/.test(x.q+x.hint)).slice(0,14)]); }
function genIrregularA(){ return varied(null, [...IRREGULAR_EXTRA, ...shuffle(genPossessiveIrregular()).filter(x=>/irregular plural|plural/.test(x.q+x.hint)).slice(0,14)]); }
function genIrregularB(){ return varied(genPossessiveIrregular, IRREGULAR_EXTRA); }
function genPossessiveIrregularReview(){ return varied(null, [...POSSESSIVE_EXTRA, ...IRREGULAR_EXTRA, ...shuffle(genPossessiveIrregular()).slice(0,10)]); }

const PRONOUN_EXTRA = [
  qChoice('Replace the subject: "Carlos rides his bike."','He',['He','She','They','We'],'Carlos is one boy.'),
  qChoice('Replace the subject: "The kittens are sleeping."','They',['It','They','She','He'],'Kittens means more than one.'),
  qChoice('Replace the subject: "My friend and I cleaned up."','We',['They','We','He','It'],'I plus another person = we.'),
  qChoice('Replace the subject: "The pencil fell."','It',['He','She','They','It'],'A pencil is a thing.'),
  qShort('What reflexive pronoun goes with "they"?','themselves','They → themselves'),
  qShort('What reflexive pronoun goes with "she"?','herself','She → herself'),
];
const SUBJECT_PRED_EXTRA = [
  qShort('In "The sleepy dog yawned," what is the subject?','The sleepy dog','The subject is who or what the sentence is about.'),
  qShort('In "The sleepy dog yawned," what is the predicate?','yawned','The predicate tells what the subject did.'),
  qShort('In "Our class read a story," what is the subject?','Our class','The subject is who or what the sentence is about.'),
  qShort('In "Our class read a story," what is the predicate?','read a story','The predicate tells what the subject did.'),
];
function genPronounsA(){ return varied(genPronouns, PRONOUN_EXTRA); }
function genPronounsB(){ return varied(null, [...PRONOUN_EXTRA, ...shuffle(genPronouns()).filter(x=>/reflexive/.test(x.q+x.hint)).slice(0,14)]); }
function genSubjectPredicateA(){ return varied(null, [...SUBJECT_PRED_EXTRA, ...shuffle(genPronouns()).filter(x=>/SUBJECT|PREDICATE|subject|predicate/.test(x.q+x.hint)).slice(0,16)]); }
function genPronounsReview(){ return varied(null, [...PRONOUN_EXTRA, ...SUBJECT_PRED_EXTRA, ...shuffle(genPronouns()).slice(0,10)]); }

const VERB_EXTRA = [
  qShort('What is the PAST tense of "skip"?','skipped','Double the p and add -ed.'),
  qShort('What is the PAST tense of "study"?','studied','Change y to i and add -ed.'),
  qShort('What is the FUTURE tense of "paint"?','will paint','Future tense uses will.'),
  qShort('What is the FUTURE tense of "share"?','will share','Future tense uses will.'),
  qChoice('What tense is used? "She will bake cookies."','future',['past','present','future'],'Will means future.'),
  qChoice('What tense is used? "He kicked the ball."','past',['past','present','future'],'Kicked already happened.'),
  qChoice('What tense is used? "Birds fly in the sky."','present',['past','present','future'],'This tells what happens now or regularly.'),
];
function genVerbAction(){ return varied(genVerbTense, VERB_EXTRA.filter(x=>/PAST|kicked|already/.test(x.q+x.hint))); }
function genVerbPast(){ return varied(null, [...VERB_EXTRA.filter(x=>/PAST|past|already|kicked/.test(x.q+x.hint)), ...shuffle(genVerbTense()).slice(0,14)]); }
function genVerbFuturePresent(){ return varied(null, [...VERB_EXTRA.filter(x=>/FUTURE|future|present|will/.test(x.q+x.hint)), ...shuffle(genVerbTense()).slice(0,14)]); }
function genVerbMixed(){ return varied(genVerbTense, VERB_EXTRA); }
function genVerbReview(){ return varied(null, [...VERB_EXTRA, ...shuffle(genVerbTense()).slice(0,14)]); }

const SV_EXTRA = [
  qChoice('Choose the correct verb: "The rabbit ___ quickly."','hops',['hop','hops'],'Rabbit is singular.'),
  qChoice('Choose the correct verb: "The rabbits ___ quickly."','hop',['hop','hops'],'Rabbits is plural.'),
  qChoice('Choose the correct verb: "My brother ___ jokes."','tells',['tell','tells'],'Brother is singular.'),
  qChoice('Choose the correct verb: "My friends ___ jokes."','tell',['tell','tells'],'Friends is plural.'),
  qChoice('Choose the correct verb: "We ___ our desks."','clean',['clean','cleans'],'We uses clean.'),
  qChoice('Choose the correct verb: "She ___ her desk."','cleans',['clean','cleans'],'She uses cleans.'),
];
function genSV1(){ return varied(genSVAgreement, SV_EXTRA.slice(0,3)); }
function genSV2(){ return varied(genSVAgreement, SV_EXTRA.slice(3)); }
function genSV3(){ return varied(null, [...SV_EXTRA, ...shuffle(genSVAgreement()).slice(0,14)]); }
function genSV4(){ return varied(genSVAgreement, shuffle(SV_EXTRA)); }
function genSVReview(){ return varied(null, [...SV_EXTRA, ...shuffle(genSVAgreement()).slice(0,14)]); }

const ADJ_ADV_EXTRA = [
  qChoice('In "The shiny coin sparkled," is "shiny" an adjective or adverb?','adjective',['adjective','adverb'],'Shiny describes the coin.'),
  qChoice('In "The turtle moved slowly," is "slowly" an adjective or adverb?','adverb',['adjective','adverb'],'Slowly tells how the turtle moved.'),
  qShort('What is the comparative form of "funny"?','funnier','Change y to i and add -er.'),
  qShort('What is the comparative form of "thin"?','thinner','Double the n and add -er.'),
  qChoice('Which word is an adjective?','green',['quickly','green','softly','loudly'],'Green describes a noun.'),
  qChoice('Which word is an adverb?','carefully',['careful','carefully','bright','tiny'],'Carefully tells how something is done.'),
];
function genAdjectivesA(){ return varied(genAdjectivesAdverbs, ADJ_ADV_EXTRA.filter(x=>/adjective|describes|comparative/.test(x.q+x.hint))); }
function genComparativesA(){ return varied(null, [...ADJ_ADV_EXTRA.filter(x=>/comparative|add -er|funnier|thinner/.test(x.q+x.hint)), ...shuffle(genAdjectivesAdverbs()).slice(0,14)]); }
function genAdverbsA(){ return varied(null, [...ADJ_ADV_EXTRA.filter(x=>/adverb|how/.test(x.q+x.hint)), ...shuffle(genAdjectivesAdverbs()).slice(0,14)]); }
function genAdjAdvCompare(){ return varied(genAdjectivesAdverbs, ADJ_ADV_EXTRA); }
function genAdjAdvReview(){ return varied(null, [...ADJ_ADV_EXTRA, ...shuffle(genAdjectivesAdverbs()).slice(0,14)]); }

const SENTENCE_EXTRA = [
  qChoice('What type of sentence is this? "Please pass the crayons."','command',['statement','question','command','exclamation'],'It tells someone what to do.'),
  qChoice('What type of sentence is this? "Why is the sky orange?"','question',['statement','question','command','exclamation'],'It asks something.'),
  qChoice('What type of sentence is this? "That roller coaster was amazing!"','exclamation',['statement','question','command','exclamation'],'It shows strong feeling.'),
  qChoice('What type of sentence is this? "The library opens at nine."','statement',['statement','question','command','exclamation'],'It tells information.'),
  qChoice('Which sentence is a command?','Close your book.',['The book is red.','Close your book.','Where is the book?','What a great book!'],'A command tells someone what to do.'),
  qChoice('Which sentence is a question?','Are you ready?',['I am ready.','Be ready.','Are you ready?','I am so ready!'],'A question asks something.'),
];
function genStatementsQuestions(){ return varied(null, [...SENTENCE_EXTRA.filter(x=>/question|statement|asks|information/.test(x.q+x.hint)), ...shuffle(genSentenceTypes()).slice(0,14)]); }
function genExclamationsCommands(){ return varied(null, [...SENTENCE_EXTRA.filter(x=>/command|exclamation|strong feeling|tells someone/.test(x.q+x.hint)), ...shuffle(genSentenceTypes()).slice(0,14)]); }
function genSentenceTypesA(){ return varied(genSentenceTypes, SENTENCE_EXTRA.slice(0,3)); }
function genSentenceTypesB(){ return varied(genSentenceTypes, SENTENCE_EXTRA.slice(3)); }
function genSentenceReview(){ return varied(null, [...SENTENCE_EXTRA, ...shuffle(genSentenceTypes()).slice(0,14)]); }

function genContractionsMake(){ return varied(genContractions, [qShort('Make a contraction: "they will"','they\'ll','They will → they\'ll'), qShort('Make a contraction: "we will"','we\'ll','We will → we\'ll'), qShort('Make a contraction: "you will"','you\'ll','You will → you\'ll')]); }
function genContractionsExpand(){ return varied(genContractions, [qShort('Expand the contraction: "they\'ll"','they will','The apostrophe replaces missing letters.'), qShort('Expand the contraction: "we\'ll"','we will','The apostrophe replaces missing letters.'), qShort('Expand the contraction: "you\'ll"','you will','The apostrophe replaces missing letters.')]); }
function genContractionsMixedA(){ return varied(genContractions, [qShort('Make a contraction: "let us"','let\'s','Let us → let\'s'), qShort('Expand the contraction: "let\'s"','let us','The apostrophe replaces missing letters.')]); }
function genContractionsMixedB(){ return varied(genContractions, [qShort('Make a contraction: "does not"','doesn\'t','Does not → doesn\'t'), qShort('Expand the contraction: "doesn\'t"','does not','The apostrophe replaces missing letters.')]); }
function genContractionsReview(){ return varied(genContractions, []); }

function genCompoundWordsA(){ return varied(genWordStructure, [qShort('Combine "cup" and "cake".','cupcake','Cup + cake = cupcake'), qShort('Combine "foot" and "ball".','football','Foot + ball = football'), qShort('Combine "pop" and "corn".','popcorn','Pop + corn = popcorn')]); }
function genPrefixesA(){ return varied(genWordStructure, [qShort('Add the prefix "pre-" to "heat".','preheat','Pre- means before.'), qShort('Add the prefix "mis-" to "spell".','misspell','Mis- means wrong or badly.')]); }
function genSuffixesA(){ return varied(genWordStructure, [qShort('Add "-er" to "read".','reader','Reader means one who reads.'), qShort('Add "-ful" to "hope".','hopeful','Hopeful means full of hope.')]); }
function genWordStructureMixedA(){ return varied(genWordStructure, [qShort('Add the prefix "re-" to "play".','replay','Re- means again.'), qShort('Combine "note" and "book".','notebook','Note + book = notebook')]); }
function genWordStructureReview(){ return varied(genWordStructure, []); }

function genSynonymsA(){ return varied(genSynonymsAntonyms, [qShort('What is a synonym for "angry"?','mad','Synonym means same or almost the same.', ['upset','furious']), qShort('What is a synonym for "small"?','tiny','Synonym means same or almost the same.', ['little'])]); }
function genAntonymsA(){ return varied(genSynonymsAntonyms, [qShort('What is an antonym for "near"?','far','Antonym means opposite.'), qShort('What is an antonym for "early"?','late','Antonym means opposite.')]); }
function genSynAntMixedA(){ return varied(genSynonymsAntonyms, [qShort('What is a synonym for "sick"?','ill','Synonym means same or almost the same.'), qShort('What is an antonym for "empty"?','full','Antonym means opposite.')]); }
function genSynAntMixedB(){ return varied(genSynonymsAntonyms, [qShort('What is a synonym for "quick"?','fast','Synonym means same or almost the same.'), qShort('What is an antonym for "first"?','last','Antonym means opposite.')]); }
function genWordMeaningReview(){ return varied(genSynonymsAntonyms, []); }


// ─── Balanced ELA Mission Builder ──────────────────────────────────────────
// Builds each ELA mission from a larger, mixed pool so missions teach the
// same topic without repeating the same exact question set.
function questionId(item){
  return String((item.q||'') + '|' + (item.answer||'')).toLowerCase().replace(/\s+/g,' ').trim();
}
function uniqueQuestions(items){
  const seen=new Set(), out=[];
  for(const item of items){
    if(!item || !item.q || item.answer===undefined) continue;
    const id=questionId(item);
    if(seen.has(id)) continue;
    seen.add(id); out.push(item);
  }
  return out;
}
function repeatBank(fn, times=4){
  let out=[];
  for(let i=0;i<times;i++) out = out.concat(fn());
  return out;
}
function getRecentQuestionIds(subject){
  try { return JSON.parse(localStorage.getItem(`missionAcademy_recentQuestions_${subject}`)||'[]'); }
  catch { return []; }
}
function saveRecentQuestionIds(subject, ids){
  localStorage.setItem(`missionAcademy_recentQuestions_${subject}`, JSON.stringify(ids.slice(-120)));
}
function pickBalanced(pool, count, avoidSet){
  const unique=uniqueQuestions(pool);
  const fresh=shuffle(unique.filter(q=>!avoidSet.has(questionId(q))));
  const fallback=shuffle(unique.filter(q=>avoidSet.has(questionId(q))));
  return [...fresh, ...fallback].slice(0,count);
}
function buildElaMission(parts, total=20){
  const recent=new Set(getRecentQuestionIds('ela'));
  let mission=[];
  const buckets=[
    ['easy', Math.max(0, parts.easyCount ?? 8)],
    ['medium', Math.max(0, parts.mediumCount ?? 8)],
    ['challenge', Math.max(0, parts.challengeCount ?? 4)]
  ];
  for(const [key,count] of buckets){
    const picked=pickBalanced(parts[key]||[], count, recent);
    mission = mission.concat(picked);
    picked.forEach(q=>recent.add(questionId(q)));
  }
  if(mission.length < total){
    const all=[...(parts.easy||[]), ...(parts.medium||[]), ...(parts.challenge||[]), ...(parts.extra||[])];
    mission = mission.concat(pickBalanced(all, total-mission.length, new Set(mission.map(questionId))));
  }
  mission=shuffle(uniqueQuestions(mission)).slice(0,total);
  saveRecentQuestionIds('ela', [...getRecentQuestionIds('ela'), ...mission.map(questionId)]);
  return mission;
}
function byText(items, pattern){ return items.filter(x=>pattern.test((x.q||'')+' '+(x.hint||'')+' '+(x.answer||''))); }
function qFindNoun(sentence, answer, hint){ return qChoice(`Which word is a noun in this sentence? "${sentence}"`, answer, shuffle([answer,'quickly','runs','very']).slice(0,4), hint); }

const NOUN_EXTRA_WIDE = [
  qFindNoun('The eagle flew over the school.', 'eagle', 'A noun names a person, place, thing, or animal.'),
  qFindNoun('Jayden opened his backpack.', 'backpack', 'Backpack is a thing.'),
  qFindNoun('The garden has red flowers.', 'garden', 'Garden is a place.'),
  qChoice('Choose the proper noun.', 'Ms. Chen', ['teacher','school','Ms. Chen','city'], 'A proper noun names one specific person, place, or thing.'),
  qChoice('Choose the common noun.', 'park', ['Balboa Park','Friday','park','Sofia'], 'A common noun is a general person, place, or thing.'),
  qChoice('Which noun should begin with a capital letter?', 'california', ['desk','california','pencil','teacher'], 'A state name is a proper noun.'),
  qChoice('Which noun should begin with a capital letter?', 'tuesday', ['tuesday','chair','book','dog'], 'Days of the week are proper nouns.'),
  qShort('What is the plural of "brush"?', 'brushes', 'Words ending in sh add -es.'),
  qShort('What is the plural of "dish"?', 'dishes', 'Words ending in sh add -es.'),
  qShort('What is the plural of "berry"?', 'berries', 'Change y to i and add -es.'),
  qShort('What is the plural of "monkey"?', 'monkeys', 'Vowel + y usually just adds -s.'),
  qChoice('Choose the correct plural: one class, two ___.', 'classes', ['classs','classes','classies','class'], 'Class ends in s, so add -es.'),
  qChoice('Choose the correct plural: one baby, three ___.', 'babies', ['babys','babies','babyes','baby'], 'Change y to i and add -es.')
];
const POSSESSIVE_IRREGULAR_WIDE = [
  qChoice('Choose the possessive noun: The ___ tail is fluffy.', "cat's", ['cat','cats',"cat's",'catses'], 'The tail belongs to one cat.'),
  qChoice('Choose the possessive noun: The ___ lunches are on the table.', "children's", ['childrens','children',"children's",'childrens\''], 'Children is irregular, then add apostrophe s.'),
  qShort('Make "team" possessive.', "team's", 'Add apostrophe s.'),
  qShort('Make "boys" possessive.', "boys'", 'Plural nouns ending in s add only an apostrophe.'),
  qShort('What is the irregular plural of "woman"?', 'women', 'Woman changes to women.'),
  qShort('What is the irregular plural of "man"?', 'men', 'Man changes to men.'),
  qShort('What is the irregular plural of "leaf"?', 'leaves', 'Change f to v and add -es.'),
  qChoice('Choose the correct plural: one wolf, two ___.', 'wolves', ['wolfs','wolves','wolfes','wolf'], 'Change f to v and add -es.')
];
const PRONOUN_PREDICATE_WIDE = [
  qChoice('Replace the subject: "Aaliyah and Noor made a poster."', 'They', ['She','They','It','He'], 'Two people = they.'),
  qChoice('Replace the subject: "The lunchbox is blue."', 'It', ['He','She','They','It'], 'A lunchbox is a thing.'),
  qShort('What reflexive pronoun goes with "we"?', 'ourselves', 'We → ourselves'),
  qShort('What reflexive pronoun goes with "I"?', 'myself', 'I → myself'),
  qShort('In "The bright kite flew high," what is the subject?', 'The bright kite', 'The subject is who or what the sentence is about.'),
  qShort('In "The bright kite flew high," what is the predicate?', 'flew high', 'The predicate tells what the subject did.'),
  qShort('In "My friends played tag," what is the subject?', 'My friends', 'The subject is who or what the sentence is about.'),
  qShort('In "My friends played tag," what is the predicate?', 'played tag', 'The predicate tells what the subject did.')
];
const VERB_WIDE = [
  qChoice('Which word is the action verb? "The falcon soars above the field."', 'soars', ['falcon','above','soars','field'], 'The action is what the falcon does.'),
  qChoice('Which word is the action verb? "Nina builds a tower."', 'builds', ['Nina','builds','tower','a'], 'The action is what Nina does.'),
  qShort('What is the PAST tense of "carry"?', 'carried', 'Change y to i and add -ed.'),
  qShort('What is the PAST tense of "drop"?', 'dropped', 'Double the p and add -ed.'),
  qShort('What is the FUTURE tense of "jump"?', 'will jump', 'Future tense uses will.'),
  qChoice('What tense is used? "They are drawing maps."', 'present', ['past','present','future'], 'Are drawing is happening now.'),
  qChoice('What tense is used? "We will visit the library."', 'future', ['past','present','future'], 'Will means future.')
];
const SV_WIDE = [
  qChoice('Choose the correct verb: "The cars ___ fast."', 'move', ['move','moves'], 'Cars is plural.'),
  qChoice('Choose the correct verb: "The car ___ fast."', 'moves', ['move','moves'], 'Car is singular.'),
  qChoice('Choose the correct verb: "They ___ kind."', 'are', ['is','are'], 'They uses are.'),
  qChoice('Choose the correct verb: "He ___ kind."', 'is', ['is','are'], 'He uses is.'),
  qChoice('Choose the correct verb: "The birds ___ in the tree."', 'sit', ['sit','sits'], 'Birds is plural.'),
  qChoice('Choose the correct verb: "A bird ___ in the tree."', 'sits', ['sit','sits'], 'A bird is singular.')
];
const ADJ_ADV_WIDE = [
  qChoice('Which word is an adjective? "The soft blanket is warm."', 'soft', ['soft','is','warmly','sleep'], 'Soft describes blanket.'),
  qChoice('Which word is an adverb? "Milo whispered quietly."', 'quietly', ['Milo','whispered','quietly','voice'], 'Quietly tells how Milo whispered.'),
  qShort('What is the comparative form of "happy"?', 'happier', 'Change y to i and add -er.'),
  qShort('What is the comparative form of "wide"?', 'wider', 'Add -r to wide.'),
  qChoice('In "The bird sang sweetly," is "sweetly" an adjective or adverb?', 'adverb', ['adjective','adverb'], 'Sweetly tells how the bird sang.'),
  qChoice('In "The silver moon glowed," is "silver" an adjective or adverb?', 'adjective', ['adjective','adverb'], 'Silver describes moon.')
];
const SENTENCE_WIDE = [
  qChoice('Which sentence is a statement?', 'The bell rang at noon.', ['The bell rang at noon.','Did the bell ring?','Ring the bell.','What a loud bell!'], 'A statement tells information.'),
  qChoice('Which sentence is an exclamation?', 'That was incredible!', ['That was incredible!','Was that incredible?','That was a game.','Walk over here.'], 'An exclamation shows strong feeling.'),
  qChoice('What punctuation should end this sentence? "Where is my pencil"', '?', ['.','?','!'], 'This sentence asks a question.'),
  qChoice('What punctuation should end this sentence? "Please open your notebook"', '.', ['.','?','!'], 'A polite command can end with a period.'),
  qChoice('What type of sentence is this? "Line up by the door."', 'command', ['statement','question','command','exclamation'], 'It tells someone what to do.')
];
const CONTRACTION_WIDE = [
  qShort('Make a contraction: "there is"', "there's", 'There is → there\'s'),
  qShort('Make a contraction: "that is"', "that's", 'That is → that\'s'),
  qShort('Make a contraction: "who is"', "who's", 'Who is → who\'s'),
  qShort('Expand the contraction: "she\'ll"', 'she will', 'The apostrophe replaces missing letters.'),
  qShort('Expand the contraction: "he\'ll"', 'he will', 'The apostrophe replaces missing letters.'),
  qShort('Expand the contraction: "they\'ve"', 'they have', 'The apostrophe replaces missing letters.')
];
const WORD_STRUCTURE_WIDE = [
  qShort('Combine "star" and "fish".', 'starfish', 'Star + fish = starfish'),
  qShort('Combine "basket" and "ball".', 'basketball', 'Basket + ball = basketball'),
  qShort('Add the prefix "dis-" to "agree".', 'disagree', 'Dis- can mean not or opposite.'),
  qShort('Add the prefix "un-" to "fair".', 'unfair', 'Un- means not.'),
  qShort('Add "-less" to "fear".', 'fearless', 'Less means without.'),
  qShort('Add "-ful" to "thank".', 'thankful', 'Ful means full of.')
];
const SYN_ANT_WIDE = [
  qShort('What is a synonym for "glad"?', 'happy', 'A synonym means the same or almost the same.', ['joyful','pleased']),
  qShort('What is a synonym for "silent"?', 'quiet', 'A synonym means the same or almost the same.'),
  qShort('What is a synonym for "large"?', 'big', 'A synonym means the same or almost the same.', ['huge']),
  qShort('What is an antonym for "brave"?', 'scared', 'An antonym means opposite.', ['afraid','fearful']),
  qShort('What is an antonym for "inside"?', 'outside', 'An antonym means opposite.'),
  qShort('What is an antonym for "remember"?', 'forget', 'An antonym means opposite.')
];

function bankNouns(){ const base=repeatBank(genNouns,5); return {easy:[...byText(base,/common noun|proper noun|Choose the proper|Choose the common/i),...NOUN_COMMON_PROPER_EXTRA_A,...NOUN_COMMON_PROPER_EXTRA_B], medium:[...byText(base,/plural|singular/i),...PLURAL_EXTRA_A,...PLURAL_EXTRA_B], challenge:[...NOUN_EXTRA_WIDE]}; }
function bankPossessiveIrregular(){ const base=repeatBank(genPossessiveIrregular,5); return {easy:[...byText(base,/possessive|Make/i),...POSSESSIVE_EXTRA], medium:[...byText(base,/irregular plural|plural/i),...IRREGULAR_EXTRA], challenge:[...POSSESSIVE_IRREGULAR_WIDE]}; }
function bankPronouns(){ const base=repeatBank(genPronouns,5); return {easy:[...byText(base,/Replace the subject|pronoun/i),...PRONOUN_EXTRA], medium:[...byText(base,/reflexive/i),...PRONOUN_EXTRA], challenge:[...SUBJECT_PRED_EXTRA,...PRONOUN_PREDICATE_WIDE]}; }
function bankVerbs(){ const base=repeatBank(genVerbTense,5); return {easy:[...byText(base,/PAST|FUTURE/i),...VERB_EXTRA], medium:[...byText(base,/tense|present|future|past/i),...VERB_WIDE], challenge:[...VERB_WIDE]}; }
function bankSV(){ const base=repeatBank(genSVAgreement,5); return {easy:[...base.slice(0,35),...SV_EXTRA], medium:[...base.slice(10),...SV_WIDE], challenge:[...SV_WIDE]}; }
function bankAdjAdv(){ const base=repeatBank(genAdjectivesAdverbs,5); return {easy:[...byText(base,/adjective|adverb/i),...ADJ_ADV_EXTRA], medium:[...byText(base,/comparative|form/i),...ADJ_ADV_WIDE], challenge:[...ADJ_ADV_WIDE]}; }
function bankSentences(){ const base=repeatBank(genSentenceTypes,5); return {easy:[...base,...SENTENCE_EXTRA], medium:[...SENTENCE_WIDE], challenge:[...SENTENCE_WIDE]}; }
function bankContractions(){ const base=repeatBank(genContractions,5); return {easy:[...byText(base,/Make a contraction/i),...CONTRACTION_WIDE], medium:[...byText(base,/Expand/i),...CONTRACTION_WIDE], challenge:[...CONTRACTION_WIDE]}; }
function bankWordStructure(){ const base=repeatBank(genWordStructure,5); return {easy:[...byText(base,/Combine|compound/i),...WORD_STRUCTURE_WIDE], medium:[...byText(base,/prefix|suffix/i),...WORD_STRUCTURE_WIDE], challenge:[...WORD_STRUCTURE_WIDE]}; }
function bankSynAnt(){ const base=repeatBank(genSynonymsAntonyms,5); return {easy:[...byText(base,/synonym/i),...SYN_ANT_WIDE], medium:[...byText(base,/antonym/i),...SYN_ANT_WIDE], challenge:[...SYN_ANT_WIDE]}; }
function buildFromBank(bankFn, mix={easyCount:7,mediumCount:8,challengeCount:5}){ return buildElaMission({...bankFn(), ...mix}); }

// Override ELA generators with balanced mission builders.
function genNounsMission1(){ return buildFromBank(bankNouns,{easyCount:9,mediumCount:6,challengeCount:5}); }
function genNounsMission2(){ return buildFromBank(bankNouns,{easyCount:7,mediumCount:8,challengeCount:5}); }
function genNounsMission3(){ return buildFromBank(bankNouns,{easyCount:5,mediumCount:10,challengeCount:5}); }
function genNounsMission4(){ return buildFromBank(bankNouns,{easyCount:6,mediumCount:9,challengeCount:5}); }
function genNounsMission5(){ return buildFromBank(bankNouns,{easyCount:6,mediumCount:7,challengeCount:7}); }
function genPossessiveA(){ return buildFromBank(bankPossessiveIrregular,{easyCount:10,mediumCount:5,challengeCount:5}); }
function genPossessiveB(){ return buildFromBank(bankPossessiveIrregular,{easyCount:8,mediumCount:7,challengeCount:5}); }
function genIrregularA(){ return buildFromBank(bankPossessiveIrregular,{easyCount:4,mediumCount:11,challengeCount:5}); }
function genIrregularB(){ return buildFromBank(bankPossessiveIrregular,{easyCount:5,mediumCount:10,challengeCount:5}); }
function genPossessiveIrregularReview(){ return buildFromBank(bankPossessiveIrregular,{easyCount:7,mediumCount:8,challengeCount:5}); }
function genPronounsA(){ return buildFromBank(bankPronouns,{easyCount:10,mediumCount:5,challengeCount:5}); }
function genPronounsB(){ return buildFromBank(bankPronouns,{easyCount:7,mediumCount:8,challengeCount:5}); }
function genSubjectPredicateA(){ return buildFromBank(bankPronouns,{easyCount:4,mediumCount:5,challengeCount:11}); }
function genPronounsReview(){ return buildFromBank(bankPronouns,{easyCount:7,mediumCount:6,challengeCount:7}); }
function genVerbAction(){ return buildFromBank(bankVerbs,{easyCount:9,mediumCount:6,challengeCount:5}); }
function genVerbPast(){ return buildFromBank(bankVerbs,{easyCount:8,mediumCount:7,challengeCount:5}); }
function genVerbFuturePresent(){ return buildFromBank(bankVerbs,{easyCount:7,mediumCount:8,challengeCount:5}); }
function genVerbMixed(){ return buildFromBank(bankVerbs,{easyCount:6,mediumCount:8,challengeCount:6}); }
function genVerbReview(){ return buildFromBank(bankVerbs,{easyCount:6,mediumCount:7,challengeCount:7}); }
function genSV1(){ return buildFromBank(bankSV,{easyCount:10,mediumCount:6,challengeCount:4}); }
function genSV2(){ return buildFromBank(bankSV,{easyCount:8,mediumCount:8,challengeCount:4}); }
function genSV3(){ return buildFromBank(bankSV,{easyCount:7,mediumCount:8,challengeCount:5}); }
function genSV4(){ return buildFromBank(bankSV,{easyCount:6,mediumCount:9,challengeCount:5}); }
function genSVReview(){ return buildFromBank(bankSV,{easyCount:6,mediumCount:8,challengeCount:6}); }
function genAdjectivesA(){ return buildFromBank(bankAdjAdv,{easyCount:10,mediumCount:5,challengeCount:5}); }
function genComparativesA(){ return buildFromBank(bankAdjAdv,{easyCount:5,mediumCount:10,challengeCount:5}); }
function genAdverbsA(){ return buildFromBank(bankAdjAdv,{easyCount:8,mediumCount:7,challengeCount:5}); }
function genAdjAdvCompare(){ return buildFromBank(bankAdjAdv,{easyCount:6,mediumCount:8,challengeCount:6}); }
function genAdjAdvReview(){ return buildFromBank(bankAdjAdv,{easyCount:6,mediumCount:7,challengeCount:7}); }
function genStatementsQuestions(){ return buildFromBank(bankSentences,{easyCount:10,mediumCount:6,challengeCount:4}); }
function genExclamationsCommands(){ return buildFromBank(bankSentences,{easyCount:8,mediumCount:8,challengeCount:4}); }
function genSentenceTypesA(){ return buildFromBank(bankSentences,{easyCount:7,mediumCount:8,challengeCount:5}); }
function genSentenceTypesB(){ return buildFromBank(bankSentences,{easyCount:6,mediumCount:9,challengeCount:5}); }
function genSentenceReview(){ return buildFromBank(bankSentences,{easyCount:6,mediumCount:8,challengeCount:6}); }
function genContractionsMake(){ return buildFromBank(bankContractions,{easyCount:10,mediumCount:5,challengeCount:5}); }
function genContractionsExpand(){ return buildFromBank(bankContractions,{easyCount:5,mediumCount:10,challengeCount:5}); }
function genContractionsMixedA(){ return buildFromBank(bankContractions,{easyCount:7,mediumCount:8,challengeCount:5}); }
function genContractionsMixedB(){ return buildFromBank(bankContractions,{easyCount:6,mediumCount:8,challengeCount:6}); }
function genContractionsReview(){ return buildFromBank(bankContractions,{easyCount:6,mediumCount:7,challengeCount:7}); }
function genCompoundWordsA(){ return buildFromBank(bankWordStructure,{easyCount:10,mediumCount:5,challengeCount:5}); }
function genPrefixesA(){ return buildFromBank(bankWordStructure,{easyCount:5,mediumCount:10,challengeCount:5}); }
function genSuffixesA(){ return buildFromBank(bankWordStructure,{easyCount:5,mediumCount:10,challengeCount:5}); }
function genWordStructureMixedA(){ return buildFromBank(bankWordStructure,{easyCount:7,mediumCount:8,challengeCount:5}); }
function genWordStructureReview(){ return buildFromBank(bankWordStructure,{easyCount:6,mediumCount:8,challengeCount:6}); }
function genSynonymsA(){ return buildFromBank(bankSynAnt,{easyCount:10,mediumCount:5,challengeCount:5}); }
function genAntonymsA(){ return buildFromBank(bankSynAnt,{easyCount:5,mediumCount:10,challengeCount:5}); }
function genSynAntMixedA(){ return buildFromBank(bankSynAnt,{easyCount:7,mediumCount:8,challengeCount:5}); }
function genSynAntMixedB(){ return buildFromBank(bankSynAnt,{easyCount:6,mediumCount:8,challengeCount:6}); }
function genWordMeaningReview(){ return buildFromBank(bankSynAnt,{easyCount:6,mediumCount:8,challengeCount:6}); }
function genELAReviewBalanced1(){
  return buildElaMission({
    easy:[...bankNouns().easy,...bankPronouns().easy,...bankVerbs().easy],
    medium:[...bankNouns().medium,...bankPronouns().medium,...bankVerbs().medium],
    challenge:[...bankNouns().challenge,...bankPronouns().challenge,...bankVerbs().challenge],
    easyCount:6,mediumCount:8,challengeCount:6
  });
}
function genELAReviewBalanced2(){
  return buildElaMission({
    easy:[...bankSentences().easy,...bankContractions().easy,...bankWordStructure().easy,...bankSynAnt().easy],
    medium:[...bankSentences().medium,...bankContractions().medium,...bankWordStructure().medium,...bankSynAnt().medium],
    challenge:[...bankSentences().challenge,...bankContractions().challenge,...bankWordStructure().challenge,...bankSynAnt().challenge],
    easyCount:6,mediumCount:8,challengeCount:6
  });
}
const elaGenerators=[
  null,
  genNounsMission1,genNounsMission2,genNounsMission3,genNounsMission4,genNounsMission5,
  genPossessiveA,genPossessiveB,genIrregularA,genIrregularB,genPossessiveIrregularReview,genPossessiveIrregularReview,
  genPronounsA,genPronounsB,genSubjectPredicateA,genPronounsReview,
  genVerbAction,genVerbPast,genVerbFuturePresent,genVerbMixed,genVerbReview,
  genSV1,genSV2,genSV3,genSV4,genSVReview,
  genAdjectivesA,genComparativesA,genAdverbsA,genAdjAdvCompare,genAdjAdvReview,
  genStatementsQuestions,genExclamationsCommands,genSentenceTypesA,genSentenceTypesB,genSentenceReview,
  genELAReviewBalanced1,genELAReviewBalanced1,genELAReviewBalanced1,genELAReviewBalanced1,genELAReviewBalanced1,
  genContractionsMake,genContractionsExpand,genContractionsMixedA,genContractionsMixedB,genContractionsReview,
  genCompoundWordsA,genPrefixesA,genSuffixesA,genWordStructureMixedA,genWordStructureReview,
  genSynonymsA,genAntonymsA,genSynAntMixedA,genSynAntMixedB,genWordMeaningReview,
  genELAReviewBalanced2,genELAReviewBalanced2,genELAReviewBalanced2,genELAReviewBalanced2,genELAReviewBalanced2,
];

const elaMissionInfo=[
  null,
  "Common Nouns & Proper Nouns","Common Nouns & Proper Nouns","Singular & Plural Nouns","Singular & Plural Nouns","Noun Review",
  "Possessive Nouns","Possessive Nouns","Irregular Plural Nouns","Irregular Plural Nouns","Possessive & Irregular Nouns","Nouns Mixed Review",
  "Pronouns","Reflexive Pronouns","Subject & Predicate","Pronouns & Predicates",
  "Action Verbs","Verb Tense (Past)","Verb Tense (Present & Future)","Mixed Verb Tense","Verb Review",
  "Subject–Verb Agreement","Subject–Verb Agreement","Subject–Verb Agreement","Subject–Verb Agreement","S–V Agreement Review",
  "Adjectives","Comparative Adjectives","Adverbs","Adjectives vs. Adverbs","Adjectives & Adverbs Review",
  "Statements & Questions","Exclamations & Commands","Sentence Types","Sentence Types","Sentence Types Review",
  "ELA Review: Nouns, Pronouns & Verbs","ELA Review","ELA Review","ELA Review","ELA Review",
  "Contractions","Contractions","Contractions","Contractions","Contractions Review",
  "Compound Words","Prefixes","Suffixes","Compound Words, Prefixes & Suffixes","Word Structure Review",
  "Synonyms","Antonyms","Synonyms & Antonyms","Synonyms & Antonyms","Word Meaning Review",
  "ELA Mixed Review","ELA Mixed Review","ELA Mixed Review","ELA Mixed Review","ELA Final Review",
];

// ─── Storage ───────────────────────────────────────────────────────────────
function storageKey(subject,name){ return `missionAcademy_${subject}_${safeStudentName(name||'student')}`; }
function getProgress(subject){ try{return JSON.parse(localStorage.getItem(storageKey(subject,getStudentName()))||'{}');}catch{return{};} }
function saveProgress(subject,data){ localStorage.setItem(storageKey(subject,getStudentName()),JSON.stringify(data)); }
// ─── Section-based locking (driven by config.js) ─────────────────────────
const SECTION_MAP = {
  math: [
    [1,5],[6,10],[11,15],[16,20],[21,25],[26,30]
  ],
  ela: [
    [1,5],[6,11],[12,15],[16,20],[21,25],[26,30],
    [31,35],[36,40],[41,45],[46,50],[51,55],[56,60]
  ],
  reading: [
    [1,5],[6,10],[11,15],[16,20]
  ],
  spelling: [
    [1,5],[6,10],[11,15],[16,20]
  ]
};

function getSectionForMission(subject, n) {
  const map = SECTION_MAP[subject] || [];
  for (let i = 0; i < map.length; i++) {
    if (n >= map[i][0] && n <= map[i][1]) return i + 1; // 1-indexed section number
  }
  return 1;
}

function getOpenSections(subject) {
  const cfg = window.SITE_CONFIG || {};
  const key = subject + '_open_sections';
  return cfg[key] ?? 1;
}

function isLocked(n, subject) {
  if (!subject) return false; // fallback: never lock if subject unknown
  const section = getSectionForMission(subject, n);
  return section > getOpenSections(subject);
}

function isUnlocked(n, subject) {
  return !isLocked(n, subject);
}

// kept for backwards compatibility — no-op since locking is config-driven
function unlockMission(n, subject, code) { return isUnlocked(n, subject) || code === TEACHER_CODE; }
function markComplete(n,subject,score){ const p=getProgress(subject); const first=p[`best_${n}`]==null; p[`score_${n}`]=score;p[`best_${n}`]=Math.max(score,p[`best_${n}`]||0);saveProgress(subject,p); if(first){ addXP(10); awardBadge('first_mission'); } }
function getScore(n,subject){ return getProgress(subject)[`score_${n}`]??null; }
function getBest(n,subject){ return getProgress(subject)[`best_${n}`]??null; }

function getAllStudentProgress(){
  const students={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(!key.startsWith('missionAcademy_')||key==='missionAcademy_studentName') continue;
    const rest=key.replace('missionAcademy_','');
    const subjectMatch=rest.match(/^(math|ela|reading|reading_g1|reading_g2|spelling)_(.+)$/);
    if(subjectMatch){
      let [,subject,sName]=subjectMatch;
      if(subject==='reading_g1'||subject==='reading_g2') subject='reading';
      if(!students[sName]) students[sName]={math:{},ela:{},reading:{},spelling:{},profile:getProfile(sName.replace(/_/g,' '))};
      try{students[sName][subject]={...(students[sName][subject]||{}),...JSON.parse(localStorage.getItem(key)||'{}')};}catch{}
    }
  }
  // Add profile-only students, too.
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(!key.startsWith('missionAcademy_profile_')) continue;
    try{
      const profile=JSON.parse(localStorage.getItem(key)||'{}');
      const sName=safeStudentName(profile.name || key.replace('missionAcademy_profile_',''));
      if(!students[sName]) students[sName]={math:{},ela:{},reading:{},spelling:{},profile};
      else students[sName].profile={...students[sName].profile,...profile};
    }catch{}
  }
  return students;
}

if(typeof window!=='undefined'){
  window.MissionEngine={
    TEACHER_CODE,
    mathGenerators,mathMissionInfo,elaGenerators,elaMissionInfo,
    getProgress,saveProgress,isLocked,isUnlocked,unlockMission,markComplete,getScore,getBest,getSectionForMission,getOpenSections,
    getAllStudentProgress,getStudentName,setStudentName,getProfile,saveProfile,setAvatar,getAvatar,getAvatarChoice,FALCON_AVATARS,getRank,addXP,awardBadge,isSoundOn,setSoundOn,toggleSound,getReadingLevel,setReadingLevelPreference,
    AudioFX,checkAnswer,randInt,shuffle
  };
}

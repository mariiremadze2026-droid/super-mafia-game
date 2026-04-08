‘use strict’;

// ===== ROLES =====
const ROLES = {
godfather: {
id: ‘godfather’, name: ‘მაფიის ბოსი’, subtitle: ‘GODFATHER’,
team: ‘mafia’, emoji: ‘🕴’, colorClass: ‘red’,
desc: ‘მაფიის ლიდერი. დეტექტივი გამოკვლევისას მოქალაქედ ხედავს.’
},
mafia: {
id: ‘mafia’, name: ‘მაფია’, subtitle: ‘’,
team: ‘mafia’, emoji: ‘🔫’, colorClass: ‘red’,
desc: ‘ღამით ირჩევ ვინ მოკვდეს. ქალაქი ვერ გიცნობს.’
},
detective: {
id: ‘detective’, name: ‘დეტექტივი’, subtitle: ‘’,
team: ‘town’, emoji: ‘🔍’, colorClass: ‘blue’,
desc: ‘ღამით ამოწმებ ერთი მოთამაშის როლს — მაფიაა თუ მოქალაქე?’
},
doctor: {
id: ‘doctor’, name: ‘ექიმი’, subtitle: ‘’,
team: ‘town’, emoji: ‘💊’, colorClass: ‘green’,
desc: ‘ღამით ირჩევ ვინ გადარჩეს. საკუთარ თავსაც შეიძლება ირჩევდე.’
},
maniac: {
id: ‘maniac’, name: ‘სერიული მკვლელი’, subtitle: ‘’,
team: ‘neutral’, emoji: ‘🗡’, colorClass: ‘purple’,
desc: ‘მარტო ხარ. ყველა ჩააძინე — მოქალაქეებიც და მაფიაც.’
},
bartender: {
id: ‘bartender’, name: ‘ბარმენი’, subtitle: ‘’,
team: ‘town’, emoji: ‘🍸’, colorClass: ‘orange’,
desc: ‘ღამით ირჩევ ვისი ქმედება დაბლოკო.’
},
citizen: {
id: ‘citizen’, name: ‘მოქალაქე’, subtitle: ‘’,
team: ‘town’, emoji: ‘👤’, colorClass: ‘gray’,
desc: ‘შენი ძალა კენჭისყრაშია. ყურადღებით დააკვირდი.’
}
};

// ===== STATE =====
const State = {
playerCount: 6,
mafiaCount: 2,
roles: { godfather: true, detective: true, doctor: true, maniac: false, bartender: false },
players: [],
night: 0,
day: 0,
seenCards: new Set(),
currentCard: -1,
nightResult: ‘’
};

// ===== STARS =====
function createStars() {
const c = document.getElementById(‘stars’);
for (let i = 0; i < 130; i++) {
const s = document.createElement(‘div’);
s.className = ‘star’;
const size = Math.random() * 2.5 + 0.4;
s.style.cssText = `width:${size}px;height:${size}px; left:${Math.random()*100}%;top:${Math.random()*100}%; --d:${(Math.random()*4+2).toFixed(1)}s; animation-delay:${(Math.random()*6).toFixed(1)}s;`;
c.appendChild(s);
}
}

// ===== SHUFFLE =====
function shuffle(arr) {
for (let i = arr.length - 1; i > 0; i–) {
const j = Math.floor(Math.random() * (i + 1));
[arr[i], arr[j]] = [arr[j], arr[i]];
}
return arr;
}

// ===== APP =====
const App = {

goTo(id) {
document.querySelectorAll(’.screen’).forEach(s => s.classList.remove(‘active’));
document.getElementById(id).classList.add(‘active’);
window.scrollTo(0, 0);
if (id === ‘screen-setup’) App.renderSetup();
},

// ––––– SETUP –––––
changeCount(d) {
State.playerCount = Math.max(4, Math.min(12, State.playerCount + d));
App.renderSetup();
},

changeRole(d) {
const max = Math.floor(State.playerCount / 2);
State.mafiaCount = Math.max(1, Math.min(max, State.mafiaCount + d));
document.getElementById(‘mafia-count’).textContent = State.mafiaCount;
App.renderSummary();
},

renderSetup() {
document.getElementById(‘player-count’).textContent = State.playerCount;
document.getElementById(‘mafia-count’).textContent = State.mafiaCount;

```
const wrap = document.getElementById('player-names');
const oldVals = Array.from(wrap.querySelectorAll('input')).map(i => i.value);
wrap.innerHTML = '';
for (let i = 0; i < State.playerCount; i++) {
  const div = document.createElement('div');
  div.className = 'player-input-wrap';
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'player-input';
  inp.placeholder = `მოთამაშე ${i + 1}`;
  inp.value = oldVals[i] || '';
  div.appendChild(inp);
  wrap.appendChild(div);
}
App.renderSummary();
```

},

renderSummary() {
let special = State.mafiaCount;
if (State.roles.detective) special++;
if (State.roles.doctor) special++;
if (State.roles.bartender) special++;
if (State.roles.maniac) special++;
const citizens = State.playerCount - special;
const el = document.getElementById(‘role-summary’);
if (citizens < 0) {
el.textContent = `⚠️ ძალიან ბევრი სპეციალური როლი! შეამცირე.`;
el.style.color = ‘#e74c3c’;
} else {
el.textContent = `სულ: ${special} სპეციალური / ${citizens} მოქალაქე`;
el.style.color = ‘var(–gold)’;
}
},

syncToggles() {
[‘godfather’,‘detective’,‘doctor’,‘maniac’,‘bartender’].forEach(id => {
const el = document.getElementById(‘role-’ + id);
if (el) el.addEventListener(‘change’, () => {
State.roles[id] = el.checked;
App.renderSummary();
});
});
},

startGame() {
// Validate
let special = State.mafiaCount;
if (State.roles.detective) special++;
if (State.roles.doctor) special++;
if (State.roles.bartender) special++;
if (State.roles.maniac) special++;
if (special > State.playerCount) {
alert(‘ძალიან ბევრი სპეციალური როლია! შეამცირე.’);
return;
}

```
// Build role pool
const pool = [];
if (State.roles.godfather) {
  pool.push('godfather');
  for (let i = 1; i < State.mafiaCount; i++) pool.push('mafia');
} else {
  for (let i = 0; i < State.mafiaCount; i++) pool.push('mafia');
}
if (State.roles.detective) pool.push('detective');
if (State.roles.doctor) pool.push('doctor');
if (State.roles.bartender) pool.push('bartender');
if (State.roles.maniac) pool.push('maniac');
while (pool.length < State.playerCount) pool.push('citizen');

shuffle(pool);

const inputs = document.querySelectorAll('.player-input');
State.players = Array.from(inputs).map((inp, i) => ({
  name: inp.value.trim() || `მოთამაშე ${i + 1}`,
  role: pool[i],
  alive: true
}));

State.seenCards.clear();
State.night = 0;
State.day = 0;
State.nightResult = '';

App.goTo('screen-deal');
App.renderDeal();
```

},

// ––––– DEAL –––––
renderDeal() {
const list = document.getElementById(‘deal-list’);
list.innerHTML = ‘’;
State.players.forEach((p, i) => {
const seen = State.seenCards.has(i);
const div = document.createElement(‘div’);
div.className = ‘deal-item’ + (seen ? ’ seen’ : ‘’);
div.innerHTML = `<div> <div class="player-label">${p.name}</div> <div class="deal-status">${seen ? '✓ ნახულია' : 'ჯერ არ უნახავს'}</div> </div> ${seen ? '<button class="btn-sm done">✓</button>' :`<button class="btn-sm" onclick="App.showCard(${i})">ბარათის ნახვა</button>`} `;
list.appendChild(div);
});
const btn = document.getElementById(‘btn-night’);
if (btn) btn.disabled = State.seenCards.size < State.players.length;
},

showCard(i) {
const p = State.players[i];
const role = ROLES[p.role];
State.currentCard = i;

```
document.getElementById('card-player-name').textContent = p.name;
document.getElementById('card-role-badge').innerHTML = `
  <span class="role-badge-emoji">${role.emoji}</span>
  <span class="role-badge-name" style="color:var(--${role.colorClass === 'red' ? 'red-bright' : role.colorClass})">
    ${role.name}${role.subtitle ? ' (' + role.subtitle + ')' : ''}
  </span>
`;
document.getElementById('card-role-desc').textContent = role.desc;
document.getElementById('overlay-card').classList.remove('hidden');
```

},

closeCard() {
State.seenCards.add(State.currentCard);
document.getElementById(‘overlay-card’).classList.add(‘hidden’);
App.renderDeal();
},

goToNight() {
State.night++;
App.goTo(‘screen-night’);
App.renderNight();
},

// ––––– NIGHT –––––
renderNight() {
document.getElementById(‘night-num’).textContent = State.night;
const container = document.getElementById(‘night-phases’);
container.innerHTML = ‘’;

```
const alive = State.players.filter(p => p.alive);
const aliveNames = alive.map(p => p.name);

// Mafia always acts
App.addPhase(container, 'mafia-target', '🔫 მაფია', 'ვინ მოკლათ?', aliveNames);

// Detective
const hasDetective = State.roles.detective && State.players.some(p => p.alive && p.role === 'detective');
if (hasDetective) App.addPhase(container, 'detective-target', '🔍 დეტექტივი', 'ვინ შეამოწმო?', aliveNames);

// Doctor
const hasDoctor = State.roles.doctor && State.players.some(p => p.alive && p.role === 'doctor');
if (hasDoctor) App.addPhase(container, 'doctor-target', '💊 ექიმი', 'ვინ განკურნო?', aliveNames);

// Maniac
const hasManiac = State.roles.maniac && State.players.some(p => p.alive && p.role === 'maniac');
if (hasManiac) App.addPhase(container, 'maniac-target', '🗡 სერიული მკვლელი', 'ვინ მოკლა?', aliveNames);

// Bartender
const hasBartender = State.roles.bartender && State.players.some(p => p.alive && p.role === 'bartender');
if (hasBartender) App.addPhase(container, 'bartender-target', '🍸 ბარმენი', 'ვის დაუბლოკო ქმედება?', aliveNames);
```

},

addPhase(container, selId, title, action, names) {
const div = document.createElement(‘div’);
div.className = ‘phase-card’;
const opts = names.map(n => `<option value="${n}">${n}</option>`).join(’’);
div.innerHTML = `<div class="phase-role">${title}</div> <div class="phase-action">${action}</div> <select id="${selId}"> <option value="">— გამოტოვება —</option> ${opts} </select>`;
container.appendChild(div);
},

goToDay() {
const get = id => { const el = document.getElementById(id); return el ? el.value : ‘’; };
const mafiaKill  = get(‘mafia-target’);
const doctorSave = get(‘doctor-target’);
const detectiveCheck = get(‘detective-target’);
const maniacKill = get(‘maniac-target’);
const bartenderBlock = get(‘bartender-target’);

```
const results = [];

// Mafia kills
if (mafiaKill) {
  if (mafiaKill === doctorSave) {
    results.push(`💊 ექიმმა ${mafiaKill} სიკვდილს გადაარჩინა!`);
  } else if (bartenderBlock && App.isMafiaBlockedByBartender(bartenderBlock)) {
    results.push(`🍸 ბარმენმა მაფიის ქმედება დაბლოკა!`);
  } else {
    const p = State.players.find(pl => pl.name === mafiaKill && pl.alive);
    if (p) { p.alive = false; results.push(`☠️ ${p.name} მოკლული იქნა ღამით.`); }
  }
}

// Maniac kills
if (maniacKill && maniacKill !== doctorSave) {
  const blocked = bartenderBlock === maniacKill;
  if (!blocked) {
    const p = State.players.find(pl => pl.name === maniacKill && pl.alive);
    if (p) { p.alive = false; results.push(`🗡 ${p.name} სერიული მკვლელის მსხვერპლი გახდა.`); }
  } else {
    results.push(`🍸 ბარმენმა სერიული მკვლელი დაბლოკა.`);
  }
}

// Detective result
if (detectiveCheck) {
  const p = State.players.find(pl => pl.name === detectiveCheck);
  if (p) {
    const appearsAs = p.role === 'godfather' ? 'მოქალაქე (სინამდვილეში ბოსი!)' :
                      (p.role === 'mafia' ? 'მაფია' : 'მოქალაქე');
    results.push(`🔍 [მხოლოდ დეტექტივს]: ${detectiveCheck} — ${appearsAs}`);
  }
}

if (results.length === 0) results.push('🌙 ღამე მშვიდად გავიდა. არავინ დაშავებულა.');

State.nightResult = results.join('\n');
State.day++;
App.goTo('screen-day');
App.renderDay();

if (App.checkWin()) return;
```

},

isMafiaBlockedByBartender(blocked) {
const mafiaPlayers = State.players.filter(p => p.alive && (p.role === ‘mafia’ || p.role === ‘godfather’));
return mafiaPlayers.some(p => p.name === blocked);
},

// ––––– DAY –––––
renderDay() {
document.getElementById(‘day-num’).textContent = State.day;
document.getElementById(‘night-result-text’).textContent = State.nightResult;

```
const voteList = document.getElementById('vote-list');
voteList.innerHTML = '';
State.players.filter(p => p.alive).forEach(p => {
  const div = document.createElement('div');
  div.className = 'vote-item';
  div.innerHTML = `
    <label>
      <input type="radio" name="vote" value="${p.name}" />
      <span>${p.name}</span>
    </label>
  `;
  voteList.appendChild(div);
});
```

},

eliminate() {
const sel = document.querySelector(‘input[name=“vote”]:checked’);
if (!sel) { alert(‘ჯერ ვინმე აირჩიე!’); return; }
const name = sel.value;
const p = State.players.find(pl => pl.name === name);
if (p) {
p.alive = false;
const role = ROLES[p.role];
alert(`${name} განდევნილ იქნა!\nროლი: ${role.emoji} ${role.name}`);
}
if (App.checkWin()) return;
},

skipVote() {
alert(‘კენჭისყრა გამოტოვებულია. ღამე გრძელდება…’);
},

goToNight2() {
App.goToNight();
},

// ––––– WIN CHECK –––––
checkWin() {
const alive = State.players.filter(p => p.alive);
const aliveMafia = alive.filter(p => p.role === ‘mafia’ || p.role === ‘godfather’);
const aliveManiac = alive.filter(p => p.role === ‘maniac’);
const aliveTown = alive.filter(p => p.role !== ‘mafia’ && p.role !== ‘godfather’ && p.role !== ‘maniac’);

```
if (aliveMafia.length === 0 && aliveManiac.length === 0) {
  setTimeout(() => App.showEnd('🏆 მოქალაქეების გამარჯვება!', '🏆', 'ქალაქი გაიწმინდა! მოქალაქეებმა გაიმარჯვეს!'), 600);
  return true;
}
if (aliveMafia.length >= aliveTown.length && aliveManiac.length === 0) {
  setTimeout(() => App.showEnd('🔫 მაფიის გამარჯვება!', '🔫', 'სიბნელემ გაიმარჯვა. ქალაქი მაფიის ხელშია.'), 600);
  return true;
}
if (aliveManiac.length > 0 && alive.length <= 2) {
  setTimeout(() => App.showEnd('🗡 სერიული მკვლელი!', '🗡', 'მარტოხელა მონადირე ყველას გაუმარჯვა.'), 600);
  return true;
}
return false;
```

},

showEnd(title, icon, desc) {
document.getElementById(‘end-icon’).textContent = icon;
document.getElementById(‘end-title’).textContent = title;
document.getElementById(‘end-desc’).textContent = desc;

```
const rolesEl = document.getElementById('end-roles');
rolesEl.innerHTML = '';
State.players.forEach(p => {
  const role = ROLES[p.role];
  const div = document.createElement('div');
  div.className = 'end-role-item';
  div.innerHTML = `
    <span class="dot ${role.colorClass}"></span>
    <strong>${p.name}</strong>
    <span style="color:var(--text-dim)">${role.emoji} ${role.name}</span>
    <span style="margin-left:auto;font-size:0.78rem;color:${p.alive ? 'var(--green)' : 'var(--red-bright)'}">
      ${p.alive ? '✓ ცოცხალი' : '✗ მკვდარი'}
    </span>
  `;
  rolesEl.appendChild(div);
});

App.goTo('screen-end');
```

}
};

// ===== INIT =====
document.addEventListener(‘DOMContentLoaded’, () => {
createStars();
App.syncToggles();
App.renderSetup();
});
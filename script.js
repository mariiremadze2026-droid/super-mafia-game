‘use strict’;

// ===== ROLE DEFINITIONS =====
const ROLES = {
godfather: {
id: ‘godfather’,
name: ‘მაფიის ბოსი’,
subtitle: ‘GODFATHER’,
team: ‘mafia’,
emoji: ‘🕴’,
color: ‘red’,
desc: ‘მაფიის ლიდერი. დეტექტივი გამოკვლევისას მოქალაქედ ხედავს.’,
night: true
},
mafia: {
id: ‘mafia’,
name: ‘მაფია’,
subtitle: ‘’,
team: ‘mafia’,
emoji: ‘🔫’,
color: ‘red’,
desc: ‘ღამით ირჩევ ვინ მოკვდეს. ქალაქი ვერ გიცნობს.’,
night: true
},
detective: {
id: ‘detective’,
name: ‘დეტექტივი’,
subtitle: ‘’,
team: ‘town’,
emoji: ‘🔍’,
color: ‘blue’,
desc: ‘ღამით ამოწმებ ერთი მოთამაშის როლს — მაფიაა თუ მოქალაქე?’,
night: true
},
doctor: {
id: ‘doctor’,
name: ‘ექიმი’,
subtitle: ‘’,
team: ‘town’,
emoji: ‘💊’,
color: ‘green’,
desc: ‘ღამით ირჩევ ვინ გადარჩეს. საკუთარ თავსაც ირჩევ.’,
night: true
},
maniac: {
id: ‘maniac’,
name: ‘სერიული მკვლელი’,
subtitle: ‘’,
team: ‘neutral’,
emoji: ‘🗡’,
color: ‘purple’,
desc: ‘მარტო ხარ. ყველა ჩააძინე — მოქალაქეებიც და მაფიაც.’,
night: true
},
bartender: {
id: ‘bartender’,
name: ‘ბარმენი’,
subtitle: ‘’,
team: ‘town’,
emoji: ‘🍸’,
color: ‘orange’,
desc: ‘ღამით ირჩევ ვისი ეფექტი დაბლოკო.’,
night: true
},
citizen: {
id: ‘citizen’,
name: ‘მოქალაქე’,
subtitle: ‘’,
team: ‘town’,
emoji: ‘👤’,
color: ‘gray’,
desc: ‘შენი ძალა დღის კენჭისყრაშია. ყურადღებით დააკვირდი.’,
night: false
}
};

// ===== GAME STATE =====
const State = {
playerCount: 6,
players: [],        // { name, role, alive }
mafiaCount: 2,
roles: {
godfather: true,
detective: true,
doctor: true,
maniac: false,
bartender: false
},
night: 0,
day: 0,
nightResult: ‘’,
seenCards: new Set(),
nightChoices: {},
eliminated: null,
log: []
};

// ===== STARS =====
function createStars() {
const container = document.getElementById(‘stars’);
for (let i = 0; i < 120; i++) {
const s = document.createElement(‘div’);
s.className = ‘star’;
const size = Math.random() * 2.5 + 0.5;
s.style.cssText = `width: ${size}px; height: ${size}px; left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; --d: ${(Math.random() * 4 + 2).toFixed(1)}s; animation-delay: ${(Math.random() * 5).toFixed(1)}s;`;
container.appendChild(s);
}
}

// ===== NAVIGATION =====
const App = {
goTo(id) {
document.querySelectorAll(’.screen’).forEach(s => s.classList.remove(‘active’));
document.getElementById(id).classList.add(‘active’);
window.scrollTo(0, 0);
if (id === ‘screen-setup’) App.renderSetup();
},

// ===== SETUP =====
changeCount(delta) {
State.playerCount = Math.max(4, Math.min(12, State.playerCount + delta));
App.renderSetup();
},

changeRole(role, delta) {
State.mafiaCount = Math.max(1, Math.min(
Math.floor(State.playerCount / 2),
State.mafiaCount + delta
));
App.renderSummary();
},

renderSetup() {
document.getElementById(‘player-count’).textContent = State.playerCount;

```
// Player name inputs
const wrap = document.getElementById('player-names');
const existing = wrap.querySelectorAll('input');
const oldVals = Array.from(existing).map(i => i.value);

wrap.innerHTML = '';
for (let i = 0; i < State.playerCount; i++) {
  const div = document.createElement('div');
  div.className = 'player-input-wrap';
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'player-input';
  inp.placeholder = `მოთამაშე ${i + 1}`;
  inp.value = oldVals[i] || '';
  wrap.appendChild(div);
  div.appendChild(inp);
}

App.renderSummary();
```

},

renderSummary() {
const active = App.getActiveRoles();
const roleTotal = State.mafiaCount + active.town.length + active.neutral.length;
const citizens = State.playerCount - roleTotal;
const el = document.getElementById(‘role-summary’);
el.textContent = `სულ: ${roleTotal + Math.max(0, citizens)} / მოთამაშეები: ${State.playerCount} — ${Math.max(0, citizens)} მოქალაქე`;
el.style.color = citizens < 0 ? ‘#e74c3c’ : ‘var(–gold)’;
},

getActiveRoles() {
const townRoles = [];
const neutralRoles = [];
if (State.roles.detective) townRoles.push(‘detective’);
if (State.roles.doctor) townRoles.push(‘doctor’);
if (State.roles.bartender) townRoles.push(‘bartender’);
if (State.roles.maniac) neutralRoles.push(‘maniac’);
return { town: townRoles, neutral: neutralRoles };
},

// Listen to role checkboxes
syncRoleToggles() {
const ids = [‘godfather’, ‘detective’, ‘doctor’, ‘maniac’, ‘bartender’];
ids.forEach(id => {
const el = document.getElementById(‘role-’ + id);
if (el) {
el.addEventListener(‘change’, () => {
State.roles[id] = el.checked;
App.renderSummary();
});
}
});
},

startGame() {
// Collect names
const inputs = document.querySelectorAll(’.player-input’);
const names = Array.from(inputs).map((inp, i) => inp.value.trim() || `მოთამაშე ${i + 1}`);

```
// Build role pool
const pool = App.buildRolePool(names.length);
if (!pool) return;

// Shuffle and assign
const shuffled = App.shuffle([...pool]);
State.players = names.map((name, i) => ({
  name,
  role: shuffled[i],
  alive: true,
  seen: false
}));

State.seenCards.clear();
State.night = 0;
State.day = 0;
State.log = [];
State.nightResult = '';

App.goTo('screen-deal');
App.renderDeal();
```

},

buildRolePool(count) {
const pool = [];

```
// Mafia
if (State.roles.godfather) {
  pool.push('godfather');
  for (let i = 1; i < State.mafiaCount; i++) pool.push('mafia');
} else {
  for (let i = 0; i < State.mafiaCount; i++) pool.push('mafia');
}

// Town special
if (State.roles.detective) pool.push('detective');
if (State.roles.doctor) pool.push('doctor');
if (State.roles.bartender) pool.push('bartender');

// Neutral
if (State.roles.maniac) pool.push('maniac');

// Fill rest with citizens
while (pool.length < count) pool.push('citizen');

if (pool.length > count) {
  alert('ძალიან ბევრი სპეციალური როლია. შეამცირე.');
  return null;
}
return pool;
```

},

shuffle(arr) {
for (let i = arr.length - 1; i > 0; i–) {
const j = Math.floor(Math.random() * (i + 1));
[arr[i], arr[j]] = [arr[j], arr[i]];
}
return arr;
},

// ===== DEAL =====
renderDeal() {
const list = document.getElementById(‘deal-list’);
list.innerHTML = ‘’;
State.players.forEach((p, i) => {
const div = document.createElement(‘div’);
div.className = ‘deal-item’ + (State.seenCards.has(i) ? ’ seen’ : ‘’);
div.id = `deal-${i}`;
div.innerHTML = `<div> <div class="player-label">${p.name}</div> <div class="deal-status">${State.seenCards.has(i) ? '✓ ნახულია' : 'ჯერ არ უნახავს'}</div> </div> ${State.seenCards.has(i) ? '<button class="btn-sm done">✓</button>' :`<button class="btn-sm" onclick="App.showCard(${i})">ბარათის ნახვა</button>`}`;
list.appendChild(div);
});

```
const btn = document.getElementById('btn-night');
btn.disabled = State.seenCards.size < State.players.length;
```

},

showCard(i) {
const p = State.players[i];
const role = ROLES[p.role];
document.getElementById(‘card-player-name’).textContent = p.name;
document.getElementById(‘card-role-badge’).innerHTML = `<span style="font-size:3.5rem">${role.emoji}</span> <span class="role-badge-name" style="color:var(--${role.color === 'red' ? 'red-bright' : role.color})">${role.name}${role.subtitle ?` (${role.subtitle})`: ''}</span>`;
document.getElementById(‘card-role-desc’).textContent = role.desc;
document.getElementById(‘overlay-card’).classList.remove(‘hidden’);
App._currentCard = i;
},

closeCard() {
const i = App._currentCard;
State.seenCards.add(i);
document.getElementById(‘overlay-card’).classList.add(‘hidden’);
App.renderDeal();
},

goToNight() {
State.night++;
App.goTo(‘screen-night’);
App.renderNight();
},

// ===== NIGHT =====
renderNight() {
document.getElementById(‘night-num’).textContent = State.night;
const container = document.getElementById(‘night-phases’);
container.innerHTML = ‘’;
State.nightChoices = {};

```
const alive = State.players.filter(p => p.alive);

// Mafia phase
App.addPhase(container, 'mafia', '🔫 მაფია', 'ვინ მოკვდეს?', alive, 'mafia-target');

// Detective phase
if (State.players.some(p => p.alive && p.role === 'detective') && State.roles.detective) {
  App.addPhase(container, 'detective', '🔍 დეტექტივი', 'ვინ შეამოწმო?', alive, 'detective-target');
}

// Doctor phase
if (State.players.some(p => p.alive && (p.role === 'doctor')) && State.roles.doctor) {
  App.addPhase(container, 'doctor', '💊 ექიმი', 'ვინ განკურნო?', alive, 'doctor-target');
}

// Maniac phase
if (State.players.some(p => p.alive && p.role === 'maniac') && State.roles.maniac) {
  App.addPhase(container, 'maniac', '🗡 სერიული მკვლელი', 'ვინ მოკლა?', alive, 'maniac-target');
}

// Bartender phase
if (State.players.some(p => p.alive && p.role === 'bartender') && State.roles.bartender) {
  App.addPhase(container, 'bartender', '🍸 ბარმენი', 'ვის დაბლოკო?', alive, 'bartender-target');
}
```

},

addPhase(container, key, title, action, players, selId) {
const div = document.createElement(‘div’);
div.className = ‘phase-card’;
const opts = players.map(p => `<option value="${p.name}">${p.name}</option>`).join(’’);
div.innerHTML = `<div class="phase-role">${title}</div> <div class="phase-action">${action}</div> <select id="${selId}"> <option value="">— გამოტოვება —</option> ${opts} </select>`;
container.appendChild(div);
},

goToDay() {
// Process night
const mafiaTarget = document.getElementById(‘mafia-target’)?.value || ‘’;
const doctorTarget = document.getElementById(‘doctor-target’)?.value || ‘’;
const detectiveTarget = document.getElementById(‘detective-target’)?.value || ‘’;
const maniacTarget = document.getElementById(‘maniac-target’)?.value || ‘’;
const bartenderTarget = document.getElementById(‘bartender-target’)?.value || ‘’;

```
let results = [];

// Bartender blocks
const blocked = bartenderTarget;

// Mafia kills (unless doctor saved)
if (mafiaTarget && mafiaTarget !== doctorTarget) {
  const p = State.players.find(pl => pl.name === mafiaTarget && pl.alive);
  if (p && blocked !== p.name) {
    p.alive = false;
    results.push(`☠️ ${p.name} მოკლული იქნა ღამით.`);
  } else if (blocked === p?.name) {
    results.push(`🍸 ბარმენმა ვიღაც დაბლოკა.`);
  }
} else if (mafiaTarget && mafiaTarget === doctorTarget) {
  results.push(`💊 ექიმმა გადაარჩინა ${mafiaTarget}!`);
}

// Maniac kills
if (maniacTarget && maniacTarget !== doctorTarget) {
  const p = State.players.find(pl => pl.name === maniacTarget && pl.alive);
  if (p && blocked !== p.name) {
    p.alive = false;
    results.push(`🗡 ${p.name} სერიული მკვლელის მსხვერპლი გახდა.`);
  }
}

// Detective result (only show to detective player, here we show for game master)
if (detectiveTarget) {
  const p = State.players.find(pl => pl.name === detectiveTarget);
  if (p) {
    const isMafia = (p.role === 'mafia') || (p.role === 'godfather' ? false : p.role === 'mafia');
    // Godfather appears innocent
    const appears = (p.role === 'mafia') ? 'მაფია' : 'მოქალაქე';
    results.push(`🔍 დეტექტივს: ${detectiveTarget} — ${appears}`);
  }
}

if (results.length === 0) results.push('🌙 ღამე მშვიდად გავიდა.');

State.nightResult = results.join('\n');
State.day++;

App.goTo('screen-day');
App.renderDay();

// Check win
App.checkWin();
```

},

// ===== DAY =====
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
const selected = document.querySelector(‘input[name=“vote”]:checked’);
if (!selected) { alert(‘აირჩიე ვინმე.’); return; }
const name = selected.value;
const p = State.players.find(pl => pl.name === name);
if (p) {
p.alive = false;
const role = ROLES[p.role];
alert(`${name} განდევნილ იქნა!\nროლი: ${role.emoji} ${role.name}`);
}
App.checkWin();
},

skipVote() {
alert(‘კენჭისყრა გამოტოვებულია.’);
},

goToNight2() {
App.goToNight();
},

checkWin() {
const alive = State.players.filter(p => p.alive);
const aliveMafia = alive.filter(p => p.role === ‘mafia’ || p.role === ‘godfather’);
const aliveTown = alive.filter(p => p.role !== ‘mafia’ && p.role !== ‘godfather’ && p.role !== ‘maniac’);
const aliveManiac = alive.filter(p => p.role === ‘maniac’);

```
let winner = null;
let icon = '🎉';
let desc = '';

if (aliveMafia.length === 0 && aliveManiac.length === 0) {
  winner = 'მოქალაქეების გამარჯვება!';
  icon = '🏆';
  desc = 'ქალაქი გაიწმინდა. მოქალაქეებმა გაიმარჯვეს!';
} else if (aliveMafia.length >= aliveTown.length && aliveManiac.length === 0) {
  winner = 'მაფიის გამარჯვება!';
  icon = '🔫';
  desc = 'ქალაქი მაფიის ხელშია. სიბნელემ გაიმარჯვა.';
} else if (aliveManiac.length > 0 && alive.length <= 2) {
  winner = 'სერიული მკვლელის გამარჯვება!';
  icon = '🗡';
  desc = 'მარტოხელა მონადირე გამარჯვებულია.';
}

if (winner) {
  setTimeout(() => App.showEnd(winner, icon, desc), 800);
}
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
    <span class="dot ${role.color}"></span>
    <strong>${p.name}</strong>
    <span style="color:var(--text-dim)">${role.emoji} ${role.name}</span>
    <span style="margin-left:auto;font-size:0.8rem;color:${p.alive ? 'var(--green)' : '#e74c3c'}">${p.alive ? '✓ ცოცხალი' : '✗ მკვდარი'}</span>
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
App.syncRoleToggles();
App.renderSetup();
});

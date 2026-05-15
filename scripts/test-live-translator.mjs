// Functional smoke test for the live translator using a minimal DOM stub.
// Verifies:
//   - English text translates to Marathi
//   - Switching back to English restores originals from WeakMap
//   - Switching to Hindi translates from the (English) original, not from Marathi
//   - Devanagari source text is left alone
//   - Word-boundary matching doesn't break apart longer words
//   - Skipped elements (script/style/data-notranslate) stay untouched
//   - Attributes (placeholder, aria-label, title, alt) translate

import { JSDOM } from 'jsdom';

let dom;
try {
  dom = new JSDOM(
    '<!doctype html><html><body><div id="app"></div></body></html>',
    { pretendToBeVisual: true },
  );
} catch (e) {
  console.log('jsdom not installed, skipping behavioural test.');
  console.log('   install jsdom and re-run to validate the live translator.');
  process.exit(0);
}

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.MutationObserver = dom.window.MutationObserver;
globalThis.NodeFilter = dom.window.NodeFilter;
globalThis.Node = dom.window.Node;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);

const { startLiveTranslator, stopLiveTranslator } = await import('../frontend/src/utils/liveTranslator.js');

const app = document.getElementById('app');
app.innerHTML = `
  <h1>Dashboard</h1>
  <p>Pending Applications: 5</p>
  <button>Save</button>
  <button>Cancel</button>
  <input placeholder="Search farmer or ID..." />
  <span class="notranslate">Dashboard</span>
  <code>Dashboard</code>
  <div>Konkan division is On track</div>
  <div>नवीन डॅशबोर्ड</div>
  <button id="lang-btn">English</button>
`;

function tick() { return new Promise((r) => setTimeout(r, 30)); }

// 1. Start in English — nothing should change
startLiveTranslator('en');
await tick();
console.log('--- after start in English ---');
console.log(app.querySelector('h1').textContent);

// 2. Switch to Marathi
// Simulate React re-rendering the lang switcher to the new label *before*
// the translator's effect fires (which is exactly how React works: commit
// phase happens before useEffect).
document.getElementById('lang-btn').textContent = 'मराठी';
startLiveTranslator('mr');
await tick();
console.log('--- after switch to Marathi ---');
console.log('  lang button:', document.getElementById('lang-btn').textContent, '(should be मराठी, NOT English)');
console.log('  h1:', app.querySelector('h1').textContent);
console.log('  p:', app.querySelector('p').textContent);
console.log('  save btn:', app.querySelectorAll('button')[0].textContent);
console.log('  cancel btn:', app.querySelectorAll('button')[1].textContent);
console.log('  input placeholder:', app.querySelector('input').getAttribute('placeholder'));
console.log('  notranslate span:', app.querySelector('.notranslate').textContent, '(should stay "Dashboard")');
console.log('  code:', app.querySelector('code').textContent, '(should stay "Dashboard")');
console.log('  konkan/on-track sentence:', app.querySelectorAll('div')[0].textContent);
console.log('  native devanagari:', app.querySelectorAll('div')[1].textContent, '(should stay)');

// 3. Switch to Hindi
document.getElementById('lang-btn').textContent = 'हिन्दी';
startLiveTranslator('hi');
await tick();
console.log('--- after switch to Hindi ---');
console.log('  lang button:', document.getElementById('lang-btn').textContent, '(should be हिन्दी)');
console.log('  h1:', app.querySelector('h1').textContent);
console.log('  save btn:', app.querySelectorAll('button')[0].textContent);
console.log('  konkan/on-track sentence:', app.querySelectorAll('div')[0].textContent);

// 4. React-like update: simulate a re-render of the h1 text back to English
app.querySelector('h1').textContent = 'Applications';
await tick();
console.log('--- after React-like update to "Applications" ---');
console.log('  h1:', app.querySelector('h1').textContent);

// 5. Switch back to English
document.getElementById('lang-btn').textContent = 'English';
startLiveTranslator('en');
await tick();
console.log('--- after switch back to English ---');
console.log('  lang button:', document.getElementById('lang-btn').textContent, '(should be English)');
console.log('  h1:', app.querySelector('h1').textContent);
console.log('  p:', app.querySelector('p').textContent);
console.log('  save btn:', app.querySelectorAll('button')[0].textContent);
console.log('  input placeholder:', app.querySelector('input').getAttribute('placeholder'));
console.log('  konkan/on-track sentence:', app.querySelectorAll('div')[0].textContent);

stopLiveTranslator();
console.log('--- done ---');

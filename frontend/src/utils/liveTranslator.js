// =========================================================
// Krishi Prabandh - Live DOM Translator
// =========================================================
//
// Walks the rendered DOM and translates English text into the
// currently selected language (mr/hi) using the dictionary in
// `translations.js`. Re-runs automatically when React mutates
// the tree (via MutationObserver) so dynamic content, mock data,
// API responses, third-party widgets, etc. are all covered.
//
// Safety guarantees:
//   - Always preserves the *original* English text of each node
//     in a WeakMap; switching languages re-translates from the
//     original, never from a previously-translated string.
//   - Disconnects the MutationObserver around its own writes so
//     it never reacts to its own DOM changes (no feedback loop).
//   - Skips <script>, <style>, <code>, <pre>, <textarea>, <input>
//     value content, and anything marked `data-notranslate` or
//     class `notranslate`.
//   - Uses word-boundary regex matching on English keys so we
//     don't break apart longer phrases (e.g. translating "App"
//     inside "Application").
//   - rAF-debounced so a burst of React renders coalesces into a
//     single pass.

import { translations } from './translations';

const ORIGINAL_TEXT = new WeakMap();
const LAST_WRITE_TEXT = new WeakMap();
const ORIGINAL_ATTRS = new WeakMap();
const LAST_WRITE_ATTRS = new WeakMap();

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'CODE',
  'PRE',
  'TEXTAREA',
  'KBD',
  'SAMP',
  'VAR',
]);

const ATTR_TARGETS = ['placeholder', 'aria-label', 'title', 'alt'];
const OBSERVER_CONFIG = {
  subtree: true,
  childList: true,
  characterData: true,
  attributes: true,
  attributeFilter: ATTR_TARGETS,
};

const DEVANAGARI_RE = /[\u0900-\u097F]/;
const HAS_LETTER_RE = /[A-Za-z]/;
const TEMPLATE_RE = /\{[^}]+\}/;

let observer = null;
let currentLang = 'en';
let translationRegex = null;
let translationMap = null;
let pendingPass = false;
let dirtyRoots = new Set();

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildIndex(lang) {
  if (lang === 'en') {
    translationMap = null;
    translationRegex = null;
    return;
  }
  const map = new Map();
  for (const [en, entry] of Object.entries(translations)) {
    if (!entry || typeof entry !== 'object') continue;
    if (TEMPLATE_RE.test(en)) continue;
    const target = entry[lang];
    if (!target || target === en) continue;
    if (TEMPLATE_RE.test(target)) continue;
    map.set(en, target);
  }
  const keys = [...map.keys()].sort((a, b) => b.length - a.length);
  if (keys.length === 0) {
    translationMap = null;
    translationRegex = null;
    return;
  }
  const parts = keys.map((k) => {
    const startBoundary = /^[A-Za-z0-9]/.test(k) ? '\\b' : '';
    const endBoundary = /[A-Za-z0-9]$/.test(k) ? '\\b' : '';
    return `${startBoundary}${escapeRegex(k)}${endBoundary}`;
  });
  translationMap = map;
  translationRegex = new RegExp(`(?:${parts.join('|')})`, 'g');
}

function translateString(original) {
  if (!original) return original;
  if (!translationRegex || !translationMap) return original;
  if (!HAS_LETTER_RE.test(original)) return original;
  let touched = false;
  const out = original.replace(translationRegex, (match) => {
    const t = translationMap.get(match);
    if (t === undefined) return match;
    touched = true;
    return t;
  });
  return touched ? out : original;
}

function isInsideSkippedTree(node) {
  let p = node.nodeType === 1 ? node : node.parentNode;
  while (p && p.nodeType === 1) {
    const tag = p.tagName;
    if (SKIP_TAGS.has(tag)) return true;
    if (p.hasAttribute && p.hasAttribute('data-notranslate')) return true;
    if (p.classList && p.classList.contains('notranslate')) return true;
    if (p.getAttribute && p.getAttribute('translate') === 'no') return true;
    p = p.parentNode;
  }
  return false;
}

function processTextNode(node /* fromMutation kept for signature parity */) {
  if (!node || node.nodeType !== 3) return;
  if (!node.parentNode) return;
  if (isInsideSkippedTree(node)) return;

  const current = node.nodeValue;
  if (!current || !current.trim()) return;

  // Reconcile against React.
  //
  // We track our own last write per node in LAST_WRITE_TEXT. If the current
  // DOM text matches what we last wrote, the stored "original" is still the
  // authoritative source-of-truth English (React hasn't touched it).
  //
  // If the current text DOESN'T match our last write, React (or some other
  // owner) has put a fresh value there — adopt it as the new original.
  // This is critical for components like the language switcher that
  // intentionally render Devanagari labels per the chosen language: we treat
  // their native text as the new authoritative original and avoid clobbering
  // it on subsequent passes.
  const ourLastWrite = LAST_WRITE_TEXT.get(node);
  if (current !== ourLastWrite) {
    ORIGINAL_TEXT.set(node, current);
  }
  const original = ORIGINAL_TEXT.get(node) || current;

  let next;
  if (currentLang === 'en' || !translationMap) {
    next = original;
  } else {
    next = translateString(original);
  }
  if (next !== node.nodeValue) {
    node.nodeValue = next;
    LAST_WRITE_TEXT.set(node, next);
  } else {
    // Mark current value as "ours" so a subsequent identical pass doesn't
    // mistakenly re-adopt our own output as a new original.
    LAST_WRITE_TEXT.set(node, current);
  }
}

function processElementAttrs(el) {
  if (!el || el.nodeType !== 1) return;
  if (isInsideSkippedTree(el)) return;

  for (const attr of ATTR_TARGETS) {
    if (!el.hasAttribute(attr)) continue;
    const current = el.getAttribute(attr);

    let originals = ORIGINAL_ATTRS.get(el);
    if (!originals) {
      originals = {};
      ORIGINAL_ATTRS.set(el, originals);
    }
    let lastWrites = LAST_WRITE_ATTRS.get(el);
    if (!lastWrites) {
      lastWrites = {};
      LAST_WRITE_ATTRS.set(el, lastWrites);
    }

    // Same reconciliation logic as for text nodes: trust the current DOM
    // value as the new original whenever it doesn't match what we last wrote.
    if (current !== lastWrites[attr]) {
      originals[attr] = current;
    }
    const original = originals[attr];

    let next;
    if (currentLang === 'en' || !translationMap) {
      next = original;
    } else {
      next = translateString(original);
    }
    if (next !== current) {
      el.setAttribute(attr, next);
      lastWrites[attr] = next;
    } else {
      lastWrites[attr] = current;
    }
  }
}

function walkAndTranslate(root) {
  if (!root) return;
  if (root.nodeType === 3) {
    processTextNode(root);
    return;
  }
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1 && isInsideSkippedTree(root)) return;

  if (root.nodeType === 1) {
    processElementAttrs(root);
  }

  // Walk text descendants
  const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      return isInsideSkippedTree(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });
  let n;
  while ((n = textWalker.nextNode())) {
    processTextNode(n);
  }

  // Walk element descendants for attribute translation
  const elWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(el) {
      return isInsideSkippedTree(el) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });
  let el;
  while ((el = elWalker.nextNode())) {
    processElementAttrs(el);
  }
}

function flushPending() {
  pendingPass = false;
  if (!observer) {
    dirtyRoots.clear();
    return;
  }
  const targets = dirtyRoots;
  dirtyRoots = new Set();

  observer.disconnect();
  try {
    for (const node of targets) {
      if (!node) continue;
      if (node.nodeType === 3) {
        processTextNode(node);
      } else if (node.nodeType === 1) {
        // For a mutated element, re-walk its subtree.
        walkAndTranslate(node);
      }
    }
  } finally {
    // Discard any mutations we just generated, then resume observing.
    observer.takeRecords();
    observer.observe(document.body, OBSERVER_CONFIG);
  }
}

function schedulePass() {
  if (pendingPass) return;
  pendingPass = true;
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(flushPending);
  } else {
    setTimeout(flushPending, 16);
  }
}

function handleMutations(mutations) {
  for (const m of mutations) {
    if (m.type === 'childList') {
      m.addedNodes.forEach((n) => dirtyRoots.add(n));
    } else if (m.type === 'characterData') {
      dirtyRoots.add(m.target);
    } else if (m.type === 'attributes') {
      dirtyRoots.add(m.target);
    }
  }
  if (dirtyRoots.size > 0) schedulePass();
}

function fullRetranslate() {
  if (typeof document === 'undefined' || !document.body) return;
  if (observer) observer.disconnect();
  try {
    walkAndTranslate(document.body);
  } finally {
    if (observer) {
      observer.takeRecords();
      observer.observe(document.body, OBSERVER_CONFIG);
    }
  }
}

export function startLiveTranslator(lang) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  currentLang = lang || 'en';
  buildIndex(currentLang);

  // Initial pass before installing observer
  fullRetranslate();

  if (!observer) {
    observer = new MutationObserver(handleMutations);
    if (document.body) {
      observer.observe(document.body, OBSERVER_CONFIG);
    }
  }
}

export function switchLiveTranslator(lang) {
  currentLang = lang || 'en';
  buildIndex(currentLang);
  fullRetranslate();
}

export function stopLiveTranslator() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  dirtyRoots.clear();
  pendingPass = false;
}

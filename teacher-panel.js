// ─── Mission Academy Teacher Panel ───────────────────────────────────────
// Activated by typing "dev" anywhere on the page (not in an input field).
// Reads/writes config.js via GitHub API.

(function() {
  'use strict';

  const GITHUB_REPO  = 'wpr-creator/2nd';
  const CONFIG_PATH  = 'config.js';
  const PANEL_ID     = 'teacherPanel';
  const TOKEN_KEY    = 'ma_teacher_github_token';

  // ── Section definitions ─────────────────────────────────────────────────
  const SUBJECTS = [
    {
      key: 'math_open_sections',
      label: '➕ Math',
      color: '#34d399',
      totalSections: 6,
      sections: [
        'Missions 1–5: Addition & Subtraction Within 20',
        'Missions 6–10: Skip Counting, Even/Odd, Word Problems',
        'Missions 11–15: Place Value & Word Problems',
        'Missions 16–20: Comparing Numbers',
        'Missions 21–25: Regrouping',
        'Missions 26–30: Mixed Review',
      ]
    },
    {
      key: 'ela_open_sections',
      label: '📖 ELA',
      color: '#f472b6',
      totalSections: 12,
      sections: [
        'Missions 1–5: Common, Proper & Plural Nouns',
        'Missions 6–11: Possessive & Irregular Plural Nouns',
        'Missions 12–15: Pronouns, Subject & Predicate',
        'Missions 16–20: Action Verbs & Verb Tense',
        'Missions 21–25: Subject–Verb Agreement',
        'Missions 26–30: Adjectives, Adverbs & Comparatives',
        'Missions 31–35: Sentence Types',
        'Missions 36–40: ELA Review I',
        'Missions 41–45: Contractions',
        'Missions 46–50: Compound Words, Prefixes & Suffixes',
        'Missions 51–55: Synonyms & Antonyms',
        'Missions 56–60: ELA Review II',
      ]
    },
    {
      key: 'reading_open_sections',
      label: '📚 Reading',
      color: '#a78bfa',
      totalSections: 4,
      sections: [
        'Passages 1–5: Stories & Narratives',
        'Passages 6–10: More Stories',
        'Passages 11–15: Informational Texts',
        'Passages 16–20: More Informational Texts',
      ]
    },
    {
      key: 'spelling_open_sections',
      label: '🔤 Spelling',
      color: '#fb923c',
      totalSections: 4,
      sections: [
        'Missions 1–5: CVC, Long Vowels, Blends, Doubles, Word Families',
        'Missions 6–10: Compound Words, Endings, Sight Words',
        'Missions 11–15: Animals, Nature, Food, School, Verbs',
        'Missions 16–20: Comparing, Contractions, Feelings, Challenges',
      ]
    },
  ];

  // ── Key sequence detector ───────────────────────────────────────────────
  let keyBuffer = '';
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    keyBuffer += e.key.toLowerCase();
    if (keyBuffer.length > 5) keyBuffer = keyBuffer.slice(-5);
    if (keyBuffer.includes('dev')) {
      keyBuffer = '';
      togglePanel();
    }
  });

  // ── Current config state ────────────────────────────────────────────────
  let draft = {};

  function getConfig() {
    const cfg = window.SITE_CONFIG || {};
    return {
      math_open_sections:     cfg.math_open_sections     ?? 1,
      ela_open_sections:      cfg.ela_open_sections      ?? 1,
      reading_open_sections:  cfg.reading_open_sections  ?? 1,
      spelling_open_sections: cfg.spelling_open_sections ?? 1,
    };
  }

  // ── Build panel HTML ────────────────────────────────────────────────────
  function buildPanel() {
    if (document.getElementById(PANEL_ID)) return;

    const overlay = document.createElement('div');
    overlay.id = PANEL_ID;
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99999;
      display:flex;align-items:center;justify-content:center;
      background:rgba(10,8,40,0.88);backdrop-filter:blur(10px);
      font-family:'Space Grotesk',sans-serif;
    `;
    overlay.innerHTML = `
      <div id="tpBox" style="
        background:linear-gradient(160deg,#1e1b4b,#2d2a6e);
        border:1px solid rgba(255,255,255,0.15);
        border-radius:22px;width:100%;max-width:680px;
        max-height:90vh;overflow-y:auto;
        box-shadow:0 30px 80px rgba(0,0,0,0.6);
        color:#f8f9ff;
      ">
        <!-- Header -->
        <div style="
          display:flex;align-items:center;gap:14px;
          padding:22px 28px 18px;
          border-bottom:1px solid rgba(255,255,255,0.1);
        ">
          <div style="
            width:44px;height:44px;border-radius:12px;
            background:linear-gradient(135deg,#fbbf24,#f59e0b);
            display:flex;align-items:center;justify-content:center;font-size:1.4rem;
          ">⚙️</div>
          <div>
            <div style="font-size:1.1rem;font-weight:700;">Teacher Control Panel</div>
            <div style="font-size:0.78rem;color:#c4b5fd;">Mission Academy · 2nd Grade · Type "dev" to open/close</div>
          </div>
          <button onclick="document.getElementById('${PANEL_ID}').remove()" style="
            margin-left:auto;background:rgba(255,255,255,0.1);border:none;
            border-radius:50%;width:34px;height:34px;color:#c4b5fd;
            cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;
          ">✕</button>
        </div>

        <!-- Body -->
        <div style="padding:24px 28px;">
          <div style="font-size:0.72rem;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#7c6fb0;margin-bottom:16px;">
            UNLOCK SECTIONS — click a section row to toggle open/locked
          </div>
          <div id="tpSections"></div>

          <!-- Status message -->
          <div id="tpStatus" style="
            min-height:28px;font-size:0.85rem;font-weight:600;
            margin-top:16px;text-align:center;
          "></div>
        </div>

        <!-- Footer -->
        <div style="
          padding:18px 28px 24px;
          border-top:1px solid rgba(255,255,255,0.1);
          display:flex;flex-direction:column;gap:12px;
        ">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="font-size:0.72rem;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#7c6fb0;white-space:nowrap;">
              GITHUB TOKEN
            </div>
            <input id="tpToken" type="password" placeholder="ghp_xxxxxxxxxxxx"
              style="
                flex:1;background:rgba(255,255,255,0.07);
                border:1.5px solid rgba(255,255,255,0.15);border-radius:10px;
                padding:10px 14px;color:#f8f9ff;font-family:monospace;font-size:0.85rem;
                outline:none;
              "
            />
            <a href="https://github.com/settings/tokens/new?scopes=repo&description=MissionAcademy" target="_blank"
              style="font-size:0.78rem;color:#a78bfa;white-space:nowrap;text-decoration:none;">
              Generate token ↗
            </a>
          </div>
          <div style="display:flex;gap:10px;">
            <button id="tpPreview" onclick="previewConfig()" style="
              flex:1;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);
              border-radius:10px;padding:12px;color:#f8f9ff;
              font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:0.88rem;cursor:pointer;
            ">👁 Preview</button>
            <button id="tpDownload" onclick="downloadConfig()" style="
              flex:1;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);
              border-radius:10px;padding:12px;color:#f8f9ff;
              font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:0.88rem;cursor:pointer;
            ">⬇ Download</button>
            <button id="tpPublish" onclick="publishConfig()" style="
              flex:2;background:linear-gradient(135deg,#fbbf24,#f59e0b);
              border:none;border-radius:10px;padding:12px;color:#1e1b4b;
              font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.88rem;cursor:pointer;
            ">🚀 Publish to GitHub</button>
          </div>
          <div style="font-size:0.72rem;color:#7c6fb0;text-align:center;">
            Publish pushes directly to GitHub Pages. Download saves the file to drag in manually.
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close on overlay click (not box click)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Load saved token
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) document.getElementById('tpToken').value = saved;

    // Save token on change
    document.getElementById('tpToken').addEventListener('change', (e) => {
      localStorage.setItem(TOKEN_KEY, e.target.value);
    });

    // Render sections
    draft = getConfig();
    renderSections();
  }

  // ── Render section toggles ──────────────────────────────────────────────
  function renderSections() {
    const container = document.getElementById('tpSections');
    if (!container) return;
    container.innerHTML = '';

    SUBJECTS.forEach(subj => {
      const openCount = draft[subj.key] || 0;

      const block = document.createElement('div');
      block.style.cssText = 'margin-bottom:20px;';
      block.innerHTML = `
        <div style="
          display:flex;align-items:center;gap:10px;margin-bottom:10px;
        ">
          <span style="font-size:0.78rem;font-weight:700;color:${subj.color};">${subj.label}</span>
          <span style="font-size:0.72rem;color:#7c6fb0;">
            ${openCount === 0 ? 'All locked' : openCount === subj.totalSections ? 'All open' : `${openCount} of ${subj.totalSections} sections open`}
          </span>
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.08);"></div>
          <button onclick="setAll('${subj.key}',${subj.totalSections})" style="
            background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.3);
            border-radius:6px;padding:4px 10px;color:#34d399;
            font-family:'Space Grotesk',sans-serif;font-size:0.7rem;font-weight:600;cursor:pointer;
          ">Open All</button>
          <button onclick="setAll('${subj.key}',0)" style="
            background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.25);
            border-radius:6px;padding:4px 10px;color:#f87171;
            font-family:'Space Grotesk',sans-serif;font-size:0.7rem;font-weight:600;cursor:pointer;
          ">Lock All</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;" id="rows_${subj.key}"></div>
      `;
      container.appendChild(block);

      const rowsEl = document.getElementById(`rows_${subj.key}`);
      subj.sections.forEach((label, i) => {
        const sectionNum = i + 1;
        const isOpen = sectionNum <= openCount;
        const row = document.createElement('div');
        row.id = `row_${subj.key}_${sectionNum}`;
        row.style.cssText = `
          display:flex;align-items:center;gap:12px;
          padding:10px 14px;border-radius:10px;cursor:pointer;
          transition:all 0.15s;
          background:${isOpen ? `rgba(${hexToRgb(subj.color)},0.12)` : 'rgba(255,255,255,0.04)'};
          border:1px solid ${isOpen ? `rgba(${hexToRgb(subj.color)},0.3)` : 'rgba(255,255,255,0.08)'};
        `;
        row.onclick = () => toggleSection(subj.key, sectionNum);
        row.innerHTML = `
          <div style="
            width:22px;height:22px;border-radius:6px;flex-shrink:0;
            display:flex;align-items:center;justify-content:center;font-size:0.85rem;
            background:${isOpen ? subj.color : 'rgba(255,255,255,0.08)'};
            color:${isOpen ? '#1e1b4b' : '#7c6fb0'};
            transition:all 0.15s;
          ">${isOpen ? '✓' : sectionNum}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.82rem;font-weight:600;color:${isOpen ? '#f8f9ff' : '#7c6fb0'};">${label}</div>
          </div>
          <div style="
            font-size:0.72rem;font-weight:700;
            color:${isOpen ? '#34d399' : '#f87171'};
            flex-shrink:0;
          ">${isOpen ? 'OPEN' : 'LOCKED'}</div>
        `;
        rowsEl.appendChild(row);
      });
    });
  }

  function hexToRgb(hex) {
    // Handle named/variable colors - return fallback
    if (!hex.startsWith('#')) return '255,255,255';
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  function toggleSection(key, sectionNum) {
    const subj = SUBJECTS.find(s => s.key === key);
    if (!subj) return;
    const current = draft[key] || 0;
    // If clicking already-open last section, close it; otherwise open through this section
    if (sectionNum === current) {
      draft[key] = sectionNum - 1;
    } else {
      draft[key] = sectionNum;
    }
    renderSections();
    setStatus('');
  }

  function setAll(key, count) {
    draft[key] = count;
    renderSections();
    setStatus('');
  }

  // ── Generate config file content ────────────────────────────────────────
  function generateConfigContent() {
    const today = new Date().toISOString().split('T')[0];
    return `// ─── Mission Academy — Section Unlock Config ──────────────────────────────
// This file is managed by the Teacher Panel (type "dev" on any page).
// Do not edit manually unless you know what you're doing.
//
// Each number = how many sections are unlocked for that subject.
// Set to 0 to lock everything. Set to max to open everything.
//
// Math:     6 sections  (1-5, 6-10, 11-15, 16-20, 21-25, 26-30)
// ELA:     12 sections  (1-5, 6-11, 12-15, 16-20, 21-25, 26-30, 31-35, 36-40, 41-45, 46-50, 51-55, 56-60)
// Reading:  4 sections  (1-5, 6-10, 11-15, 16-20)
// Spelling: 4 sections  (1-5, 6-10, 11-15, 16-20)

window.SITE_CONFIG = {
  math_open_sections:     ${draft.math_open_sections},
  ela_open_sections:      ${draft.ela_open_sections},
  reading_open_sections:  ${draft.reading_open_sections},
  spelling_open_sections: ${draft.spelling_open_sections},
  updated: "${today}"
};
`;
  }

  // ── Preview ─────────────────────────────────────────────────────────────
  function previewConfig() {
    const content = generateConfigContent();
    const win = window.open('', '_blank');
    win.document.write(`<pre style="font-family:monospace;font-size:14px;padding:20px;background:#1e1b4b;color:#f8f9ff;">${content}</pre>`);
  }
  window.previewConfig = previewConfig;

  // ── Download ─────────────────────────────────────────────────────────────
  function downloadConfig() {
    const content = generateConfigContent();
    const blob = new Blob([content], {type: 'text/javascript'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'config.js';
    a.click();
    setStatus('✓ Downloaded! Drag config.js into your GitHub repo.', '#34d399');
  }
  window.downloadConfig = downloadConfig;

  // ── Publish to GitHub ───────────────────────────────────────────────────
  async function publishConfig() {
    const token = document.getElementById('tpToken')?.value?.trim();
    if (!token) {
      setStatus('⚠ Please enter your GitHub token first.', '#f87171');
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);

    const btn = document.getElementById('tpPublish');
    btn.textContent = '⏳ Publishing...';
    btn.disabled = true;

    try {
      // 1. Get current file SHA
      const getRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${CONFIG_PATH}`,
        { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
      );

      let sha = null;
      if (getRes.ok) {
        const data = await getRes.json();
        sha = data.sha;
      } else if (getRes.status !== 404) {
        throw new Error(`GitHub API error: ${getRes.status}`);
      }

      // 2. Push new content
      const content = generateConfigContent();
      const encoded = btoa(unescape(encodeURIComponent(content)));
      const today = new Date().toISOString().split('T')[0];

      const putBody = {
        message: `Teacher panel: update section unlocks (${today})`,
        content: encoded,
        ...(sha ? { sha } : {})
      };

      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${CONFIG_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(putBody)
        }
      );

      if (!putRes.ok) {
        const err = await putRes.json();
        throw new Error(err.message || `Push failed: ${putRes.status}`);
      }

      // 3. Update local config immediately so page reflects changes
      window.SITE_CONFIG = {
        math_open_sections:     draft.math_open_sections,
        ela_open_sections:      draft.ela_open_sections,
        reading_open_sections:  draft.reading_open_sections,
        spelling_open_sections: draft.spelling_open_sections,
        updated: today
      };

      setStatus('✅ Published! Students will see changes on next page reload.', '#34d399');
      btn.textContent = '✅ Published!';
      setTimeout(() => { btn.textContent = '🚀 Publish to GitHub'; btn.disabled = false; }, 3000);

    } catch (err) {
      setStatus(`❌ ${err.message}`, '#f87171');
      btn.textContent = '🚀 Publish to GitHub';
      btn.disabled = false;
    }
  }
  window.publishConfig = publishConfig;

  function setStatus(msg, color = '#c4b5fd') {
    const el = document.getElementById('tpStatus');
    if (el) { el.textContent = msg; el.style.color = color; }
  }

  // ── Toggle section helper (called from HTML onclick) ────────────────────
  window.toggleSection = toggleSection;
  window.setAll = setAll;

  function togglePanel() {
    const existing = document.getElementById(PANEL_ID);
    if (existing) { existing.remove(); return; }
    buildPanel();
  }

  // ── Export for direct call ──────────────────────────────────────────────
  window.openTeacherPanel = togglePanel;

})();

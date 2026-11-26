// 由 scripts/build.mjs 生成，请修改 src/ 下的源码后运行 npm run build。
window.__ModuleLoader__.load({
  id: 'dsh-drama-board',
  factory(require) {
    const VERSION = "0.4.0"
    const CSS = `/* 映序 Studio
   两种表面：浅色的「稿纸」用来写字，深色的「监视器」专门放画面。
   所有图像都在 9:16 的监视器画框里出现，不随主题变色。 */

.db-root {
  --bg: #eceef2; --panel: rgba(255, 255, 255, .58); --surface: #fff; --raised: #f3f4f7; --sunken: #e5e7ed;
  --ink: #14171f; --ink-2: #3b4252; --muted: #687083; --line: rgba(18, 28, 45, .1); --line-2: rgba(18, 28, 45, .19);
  --accent: #0a7cff; --accent-ink: #0562cf; --accent-soft: rgba(10, 124, 255, .1); --on-accent: #fff;
  --rec: #e8323d; --rec-soft: rgba(232, 50, 61, .1); --ok: #17854a; --ok-soft: rgba(23, 133, 74, .11); --warn: #9a6205; --warn-soft: rgba(196, 128, 12, .13);
  --screen: #0d1016; --screen-2: #1a1f2a; --screen-line: rgba(255, 255, 255, .14); --screen-ink: #eef1f7; --screen-muted: #8e98ac;
  --display: "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", serif;
  --mono: ui-monospace, "SF Mono", Menlo, monospace;
  --shadow: 0 1px 2px rgba(15, 23, 42, .05), 0 10px 30px -18px rgba(15, 23, 42, .28);
  --dsw-alias-label-primary: var(--ink); --dsw-alias-label-secondary: var(--muted);
  position: relative; display: flex; height: 100%; min-height: 0; overflow: hidden; isolation: isolate;
  color: var(--ink); background: var(--bg);
  font: 14px/1.55 -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; text-align: left;
}
.db-root[data-theme=dark] {
  --bg: #0d1015; --panel: rgba(20, 24, 31, .66); --surface: #161a22; --raised: #1e232d; --sunken: #11141a;
  --ink: #eef1f6; --ink-2: #c5ccd9; --muted: #8f99ab; --line: rgba(255, 255, 255, .09); --line-2: rgba(255, 255, 255, .18);
  --accent: #3d9bff; --accent-ink: #7cbcff; --accent-soft: rgba(61, 155, 255, .15);
  --rec: #ff565f; --rec-soft: rgba(255, 86, 95, .15); --ok: #4cc38a; --ok-soft: rgba(76, 195, 138, .14); --warn: #e3a643; --warn-soft: rgba(227, 166, 67, .14);
  --screen: #07090c; --screen-2: #151922;
  --shadow: 0 1px 2px rgba(0, 0, 0, .3), 0 14px 34px -20px rgba(0, 0, 0, .7);
}
.db-root *, .db-root *::before, .db-root *::after { box-sizing: border-box; }
/* 重置一律用 :where 包住，权重不高于后面的组件类。 */
.db-root :where(h1, h2, h3, p, ol, ul, figure) { margin: 0; padding: 0; }
.db-root :where(ol, ul) { list-style: none; }
.db-root :where(button, input, textarea, select) { font: inherit; color: inherit; margin: 0; }
.db-root :where(button) { cursor: pointer; background: none; border: 0; padding: 0; text-align: inherit; }
.db-root :where(button):disabled { cursor: not-allowed; opacity: .45; }
.db-root :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.db-root :where(fieldset) { border: 0; margin: 0; padding: 0; min-width: 0; }
.db-root :where(img, video) { display: block; max-width: 100%; }
.db-icon { flex: none; }
.db-grow { flex: 1 1 0; min-width: 0; }
.db-muted { color: var(--muted); font-size: 13px; }
.db-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.db-row.tight { gap: 6px; }
.db-row.end { justify-content: flex-end; }
.db-stack { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
.db-two { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr); gap: 18px; align-items: start; }

/* 侧栏 */
.db-side { width: 218px; flex: none; display: flex; flex-direction: column; gap: 4px; padding: 20px 12px 12px; background: var(--panel); border-right: 1px solid var(--line); backdrop-filter: blur(24px) saturate(140%); -webkit-backdrop-filter: blur(24px) saturate(140%); min-height: 0; }
.db-brand { display: flex; align-items: center; gap: 11px; padding: 2px 8px 18px; }
.db-brand strong { display: block; font: 700 21px/1.1 var(--display); letter-spacing: .04em; }
.db-brand small { display: block; margin-top: 3px; font-size: 11px; color: var(--muted); }
/* 品牌标记：两张错开的竖屏画幅，颜色取自抖音的青与红。 */
.db-brand-mark { position: relative; width: 34px; height: 38px; flex: none; border-radius: 9px; background: #10131a; overflow: hidden; }
.db-brand-mark i { position: absolute; left: 11px; top: 8px; width: 12px; height: 21px; border-radius: 3px; mix-blend-mode: screen; }
.db-brand-mark i:first-child { background: #25f4ee; transform: translate(-2.5px, -1.5px); }
.db-brand-mark i:last-child { background: #fe2c55; transform: translate(2.5px, 1.5px); }
.db-nav { display: flex; flex-direction: column; gap: 2px; }
.db-nav.tools { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--line); }
.db-nav button { display: flex; align-items: center; gap: 11px; height: 36px; padding: 0 10px; border-radius: 10px; color: var(--ink-2); font-size: 14px; }
.db-nav button:hover { background: var(--line); }
.db-nav button[aria-current=page] { background: var(--surface); color: var(--accent-ink); font-weight: 600; box-shadow: var(--shadow); }
.db-nav button small { margin-left: auto; font-size: 11px; font-weight: 400; color: var(--muted); }
.db-side-projects { margin-top: 12px; padding-top: 8px; border-top: 1px solid var(--line); display: flex; flex-direction: column; min-height: 0; flex: 1; }
.db-side-label { display: flex; align-items: center; justify-content: space-between; padding: 0 2px 4px 10px; font-size: 12px; color: var(--muted); }
.db-search { display: flex; align-items: center; gap: 7px; margin: 0 2px 6px; padding: 0 9px; height: 30px; border-radius: 8px; background: var(--line); color: var(--muted); }
.db-search input { border: 0; outline: 0; background: none; width: 100%; min-width: 0; font-size: 13px; color: var(--ink); }
.db-project-list { display: flex; flex-direction: column; gap: 2px; overflow: auto; min-height: 0; }
.db-project { display: flex; align-items: center; gap: 9px; padding: 5px 8px; border-radius: 9px; font-size: 13px; color: var(--ink-2); min-width: 0; }
.db-project:hover { background: var(--line); }
.db-project[aria-current] { background: var(--surface); color: var(--ink); font-weight: 600; }
.db-project img, .db-project i { width: 20px; height: 28px; flex: none; border-radius: 4px; object-fit: cover; background: var(--screen); color: var(--screen-muted); display: grid; place-items: center; font: 600 11px/1 var(--display); font-style: normal; }
.db-project span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.db-model { display: flex; align-items: center; gap: 8px; margin-top: 8px; padding: 9px 10px; border-radius: 10px; background: var(--surface); font-size: 12px; color: var(--ink-2); box-shadow: var(--shadow); }
.db-model span:nth-child(2) { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.db-dot { width: 7px; height: 7px; flex: none; border-radius: 50%; background: var(--line-2); }
.db-dot.ok { background: var(--ok); }
.db-dot.part { background: #e0a13a; }
.db-dot.rec { background: var(--rec); }

/* 顶栏与内容区 */
.db-main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; position: relative; }
.db-top { height: 62px; flex: none; display: flex; align-items: center; gap: 10px; padding: 0 28px; border-bottom: 1px solid var(--line); }
.db-top-title { min-width: 0; }
.db-top-title h1 { font-size: 19px; line-height: 1.25; font-weight: 650; letter-spacing: -.01em; }
.db-top-title p { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 46vw; }
.db-save { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--muted); white-space: nowrap; }
.db-save.err { color: var(--rec); }
.db-busy { display: flex; align-items: center; gap: 10px; padding: 9px 28px; background: var(--accent-soft); color: var(--accent-ink); font-size: 13px; border-bottom: 1px solid var(--line); }
.db-busy span:nth-child(2) { flex: 1; }
.db-busy.warn { background: var(--warn-soft); color: var(--warn); }
.db-scroll { position: relative; flex: 1; min-height: 0; overflow: auto; scrollbar-gutter: stable; }
.db-page { max-width: 1440px; margin: 0 auto; padding: 24px 28px 40px; animation: db-page-in .22s ease-out; }
.db-page.locked { opacity: .7; }
.db-scroll.fill { overflow: hidden; }
.db-scroll.fill .db-page { max-width: none; height: 100%; padding: 0; }
.db-boot { flex: 1; padding: 40px; max-width: 900px; margin: 0 auto; }
.db-skel { height: 150px; border-radius: 18px; background: linear-gradient(100deg, var(--sunken) 30%, var(--raised) 50%, var(--sunken) 70%); background-size: 300% 100%; animation: db-sweep 1.6s linear infinite; margin-bottom: 16px; }
.db-skel.tall { height: 300px; }

/* 按钮与表单 */
.db-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 36px; padding: 0 14px; border-radius: 10px; border: 1px solid var(--line-2) !important; background: var(--surface) !important; color: var(--ink); font-size: 14px; font-weight: 500; white-space: nowrap; transition: background .15s, transform .12s, border-color .15s; }
.db-btn:hover:not(:disabled) { background: var(--raised) !important; }
.db-btn:active:not(:disabled) { transform: scale(.97); }
.db-btn.primary { background: var(--accent) !important; border-color: transparent !important; color: var(--on-accent); }
.db-btn.primary:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 88%, #000) !important; }
.db-btn.primary.rec { background: var(--rec) !important; }
.db-btn.primary.rec:hover:not(:disabled) { background: color-mix(in srgb, var(--rec) 88%, #000) !important; }
.db-btn.danger { background: var(--rec) !important; border-color: transparent !important; color: #fff; }
.db-btn.ghost { background: transparent !important; border-color: transparent !important; color: var(--ink-2); }
.db-btn.ghost:hover:not(:disabled) { background: var(--line) !important; }
.db-btn.ghost.danger { color: var(--rec); }
.db-btn.sm { min-height: 30px; padding: 0 10px; font-size: 13px; border-radius: 8px; }
.db-btn.icon { width: 36px; padding: 0; }
.db-btn.icon.sm { width: 30px; }
.db-btn.trail .db-icon { order: 2; }
.db-spin { width: 14px; height: 14px; flex: none; border-radius: 50%; border: 2px solid currentColor; border-right-color: transparent; animation: db-spin .8s linear infinite; }
.db-link { color: var(--accent-ink); font-size: 13px; text-decoration: underline; text-underline-offset: 3px; white-space: nowrap; }
.db-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.db-label { display: flex; align-items: baseline; gap: 8px; font-size: 13px; font-weight: 500; color: var(--ink-2); }
.db-label em { font-style: normal; font-weight: 400; font-size: 12px; color: var(--muted); }
.db-input, .db-select, .db-textarea, .db-cell { width: 100%; min-width: 0; border: 1px solid var(--line-2); border-radius: 10px; background: var(--surface); padding: 8px 11px; font-size: 14px; line-height: 1.6; transition: border-color .15s, box-shadow .15s; }
.db-input, .db-select { height: 38px; padding-block: 0; }
.db-textarea, .db-cell { resize: vertical; display: block; }
.db-input:hover, .db-select:hover, .db-textarea:hover { border-color: color-mix(in srgb, var(--accent) 40%, var(--line-2)); }
.db-input:focus, .db-select:focus, .db-textarea:focus, .db-cell:focus { outline: 0; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.db-input::placeholder, .db-textarea::placeholder { color: color-mix(in srgb, var(--muted) 70%, transparent); }
.db-input-title { height: 46px; font: 700 21px/1.2 var(--display); }
.db-input-bare { border-color: transparent; background: transparent; font-weight: 600; }
.db-input-bare:hover { border-color: var(--line-2); }
.db-form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.db-form-row.three { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.db-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.db-chip { height: 32px; padding: 0 12px; border-radius: 16px; border: 1px solid var(--line-2) !important; font-size: 13px; color: var(--ink-2); display: inline-flex; align-items: center; gap: 6px; }
.db-chip:hover { background: var(--raised); }
.db-chip[aria-pressed=true] { background: var(--accent-soft); border-color: var(--accent) !important; color: var(--accent-ink); font-weight: 600; }
.db-chip.person { padding-left: 4px; }
.db-chip.person img, .db-chip.person i { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; object-position: center 18%; background: var(--sunken); display: grid; place-items: center; font-size: 11px; font-style: normal; }
.db-seg { display: inline-flex; padding: 3px; gap: 2px; border-radius: 10px; background: var(--sunken); }
.db-seg button { display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 10px; border-radius: 7px; font-size: 13px; color: var(--muted); white-space: nowrap; }
.db-seg button[aria-pressed=true] { background: var(--surface); color: var(--ink); font-weight: 600; box-shadow: 0 1px 2px rgba(0, 0, 0, .12); }
.db-tag { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 8px; border-radius: 6px; background: var(--sunken); color: var(--ink-2); font-size: 12px; white-space: nowrap; }
.db-tag.ok { background: var(--ok-soft); color: var(--ok); }
.db-tag.warn { background: var(--warn-soft); color: var(--warn); }
.db-tag.info { background: var(--accent-soft); color: var(--accent-ink); }
.db-tag.rec { background: var(--rec-soft); color: var(--rec); }
.db-checkline { display: flex; align-items: center; gap: 9px; padding: 6px 0; font-size: 14px; cursor: pointer; }
.db-root input[type=checkbox], .db-root input[type=radio] { accent-color: var(--accent); width: 16px; height: 16px; margin: 0; flex: none; }
.db-root input[type=range] { accent-color: var(--accent); width: 100%; }
.db-note { font-size: 13px; line-height: 1.7; color: var(--muted); }
.db-warn { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 9px 12px; border-radius: 10px; background: var(--warn-soft); color: var(--warn); font-size: 13px; }
.db-done { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.6; color: var(--ok); }
.db-done .db-icon { margin-top: 2px; }

/* 卡片 */
.db-card { background: var(--surface); border-radius: 18px; padding: 20px; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.db-section-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 12px; }
.db-section-head h2 { font-size: 16px; font-weight: 650; }
.db-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.db-tools .db-btn { justify-content: flex-start; }
.db-inline-field { display: flex; align-items: center; gap: 10px; }
.db-inline-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: -6px; }
.db-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 56px 24px; text-align: center; border: 1px dashed var(--line-2); border-radius: 18px; }
.db-empty-mark { width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-ink); }
.db-empty strong { font-size: 17px; }
.db-empty p { max-width: 460px; color: var(--muted); font-size: 14px; line-height: 1.7; }
.db-empty .db-row { justify-content: center; margin-top: 6px; }
.db-ring { position: relative; display: inline-grid; place-items: center; flex: none; }
.db-ring > svg { position: absolute; inset: 0; }
.db-ring .track { stroke: var(--line-2); }
.db-ring .bar { stroke: var(--accent); transition: stroke-dashoffset .5s ease; }
.db-ring.full .bar { stroke: var(--ok); }
.db-ring-in { position: relative; font-size: 12px; font-weight: 600; color: var(--muted); display: grid; place-items: center; }
.db-ring.full .db-ring-in { color: var(--ok); }
.db-bar { height: 4px; border-radius: 2px; background: var(--line-2); overflow: hidden; }
.db-bar span { display: block; height: 100%; border-radius: 2px; background: var(--accent); transition: width .4s ease; }
.db-bar.rec span { background: var(--rec); }

/* 画框：所有图像共用 */
.db-frame { position: relative; width: 100%; overflow: hidden; border-radius: 12px; background: var(--screen); color: var(--screen-muted); isolation: isolate; }
.db-frame.clickable { cursor: pointer; }
.db-frame img, .db-frame video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.db-frame.clickable img { transition: transform .5s cubic-bezier(.2, .7, .2, 1); }
.db-frame.clickable:hover img { transform: scale(1.045); }
.db-frame img.develop { animation: db-develop 1s cubic-bezier(.2, .7, .2, 1) both; }
.db-frame-ph { position: absolute; inset: 0; display: grid; place-items: center; background: radial-gradient(120% 80% at 50% 40%, var(--screen-2), var(--screen)); }
.db-frame-ph i { position: absolute; width: 14%; max-width: 22px; aspect-ratio: 1; border: 1.5px solid var(--screen-line); }
.db-frame-ph .tl { left: 9%; top: 6%; border-right: 0; border-bottom: 0; }
.db-frame-ph .tr { right: 9%; top: 6%; border-left: 0; border-bottom: 0; }
.db-frame-ph .bl { left: 9%; bottom: 6%; border-right: 0; border-top: 0; }
.db-frame-ph .br { right: 9%; bottom: 6%; border-left: 0; border-top: 0; }
.db-frame-ph span { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 0 12%; text-align: center; font-size: 12px; line-height: 1.4; }
.db-frame-ph b { font: 600 15px/1.2 var(--display); color: var(--screen-ink); opacity: .82; }
.db-frame-ph em { font-style: normal; }
.db-frame-gen { position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 12%; background: rgba(8, 10, 14, .46); }
.db-frame-sweep { position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, .2) 50%, transparent 65%); background-size: 260% 100%; animation: db-sweep 1.5s linear infinite; pointer-events: none; }
.db-frame-gen-text { position: relative; padding: 4px 10px; border-radius: 12px; background: rgba(0, 0, 0, .55); color: #fff; font-size: 12px; max-width: 86%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.db-versions { display: flex; gap: 6px; flex-wrap: wrap; }
.db-versions button { width: 34px; height: 60px; border-radius: 6px; overflow: hidden; background: var(--screen); opacity: .62; outline: 2px solid transparent; outline-offset: 1px; transition: opacity .15s; }
.db-versions button:hover { opacity: 1; }
.db-versions button[aria-pressed=true] { opacity: 1; outline-color: var(--accent); }
.db-versions img { width: 100%; height: 100%; object-fit: cover; }
.db-audio { display: inline-flex; align-items: center; gap: 7px; height: 30px; padding: 0 11px 0 9px; border-radius: 15px; background: var(--sunken) !important; font-size: 12px; color: var(--ink-2); }
.db-audio.on { background: var(--accent-soft) !important; color: var(--accent-ink); }
.db-audio-wave { display: inline-flex; align-items: center; gap: 2px; height: 14px; }
.db-audio-wave i { width: 2px; height: 5px; border-radius: 1px; background: currentColor; opacity: .55; }
.db-audio-wave i:nth-child(2) { height: 11px; } .db-audio-wave i:nth-child(3) { height: 8px; } .db-audio-wave i:nth-child(4) { height: 13px; }
.db-audio.on .db-audio-wave i { animation: db-wave .7s ease-in-out infinite alternate; opacity: 1; }
.db-audio.on .db-audio-wave i:nth-child(2) { animation-delay: -.3s; } .db-audio.on .db-audio-wave i:nth-child(3) { animation-delay: -.5s; } .db-audio.on .db-audio-wave i:nth-child(4) { animation-delay: -.15s; }

/* 菜单、弹窗、提示、灯箱 */
.db-menu { position: relative; display: inline-flex; }
.db-menu-pop { position: absolute; top: calc(100% + 6px); right: 0; z-index: 40; min-width: 210px; padding: 6px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); box-shadow: 0 18px 50px -12px rgba(0, 0, 0, .35); animation: db-pop .14s ease-out; }
.db-menu-pop.left { right: auto; left: 0; }
.db-menu-pop button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border-radius: 9px; font-size: 14px; }
.db-menu-pop button:hover:not(:disabled) { background: var(--raised); }
.db-menu-pop button.danger { color: var(--rec); }
.db-menu-pop small { display: block; font-size: 12px; color: var(--muted); }
.db-modal-backdrop { position: absolute; inset: 0; z-index: 80; display: grid; place-items: center; padding: 20px; background: rgba(10, 14, 22, .42); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); animation: db-fade .15s ease-out; }
.db-modal { width: min(100%, 420px); padding: 24px; border-radius: 22px; background: var(--surface); box-shadow: 0 30px 80px -20px rgba(0, 0, 0, .5); animation: db-pop .18s ease-out; }
.db-modal h2 { font-size: 18px; margin-bottom: 8px; }
.db-modal p { font-size: 14px; line-height: 1.75; color: var(--ink-2); white-space: pre-line; margin-bottom: 20px; }
.db-toasts { position: absolute; left: 50%; bottom: 22px; z-index: 90; transform: translateX(-50%); display: flex; flex-direction: column; gap: 8px; align-items: center; width: min(560px, calc(100% - 32px)); pointer-events: none; }
.db-toast { pointer-events: auto; display: flex; align-items: flex-start; gap: 9px; max-width: 100%; padding: 10px 12px 10px 14px; border-radius: 14px; background: #1b202b; color: #f2f4f8; font-size: 13px; line-height: 1.55; box-shadow: 0 16px 40px -14px rgba(0, 0, 0, .55); animation: db-toast .22s cubic-bezier(.2, .8, .2, 1); }
.db-toast .db-icon { margin-top: 2px; color: #7cbcff; }
.db-toast.ok .db-icon { color: #5ad19a; }
.db-toast.err { background: #4a1418; }
.db-toast.err .db-icon { color: #ff8f96; }
.db-toast span { white-space: pre-wrap; overflow-wrap: anywhere; }
.db-toast button { color: inherit; opacity: .7; padding: 3px; margin-top: 1px; }
.db-lightbox { position: absolute; inset: 0; z-index: 85; display: flex; flex-direction: column; background: rgba(5, 7, 10, .93); color: #eef1f7; animation: db-fade .16s ease-out; }
.db-lightbox-stage { flex: 1; min-height: 0; display: grid; place-items: center; padding: 24px 24px 8px; }
.db-lightbox-stage img, .db-lightbox-stage video { max-width: 100%; max-height: 100%; border-radius: 10px; animation: db-pop .22s ease-out; }
.db-lightbox-bar { display: flex; align-items: center; gap: 8px; padding: 12px 20px 18px; }
.db-lightbox-bar .db-btn { background: rgba(255, 255, 255, .1) !important; border-color: transparent !important; color: #fff; }
.db-lightbox-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.db-lightbox-meta span, .db-lightbox-count { font-size: 12px; color: #9aa4b8; }
.db-jobs { position: relative; }
.db-jobs-btn { display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 12px 0 8px; border-radius: 16px; background: var(--sunken) !important; font-size: 13px; color: var(--ink-2); }
.db-jobs-btn.busy { background: var(--accent-soft) !important; color: var(--accent-ink); }
.db-jobs-btn.err { color: var(--rec); }
.db-jobs-pop { position: absolute; right: 0; top: calc(100% + 8px); z-index: 50; width: 340px; max-height: 60vh; overflow: auto; padding: 12px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); box-shadow: 0 20px 60px -14px rgba(0, 0, 0, .4); animation: db-pop .14s ease-out; }
.db-jobs-pop header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.db-jobs-pop header strong { flex: 1; }
.db-jobs-pop li { display: flex; align-items: flex-start; gap: 10px; padding: 9px 4px; border-top: 1px solid var(--line); font-size: 13px; }
.db-jobs-pop li > div { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.db-jobs-pop li > .db-icon { margin-top: 2px; color: var(--muted); }
.db-jobs-pop li.error p { color: var(--rec); font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }

/* 总览 */
.db-overview { display: flex; flex-direction: column; gap: 22px; }
.db-hero { display: grid; grid-template-columns: 212px minmax(0, 1fr); gap: 30px; padding: 24px; border-radius: 22px; background: var(--surface); box-shadow: var(--shadow); }
.db-poster { position: relative; }
.db-poster .db-frame { border-radius: 14px; }
.db-poster-title { position: absolute; left: 0; right: 0; bottom: 0; padding: 44px 14px 14px; border-radius: 0 0 14px 14px; background: linear-gradient(transparent, rgba(0, 0, 0, .78)); color: #fff; pointer-events: none; }
.db-poster-title strong { display: block; font: 900 21px/1.25 var(--display); letter-spacing: .03em; text-wrap: balance; }
.db-poster-title span { font-size: 11px; opacity: .8; }
.db-hero-body { display: flex; flex-direction: column; gap: 14px; min-width: 0; padding: 6px 0; }
.db-title { font: 900 34px/1.2 var(--display); letter-spacing: .02em; text-wrap: balance; }
.db-hero-logline { max-width: 62ch; font-size: 15px; line-height: 1.8; color: var(--ink-2); }
.db-pipeline { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); margin-top: auto; padding-top: 18px; border-top: 1px solid var(--line); }
.db-pipeline li { position: relative; }
.db-pipeline li + li::before { content: ""; position: absolute; top: 20px; left: calc(-50% + 26px); right: calc(50% + 26px); height: 1.5px; background: var(--line-2); }
.db-pipeline button { display: flex; flex-direction: column; align-items: center; gap: 5px; width: 100%; padding: 0 2px 4px; border-radius: 10px; text-align: center; }
.db-pipeline button:hover strong { color: var(--accent-ink); }
.db-pipeline strong { font-size: 13px; font-weight: 600; margin-top: 2px; }
.db-pipeline small { font-size: 11px; color: var(--muted); line-height: 1.35; }
.db-overview-cols { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 22px; align-items: start; }
.db-shelf, .db-side-col { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.db-ep-card { padding: 16px; border-radius: 18px; background: var(--surface); box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 12px; }
.db-ep-card-head { display: flex; align-items: flex-start; gap: 12px; }
.db-ep-card-head h3 { font-size: 16px; font-weight: 650; }
.db-ep-card-head p { font-size: 13px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.db-ep-num { font: 700 20px/1.2 var(--display); color: var(--muted); flex: none; min-width: 26px; }
.db-ep-card-foot { display: flex; align-items: center; gap: 4px; }
.db-strip { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(54px, 78px); gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin; }
.db-strip .db-frame { border-radius: 8px; }
.db-strip .db-frame-ph span { font-size: 10px; } .db-strip .db-frame-ph b { font-size: 12px; } .db-strip .db-frame-ph em { display: none; }
.db-strip-more { border-radius: 8px; background: var(--sunken) !important; color: var(--muted); font-size: 13px; display: grid; place-items: center; }
.db-strip-empty { display: flex; align-items: center; justify-content: center; gap: 8px; height: 74px; border-radius: 10px; border: 1px dashed var(--line-2) !important; color: var(--muted); font-size: 13px; }
.db-strip-empty:hover { color: var(--accent-ink); border-color: var(--accent) !important; }
.db-todo li + li { border-top: 1px solid var(--line); }
.db-todo button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 0; }
.db-todo button span { flex: 1; min-width: 0; }
.db-todo strong { display: block; font-size: 14px; font-weight: 550; }
.db-todo small { display: block; font-size: 12px; color: var(--muted); line-height: 1.5; }
.db-todo button:hover strong { color: var(--accent-ink); }

/* 立项与分集 */
.db-looks { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 8px; }
.db-look { display: flex; flex-direction: column; gap: 6px; padding: 5px 5px 7px; border-radius: 12px; border: 1px solid var(--line-2) !important; font-size: 12px; text-align: center; color: var(--ink-2); }
.db-look i { display: block; height: 46px; border-radius: 8px; }
.db-look[aria-pressed=true] { border-color: var(--accent) !important; background: var(--accent-soft); color: var(--accent-ink); font-weight: 600; }
.db-seeds { display: flex; flex-direction: column; gap: 8px; }
.db-seeds button { display: flex; flex-direction: column; gap: 4px; padding: 11px 12px; border-radius: 12px; background: var(--raised) !important; }
.db-seeds button:hover:not(:disabled) { background: var(--accent-soft) !important; }
.db-seeds strong { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.db-seeds span { font-size: 13px; line-height: 1.6; color: var(--muted); }
.db-episode { border-radius: 18px; background: var(--surface); box-shadow: var(--shadow); }
.db-episode header { display: flex; align-items: center; gap: 10px; padding: 10px 14px 10px 18px; border-bottom: 1px solid var(--line); }
.db-episode header .db-input { flex: 1; font-size: 16px; }
.db-episode-body { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 16px 18px 18px; }
.db-field.wide { grid-column: 1 / -1; }

/* 角色 */
.db-cast { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 470px), 1fr)); gap: 18px; }
.db-char { display: grid; grid-template-columns: 172px minmax(0, 1fr); gap: 18px; padding: 16px; border-radius: 18px; background: var(--surface); box-shadow: var(--shadow); }
.db-char-photo { display: flex; flex-direction: column; gap: 8px; }
.db-char-photo-actions { display: flex; gap: 6px; }
.db-char-photo-actions .db-btn { flex: 1; padding: 0 6px; }
.db-char-photo .db-versions button { width: 30px; height: 40px; }
.db-char-body { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.db-char-name { flex: 1; height: 40px; font: 700 20px/1.2 var(--display); padding-left: 6px; margin-left: -6px; }
.db-voice { display: flex; gap: 6px; align-items: center; min-width: 190px; }

/* 分镜 */
.db-board { height: 100%; display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); }
.db-board.with-inspector { grid-template-columns: minmax(0, 1fr) 400px; }
.db-board-main > * { flex: none; }
.db-board-main { min-width: 0; min-height: 0; overflow: auto; padding: 20px 28px 40px; display: flex; flex-direction: column; gap: 14px; scrollbar-gutter: stable; }
.db-ep-tabs { display: flex; gap: 6px; overflow-x: auto; padding: 2px; scrollbar-width: none; flex: none; }
.db-ep-tabs button { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 14px 0 10px; border-radius: 19px; border: 1px solid var(--line-2) !important; font-size: 14px; white-space: nowrap; color: var(--ink-2); flex: none; max-width: 240px; }
.db-ep-tabs button:hover { background: var(--surface); }
.db-ep-tabs button[aria-selected=true] { background: var(--ink) !important; border-color: var(--ink) !important; color: var(--bg); }
.db-ep-tabs .db-ep-num { font-size: 15px; min-width: 0; color: inherit; opacity: .6; }
.db-ep-tab-title { overflow: hidden; text-overflow: ellipsis; }
.db-board-brief { font-size: 13px; line-height: 1.7; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.db-board-brief b { margin: 0 6px 0 0; padding: 1px 6px; border-radius: 5px; background: var(--sunken); color: var(--ink-2); font-weight: 500; font-size: 12px; }
.db-board-brief b + b, .db-board-brief b:nth-of-type(2) { margin-left: 14px; }
.db-total { font-size: 13px; color: var(--muted); display: inline-flex; align-items: baseline; gap: 7px; white-space: nowrap; }
.db-total b { font: 600 15px/1 var(--mono); color: var(--ink); }
.db-total.over, .db-total.over b { color: var(--rec); }
.db-wall { display: grid; grid-template-columns: repeat(auto-fill, minmax(164px, 1fr)); gap: 18px 14px; align-content: start; }
.db-tile { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.db-tile .db-frame { outline: 3px solid transparent; outline-offset: 2px; transition: outline-color .15s; }
.db-tile.selected .db-frame { outline-color: var(--accent); }
.db-slate { position: absolute; left: 7px; top: 7px; display: flex; align-items: center; gap: 4px; pointer-events: none; }
.db-slate b, .db-slate span { height: 21px; padding: 0 7px; border-radius: 6px; background: rgba(0, 0, 0, .58); color: #fff; font-size: 11px; display: inline-flex; align-items: center; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.db-slate b { font: 600 12px/1 var(--mono); background: rgba(255, 255, 255, .92); color: #10131a; }
.db-tile-foot { position: absolute; left: 7px; right: 7px; bottom: 7px; display: flex; align-items: center; gap: 4px; pointer-events: none; }
.db-tile-foot i, .db-tile-foot time { height: 21px; min-width: 21px; padding: 0 5px; border-radius: 6px; background: rgba(0, 0, 0, .58); color: #fff; font: 500 11px/1 var(--mono); display: inline-grid; place-items: center; }
.db-tile-foot i.todo { color: #ffc56b; }
.db-tile-text { font-size: 13px; line-height: 1.5; color: var(--ink-2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.db-tile-line { font-size: 12px; line-height: 1.5; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; padding-left: 8px; border-left: 2px solid var(--line-2); }
.db-tile-add { aspect-ratio: 9 / 16; border-radius: 12px; border: 1.5px dashed var(--line-2) !important; color: var(--muted); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; font-size: 13px; align-self: start; }
.db-tile-add:hover { border-color: var(--accent) !important; color: var(--accent-ink); background: var(--accent-soft); }
.db-inspector { min-width: 0; min-height: 0; display: flex; flex-direction: column; background: var(--surface); border-left: 1px solid var(--line); animation: db-slide .2s cubic-bezier(.2, .8, .2, 1); }
.db-inspector-head { display: flex; align-items: center; gap: 6px; padding: 12px 12px 12px 18px; border-bottom: 1px solid var(--line); flex: none; }
.db-inspector-head strong { font: 600 16px/1 var(--mono); }
.db-inspector-scroll { flex: 1; min-height: 0; overflow: auto; padding: 16px 18px 28px; display: flex; flex-direction: column; gap: 14px; }
.db-inspector-media { display: grid; grid-template-columns: 148px minmax(0, 1fr); gap: 14px; align-items: start; }
.db-inspector-actions { display: flex; flex-direction: column; gap: 8px; align-items: stretch; }
.db-final-prompt { padding: 10px 12px; border-radius: 10px; background: var(--raised); font-size: 13px; line-height: 1.7; color: var(--ink-2); overflow-wrap: anywhere; margin-top: -4px; }
.db-table-wrap { overflow: auto; border-radius: 14px; background: var(--surface); box-shadow: var(--shadow); }
.db-table { border-collapse: collapse; width: 100%; min-width: 1240px; font-size: 13px; }
.db-table th { position: sticky; top: 0; z-index: 1; padding: 10px 8px; text-align: left; background: var(--raised); font-weight: 500; color: var(--muted); white-space: nowrap; }
.db-table td { padding: 6px; border-top: 1px solid var(--line); vertical-align: top; }
.db-table .c-no { width: 40px; text-align: center; padding-top: 14px; font-family: var(--mono); color: var(--muted); }
.db-table .c-thumb { width: 62px; } .db-table .c-thumb .db-frame { border-radius: 6px; } .db-table .c-thumb .db-frame-ph span { display: none; }
.db-table td:nth-child(3), .db-table td:nth-child(4) { width: 92px; } .db-table td:nth-child(7) { width: 70px; }
.db-table .db-select, .db-table .db-input { height: 34px; padding-inline: 7px; font-size: 13px; }
.db-cell { font-size: 13px; padding: 6px 8px; border-color: transparent; background: var(--raised); min-height: 72px; }

/* 成片 */
.db-studio { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 26px; align-items: start; }
.db-screen { display: flex; flex-direction: column; gap: 10px; position: sticky; top: 8px; }
.db-screen-frame { position: relative; aspect-ratio: 9 / 16; border-radius: 22px; overflow: hidden; background: var(--screen); cursor: pointer; box-shadow: 0 0 0 6px var(--screen), 0 0 0 7px var(--line-2), 0 30px 60px -30px rgba(0, 0, 0, .6); margin: 7px; isolation: isolate; }
.db-screen.empty .db-screen-frame { display: grid; place-items: center; color: var(--screen-muted); cursor: default; }
.db-screen-frame > img, .db-screen-frame > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.db-kb { animation: db-kb-still var(--dur, 4s) linear both; transform-origin: 50% 42%; will-change: transform; }
.db-kb.push { animation-name: db-kb-push; animation-timing-function: ease-in-out; }
.db-kb.pull { animation-name: db-kb-pull; animation-timing-function: ease-in-out; }
.db-kb.pan { animation-name: db-kb-pan; animation-timing-function: ease-in-out; }
.db-kb.truck { animation-name: db-kb-truck; animation-timing-function: ease-in-out; }
.db-kb.follow { animation-name: db-kb-follow; animation-timing-function: ease-in-out; }
.db-kb.crane { animation-name: db-kb-crane; animation-timing-function: ease-in-out; }
.db-screen-bars { position: absolute; left: 10px; right: 10px; top: 10px; display: flex; gap: 3px; }
.db-screen-bars i { flex: 1 1 0; height: 2.5px; border-radius: 2px; background: rgba(255, 255, 255, .32); overflow: hidden; }
.db-screen-bars b { display: block; height: 100%; background: #fff; }
.db-screen-title { position: absolute; left: 16px; right: 16px; top: 34px; text-align: center; color: #fff; font: 700 17px/1.4 var(--display); letter-spacing: .06em; text-shadow: 0 1px 8px rgba(0, 0, 0, .8); }
.db-screen-sub { position: absolute; left: 14px; right: 14px; bottom: 18%; text-align: center; color: #fff; font-size: 18px; font-weight: 700; line-height: 1.4; text-shadow: 0 0 3px #000, 0 0 3px #000, 0 2px 6px rgba(0, 0, 0, .9); animation: db-fade .12s ease-out; }
.db-screen-play { position: absolute; left: 50%; top: 50%; width: 68px; height: 68px; margin: -34px; border-radius: 50%; display: grid; place-items: center; background: rgba(0, 0, 0, .46); color: #fff; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); animation: db-pop .16s ease-out; }
.db-screen-play .db-icon { fill: currentColor; margin-left: 4px; }
.db-screen-controls { display: flex; align-items: center; gap: 6px; padding: 0 7px; }
.db-screen-controls .db-btn.primary { border-radius: 50%; }
.db-screen-controls .db-btn.primary .db-icon { fill: currentColor; }
.db-timecode { font: 500 13px/1 var(--mono); color: var(--ink-2); margin-left: 4px; white-space: nowrap; }
.db-studio-side { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.db-steps { display: flex; flex-direction: column; background: var(--surface); border-radius: 18px; box-shadow: var(--shadow); padding: 4px 20px; }
.db-step { display: flex; gap: 14px; padding: 16px 0; }
.db-step + .db-step { border-top: 1px solid var(--line); }
.db-step-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.db-step-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; min-height: 36px; align-content: center; }
.db-step-head strong { font-size: 16px; font-weight: 650; }
.db-options { display: flex; flex-wrap: wrap; gap: 8px 20px; font-size: 13px; }
.db-options label { display: inline-flex; align-items: center; gap: 7px; cursor: pointer; white-space: nowrap; }
.db-options .db-select { width: auto; height: 30px; font-size: 13px; }
.db-range { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); width: 150px; }
.db-render-progress { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 6px 12px; font-size: 13px; color: var(--rec); }
.db-render-progress .db-bar { grid-column: 1 / -1; height: 6px; border-radius: 3px; }
.db-output { display: grid; grid-template-columns: 104px minmax(0, 1fr); gap: 16px; padding: 14px; border-radius: 18px; background: var(--surface); box-shadow: var(--shadow); align-items: center; animation: db-pop .25s ease-out; }
.db-output .db-frame { border-radius: 10px; }
.db-play-badge { position: absolute; left: 50%; top: 50%; width: 38px; height: 38px; margin: -19px; border-radius: 50%; display: grid; place-items: center; background: rgba(0, 0, 0, .5); color: #fff; pointer-events: none; }
.db-play-badge .db-icon { fill: currentColor; margin-left: 2px; }
.db-output-body { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.db-output-body strong { font: 700 17px/1.4 var(--display); }
.db-timeline { background: var(--screen); border-radius: 18px; padding: 14px 16px 12px; color: var(--screen-muted); display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0 12px; }
.db-timeline-track { grid-column: 2; display: flex; gap: 3px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin; scrollbar-color: #3a4252 transparent; }
.db-timeline-legend { grid-column: 1; grid-row: 1; display: grid; grid-template-rows: 104px 24px 12px; gap: 5px; font-size: 11px; align-items: center; }
.db-cell-shot { flex: none; display: grid; grid-template-rows: 104px 24px 12px; gap: 5px; }
.db-film { position: relative; display: block; width: 100%; height: 104px; border-radius: 5px; overflow: hidden; background: #000 !important; outline: 2px solid transparent; outline-offset: 0; }
/* 胶片齿孔 */
.db-film::before, .db-film::after { content: ""; position: absolute; left: 0; right: 0; height: 9px; z-index: 2; background: #000 repeating-linear-gradient(90deg, transparent 0 5px, rgba(255, 255, 255, .5) 5px 10px, transparent 10px 15px) 0 2.5px / 100% 4px no-repeat; }
.db-film::before { top: 0; } .db-film::after { bottom: 0; }
.db-film img { position: absolute; left: 0; top: 9px; width: 100%; height: calc(100% - 18px); object-fit: cover; opacity: .86; transition: opacity .15s; }
.db-film:hover img, .db-cell-shot.on .db-film img { opacity: 1; }
.db-cell-shot.on .db-film { outline-color: #fff; }
.db-film-empty { position: absolute; inset: 9px 0; display: grid; place-items: center; background: var(--screen-2); font-size: 11px; }
.db-film b { position: absolute; left: 4px; top: 12px; z-index: 3; padding: 2px 4px; border-radius: 3px; background: rgba(255, 255, 255, .9); color: #10131a; font: 600 10px/1 var(--mono); }
.db-film time { position: absolute; right: 4px; bottom: 12px; z-index: 3; padding: 2px 4px; border-radius: 3px; background: rgba(0, 0, 0, .65); color: #fff; font: 500 10px/1 var(--mono); }
.db-film i { position: absolute; right: 4px; top: 12px; z-index: 3; width: 16px; height: 16px; border-radius: 3px; background: rgba(0, 0, 0, .65); color: #fff; display: grid; place-items: center; }
.db-track-sub { height: 24px; padding: 0 6px; border-radius: 4px; background: rgba(255, 255, 255, .1); color: var(--screen-ink); font-size: 11px; line-height: 24px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.db-track-sub.none { background: rgba(255, 255, 255, .03); }
.db-track-voice { height: 12px; border-radius: 3px; background: rgba(255, 255, 255, .03); overflow: hidden; }
.db-track-voice.need { background: repeating-linear-gradient(135deg, rgba(255, 197, 107, .32) 0 4px, transparent 4px 8px); }
.db-track-voice span { display: block; height: 100%; border-radius: 3px; background: #4cc38a; opacity: .85; }

/* 发布 */
.db-publish { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 28px; align-items: start; }
.db-phone { position: sticky; top: 8px; display: flex; flex-direction: column; gap: 12px; text-align: center; }
.db-phone-screen { position: relative; aspect-ratio: 9 / 16; margin: 7px; border-radius: 24px; overflow: hidden; background: var(--screen); box-shadow: 0 0 0 6px var(--screen), 0 0 0 7px var(--line-2), 0 30px 60px -30px rgba(0, 0, 0, .6); color: #fff; }
.db-phone-screen > img, .db-phone-screen > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.db-phone-cover-text { position: absolute; left: 14px; right: 14px; top: 26%; text-align: center; font: 900 30px/1.25 var(--display); letter-spacing: .04em; text-shadow: 0 2px 0 #000, 0 0 14px rgba(0, 0, 0, .8); text-wrap: balance; pointer-events: none; }
.db-phone-play { position: absolute; left: 50%; top: 50%; width: 64px; height: 64px; margin: -32px; border-radius: 50%; display: grid; place-items: center; background: rgba(0, 0, 0, .5) !important; color: #fff; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: transform .15s; }
.db-phone-play:hover { transform: scale(1.08); }
.db-phone-play .db-icon { fill: currentColor; margin-left: 4px; }
.db-phone-rail { position: absolute; right: 10px; bottom: 96px; display: flex; flex-direction: column; gap: 18px; filter: drop-shadow(0 1px 3px rgba(0, 0, 0, .8)); pointer-events: none; }
.db-phone-caption { position: absolute; left: 0; right: 0; bottom: 0; padding: 40px 54px 44px 14px; text-align: left; background: linear-gradient(transparent, rgba(0, 0, 0, .72)); font-size: 13px; line-height: 1.5; pointer-events: none; }
.db-phone-caption strong { font-size: 14px; } .db-phone-caption span { opacity: .86; font-size: 12px; }
.db-titles { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
.db-title-option { display: flex; align-items: center; gap: 10px; width: 100%; padding: 2px 12px; border-radius: 12px; border: 1px solid var(--line-2); cursor: pointer; }
.db-title-option.on { border-color: var(--accent); background: var(--accent-soft); }
.db-title-option .db-input { flex: 1; padding-inline: 2px; font-size: 15px; }
.db-title-option .db-input:hover, .db-title-option .db-input:focus { border-color: transparent; box-shadow: none; }
.db-count { font: 500 12px/1 var(--mono); color: var(--muted); }
.db-count.over { color: var(--rec); }
.db-strip.pick { grid-auto-columns: 72px; padding: 3px; }
.db-cover-option { aspect-ratio: 9 / 16; border-radius: 8px; overflow: hidden; outline: 3px solid transparent; outline-offset: 1px; opacity: .7; }
.db-cover-option[aria-pressed=true] { outline-color: var(--accent); opacity: 1; }
.db-cover-option:hover { opacity: 1; }
.db-cover-option img { width: 100%; height: 100%; object-fit: cover; }
.db-deliver { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid var(--line); }
.db-deliver > div:first-child { display: flex; flex-direction: column; min-width: 0; }
.db-platforms { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.db-platform { display: grid; grid-template-columns: 36px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 14px; border: 1px solid var(--line-2); background: var(--surface); transition: border-color .15s, background .15s; }
.db-platform:hover { border-color: color-mix(in srgb, var(--platform-color) 45%, var(--line-2)); }
.db-platform.on { border-color: var(--platform-color); background: color-mix(in srgb, var(--platform-color) 7%, var(--surface)); }
.db-platform-badge { width: 36px; height: 36px; border-radius: 11px; display: grid; place-items: center; background: color-mix(in srgb, var(--platform-color) 14%, transparent); color: var(--platform-color); font: 800 15px/1 var(--display); }
.db-platform-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.db-platform-text strong { font-size: 14px; line-height: 1.3; }
.db-platform-text small { font-size: 11px; color: var(--muted); white-space: nowrap; }
.db-platform-check { color: var(--platform-color); }
.db-platform-detail { display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid var(--line); color: var(--ink-2); }
.db-platform-detail p { font-size: 13px; line-height: 1.65; }
.db-platform-detail .db-link { margin-left: 6px; white-space: nowrap; }
.db-platform-limits { display: flex; flex-wrap: wrap; gap: 6px; }
.db-platform-limits li { padding: 3px 9px; border-radius: 999px; background: var(--line); color: var(--ink-2); font-size: 12px; }
.db-link-btn { text-decoration: none; }
.db-checks { display: grid; }
.db-check { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 9px; align-items: start; padding: 7px 0; border-top: 1px solid var(--line); }
.db-check:first-child { border-top: 0; }
.db-check > div { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.db-check > div > span { font-size: 13px; font-weight: 550; }
.db-check small { font-size: 12px; color: var(--muted); line-height: 1.55; }
.db-check .db-icon { margin-top: 2px; }
.db-check.ok .db-icon { color: var(--ok); }
.db-check.warn .db-icon { color: var(--warn); }
.db-check.bad .db-icon { color: var(--rec); }
.db-check.bad > div > span { color: var(--rec); }

/* 素材库 */
.db-library { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 18px 14px; align-items: start; }
.db-asset { position: relative; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.db-asset figcaption { display: flex; flex-direction: column; font-size: 13px; min-width: 0; }
.db-asset figcaption > span { display: flex; align-items: center; gap: 6px; font-weight: 550; white-space: nowrap; }
.db-asset figcaption small { font-size: 12px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.db-asset-actions { position: absolute; top: 6px; right: 6px; display: flex; padding: 2px; border-radius: 10px; background: rgba(10, 12, 18, .72); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); opacity: 0; transition: opacity .15s; }
.db-asset-actions .db-btn { color: #fff; }
.db-asset:hover .db-asset-actions, .db-asset:focus-within .db-asset-actions { opacity: 1; }
.db-asset-audio { aspect-ratio: 9 / 16; border-radius: 12px; background: var(--screen); color: var(--screen-ink); padding: 44px 14px 14px; display: flex; flex-direction: column-reverse; justify-content: space-between; gap: 12px; align-items: flex-start; }
.db-asset-audio p { font: 500 15px/1.6 var(--display); display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
.db-asset-audio .db-audio { background: rgba(255, 255, 255, .12) !important; color: #fff; }

/* 生成引擎 */
.db-engine-page { max-width: 980px; margin: 0 auto; }
.db-line { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0; border-radius: 18px; background: var(--screen); color: var(--screen-ink); overflow: hidden; }
.db-line li + li { border-left: 1px solid var(--screen-line); }
.db-line button { display: flex; flex-direction: column; gap: 3px; width: 100%; padding: 14px 16px; min-width: 0; }
.db-line button:hover { background: rgba(255, 255, 255, .06); }
.db-line span { font-size: 12px; color: var(--screen-muted); }
.db-line strong { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.db-line i { font-style: normal; font-size: 11px; display: inline-flex; align-items: center; gap: 5px; color: #ffc56b; }
.db-line i::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.db-line li.ok i { color: #5ad19a; }
.db-keys { display: flex; flex-direction: column; }
.db-key { display: grid; grid-template-columns: minmax(150px, 1.1fr) minmax(0, 1.5fr) auto 30px 52px; gap: 10px; align-items: center; padding: 10px 0; border-top: 1px solid var(--line); }
.db-key:first-child { border-top: 0; }
.db-key-name { display: flex; flex-direction: column; min-width: 0; }
.db-key-name span { font-size: 12px; line-height: 1.45; }
.db-vendors { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 8px; }
.db-vendor { display: flex; flex-direction: column; gap: 3px; padding: 11px 13px; border-radius: 12px; border: 1px solid var(--line-2) !important; min-width: 0; }
.db-vendor:hover { background: var(--raised); }
.db-vendor[aria-checked=true] { border-color: var(--accent) !important; background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--accent); }
.db-vendor strong { font-size: 14px; font-weight: 600; }
.db-vendor small { font-size: 12px; color: var(--warn); }
.db-vendor small.ok { color: var(--muted); }
.db-sample { display: flex; align-items: flex-end; gap: 12px; }
.db-sample .db-frame { width: 120px; }

/* iOS 的连续曲率圆角；不支持的引擎回退为普通圆角。 */
.db-card, .db-hero, .db-ep-card, .db-episode, .db-char, .db-steps, .db-output, .db-modal, .db-btn, .db-input, .db-select, .db-textarea, .db-frame, .db-screen-frame, .db-phone-screen, .db-vendor, .db-empty, .db-menu-pop, .db-jobs-pop, .db-toast, .db-timeline, .db-line { corner-shape: superellipse(1.6); }

@keyframes db-spin { to { transform: rotate(360deg); } }
@keyframes db-sweep { from { background-position: 130% 0; } to { background-position: -130% 0; } }
@keyframes db-develop { from { filter: blur(16px) saturate(.15) brightness(1.7); transform: scale(1.06); } 60% { filter: blur(2px) saturate(.8) brightness(1.1); } to { filter: none; transform: none; } }
@keyframes db-page-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes db-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes db-pop { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }
@keyframes db-slide { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: none; } }
@keyframes db-toast { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes db-wave { from { transform: scaleY(.35); } to { transform: scaleY(1); } }
/* 试映的运镜：与合成时 ffmpeg 的推拉摇移幅度保持一致。 */
@keyframes db-kb-still { from { transform: scale(1); } to { transform: scale(1.035); } }
@keyframes db-kb-push { from { transform: scale(1); } to { transform: scale(1.22); } }
@keyframes db-kb-pull { from { transform: scale(1.22); } to { transform: scale(1); } }
@keyframes db-kb-pan { from { transform: scale(1.2) translateX(8%); } to { transform: scale(1.2) translateX(-8%); } }
@keyframes db-kb-truck { from { transform: scale(1.2) translateX(-8%); } to { transform: scale(1.2) translateX(8%); } }
@keyframes db-kb-follow { from { transform: scale(1.1) translateX(1.6%); } to { transform: scale(1.18) translateX(-1.6%); } }
@keyframes db-kb-crane { from { transform: scale(1.2) translateY(-8%); } to { transform: scale(1.2) translateY(8%); } }

@media (max-width: 1240px) {
  .db-overview-cols, .db-two { grid-template-columns: minmax(0, 1fr); }
  .db-side-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  /* 检查器改成从右侧滑出的抽屉。 */
  .db-board.with-inspector { grid-template-columns: minmax(0, 1fr); }
  .db-inspector { position: absolute; top: 0; right: 0; bottom: 0; z-index: 30; width: min(420px, 100%); box-shadow: -24px 0 60px -30px rgba(0, 0, 0, .5); }
}
@media (max-width: 980px) {
  .db-side { width: 186px; }
  .db-top, .db-busy { padding-inline: 20px; }
  .db-page { padding: 20px 20px 36px; }
  .db-board-main { padding: 16px 20px 36px; }
  .db-hero { grid-template-columns: 168px minmax(0, 1fr); gap: 20px; }
  .db-title { font-size: 27px; }
  .db-pipeline { grid-template-columns: repeat(4, minmax(0, 1fr)); row-gap: 14px; }
  .db-pipeline li + li::before { display: none; }
  .db-studio, .db-publish { grid-template-columns: 240px minmax(0, 1fr); gap: 18px; }
  .db-platforms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .db-key { grid-template-columns: minmax(0, 1fr) auto 30px; }
  .db-key-name { grid-column: 1 / -1; } .db-key .db-link, .db-key > span:last-child { display: none; }
  .db-line { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .db-line li:nth-child(n+4) { border-top: 1px solid var(--screen-line); }
}
@media (max-width: 860px) {
  .db-publish { grid-template-columns: minmax(0, 1fr); }
  .db-phone { position: static; width: min(100%, 300px); margin: 0 auto; }
}
@media (max-width: 720px) {
  .db-root { flex-direction: column-reverse; }
  .db-side { width: 100%; flex-direction: row; padding: 4px 6px max(4px, env(safe-area-inset-bottom)); gap: 0; border-right: 0; border-top: 1px solid var(--line); overflow-x: auto; scrollbar-width: none; }
  .db-brand, .db-side-projects, .db-model { display: none; }
  .db-nav, .db-nav.tools { flex-direction: row; gap: 0; margin: 0; padding: 0; border: 0; }
  .db-nav button { flex-direction: column; justify-content: center; gap: 2px; height: 50px; min-width: 56px; padding: 0 6px; font-size: 11px; }
  .db-nav button small { display: none; }
  .db-nav button[aria-current=page] { background: transparent; box-shadow: none; }
  .db-top { height: 54px; padding-inline: 14px; gap: 6px; }
  .db-top-title h1 { font-size: 17px; } .db-top-title p { max-width: 38vw; }
  .db-save { display: none; }
  .db-busy { padding-inline: 14px; }
  .db-page { padding: 14px 14px 30px; }
  .db-board-main { padding: 12px 14px 30px; }
  .db-hero { grid-template-columns: 1fr; padding: 16px; }
  .db-poster { width: 150px; }
  .db-title { font-size: 24px; }
  .db-pipeline { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .db-form-row, .db-episode-body, .db-studio, .db-publish { grid-template-columns: minmax(0, 1fr); }
  .db-form-row.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .db-char { grid-template-columns: 1fr; }
  .db-char-photo { display: grid; grid-template-columns: 118px minmax(0, 1fr); align-items: start; }
  .db-char-photo-actions { flex-direction: column; }
  .db-screen, .db-phone { position: static; width: min(100%, 300px); margin: 0 auto; }
  .db-wall { grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 14px 10px; }
  .db-inspector-media { grid-template-columns: 112px minmax(0, 1fr); }
  .db-input, .db-select, .db-textarea { font-size: 16px; }
  .db-btn { min-height: 40px; } .db-btn.sm { min-height: 34px; } .db-btn.icon { width: 40px; } .db-btn.icon.sm { width: 34px; }
  .db-jobs-pop { position: fixed; left: 10px; right: 10px; top: 60px; width: auto; }
  .db-output { grid-template-columns: 84px minmax(0, 1fr); }
  .db-platforms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .db-line { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .db-line li:nth-child(n+3) { border-top: 1px solid var(--screen-line); }
  .db-asset-actions { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .db-root *, .db-root *::before, .db-root *::after { animation-duration: .001s !important; animation-iteration-count: 1 !important; transition-duration: .001s !important; }
  /* 试映的运镜是内容本身，保留。 */
  .db-root .db-kb { animation-duration: var(--dur, 4s) !important; }
}
@supports not (backdrop-filter: blur(1px)) { .db-side { background: var(--surface); } }
`

    //#region 00-core.js
    // 基础：React 别名、常量、数据形状、接口与纯函数。
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext, Fragment } = React
    const cx = (...parts) => parts.filter(Boolean).join(' ')

    const API = '/drama-board/api'
    const GENRES = ['逆袭', '甜宠', '悬疑', '重生', '萌宝', '其他']
    const STYLES = ['写实', '国漫', '3D']
    const SHOT_SIZES = ['远景', '全景', '中景', '近景', '特写']
    const CAMERAS = ['固定', '推', '拉', '摇', '移', '跟', '升降']

    /** 画风 → 写进每条生图提示词开头的风格描述。 */
    const STYLE_PROMPTS = {
      写实: '电影感写实摄影，真实皮肤质感，自然光影，35mm 镜头，浅景深',
      国漫: '国漫风格，精致线条，赛璐璐上色，色彩饱满，光影细腻',
      '3D': '3D 动画电影风格，角色造型圆润，柔和全局光照，材质细腻',
    }

    /** 影调：全剧统一的色彩倾向。colors 用于本地草图和界面色卡。 */
    const LOOKS = [
      { id: 'natural', name: '自然', prompt: '', colors: ['#2b3a4a', '#8fa3b5', '#e9dcc7'] },
      { id: 'cold', name: '冷调悬疑', prompt: '低饱和冷色调，青蓝色阴影，局部硬光，氛围压抑', colors: ['#0f1c2b', '#2f6d86', '#c9e3ea'] },
      { id: 'warm', name: '暖调治愈', prompt: '暖色调，柔和逆光，奶油色高光，氛围温柔', colors: ['#4a2c1f', '#d98b4d', '#fbe6c4'] },
      { id: 'neon', name: '霓虹都市', prompt: '夜景霓虹，洋红与青色对比光，湿润地面反光', colors: ['#150b2c', '#d6336c', '#35d6e0'] },
      { id: 'ink', name: '古风水墨', prompt: '古风，水墨晕染质感，留白构图，青绿设色', colors: ['#1f2a26', '#6f8f7b', '#efe8d6'] },
      { id: 'gold', name: '豪门鎏金', prompt: '高级感室内光，金色点光与深色木质，对比强烈', colors: ['#17120c', '#b8862f', '#f3deb0'] },
    ]

    /**
     * 发布平台。四家的接口开放程度不一样，字段限制也不一样：
     * api = open 表示官方有发布接口可对接（都要开放平台入驻 + 用户授权），closed 表示只有网页后台。
     * studio 是手动发布入口，没接通接口时也能 30 秒发出去。
     */
    const PLATFORMS = [
      {
        id: 'douyin', name: '抖音', short: '抖', color: '#fe2c55', api: 'open',
        titleMax: 55, captionMax: 1000, tagMax: 5, coverAspect: '9:16',
        titleHint: '不超过 55 字，信息流一般只露出前 20 字',
        apiDetail: '官方接口：上传视频 → 创建视频（video.create.bind）。需企业主体入驻开放平台，并在「能力实验室」开通「代替用户发布内容到抖音」，发布时还要账号本人授权。',
        limits: ['竖屏 9:16，推荐 1080×1920', '文件 ≤ 4GB，超过 300MB 必须分片', '标题 ≤ 55 字，描述 ≤ 1000 字', '话题 3–5 个'],
        doc: 'https://developer.open-douyin.com/docs/resource/zh-CN/dop/develop/openapi/video-management/douyin/create-video/video-create',
        studio: 'https://creator.douyin.com/creator-micro/content/upload', studioName: '抖音创作服务平台',
      },
      {
        id: 'bilibili', name: 'B站', short: 'B', color: '#00aeec', api: 'open',
        titleMax: 80, captionMax: 2000, tagMax: 10, coverAspect: '16:9',
        titleHint: '不超过 80 字，搜索结果里会完整显示',
        apiDetail: '官方接口：上传预处理 → 分片上传 → 合片 → 封面上传 → 稿件提交（还要先查分区）。需入驻开放平台、创建应用，走 OAuth 授权和 HMAC-SHA256 签名。',
        limits: ['竖屏能投，但站内主推 16:9', '文件 ≤ 4GB，时长 < 5 小时', '标题 ≤ 80 字，简介 ≤ 2000 字', '封面 16:9（1146×717）', '标签 ≤ 10 个'],
        doc: 'https://open.bilibili.com/doc/',
        studio: 'https://member.bilibili.com/platform/upload/video/frame', studioName: 'B站创作中心',
      },
      {
        id: 'kuaishou', name: '快手', short: '快', color: '#ff5000', api: 'open',
        titleMax: 50, captionMax: 500, tagMax: 5, coverAspect: '9:16',
        titleHint: '不超过 50 字；快手没有独立标题，第一行就是标题',
        apiDetail: '官方接口：start_upload → 上传 → publish（scope user_video_publish）。需企业资质入驻开放平台，并单独申请视频发布权限。',
        limits: ['竖屏 9:16', '直传 ≤ 10MB，更大的走分片（每片 ≤ 10MB）', '描述 ≤ 500 字，首行当标题', '封面 ≤ 10MB'],
        doc: 'https://open.kuaishou.com/platformDocs/openAbility/contentManagement/createAVideo.html',
        studio: 'https://cp.kuaishou.com/article/publish/video', studioName: '快手创作者服务平台',
      },
      {
        id: 'shipinhao', name: '视频号', short: '视', color: '#07c160', api: 'closed',
        titleMax: 16, captionMax: 1000, tagMax: 10, coverAspect: '9:16',
        titleHint: '不超过 16 字，只收中英文、数字和空格',
        apiDetail: '没有对外的发布接口（官方社区答复「目前没有」）。视频号助手给的 AppID/AppSecret 只开放了直播数据、橱窗商品等能力，发视频只能登录网页版助手手动上传。',
        limits: ['竖屏 9:16', '短标题 ≤ 16 字，别带标点和表情', '描述 ≤ 1000 字，可以带 #话题', '网页版视频号助手手动上传'],
        doc: 'https://developers.weixin.qq.com/doc/channels/api/',
        studio: 'https://channels.weixin.qq.com/platform/post/create', studioName: '视频号助手',
      },
    ]
    const platformOf = (id) => PLATFORMS.find((item) => item.id === id) || PLATFORMS[0]

    const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

    //#region 数据形状
    const emptyShot = () => ({
      id: uid('s'), shotSize: '中景', camera: '固定', description: '', cast: [], castSet: false,
      dialogue: '（无）', duration: 3, imagePrompt: '', videoPrompt: '',
      image: null, images: [], video: null, audio: null, audioText: '',
    })

    const blankPublish = () => ({ platform: 'douyin', titles: [], caption: '', tags: [], coverText: '', pick: 0 })

    const blankEpisode = (index) => ({
      id: uid('e'), index, title: `第${index}集`, hook: '', conflict: '', cliffhanger: '',
      publish: blankPublish(), cover: null, renders: [], bgm: null,
    })

    function makeProject(name) {
      return {
        id: uid('p'),
        name: name || '新短剧项目',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        brief: { logline: '', genre: '逆袭', episodes: 10, style: '写实' },
        visual: { look: 'natural', extra: '', negative: '' },
        narratorVoice: '',
        characters: [],
        episodes: [],
        boards: {},
        checklist: {},
      }
    }

    /** 素材引用：只认后端返回的那几个字段，文件名必须是安全字符。 */
    function normalizeRef(raw) {
      if (!raw || typeof raw !== 'object') return null
      const ok = (value) => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/.test(value)
      if (!ok(raw.pid) || !ok(raw.file)) return null
      return {
        id: String(raw.id || raw.file), pid: raw.pid, file: raw.file,
        kind: ['image', 'video', 'audio', 'render'].includes(raw.kind) ? raw.kind : 'image',
        mime: typeof raw.mime === 'string' ? raw.mime : '',
        w: Number(raw.w) || null, h: Number(raw.h) || null, dur: Number(raw.dur) || null,
        source: typeof raw.source === 'string' ? raw.source : 'ai',
        provider: typeof raw.provider === 'string' ? raw.provider : '',
        createdAt: Number(raw.createdAt) || Date.now(),
      }
    }
    const normalizeRefs = (list) => (Array.isArray(list) ? list.map(normalizeRef).filter(Boolean).slice(0, 12) : [])

    function normalizeShot(shot) {
      return {
        id: typeof shot?.id === 'string' ? shot.id : uid('s'),
        shotSize: SHOT_SIZES.includes(shot?.shotSize) ? shot.shotSize : '中景',
        camera: CAMERAS.includes(shot?.camera) ? shot.camera : '固定',
        description: String(shot?.description ?? ''),
        cast: Array.isArray(shot?.cast) ? shot.cast.map((name) => String(name || '').trim()).filter(Boolean).slice(0, 6) : [],
        // castSet：出镜角色是明确指定的（AI 给出或手动勾选）；否则按姓名在文字里自动匹配。
        castSet: Boolean(shot?.castSet) || (Array.isArray(shot?.cast) && shot.cast.some((name) => String(name || '').trim())),
        dialogue: String(shot?.dialogue ?? ''),
        duration: Number.isFinite(Number(shot?.duration)) && Number(shot.duration) >= 0 ? Number(shot.duration) : 3,
        imagePrompt: String(shot?.imagePrompt ?? ''),
        videoPrompt: String(shot?.videoPrompt ?? ''),
        image: normalizeRef(shot?.image),
        images: normalizeRefs(shot?.images),
        video: normalizeRef(shot?.video),
        audio: normalizeRef(shot?.audio),
        audioText: String(shot?.audioText ?? ''),
      }
    }

    function normalizeProject(raw) {
      const base = makeProject()
      if (!raw || typeof raw !== 'object') return base
      const brief = raw.brief && typeof raw.brief === 'object' ? raw.brief : {}
      const visual = raw.visual && typeof raw.visual === 'object' ? raw.visual : {}
      const project = {
        ...base,
        id: typeof raw.id === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/.test(raw.id) ? raw.id : base.id,
        name: typeof raw.name === 'string' && raw.name ? raw.name : '未命名短剧',
        createdAt: Number(raw.createdAt) || base.createdAt,
        updatedAt: Number(raw.updatedAt) || base.updatedAt,
        brief: {
          logline: typeof brief.logline === 'string' ? brief.logline : '',
          genre: GENRES.includes(brief.genre) ? brief.genre : '逆袭',
          episodes: Math.max(1, Math.min(60, Math.round(Number(brief.episodes) || 10))),
          style: STYLES.includes(brief.style) ? brief.style : '写实',
        },
        visual: {
          look: LOOKS.some((look) => look.id === visual.look) ? visual.look : 'natural',
          extra: String(visual.extra ?? ''),
          negative: String(visual.negative ?? ''),
        },
        narratorVoice: String(raw.narratorVoice ?? ''),
        checklist: raw.checklist && typeof raw.checklist === 'object' ? { ...raw.checklist } : {},
        characters: Array.isArray(raw.characters) ? raw.characters.map((c) => ({
          id: typeof c?.id === 'string' ? c.id : uid('c'),
          name: String(c?.name ?? ''),
          identity: String(c?.identity ?? ''),
          personality: String(c?.personality ?? ''),
          appearance: String(c?.appearance ?? ''),
          portrait: normalizeRef(c?.portrait),
          portraits: normalizeRefs(c?.portraits),
          voice: String(c?.voice ?? ''),
        })) : [],
        episodes: Array.isArray(raw.episodes) ? raw.episodes.map((e, i) => {
          const publish = e?.publish && typeof e.publish === 'object' ? e.publish : {}
          return {
            id: typeof e?.id === 'string' ? e.id : uid('e'),
            index: i + 1,
            title: String(e?.title ?? `第${i + 1}集`),
            hook: String(e?.hook ?? ''),
            conflict: String(e?.conflict ?? ''),
            cliffhanger: String(e?.cliffhanger ?? ''),
            publish: {
              platform: PLATFORMS.some((item) => item.id === publish.platform) ? publish.platform : 'douyin',
              titles: Array.isArray(publish.titles) ? publish.titles.map(String).slice(0, 6) : [],
              caption: String(publish.caption ?? ''),
              tags: Array.isArray(publish.tags) ? publish.tags.map((tag) => String(tag).replace(/^#/, '')).filter(Boolean).slice(0, 8) : [],
              coverText: String(publish.coverText ?? ''),
              pick: Math.max(0, Number(publish.pick) || 0),
            },
            cover: typeof e?.cover === 'string' ? e.cover : null,
            renders: normalizeRefs(e?.renders),
            bgm: normalizeRef(e?.bgm),
          }
        }) : [],
        boards: {},
      }
      const boards = raw.boards && typeof raw.boards === 'object' ? raw.boards : {}
      for (const [key, list] of Object.entries(boards)) {
        if (!Array.isArray(list) || !/^[1-9][0-9]*$/.test(key) || Number(key) > Math.max(project.episodes.length, project.brief.episodes)) continue
        project.boards[key] = list.map(normalizeShot)
      }
      return project
    }

    function normalizeStore(raw) {
      const source = raw && typeof raw === 'object' ? raw : {}
      const projects = Array.isArray(source.projects) ? source.projects.map(normalizeProject) : []
      const activeId = projects.some((p) => p.id === source.activeId) ? source.activeId : (projects[0]?.id ?? null)
      return { projects, activeId }
    }

    /** 删除一集：同时删掉它的分镜，其余分镜随分集重新编号。 */
    function removeEpisode(draft, id) {
      const nextBoards = {}
      draft.episodes = draft.episodes.filter((e) => e.id !== id).map((e, i) => {
        if (draft.boards[String(e.index)]) nextBoards[String(i + 1)] = draft.boards[String(e.index)]
        return { ...e, index: i + 1 }
      })
      draft.boards = nextBoards
      draft.brief.episodes = Math.max(1, draft.episodes.length)
    }
    //#endregion

    //#region 接口
    async function request(path, body) {
      const init = body === undefined
        ? { method: 'GET' }
        : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
      let response
      try {
        response = await fetch(`${API}/${path}`, init)
      } catch (error) {
        throw new Error(`连不上插件后端（${error?.message || error}）`)
      }
      let payload = null
      try {
        payload = await response.json()
      } catch {
        throw new Error(response.status === 404
          ? '后端还是旧版本：请重启 DeepSeek Harness 后再试。'
          : `后端返回了非 JSON 内容（HTTP ${response.status}）`)
      }
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || `请求失败（HTTP ${response.status}）`)
      return payload
    }

    const mediaUrl = (ref) => (ref ? `${API}/media/${encodeURIComponent(ref.pid)}/${encodeURIComponent(ref.file)}` : '')

    async function uploadMedia(pid, blob, { name = '', source = 'upload', target = null } = {}) {
      const query = new URLSearchParams({ pid, name, source, target: JSON.stringify(target) })
      let response
      try {
        response = await fetch(`${API}/media/upload?${query}`, { method: 'POST', headers: { 'content-type': 'application/octet-stream' }, body: blob })
      } catch (error) {
        throw new Error(`上传失败（${error?.message || error}）`)
      }
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok) throw new Error(payload?.error || `上传失败（HTTP ${response.status}）`)
      return normalizeRef(payload.asset)
    }
    //#endregion

    //#region 纯函数
    function download(filename, text, mime) {
      const blob = new Blob([text], { type: mime })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.style.display = 'none'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      setTimeout(() => URL.revokeObjectURL(url), 3000)
    }

    function downloadUrl(url, filename) {
      const anchor = document.createElement('a')
      anchor.href = `${url}?download=${encodeURIComponent(filename)}`
      anchor.download = filename
      anchor.style.display = 'none'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch {
        try {
          const area = document.createElement('textarea')
          area.value = text
          area.style.position = 'fixed'
          area.style.opacity = '0'
          document.body.appendChild(area)
          area.select()
          const ok = document.execCommand('copy')
          area.remove()
          return ok
        } catch {
          return false
        }
      }
    }

    const safeName = (value) => String(value || '短剧项目').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 60)
    const totalDuration = (shots) => shots.reduce((sum, shot) => sum + (Number(shot.duration) || 0), 0)
    const shotsOf = (project, index) => project?.boards?.[String(index)] || []
    const pad2 = (value) => String(value).padStart(2, '0')
    const clock = (seconds) => {
      const total = Math.max(0, Math.round(seconds))
      return `${Math.floor(total / 60)}:${pad2(total % 60)}`
    }

    /**
     * 把「林晚（低声）：你是谁？」拆成说话人与台词。
     * 没有台词（空、「（无）」）时返回 null。
     */
    function parseDialogue(text) {
      const raw = String(text || '').trim()
      if (!raw || /^[（(]?\s*无\s*[)）]?$/.test(raw)) return null
      const lines = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean)
      let speaker = ''
      const spoken = []
      for (const line of lines) {
        const match = /^([^：:（(「“"]{1,10})(?:[（(][^）)]*[）)])?\s*[：:]\s*(.+)$/.exec(line)
        const body = (match ? match[2] : line).replace(/[（(][^）)]*[）)]/g, '').replace(/^[“"「『]+|[”"」』]+$/g, '').trim()
        if (match && !speaker) speaker = match[1].trim()
        if (body) spoken.push(body)
      }
      const line = spoken.join(' ')
      return line ? { speaker, line } : null
    }

    /** 与后端 splitSubtitle 相同的切分规则，用于试映时的字幕。 */
    function splitSubtitle(text, maxChars = 12) {
      const clean = String(text || '').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim()
      if (!clean) return []
      const parts = clean.split(/(?<=[。！？!?；;…，,、])/).map((part) => part.trim()).filter(Boolean)
      const cues = []
      let current = ''
      const flush = () => { if (current) { cues.push(current); current = '' } }
      for (const part of parts) {
        if ((current + part).length <= maxChars) { current += part; continue }
        flush()
        if (part.length <= maxChars) { current = part; continue }
        for (let i = 0; i < part.length; i += maxChars) {
          const slice = part.slice(i, i + maxChars)
          if (slice.length === maxChars || i + maxChars < part.length) cues.push(slice)
          else current = slice
        }
      }
      flush()
      return cues.map((cue) => cue.replace(/[，,、；;]+$/, '')).filter(Boolean)
    }

    const stripTail = (text) => String(text || '').trim().replace(/[。.；;，,\s]+$/, '')

    /** 这个镜头里出现了哪些角色：优先用 cast 字段，没有就按姓名在文字里找。 */
    function castOf(project, shot) {
      const named = project.characters.filter((c) => c.name.trim())
      if (shot.castSet) return named.filter((c) => shot.cast.includes(c.name.trim()))
      const haystack = `${shot.imagePrompt}\n${shot.description}`
      return named.filter((c) => haystack.includes(c.name.trim()))
    }

    /**
     * 拼出真正发给出图引擎的提示词：画风 + 影调 + 画面 + 出镜角色的固定外貌 + 画幅。
     * 外貌由这里逐字拼接，不依赖模型自己记得抄。
     */
    function composeImagePrompt(project, shot) {
      const look = LOOKS.find((item) => item.id === project.visual.look)
      const scene = (shot.imagePrompt.trim() || shot.description.trim())
      const cast = castOf(project, shot)
      const sheets = cast
        .filter((c) => c.appearance.trim() && !scene.includes(stripTail(c.appearance)))
        .map((c) => `${c.name.trim()}：${stripTail(c.appearance)}`)
      const parts = [
        STYLE_PROMPTS[project.brief.style] || '',
        look?.prompt || '',
        `${shot.shotSize}镜头`,
        stripTail(scene),
        sheets.length ? `人物设定——${sheets.join('；')}` : '',
        stripTail(project.visual.extra),
        /9\s*[:：]\s*16/.test(scene) ? '' : '竖屏 9:16 构图',
      ].filter(Boolean)
      return {
        prompt: scene ? parts.join('，') : '',
        cast,
        refs: cast.map((c) => c.portrait).filter(Boolean).slice(0, 4),
      }
    }

    function composePortraitPrompt(project, character) {
      const look = LOOKS.find((item) => item.id === project.visual.look)
      return [
        STYLE_PROMPTS[project.brief.style] || '',
        look?.prompt || '',
        '角色定妆照，单人半身肖像，正面平视镜头，表情自然',
        stripTail(character.appearance),
        '干净的浅灰色背景，柔和棚拍光，竖屏 9:16 构图',
      ].filter(Boolean).join('，')
    }

    function csvCell(value) {
      const raw = String(value ?? '')
      const text = /^[=+@-]/.test(raw) ? `'${raw}` : raw
      return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
    }
    const mdCell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')

    function toMarkdown(project, index, shots) {
      const lines = [`# ${project.name}`, '', `> ${project.brief.logline || '（未填写梗概）'}`, '',
        `- 题材：${project.brief.genre}　画风：${project.brief.style}　集数：${project.brief.episodes}　画幅：9:16`, '']
      if (project.characters.length > 0) {
        lines.push('## 角色卡', '', '| 姓名 | 身份 | 性格 | 固定外貌 |', '| --- | --- | --- | --- |')
        for (const c of project.characters) lines.push(`| ${mdCell(c.name)} | ${mdCell(c.identity)} | ${mdCell(c.personality)} | ${mdCell(c.appearance)} |`)
        lines.push('')
      }
      const episode = project.episodes.find((e) => e.index === index)
      lines.push(`## 第 ${index} 集 分镜表${episode?.title ? `：${episode.title}` : ''}`, '')
      if (episode) lines.push(`- 前 3 秒钩子：${episode.hook}`, `- 本集冲突：${episode.conflict}`, `- 结尾卡点：${episode.cliffhanger}`, '')
      lines.push('| 镜号 | 景别 | 运镜 | 画面描述 | 台词/旁白 | 时长(秒) | AI 生图提示词 | AI 视频提示词 |', '| --- | --- | --- | --- | --- | --- | --- | --- |')
      shots.forEach((shot, i) => {
        lines.push(`| ${i + 1} | ${shot.shotSize} | ${shot.camera} | ${mdCell(shot.description)} | ${mdCell(shot.dialogue)} | ${shot.duration} | ${mdCell(composeImagePrompt(project, shot).prompt)} | ${mdCell(shot.videoPrompt)} |`)
      })
      lines.push('', `合计 ${totalDuration(shots)} 秒。`)
      return lines.join('\n')
    }

    function toCsv(project, index, shots) {
      const rows = [['镜号', '景别', '运镜', '画面描述', '台词/旁白', '时长(秒)', 'AI 生图提示词', 'AI 视频提示词']]
      shots.forEach((shot, i) => {
        rows.push([i + 1, shot.shotSize, shot.camera, shot.description, shot.dialogue, shot.duration, composeImagePrompt(project, shot).prompt, shot.videoPrompt])
      })
      const episode = project.episodes.find((e) => e.index === index)
      const meta = [[`# ${project.name}`], [`# 题材：${project.brief.genre}　画风：${project.brief.style}　画幅：9:16`], [`# 第 ${index} 集${episode?.title ? `：${episode.title}` : ''}`], []]
      return '﻿' + [...meta, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
    }

    /** 一集的制作进度：有多少镜头已经有图、有配音、有成片。 */
    function episodeProgress(project, index) {
      const shots = shotsOf(project, index)
      const spoken = shots.filter((shot) => parseDialogue(shot.dialogue))
      const episode = project.episodes.find((e) => e.index === index)
      return {
        shots: shots.length,
        images: shots.filter((shot) => shot.image).length,
        videos: shots.filter((shot) => shot.video).length,
        spoken: spoken.length,
        voiced: spoken.filter((shot) => shot.audio).length,
        stale: spoken.filter((shot) => shot.audio && shot.audioText && shot.audioText !== parseDialogue(shot.dialogue)?.line).length,
        seconds: totalDuration(shots),
        render: episode?.renders?.[0] || null,
      }
    }

    function projectChecks(project) {
      const checks = []
      if (!project.brief.logline.trim()) checks.push({ text: '补充一句话故事梗概', detail: '明确主角、目标与核心冲突。', tab: 'brief' })
      const missingLooks = project.characters.filter((c) => !c.appearance.trim()).length
      if (!project.characters.length) checks.push({ text: '建立主要角色', detail: '先固定外貌，再开始设计镜头。', tab: 'cast' })
      else if (missingLooks) checks.push({ text: `${missingLooks} 个角色缺少固定外貌`, detail: '为角色填写可重复使用的视觉描述。', tab: 'cast' })
      const noPortrait = project.characters.filter((c) => c.appearance.trim() && !c.portrait).length
      if (noPortrait) checks.push({ text: `${noPortrait} 个角色还没有定妆照`, detail: '定妆照会作为参考图，帮助同一角色在不同镜头里保持一致。', tab: 'cast' })
      const missingEpisodes = project.episodes.filter((e) => !e.hook.trim() || !e.conflict.trim() || !e.cliffhanger.trim()).length
      if (!project.episodes.length) checks.push({ text: '添加第一集故事', detail: '写好开场钩子、冲突和结尾卡点。', tab: 'episodes' })
      else if (missingEpisodes) checks.push({ text: `${missingEpisodes} 集故事尚未完整`, detail: '检查开场钩子、冲突与结尾卡点。', tab: 'episodes' })
      const boards = project.episodes.map((e) => [e.index, shotsOf(project, e.index)])
      const pending = boards.filter(([, shots]) => !shots.length).length
      if (pending) checks.push({ text: `${pending} 集等待镜头设计`, detail: '把分集故事拆成可以生成的镜头。', tab: 'board' })
      const all = boards.flatMap(([, shots]) => shots)
      const noDescription = all.filter((s) => !s.description.trim()).length
      if (noDescription) checks.push({ text: `${noDescription} 个镜头缺少画面描述`, detail: '补充场景、人物动作与画面重点。', tab: 'board' })
      const noImage = all.filter((s) => !s.image).length
      if (all.length && noImage) checks.push({ text: `${noImage} 个镜头还没有关键帧`, detail: '在分镜页批量出图，或逐个镜头生成。', tab: 'board' })
      const invalid = boards.filter(([, shots]) => shots.some((s) => !Number.isFinite(Number(s.duration)) || Number(s.duration) <= 0))
      if (invalid.length) checks.push({ text: `${invalid.length} 集存在无效镜头时长`, detail: '镜头时长应为大于 0 的秒数。', tab: 'board' })
      const over = boards.filter(([, shots]) => totalDuration(shots) > 120)
      if (over.length) checks.push({ text: `${over.length} 集总时长超过 120 秒`, detail: '按发布目标检查节奏与时长。', tab: 'board' })
      const unrendered = boards.filter(([index, shots]) => shots.length && shots.every((s) => s.image) && !episodeProgress(project, index).render).length
      if (unrendered) checks.push({ text: `${unrendered} 集可以合成成片了`, detail: '关键帧已齐，去成片页配音并合成。', tab: 'studio' })
      return checks
    }
    //#endregion
    //#endregion

    //#region 20-ui.js
    // 通用界面组件：图标、按钮、表单、画框、灯箱、菜单。
    const ICONS = {
      home: 'M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9',
      brief: 'M8 3h8l4 4v14H4V3h4m8 0v5h4M8 12h8m-8 4h6',
      cast: 'M15 21v-2a5 5 0 0 0-10 0v2m12-15a4 4 0 0 1 0 8m2 3a4 4 0 0 1 3 4M14 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
      episodes: 'M8 3h12v16M4 7h12v14H4zM8 11h4m-4 4h4',
      board: 'M3 4h18v16H3zM3 9h18M8 4l3 5m4-5 3 5',
      studio: 'M3 6h13v12H3zM16 10l5-3v10l-5-3',
      publish: 'M12 16V4m-5 5 5-5 5 5M4 15v5h16v-5',
      library: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
      engine: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6m8-3a8 8 0 0 0-.2-1.7l2-1.5-2-3.4-2.3 1a8 8 0 0 0-3-1.7L14 2h-4l-.5 2.7a8 8 0 0 0-3 1.7l-2.3-1-2 3.4 2 1.5a8 8 0 0 0 0 3.4l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 3 1.7L10 22h4l.5-2.7a8 8 0 0 0 3-1.7l2.3 1 2-3.4-2-1.5A8 8 0 0 0 20 12',
      plus: 'M12 5v14M5 12h14', search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
      chevron: 'm9 5 7 7-7 7', back: 'm15 5-7 7 7 7', down: 'm5 9 7 7 7-7', up: 'm5 15 7-7 7 7', close: 'm6 6 12 12M6 18 18 6',
      download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', upload: 'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
      copy: 'M8 8h13v13H8zM16 4V2H2v14h2', trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
      moon: 'M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10',
      sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
      sparkles: 'm12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3M21 2v4m-2-2h4',
      check: 'm5 12 4 4L19 6', warning: 'M12 3 2 21h20L12 3m0 6v5m0 3v.1',
      clock: 'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
      grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
      list: 'M8 5h13M8 12h13M8 19h13M3 5h.1M3 12h.1M3 19h.1',
      undo: 'M3 10h11a7 7 0 0 1 0 14M3 10l5-5m-5 5 5 5',
      image: 'M3 4h18v16H3zM3 16l5-5 4 4 3-3 6 6M15.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0',
      film: 'M4 3h16v18H4zM8 3v18M16 3v18M4 8h4M4 13h4M4 18h4M16 8h4M16 13h4M16 18h4',
      mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3M5 11a7 7 0 0 0 14 0M12 18v3',
      play: 'M7 4v16l13-8z', pause: 'M7 4v16M17 4v16', prev: 'M19 5v14L8 12zM5 5v14', next: 'M5 5v14l11-7zM19 5v14',
      volume: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11', mute: 'M4 9v6h4l5 4V5L8 9zM22 9l-6 6m0-6 6 6',
      pencil: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4', expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
      refresh: 'M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4',
      more: 'M5 12h.1M12 12h.1M19 12h.1', key: 'M15 7a4 4 0 1 1-3.9 5H8v3H5v3H2v-3l6.1-6.1A4 4 0 0 1 15 7m1.5 2.5h.1',
      link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
      music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0m11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
      text: 'M5 6V4h14v2M12 4v16m-3 0h6', bolt: 'M13 2 4 14h7l-1 8 9-12h-7z', heart: 'M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11',
      comment: 'M4 5h16v11H9l-5 4z', share: 'M14 5l6 6-6 6v-4c-6 0-9 2-10 6 0-7 3-10 10-10z',
    }

    function Icon({ name, size = 18, className, style }) {
      return h('svg', {
        className: cx('db-icon', className), width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: name === 'more' ? 2.8 : 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, style,
      }, h('path', { d: ICONS[name] || ICONS.brief }))
    }

    const Spinner = () => h('span', { className: 'db-spin', 'aria-hidden': 'true' })

    /** kind: primary | soft | ghost | danger；不传就是描边按钮。 */
    function Btn({ kind, size, icon, busy, children, className, ...props }) {
      return h('button', { type: 'button', className: cx('db-btn', kind, size, className), ...props },
        busy ? h(Spinner) : icon ? h(Icon, { name: icon, size: size === 'sm' ? 15 : 17 }) : null,
        children)
    }

    function IconBtn({ icon, label, className, size, ...props }) {
      return h('button', { type: 'button', className: cx('db-btn icon', size, className), title: label, 'aria-label': label, ...props },
        h(Icon, { name: icon, size: size === 'sm' ? 15 : 17 }))
    }

    function Field({ label, hint, wide, children }) {
      return h('label', { className: cx('db-field', wide && 'wide') },
        h('span', { className: 'db-label' }, label, hint ? h('em', null, hint) : null),
        children)
    }

    function Chips({ options, value, onChange, label }) {
      return h('div', { className: 'db-chips', role: 'group', 'aria-label': label }, options.map((option) => h('button', {
        key: option, type: 'button', className: 'db-chip', 'aria-pressed': option === value, onClick: () => onChange(option),
      }, option)))
    }

    function Segment({ options, value, onChange, label }) {
      return h('div', { className: 'db-seg', role: 'group', 'aria-label': label }, options.map(([id, text, icon]) => h('button', {
        key: id, type: 'button', 'aria-pressed': value === id, onClick: () => onChange(id),
      }, icon ? h(Icon, { name: icon, size: 14 }) : null, text)))
    }

    /** 状态小标签。tone: ok | warn | info | rec | 空。 */
    const Tag = ({ tone, icon, children }) => h('span', { className: cx('db-tag', tone) }, icon ? h(Icon, { name: icon, size: 12 }) : null, children)

    /** 环形进度。 */
    function Ring({ value, size = 34, stroke = 3.5, children }) {
      const radius = (size - stroke) / 2
      const length = 2 * Math.PI * radius
      const ratio = Math.max(0, Math.min(1, value || 0))
      return h('span', { className: cx('db-ring', ratio >= 1 && 'full'), style: { width: size, height: size } },
        h('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}`, 'aria-hidden': true },
          h('circle', { cx: size / 2, cy: size / 2, r: radius, fill: 'none', strokeWidth: stroke, className: 'track' }),
          h('circle', { cx: size / 2, cy: size / 2, r: radius, fill: 'none', strokeWidth: stroke, className: 'bar', strokeLinecap: 'round', strokeDasharray: length, strokeDashoffset: length * (1 - ratio), transform: `rotate(-90 ${size / 2} ${size / 2})` })),
        children ? h('span', { className: 'db-ring-in' }, children) : null)
    }

    function Empty({ icon = 'sparkles', title, children, action }) {
      return h('div', { className: 'db-empty' },
        h('span', { className: 'db-empty-mark' }, h(Icon, { name: icon, size: 22 })),
        title ? h('strong', null, title) : null,
        children ? h('p', null, children) : null,
        action || null)
    }

    /** 运镜方式对应的示意箭头，叠在空画框上，提醒这个镜头会怎么动。 */
    const CAMERA_GLYPH = { 固定: '', 推: '⤢', 拉: '⤡', 摇: '⟷', 移: '⟶', 跟: '⤳', 升降: '⭥' }

    /**
     * 9:16 画框。所有图像都放在同一种深色「监视器」画框里：
     * 没图时是取景框占位，出图中有扫光，图片到达时有一次「显影」。
     */
    function Frame({ asset, video, job, ratio = '9 / 16', shot, index, className, onOpen, fit = 'cover', position, children, emptyLabel }) {
      const src = mediaUrl(asset)
      const previous = useRef(src)
      const [develop, setDevelop] = useState(0)
      const [failed, setFailed] = useState(false)
      useEffect(() => {
        if (src && previous.current !== src) { setDevelop((n) => n + 1); setFailed(false) }
        previous.current = src
      }, [src])
      const active = job && (job.status === 'queued' || job.status === 'running')
      const body = video
        ? h('video', { src: mediaUrl(video), poster: src || undefined, muted: true, loop: true, playsInline: true, preload: 'metadata', onMouseEnter: (e) => e.currentTarget.play().catch(() => {}), onMouseLeave: (e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 } })
        : src && !failed
          ? h('img', { key: `${src}-${develop}`, className: develop ? 'develop' : '', src, alt: shot?.description?.slice(0, 60) || '', loading: 'lazy', draggable: false, style: { objectFit: fit, objectPosition: position }, onError: () => setFailed(true) })
          : h('div', { className: 'db-frame-ph' },
            h('i', { className: 'tl' }), h('i', { className: 'tr' }), h('i', { className: 'bl' }), h('i', { className: 'br' }),
            failed ? h('span', null, '图片文件找不到了') : h('span', null,
              shot ? h('b', null, shot.shotSize) : null,
              shot && CAMERA_GLYPH[shot.camera] ? h('em', null, CAMERA_GLYPH[shot.camera], ' ', shot.camera) : null,
              emptyLabel ? h('small', null, emptyLabel) : null))
      return h('div', { className: cx('db-frame', className, active && 'busy', onOpen && 'clickable'), style: { aspectRatio: ratio }, onClick: onOpen, role: onOpen ? 'button' : undefined, tabIndex: onOpen ? 0 : undefined, onKeyDown: onOpen ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } } : undefined, 'aria-label': onOpen && index !== undefined ? `镜头 ${index + 1}` : undefined },
        body,
        active ? h('div', { className: 'db-frame-gen', role: 'status' },
          h('span', { className: 'db-frame-sweep' }),
          h('span', { className: 'db-frame-gen-text' }, job.status === 'queued' ? '排队中' : job.message || '生成中')) : null,
        children)
    }

    /** 全屏看图 / 看视频。 */
    function Lightbox({ items, start = 0, onClose }) {
      const [index, setIndex] = useState(start)
      const item = items[Math.max(0, Math.min(items.length - 1, index))]
      useEffect(() => {
        const handler = (event) => {
          if (event.key === 'Escape') onClose()
          if (event.key === 'ArrowLeft') setIndex((n) => Math.max(0, n - 1))
          if (event.key === 'ArrowRight') setIndex((n) => Math.min(items.length - 1, n + 1))
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
      }, [items.length, onClose])
      if (!item) return null
      const isVideo = item.asset.kind === 'video' || item.asset.kind === 'render'
      return h('div', { className: 'db-lightbox', role: 'dialog', 'aria-modal': true, 'aria-label': '查看素材', onClick: (e) => { if (e.target === e.currentTarget) onClose() } },
        h('div', { className: 'db-lightbox-stage' },
          isVideo
            ? h('video', { key: item.asset.file, src: mediaUrl(item.asset), controls: true, autoPlay: true, playsInline: true })
            : item.asset.kind === 'audio'
              ? h('audio', { key: item.asset.file, src: mediaUrl(item.asset), controls: true, autoPlay: true })
              : h('img', { key: item.asset.file, src: mediaUrl(item.asset), alt: item.title || '' })),
        h('div', { className: 'db-lightbox-bar' },
          h('div', { className: 'db-lightbox-meta' },
            h('strong', null, item.title || '素材'),
            item.note ? h('span', null, item.note) : null),
          items.length > 1 ? h('span', { className: 'db-lightbox-count' }, `${index + 1} / ${items.length}`) : null,
          items.length > 1 ? h(IconBtn, { icon: 'back', label: '上一张', disabled: index === 0, onClick: () => setIndex(index - 1) }) : null,
          items.length > 1 ? h(IconBtn, { icon: 'chevron', label: '下一张', disabled: index === items.length - 1, onClick: () => setIndex(index + 1) }) : null,
          item.actions || null,
          h(IconBtn, { icon: 'download', label: '下载', onClick: () => downloadUrl(mediaUrl(item.asset), `${safeName(item.title || '素材')}.${item.asset.file.split('.').pop()}`) }),
          h(IconBtn, { icon: 'close', label: '关闭', onClick: onClose })))
    }

    /** 下拉菜单：items 为 [{ label, hint, icon, onClick, disabled, danger }]。 */
    function Menu({ button, items, align = 'right' }) {
      const [open, setOpen] = useState(false)
      const box = useRef(null)
      useEffect(() => {
        if (!open) return
        const close = (event) => { if (!box.current?.contains(event.target)) setOpen(false) }
        const key = (event) => { if (event.key === 'Escape') setOpen(false) }
        document.addEventListener('mousedown', close)
        document.addEventListener('keydown', key)
        return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', key) }
      }, [open])
      return h('span', { className: 'db-menu', ref: box },
        button({ open, toggle: () => setOpen((value) => !value) }),
        open ? h('div', { className: cx('db-menu-pop', align), role: 'menu' }, items.filter(Boolean).map((item) => h('button', {
          key: item.label, type: 'button', role: 'menuitem', className: cx(item.danger && 'danger'), disabled: item.disabled,
          onClick: () => { setOpen(false); item.onClick() },
        }, item.icon ? h(Icon, { name: item.icon, size: 16 }) : null, h('span', null, item.label, item.hint ? h('small', null, item.hint) : null)))) : null)
    }

    /** 点一下试听的小播放键；同一时间只响一个。 */
    let playingAudio = null
    function AudioChip({ asset, label = '试听' }) {
      const [playing, setPlaying] = useState(false)
      const audio = useRef(null)
      useEffect(() => () => { audio.current?.pause() }, [])
      useEffect(() => { audio.current?.pause(); audio.current = null; setPlaying(false) }, [asset?.file])
      if (!asset) return null
      const toggle = () => {
        if (playing) { audio.current?.pause(); return }
        playingAudio?.pause()
        const element = audio.current || new Audio(mediaUrl(asset))
        audio.current = element
        playingAudio = element
        element.onended = element.onpause = () => setPlaying(false)
        element.onplay = () => setPlaying(true)
        element.currentTime = 0
        element.play().catch(() => setPlaying(false))
      }
      return h('button', { type: 'button', className: cx('db-audio', playing && 'on'), onClick: toggle, 'aria-label': playing ? '停止' : label },
        h(Icon, { name: playing ? 'pause' : 'play', size: 12 }),
        h('span', { className: 'db-audio-wave', 'aria-hidden': true }, h('i'), h('i'), h('i'), h('i')),
        asset.dur ? h('span', null, `${asset.dur.toFixed(1)} 秒`) : h('span', null, label))
    }

    /** 选文件按钮（上传图片 / 视频 / 配乐）。 */
    function FilePick({ accept, onPick, children, ...props }) {
      const input = useRef(null)
      return h(Fragment, null,
        h('input', { type: 'file', accept, hidden: true, ref: input, onChange: (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) onPick(file) } }),
        h(Btn, { ...props, onClick: () => input.current?.click() }, children))
    }
    //#endregion

    //#region 30-sketch.js
    // 本地分镜草图：不接任何出图引擎也能先把画面位置占上、把整条流程跑通。
    // 按景别决定人物大小，按影调取色，同一个镜头每次画出来都一样（用镜头 ID 做随机种子）。

    function seededRandom(text) {
      let seed = 2166136261
      for (let i = 0; i < text.length; i += 1) { seed ^= text.charCodeAt(i); seed = Math.imul(seed, 16777619) }
      return () => {
        seed += 0x6d2b79f5
        let t = seed
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }

    /** 人物剪影：头 + 肩 + 躯干。unit 是头的半径。 */
    function drawFigure(ctx, x, baseY, unit, fill, rim) {
      ctx.save()
      ctx.translate(x, baseY)
      ctx.beginPath()
      ctx.arc(0, -unit * 6.3, unit, 0, Math.PI * 2)
      ctx.moveTo(-unit * 0.42, -unit * 5.4)
      ctx.lineTo(unit * 0.42, -unit * 5.4)
      ctx.quadraticCurveTo(unit * 2.1, -unit * 5.1, unit * 2.15, -unit * 3.6)
      ctx.lineTo(unit * 1.75, unit * 0.4)
      ctx.lineTo(-unit * 1.75, unit * 0.4)
      ctx.lineTo(-unit * 2.15, -unit * 3.6)
      ctx.quadraticCurveTo(-unit * 2.1, -unit * 5.1, -unit * 0.42, -unit * 5.4)
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
      ctx.lineWidth = Math.max(2, Math.min(7, unit * 0.07))
      ctx.strokeStyle = rim
      ctx.stroke()
      ctx.restore()
    }

    function renderSketch(project, shot, index) {
      const width = 720
      const height = 1280
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      const random = seededRandom(shot.id)
      const look = LOOKS.find((item) => item.id === project.visual.look) || LOOKS[0]
      const [dark, mid, light] = look.colors

      // 背景：上方是墙或天，下方是带透视线的地面。
      const horizon = height * (0.52 + random() * 0.12)
      const sky = ctx.createLinearGradient(0, 0, 0, horizon)
      sky.addColorStop(0, dark)
      sky.addColorStop(1, mid)
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, width, horizon)
      const ground = ctx.createLinearGradient(0, horizon, 0, height)
      ground.addColorStop(0, mid)
      ground.addColorStop(1, dark)
      ctx.fillStyle = ground
      ctx.fillRect(0, horizon, width, height - horizon)
      ctx.globalAlpha = 0.16
      ctx.strokeStyle = light
      ctx.lineWidth = 2
      const vanish = width * (0.3 + random() * 0.4)
      for (let i = -4; i <= 8; i += 1) {
        ctx.beginPath()
        ctx.moveTo(vanish, horizon)
        ctx.lineTo(i * width / 4, height)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // 主光：一团柔光，位置随镜头变化。
      const glowX = width * (0.2 + random() * 0.6)
      const glowY = horizon * (0.25 + random() * 0.4)
      const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, width * 0.9)
      glow.addColorStop(0, `${light}cc`)
      glow.addColorStop(0.25, `${light}44`)
      glow.addColorStop(1, `${light}00`)
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      // 人物：景别越近，人越大。
      const cast = castOf(project, shot)
      const count = Math.min(3, cast.length)
      const unitBySize = { 远景: 15, 全景: 42, 中景: 78, 近景: 128, 特写: 215 }
      const baseBySize = { 远景: horizon + 70, 全景: height * 0.9, 中景: height * 1.06, 近景: height * 1.28, 特写: height * 1.58 }
      const unit = unitBySize[shot.shotSize] || 78
      if (count === 0 && (shot.shotSize === '特写' || shot.shotSize === '近景')) {
        // 没有人物的近景多半是道具：画一个被光打亮的物件。
        const size = width * 0.34
        ctx.save()
        ctx.translate(width / 2, height * 0.56)
        ctx.rotate((random() - 0.5) * 0.5)
        ctx.fillStyle = `${dark}ee`
        ctx.strokeStyle = `${light}cc`
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.roundRect(-size / 2, -size * 0.32, size, size * 0.64, size * 0.12)
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }
      for (let i = 0; i < count; i += 1) {
        const spread = count === 1 ? 0.5 : 0.24 + (0.52 * i) / (count - 1)
        const x = width * (spread + (random() - 0.5) * 0.06)
        const scale = count > 1 && i > 0 ? 0.86 + random() * 0.1 : 1
        drawFigure(ctx, x, baseBySize[shot.shotSize] || height, unit * scale, `${dark}f2`, `${light}aa`)
      }

      // 铅笔排线与颗粒，让它一眼看得出是草图。
      ctx.globalAlpha = 0.07
      ctx.strokeStyle = light
      ctx.lineWidth = 1.5
      for (let i = 0; i < 90; i += 1) {
        const x = random() * width
        const y = random() * height
        const length = 40 + random() * 120
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + length, y - length * 0.6)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, height * 0.75)
      vignette.addColorStop(0, '#00000000')
      vignette.addColorStop(1, '#000000aa')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)

      // 左下角标注：这是草图，不是成片画面（避开顶部进度条和字幕区）。
      ctx.font = '600 26px -apple-system, "PingFang SC", sans-serif'
      ctx.textBaseline = 'top'
      const label = `草图 ${pad2(index + 1)}　${shot.shotSize} / ${shot.camera}`
      const labelWidth = ctx.measureText(label).width
      ctx.fillStyle = '#00000088'
      ctx.beginPath()
      ctx.roundRect(28, height - 78, labelWidth + 32, 50, 12)
      ctx.fill()
      ctx.fillStyle = '#ffffffdd'
      ctx.fillText(label, 44, height - 66)

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('草图绘制失败'))), 'image/jpeg', 0.86)
      })
    }
    //#endregion

    //#region 40-store.js
    // 工作台状态：项目数据、自动保存、撤销、后台任务、引擎配置与所有生成动作。
    const StudioContext = createContext(null)
    const useStudio = () => useContext(StudioContext)
    const clone = (value) => JSON.parse(JSON.stringify(value))
    const isActive = (job) => job.status === 'queued' || job.status === 'running'

    function useStudioState() {
      const [store, setStore] = useState({ projects: [], activeId: null })
      const [loaded, setLoaded] = useState(false)
      const [loadError, setLoadError] = useState('')
      const [tab, setTab] = useState('overview')
      const [episodeIndex, setEpisodeIndex] = useState(1)
      const [selectedShot, setSelectedShot] = useState(null)
      const [busy, setBusy] = useState(null)
      const [elapsed, setElapsed] = useState(0)
      const [saving, setSaving] = useState(false)
      const [saveError, setSaveError] = useState(false)
      const [retrySave, setRetrySave] = useState(0)
      const [model, setModel] = useState(null)
      const [engine, setEngine] = useState(null)
      const [jobs, setJobs] = useState([])
      const [toasts, setToasts] = useState([])
      const [dialog, setDialog] = useState(null)
      const [undoStore, setUndoStore] = useState(null)
      const [lightbox, setLightbox] = useState(null)
      const [theme, setTheme] = useState(() => { try { return localStorage.getItem('drama-studio-theme') || 'light' } catch { return 'light' } })

      const current = useRef(store)
      current.current = store
      const savedSnapshot = useRef('')
      const pendingSave = useRef(null)
      const writing = useRef(false)
      const mounted = useRef(true)
      const dialogResolve = useRef(null)
      const handled = useRef(new Set())
      const abortText = useRef(null)

      const project = useMemo(() => store.projects.find((p) => p.id === store.activeId) || null, [store])

      useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
      useEffect(() => { try { localStorage.setItem('drama-studio-theme', theme) } catch { /* 记不住也没关系 */ } }, [theme])
      useEffect(() => {
        if (!busy) { setElapsed(0); return undefined }
        const started = Date.now()
        const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
        return () => clearInterval(timer)
      }, [busy])
      useEffect(() => {
        if (project && !project.episodes.some((e) => e.index === episodeIndex)) setEpisodeIndex(project.episodes[0]?.index || 1)
      }, [project?.id, project?.episodes.length, episodeIndex])

      //#region 提示与确认
      const toast = useCallback((tone, text, action) => {
        const id = uid('t')
        setToasts((list) => [...list.slice(-3), { id, tone, text, action }])
        if (tone !== 'err') setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 4200)
      }, [])
      const copy = useCallback(async (text, what = '内容') => {
        const ok = Boolean(text) && await copyText(text)
        toast(ok ? 'ok' : 'err', ok ? `已复制${what}。` : '复制失败，请手动选中文本复制。')
      }, [toast])
      const dismissToast = useCallback((id) => setToasts((list) => list.filter((item) => item.id !== id)), [])

      /** 弹确认框。返回 true（主操作）、'alt'（次操作）或 false（取消）。 */
      const ask = useCallback((title, text, action = '确认', options = {}) => new Promise((resolve) => {
        dialogResolve.current = resolve
        setDialog({ title, text, action, ...options })
      }), [])
      const answer = useCallback((value) => { setDialog(null); dialogResolve.current?.(value); dialogResolve.current = null }, [])
      //#endregion

      //#region 读取与保存
      const reloadEngine = useCallback(async () => {
        try {
          const view = await request('settings')
          if (mounted.current) setEngine(view)
          return view
        } catch (error) {
          if (mounted.current) setEngine({ error: error.message })
          return null
        }
      }, [])

      useEffect(() => {
        let alive = true
        ;(async () => {
          try {
            const payload = await request('state')
            if (!alive) return
            const initial = normalizeStore(payload.state)
            savedSnapshot.current = JSON.stringify(initial)
            setStore(initial)
            setModel(payload.model || null)
            setLoaded(true)
          } catch (error) {
            if (alive) setLoadError(error.message)
          }
        })()
        reloadEngine()
        return () => { alive = false }
      }, [reloadEngine])

      // 串行写入：慢的旧请求不能盖掉新的编辑。
      useEffect(() => {
        if (!loaded) return undefined
        const snapshot = JSON.stringify(store)
        if (snapshot === savedSnapshot.current && !writing.current && !pendingSave.current) return undefined
        pendingSave.current = store
        setSaving(true)
        const drain = async () => {
          if (writing.current) return
          writing.current = true
          try {
            while (pendingSave.current) {
              const next = pendingSave.current
              pendingSave.current = null
              try {
                await request('state', { state: next })
                savedSnapshot.current = JSON.stringify(next)
                if (mounted.current) setSaveError(false)
              } catch (error) {
                pendingSave.current = pendingSave.current || next
                if (mounted.current) { setSaveError(true); toast('err', `尚未保存：${error.message}。请重试或导出备份。`) }
                break
              }
            }
          } finally {
            writing.current = false
            if (mounted.current) setSaving(false)
          }
        }
        const timer = setTimeout(drain, 600)
        return () => clearTimeout(timer)
      }, [store, loaded, retrySave, toast])

      useEffect(() => {
        const handler = (event) => {
          if (savedSnapshot.current && JSON.stringify(current.current) !== savedSnapshot.current) { event.preventDefault(); event.returnValue = '' }
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
      }, [])

      /** 修改一个项目（默认是当前项目）。 */
      const patch = useCallback((mutate, pid) => {
        setStore((state) => {
          const id = pid || state.activeId
          const target = state.projects.find((p) => p.id === id)
          if (!target) return state
          const draft = clone(target)
          mutate(draft)
          draft.updatedAt = Date.now()
          return { ...state, projects: state.projects.map((p) => (p.id === id ? draft : p)) }
        })
      }, [])

      const patchShot = useCallback((shotId, mutate) => patch((draft) => {
        for (const list of Object.values(draft.boards)) {
          const shot = list.find((item) => item.id === shotId)
          if (shot) { mutate(shot, list); return }
        }
      }), [patch])
      //#endregion

      //#region 项目管理
      const navigate = useCallback((next, index, shotId) => {
        setTab(next)
        if (index) setEpisodeIndex(index)
        if (shotId !== undefined) setSelectedShot(shotId)
        document.querySelector('.db-scroll')?.scrollTo({ top: 0 })
      }, [])

      const createProject = useCallback(() => {
        const created = makeProject(`新短剧 ${new Date().toLocaleDateString('zh-CN')}`)
        created.episodes = Array.from({ length: 3 }, (_, i) => blankEpisode(i + 1))
        created.brief.episodes = 3
        setUndoStore(current.current)
        setStore((state) => ({ projects: [created, ...state.projects], activeId: created.id }))
        setTab('brief')
        setEpisodeIndex(1)
        setSelectedShot(null)
        toast('ok', '已新建项目，先写一句故事梗概。')
      }, [toast])

      const switchProject = useCallback((id) => {
        setStore((state) => ({ ...state, activeId: id }))
        setEpisodeIndex(1)
        setSelectedShot(null)
      }, [])

      const duplicateProject = useCallback(() => {
        if (!project) return
        const copy = normalizeProject(clone(project))
        copy.id = uid('p')
        copy.name += ' 副本'
        copy.createdAt = copy.updatedAt = Date.now()
        setUndoStore(current.current)
        setStore((state) => ({ projects: [copy, ...state.projects], activeId: copy.id }))
        toast('ok', '已创建副本。图片和视频与原项目共用，不会重复占用空间。')
      }, [project, toast])

      const deleteProject = useCallback(async () => {
        if (!project) return
        if (!await ask('删除这个项目？', `「${project.name}」的角色、分集与分镜将一起删除。已生成的图片和视频仍保留在素材目录里。可用撤销恢复。`, '删除项目', { danger: true })) return
        setUndoStore(current.current)
        setStore((state) => {
          const projects = state.projects.filter((p) => p.id !== project.id)
          return { projects, activeId: projects[0]?.id ?? null }
        })
        setTab('overview')
        toast('info', '项目已删除。')
      }, [project, ask, toast])

      const backupProject = useCallback(() => {
        if (!project) return
        download(`${safeName(project.name)}-备份.json`, JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), projects: [project], activeId: project.id }, null, 2), 'application/json;charset=utf-8')
        toast('ok', '已导出项目备份（文字与素材引用；图片和视频文件在素材目录里）。')
      }, [project, toast])

      const importBackup = useCallback(async (file) => {
        try {
          if (file.size > 10 * 1024 * 1024) throw new Error('备份文件不能超过 10 MB。')
          const raw = JSON.parse(await file.text())
          const list = Array.isArray(raw.projects) ? raw.projects : raw.brief ? [raw] : null
          if (!list?.length || list.length > 100 || list.some((p) => !p || typeof p.name !== 'string' || !p.brief || !Array.isArray(p.characters) || !Array.isArray(p.episodes) || !p.boards || Array.isArray(p.boards) || typeof p.boards !== 'object')) {
            throw new Error('请选择包含项目名称、立项、角色、分集和分镜的有效 JSON 备份。')
          }
          const imported = list.map((item) => { const p = normalizeProject(item); p.id = uid('p'); p.updatedAt = Date.now(); return p })
          setUndoStore(current.current)
          setStore((state) => ({ projects: [...imported, ...state.projects], activeId: imported[0].id }))
          setTab('overview')
          setEpisodeIndex(1)
          toast('ok', `已导入 ${imported.length} 个项目，原有项目已保留。`)
        } catch (error) {
          toast('err', `导入失败：${error.message}`)
        }
      }, [toast])

      const undo = useCallback(() => {
        if (!undoStore) return
        setStore(undoStore)
        setUndoStore(null)
        toast('ok', '已撤销上次操作。')
      }, [undoStore, toast])
      //#endregion

      //#region 后台任务
      /** 把任务结果写回它所属的镜头 / 角色 / 分集。 */
      const applyJob = useCallback((job) => {
        const asset = normalizeRef(job.result?.asset)
        const target = job.target
        if (!asset || !target) return
        patch((draft) => {
          if (target.kind === 'shot') {
            for (const list of Object.values(draft.boards)) {
              const shot = list.find((item) => item.id === target.shotId)
              if (!shot) continue
              if (target.field === 'image') { shot.image = asset; shot.images = [asset, ...shot.images.filter((item) => item.file !== asset.file)].slice(0, 8) }
              if (target.field === 'video') shot.video = asset
              if (target.field === 'audio') { shot.audio = asset; shot.audioText = target.text || '' }
              return
            }
          }
          if (target.kind === 'character') {
            const character = draft.characters.find((item) => item.id === target.id)
            if (character) { character.portrait = asset; character.portraits = [asset, ...character.portraits.filter((item) => item.file !== asset.file)].slice(0, 8) }
          }
          if (target.kind === 'episode') {
            const episode = draft.episodes.find((item) => item.id === target.id)
            if (episode) episode.renders = [asset, ...episode.renders].slice(0, 5)
          }
        }, job.pid)
      }, [patch])

      const refreshJobs = useCallback(async () => {
        let list
        try {
          list = (await request('jobs')).jobs || []
        } catch {
          return
        }
        if (!mounted.current) return
        const acks = []
        for (const job of list) {
          if (isActive(job) || handled.current.has(job.id)) continue
          handled.current.add(job.id)
          if (job.status === 'done') {
            applyJob(job)
            acks.push(job.id)
            if (job.type === 'render') {
              const missing = job.result?.missingImages
              toast('ok', `${job.label}已合成，时长 ${job.result?.total} 秒${missing ? `（${missing} 个镜头还没有图，用占位画面代替）` : ''}。`)
            }
          } else if (job.status === 'canceled') {
            acks.push(job.id)
          } else if (job.status === 'error') {
            toast('err', `${job.label || '任务'}失败：${job.error}`)
          }
        }
        if (acks.length) request('jobs/ack', { ids: acks }).catch(() => {})
        setJobs(list.filter((job) => !acks.includes(job.id)))
      }, [applyJob, toast])

      useEffect(() => { if (loaded) refreshJobs() }, [loaded, refreshJobs])
      const hasActiveJobs = jobs.some(isActive)
      useEffect(() => {
        if (!hasActiveJobs) return undefined
        const timer = setInterval(refreshJobs, 1200)
        return () => clearInterval(timer)
      }, [hasActiveJobs, refreshJobs])

      const queue = useCallback(async (list) => {
        if (!project || !list.length) return []
        try {
          const payload = await request('jobs', { pid: project.id, jobs: list })
          setJobs((existing) => [...existing, ...payload.jobs])
          return payload.jobs
        } catch (error) {
          toast('err', error.message)
          return []
        }
      }, [project, toast])

      const cancelJobs = useCallback(async (ids) => {
        try { await request('jobs/cancel', { ids }) } catch { /* 下一轮轮询会纠正 */ }
        refreshJobs()
      }, [refreshJobs])

      const dismissJobs = useCallback(async (ids) => {
        setJobs((list) => list.filter((job) => !ids.includes(job.id)))
        try { await request('jobs/ack', { ids }) } catch { /* 已经从列表里拿掉了 */ }
      }, [])

      /** 某个镜头 / 角色当前正在跑的任务。 */
      const jobFor = useCallback((match) => jobs.find((job) => isActive(job) && job.target && Object.entries(match).every(([key, value]) => job.target[key] === value)) || null, [jobs])
      //#endregion

      //#region 生成动作
      const imageVendor = engine?.settings?.image?.vendor || 'none'
      const videoVendor = engine?.settings?.video?.vendor || 'local'

      const sketchShots = useCallback(async (index, shotIds) => {
        if (!project) return
        const shots = shotsOf(project, index)
        let made = 0
        for (const [position, shot] of shots.entries()) {
          if (!shotIds.includes(shot.id)) continue
          try {
            const blob = await renderSketch(project, shot, position)
            const asset = await uploadMedia(project.id, blob, { name: `草图 第${index}集 镜头${position + 1}`, source: 'sketch', target: { kind: 'shot', shotId: shot.id, field: 'image' } })
            applyJob({ pid: project.id, target: { kind: 'shot', shotId: shot.id, field: 'image' }, result: { asset } })
            made += 1
          } catch (error) {
            toast('err', `镜头 ${position + 1} 草图失败：${error.message}`)
            break
          }
        }
        if (made) toast('ok', `已画好 ${made} 张分镜草图。接入出图引擎后可以随时换成 AI 画面。`)
      }, [project, applyJob, toast])

      /** 给一批镜头出图。没接出图引擎时，问用户是去接入还是先画草图。 */
      const generateImages = useCallback(async (index, shotIds) => {
        if (!project || !shotIds.length) return
        if (imageVendor === 'none') {
          const choice = await ask('还没有接入出图引擎', '接入火山方舟（即梦同款）、智谱或硅基流动后，就能按提示词生成真实画面。也可以先用本地草图把流程跑通。', '去接入', { alt: '先画草图' })
          if (choice === true) navigate('engine')
          if (choice === 'alt') await sketchShots(index, shotIds)
          return
        }
        const shots = shotsOf(project, index)
        const list = []
        let skipped = 0
        shots.forEach((shot, position) => {
          if (!shotIds.includes(shot.id) || jobFor({ shotId: shot.id, field: 'image' })) return
          const composed = composeImagePrompt(project, shot)
          if (!composed.prompt) { skipped += 1; return }
          list.push({
            type: 'image', label: `第${index}集 镜头 ${position + 1} 出图`,
            target: { kind: 'shot', shotId: shot.id, field: 'image' },
            payload: { prompt: composed.prompt, negative: project.visual.negative, width: 720, height: 1280, refs: composed.refs.map(({ pid, file, mime }) => ({ pid, file, mime })) },
          })
        })
        if (skipped) toast('info', `${skipped} 个镜头没有画面描述，已跳过。`)
        await queue(list)
      }, [project, imageVendor, ask, navigate, sketchShots, jobFor, queue, toast])

      const generatePortrait = useCallback(async (characterId) => {
        const character = project?.characters.find((item) => item.id === characterId)
        if (!character) return
        if (!character.appearance.trim()) { toast('err', '先填写固定外貌，再生成定妆照。'); return }
        if (imageVendor === 'none') {
          if (await ask('还没有接入出图引擎', '定妆照需要 AI 出图。接入后，定妆照还会作为参考图帮助角色跨镜头保持一致。', '去接入')) navigate('engine')
          return
        }
        await queue([{
          type: 'image', label: `${character.name || '角色'} 定妆照`, target: { kind: 'character', id: character.id },
          payload: { prompt: composePortraitPrompt(project, character), negative: project.visual.negative, width: 720, height: 1280, refs: [] },
        }])
      }, [project, imageVendor, ask, navigate, queue, toast])

      const voiceFor = useCallback((speaker) => {
        const character = project?.characters.find((item) => item.name.trim() && item.name.trim() === speaker)
        return character?.voice || project?.narratorVoice || ''
      }, [project])

      const generateVoices = useCallback(async (index, shotIds) => {
        if (!project) return
        const list = []
        shotsOf(project, index).forEach((shot, position) => {
          if (!shotIds.includes(shot.id) || jobFor({ shotId: shot.id, field: 'audio' })) return
          const spoken = parseDialogue(shot.dialogue)
          if (!spoken) return
          list.push({
            type: 'tts', label: `第${index}集 镜头 ${position + 1} 配音`,
            target: { kind: 'shot', shotId: shot.id, field: 'audio', text: spoken.line },
            payload: { text: spoken.line, voice: voiceFor(spoken.speaker) },
          })
        })
        if (!list.length) { toast('info', '这些镜头没有需要配音的台词。'); return }
        await queue(list)
      }, [project, jobFor, voiceFor, queue, toast])

      const generateVideos = useCallback(async (index, shotIds) => {
        if (!project) return
        if (videoVendor === 'local') {
          if (await ask('当前是本地运镜动效', '合成成片时会按每个镜头的运镜方式自动加动效，不需要单独生成。要让画面里的人物真的动起来，请接入图生视频引擎。', '去接入')) navigate('engine')
          return
        }
        const list = []
        let noImage = 0
        shotsOf(project, index).forEach((shot, position) => {
          if (!shotIds.includes(shot.id) || jobFor({ shotId: shot.id, field: 'video' })) return
          if (!shot.image) { noImage += 1; return }
          list.push({
            type: 'video', label: `第${index}集 镜头 ${position + 1} 视频`,
            target: { kind: 'shot', shotId: shot.id, field: 'video' },
            payload: { prompt: shot.videoPrompt.trim() || shot.description.trim(), image: { pid: shot.image.pid, file: shot.image.file, mime: shot.image.mime }, duration: shot.duration },
          })
        })
        if (noImage) toast('info', `${noImage} 个镜头还没有关键帧，图生视频需要先出图。`)
        await queue(list)
      }, [project, videoVendor, ask, navigate, jobFor, queue, toast])

      const renderEpisode = useCallback(async (index) => {
        if (!project) return
        const episode = project.episodes.find((item) => item.index === index)
        const shots = shotsOf(project, index)
        if (!episode || !shots.length) { toast('err', '这一集还没有镜头。'); return }
        if (jobs.some((job) => isActive(job) && job.type === 'render' && job.target?.id === episode.id)) return
        const options = engine?.settings?.render || {}
        const pick = ({ pid, file, mime, dur }) => ({ pid, file, mime, dur })
        await queue([{
          type: 'render', label: `第${index}集`, target: { kind: 'episode', id: episode.id },
          payload: {
            shots: shots.map((shot, position) => ({
              image: shot.image ? pick(shot.image) : null,
              video: shot.video ? pick(shot.video) : null,
              audio: shot.audio ? pick(shot.audio) : null,
              duration: shot.duration, camera: shot.camera,
              subtitle: parseDialogue(shot.dialogue)?.line || '',
              label: `镜头 ${position + 1}`,
            })),
            options: {
              width: options.width, fps: options.fps, subtitles: options.subtitles, fitAudio: options.fitAudio,
              title: options.titleCard === false ? '' : `第${index}集 ${episode.title.replace(/^第\s*\d+\s*集[：:\s]*/, '')}`.trim(),
              bgm: episode.bgm ? pick(episode.bgm) : null, bgmVolume: options.bgmVolume,
            },
          },
        }])
      }, [project, engine, jobs, queue, toast])

      /** 文本生成：大纲、角色、分集、分镜、发布文案。 */
      const generate = useCallback(async (kind, index = episodeIndex) => {
        if (!project || busy) return
        if (kind === 'outline' && !project.brief.logline.trim()) { toast('err', '先写一句故事梗概，再生成大纲。'); return }
        const hasBoards = Object.values(project.boards).some((list) => list.length)
        const hasEpisodes = project.episodes.some((e) => e.hook || e.conflict || e.cliffhanger)
        const existing = kind === 'outline' ? project.characters.length || hasEpisodes || hasBoards
          : kind === 'characters' ? project.characters.length
            : kind === 'episodes' ? hasEpisodes || hasBoards
              : kind === 'storyboard' ? shotsOf(project, index).length
                : 0
        if (existing) {
          const detail = kind === 'outline' || kind === 'episodes'
            ? '本次生成将替换对应角色或分集；重新生成分集也会清空原有分镜和它们的画面，避免镜头与故事错配。完成后可撤销，也可先取消并导出备份。'
            : kind === 'storyboard' ? '这一集已有的镜头（含已出的图和配音）会被新分镜替换。完成后可撤销。'
              : '本次生成将替换已有角色（定妆照会一并清空）。完成后可撤销。'
          if (!await ask('替换已有创作内容？', detail, '确认替换')) return
        }
        const pid = project.id
        const snapshot = current.current
        const controller = new AbortController()
        abortText.current = controller
        setBusy(kind)
        try {
          const episode = project.episodes.find((e) => e.index === index) || { index, title: `第${index}集`, hook: '', conflict: '', cliffhanger: '' }
          // 只把文字发给模型，素材引用留在本机。
          const lean = { name: project.name, brief: project.brief, characters: project.characters.map(({ name, identity, personality, appearance }) => ({ name, identity, personality, appearance })) }
          const response = await fetch(`${API}/generate`, {
            method: 'POST', headers: { 'content-type': 'application/json' }, signal: controller.signal,
            body: JSON.stringify({ kind, project: lean, episode, episodeIndex: index }),
          })
          const payload = await response.json().catch(() => null)
          if (!response.ok || !payload?.ok) throw new Error(payload?.error || `请求失败（HTTP ${response.status}）`)
          const data = payload.data || {}
          if (kind === 'publish') {
            if (!Array.isArray(data.titles) || !data.titles.length) throw new Error('AI 未返回有效内容，请重试。')
          } else {
            const required = kind === 'outline' ? ['characters', 'episodes'] : [kind === 'storyboard' ? 'shots' : kind]
            if (required.some((key) => !Array.isArray(data[key]) || !data[key].length || data[key].some((item) => !item || typeof item !== 'object'))) throw new Error('AI 未返回有效内容，原有数据已保留，请重试。')
          }
          if (payload.model) setModel(payload.model)
          if (kind !== 'publish') setUndoStore(snapshot)
          patch((draft) => {
            if (kind === 'outline' || kind === 'characters') {
              draft.characters = data.characters.map((item) => ({
                id: uid('c'), name: String(item?.name ?? ''), identity: String(item?.identity ?? ''),
                personality: String(item?.personality ?? ''), appearance: String(item?.appearance ?? ''),
                portrait: null, portraits: [], voice: '',
              }))
            }
            if (kind === 'outline' || kind === 'episodes') {
              draft.boards = {}
              draft.episodes = data.episodes.map((item, i) => ({
                ...blankEpisode(i + 1), title: String(item?.title ?? `第${i + 1}集`), hook: String(item?.hook ?? ''),
                conflict: String(item?.conflict ?? ''), cliffhanger: String(item?.cliffhanger ?? ''),
              }))
              draft.brief.episodes = draft.episodes.length
            }
            if (kind === 'storyboard') {
              while (draft.episodes.length < index) draft.episodes.push(blankEpisode(draft.episodes.length + 1))
              draft.boards[String(index)] = data.shots.map((item) => normalizeShot({ ...item, id: uid('s'), duration: Number(item?.duration) > 0 ? Number(item.duration) : 3, image: null, images: [], video: null, audio: null }))
            }
            if (kind === 'publish') {
              const target = draft.episodes.find((e) => e.index === index)
              if (target) {
                target.publish = {
                  ...blankPublish(), platform: platformOf(target.publish?.platform).id,
                  titles: data.titles.map(String).slice(0, 6), caption: String(data.caption ?? ''),
                  tags: (Array.isArray(data.tags) ? data.tags : []).map((tag) => String(tag).replace(/^#/, '')).filter(Boolean).slice(0, 8),
                  coverText: String(data.coverText ?? ''), pick: 0,
                }
              }
            }
          }, pid)
          if (kind === 'storyboard') setSelectedShot(null)
          toast('ok', kind === 'outline' ? `大纲已生成：${data.characters.length} 个角色、${data.episodes.length} 集。`
            : kind === 'characters' ? `角色卡已更新：${data.characters.length} 个角色。`
              : kind === 'episodes' ? `分集已更新：${data.episodes.length} 集。`
                : kind === 'storyboard' ? `第 ${index} 集分镜已生成：${data.shots.length} 个镜头。下一步可以批量出图。`
                  : `第 ${index} 集发布文案已生成。`)
        } catch (error) {
          if (controller.signal.aborted) toast('info', '已取消生成。')
          else toast('err', error.message)
        } finally {
          abortText.current = null
          setBusy(null)
        }
      }, [project, busy, episodeIndex, ask, patch, toast])

      const cancelGenerate = useCallback(() => abortText.current?.abort(), [])

      const saveEngine = useCallback(async (change) => {
        try {
          const view = await request('settings', change)
          setEngine(view)
          request('state').then((payload) => { if (mounted.current) setModel(payload.model || null) }).catch(() => {})
          return view
        } catch (error) {
          toast('err', `引擎配置没有保存：${error.message}`)
          return null
        }
      }, [toast])
      //#endregion

      return {
        store, project, loaded, loadError, tab, episodeIndex, setEpisodeIndex, selectedShot, setSelectedShot,
        busy, elapsed, saving, saveError, retry: () => setRetrySave((n) => n + 1), model, engine, jobs, toasts, dialog, undoStore, theme, setTheme,
        lightbox, setLightbox, toast, copy, dismissToast, ask, answer, patch, patchShot, navigate,
        createProject, switchProject, duplicateProject, deleteProject, backupProject, importBackup, undo, setUndoStore,
        queue, cancelJobs, dismissJobs, jobFor, applyJob,
        imageVendor, videoVendor, sketchShots, generateImages, generatePortrait, generateVoices, generateVideos, renderEpisode,
        generate, cancelGenerate, reloadEngine, saveEngine, voiceFor,
      }
    }
    //#endregion

    //#region 50-overview.js
    // 总览：海报、制作流水线、分集货架、待办。

    /** 取一张能代表这部剧的画面：第一集第一张有图的镜头，其次是主角定妆照。 */
    function posterOf(project) {
      for (const episode of project.episodes) {
        const cover = shotsOf(project, episode.index).find((shot) => shot.id === episode.cover && shot.image)
        if (cover) return cover.image
        const first = shotsOf(project, episode.index).find((shot) => shot.image)
        if (first) return first.image
      }
      return project.characters.find((c) => c.portrait)?.portrait || null
    }

    function pipelineOf(project) {
      const episodes = project.episodes
      const shots = episodes.flatMap((e) => shotsOf(project, e.index))
      const spoken = shots.filter((shot) => parseDialogue(shot.dialogue))
      const told = episodes.filter((e) => e.hook.trim() && e.conflict.trim() && e.cliffhanger.trim()).length
      const boarded = episodes.filter((e) => shotsOf(project, e.index).length).length
      const rendered = episodes.filter((e) => e.renders.length).length
      const looks = project.characters.filter((c) => c.appearance.trim()).length
      return [
        { id: 'brief', name: '立项', done: project.brief.logline.trim() ? 1 : 0, total: 1, text: project.brief.logline.trim() ? '梗概已定' : '写一句梗概' },
        { id: 'cast', name: '角色', done: looks, total: Math.max(1, project.characters.length), text: project.characters.length ? `${project.characters.filter((c) => c.portrait).length}/${project.characters.length} 有定妆照` : '还没有角色' },
        { id: 'episodes', name: '分集', done: told, total: Math.max(1, episodes.length), text: `${told}/${episodes.length} 集完整` },
        { id: 'board', name: '分镜', done: boarded, total: Math.max(1, episodes.length), text: `${shots.length} 个镜头` },
        { id: 'board', key: 'images', name: '出图', done: shots.filter((s) => s.image).length, total: Math.max(1, shots.length), text: `${shots.filter((s) => s.image).length}/${shots.length} 镜有图` },
        { id: 'studio', key: 'voice', name: '配音', done: spoken.filter((s) => s.audio).length, total: Math.max(1, spoken.length), text: `${spoken.filter((s) => s.audio).length}/${spoken.length} 句` },
        { id: 'studio', name: '成片', done: rendered, total: Math.max(1, episodes.length), text: `${rendered}/${episodes.length} 集` },
      ]
    }

    function OverviewPage() {
      const studio = useStudio()
      const { project, navigate, patch } = studio
      const poster = posterOf(project)
      const stages = pipelineOf(project)
      const checks = projectChecks(project)
      const nextStage = stages.find((stage) => stage.done < stage.total) || stages[stages.length - 1]
      const next = checks[0]?.tab || nextStage.id
      const look = LOOKS.find((item) => item.id === project.visual.look)

      return h('div', { className: 'db-overview' },
        h('section', { className: 'db-hero' },
          h('div', { className: 'db-poster' },
            h(Frame, { asset: poster, emptyLabel: '出第一张图后，这里就是海报', onOpen: poster ? () => studio.setLightbox({ items: [{ asset: poster, title: project.name }] }) : undefined }),
            h('div', { className: 'db-poster-title', 'aria-hidden': true }, h('strong', null, project.name.slice(0, 14)), h('span', null, `${project.brief.genre}短剧　共 ${project.episodes.length} 集`))),
          h('div', { className: 'db-hero-body' },
            h('div', { className: 'db-row' }, h(Tag, null, project.brief.genre), h(Tag, null, project.brief.style), look && look.id !== 'natural' ? h(Tag, null, look.name) : null, h(Tag, null, '竖屏 9:16')),
            h('h2', { className: 'db-title' }, project.name),
            h('p', { className: 'db-hero-logline' }, project.brief.logline || '还没有梗概。用一句话写下主角、目标和冲突，剩下的交给流水线。'),
            h('div', { className: 'db-row' },
              h(Btn, { kind: 'primary', icon: 'chevron', className: 'trail', onClick: () => navigate(next) }, checks[0] ? `下一步：${checks[0].text}` : '继续制作'),
              project.episodes.some((e) => shotsOf(project, e.index).length) ? h(Btn, { icon: 'play', onClick: () => navigate('studio') }, '试映') : null),
            h('ol', { className: 'db-pipeline', 'aria-label': '制作进度' }, stages.map((stage, i) => h('li', { key: stage.key || `${stage.id}-${i}` },
              h('button', { type: 'button', onClick: () => navigate(stage.id) },
                h(Ring, { value: stage.done / stage.total, size: 40 }, stage.done >= stage.total ? h(Icon, { name: 'check', size: 15 }) : String(i + 1)),
                h('strong', null, stage.name),
                h('small', null, stage.text)))))),
        ),

        h('div', { className: 'db-overview-cols' },
          h('section', { className: 'db-shelf' },
            h('header', { className: 'db-section-head' }, h('h2', null, '分集'), h(Btn, { kind: 'ghost', size: 'sm', onClick: () => navigate('episodes') }, '编辑分集')),
            project.episodes.length === 0
              ? h(Empty, { icon: 'episodes', title: '还没有分集', action: h(Btn, { kind: 'primary', onClick: () => navigate('brief') }, '去立项生成大纲') }, '写好梗概后，一次生成角色和全部分集。')
              : project.episodes.map((episode) => {
                const shots = shotsOf(project, episode.index)
                const progress = episodeProgress(project, episode.index)
                return h('article', { className: 'db-ep-card', key: episode.id },
                  h('div', { className: 'db-ep-card-head' },
                    h('span', { className: 'db-ep-num' }, pad2(episode.index)),
                    h('div', { className: 'db-grow' },
                      h('h3', null, episode.title),
                      h('p', null, episode.hook || '还没有写开场钩子')),
                    h('div', { className: 'db-row tight' },
                      shots.length ? h(Tag, { tone: progress.images === shots.length ? 'ok' : '' , icon: 'image' }, `${progress.images}/${shots.length}`) : null,
                      progress.spoken ? h(Tag, { tone: progress.voiced === progress.spoken ? 'ok' : '', icon: 'mic' }, `${progress.voiced}/${progress.spoken}`) : null,
                      progress.render ? h(Tag, { tone: 'rec', icon: 'film' }, '已成片') : null)),
                  shots.length
                    ? h('div', { className: 'db-strip' },
                      shots.slice(0, 9).map((shot, i) => h(Frame, { key: shot.id, asset: shot.image, shot, index: i, job: studio.jobFor({ shotId: shot.id, field: 'image' }), onOpen: () => navigate('board', episode.index, shot.id) })),
                      shots.length > 9 ? h('button', { type: 'button', className: 'db-strip-more', onClick: () => navigate('board', episode.index) }, `+${shots.length - 9}`) : null)
                    : h('button', { type: 'button', className: 'db-strip-empty', onClick: () => navigate('board', episode.index) }, h(Icon, { name: 'board', size: 16 }), '还没有分镜，去拆镜头'),
                  h('div', { className: 'db-ep-card-foot' },
                    h('span', { className: 'db-muted' }, shots.length ? `${shots.length} 个镜头，${clock(progress.seconds)}` : '待创作'),
                    h('span', { className: 'db-grow' }),
                    h(Btn, { kind: 'ghost', size: 'sm', icon: 'board', onClick: () => navigate('board', episode.index) }, '分镜'),
                    h(Btn, { kind: 'ghost', size: 'sm', icon: 'studio', disabled: !shots.length, onClick: () => navigate('studio', episode.index) }, '成片')))
              })),

          h('aside', { className: 'db-side-col' },
            h('section', { className: 'db-card' },
              h('header', { className: 'db-section-head' }, h('h2', null, '待办'), h('span', { className: 'db-muted' }, checks.length ? `${checks.length} 项` : '都处理完了')),
              checks.length
                ? h('ul', { className: 'db-todo' }, checks.slice(0, 5).map((check) => h('li', { key: check.text },
                  h('button', { type: 'button', onClick: () => navigate(check.tab) },
                    h('span', null, h('strong', null, check.text), h('small', null, check.detail)),
                    h(Icon, { name: 'chevron', size: 14 })))))
                : h('p', { className: 'db-done' }, h(Icon, { name: 'check', size: 16 }), '故事、镜头和画面都齐了。成片后再过一遍下面的清单。')),
            h('section', { className: 'db-card' },
              h('header', { className: 'db-section-head' }, h('h2', null, '发布前检查')),
              [['looks', '同一角色在各镜头里长得一样'], ['continuity', '镜头衔接顺、场景不跳'], ['captions', '字幕和配音逐句对过'], ['rights', '没有真实明星肖像和未授权 IP']].map(([id, text]) => h('label', { className: 'db-checkline', key: id },
                h('input', { type: 'checkbox', checked: Boolean(project.checklist?.[id]), onChange: (event) => { const checked = event.target.checked; patch((draft) => { draft.checklist = { ...draft.checklist, [id]: checked } }) } }),
                text))),
            h('section', { className: 'db-card db-tools' },
              h('header', { className: 'db-section-head' }, h('h2', null, '项目')),
              h(Btn, { kind: 'ghost', icon: 'download', onClick: studio.backupProject }, '导出备份'),
              h(Btn, { kind: 'ghost', icon: 'copy', onClick: studio.duplicateProject }, '创建副本'),
              h(Btn, { kind: 'ghost', icon: 'library', onClick: () => navigate('library') }, '打开素材库'))),
        ))
    }
    //#endregion

    //#region 51-story.js
    // 立项与分集：故事的文字部分。

    const SEEDS = [
      ['悬疑', '来自明天的来电', '一位接线员每晚接到明天的求救电话，直到来电人说出了她自己的名字。'],
      ['重生', '重来一次的选择', '重回毕业那天，她放弃了上一世的成功捷径，却发现好友正在重复她犯过的错。'],
      ['甜宠', '交换身份的邻居', '两个互不相识的邻居每天醒来都会交换身份，必须共同解决一场即将到来的婚礼危机。'],
      ['逆袭', '被退婚的外卖员', '被当众退婚的外卖员，其实是隐姓埋名十年的集团继承人，而退婚宴的酒店正是他家的产业。'],
    ]

    /** 计划集数：允许暂时清空，失焦时再校正到 1~60。 */
    function EpisodeCount({ value, onChange }) {
      const [text, setText] = useState(String(value))
      useEffect(() => setText(String(value)), [value])
      const commit = () => {
        const next = Math.max(1, Math.min(60, Math.round(Number(text) || value || 1)))
        setText(String(next))
        if (next !== value) onChange(next)
      }
      return h('input', { className: 'db-input', type: 'number', min: 1, max: 60, value: text, 'aria-label': '计划集数', onChange: (e) => setText(e.target.value), onBlur: commit, onKeyDown: (e) => { if (e.key === 'Enter') e.currentTarget.blur() } })
    }

    function BriefPage() {
      const studio = useStudio()
      const { project, patch, busy, generate } = studio
      const brief = project.brief
      return h('div', { className: 'db-two' },
        h('div', { className: 'db-stack' },
          h('section', { className: 'db-card' },
            h(Field, { label: '剧名' }, h('input', { className: 'db-input db-input-title', value: project.name, onChange: (e) => patch((draft) => { draft.name = e.target.value }) })),
            h(Field, { label: '一句话梗概', hint: '谁，想要什么，被什么挡住' },
              h('textarea', { className: 'db-textarea', rows: 3, value: brief.logline, placeholder: '例：被退婚的外卖员，其实是隐藏十年的集团继承人。', onChange: (e) => patch((draft) => { draft.brief.logline = e.target.value }) })),
            h('div', { className: 'db-form-row' },
              h(Field, { label: '题材' }, h(Chips, { label: '题材', options: GENRES, value: brief.genre, onChange: (value) => patch((draft) => { draft.brief.genre = value }) })),
              h(Field, { label: '计划集数', hint: '改小不会删除已写的分集' }, h(EpisodeCount, { value: brief.episodes, onChange: (value) => patch((draft) => { draft.brief.episodes = value }) }))),
            h('div', { className: 'db-row' },
              h(Btn, { kind: 'primary', icon: 'sparkles', busy: busy === 'outline', disabled: Boolean(busy), onClick: () => generate('outline') }, busy === 'outline' ? '生成中' : '生成剧本大纲'),
              h('span', { className: 'db-muted' }, '一次生成角色卡和全部分集'))),

          h('section', { className: 'db-card' },
            h('header', { className: 'db-section-head' }, h('h2', null, '画面风格'), h('span', { className: 'db-muted' }, '会写进每一张图的提示词')),
            h(Field, { label: '画风' }, h(Chips, { label: '画风', options: STYLES, value: brief.style, onChange: (value) => patch((draft) => { draft.brief.style = value }) })),
            h('div', { className: 'db-field' },
              h('span', { className: 'db-label' }, '影调'),
              h('div', { className: 'db-looks', role: 'group', 'aria-label': '影调' }, LOOKS.map((look) => h('button', {
                key: look.id, type: 'button', className: 'db-look', 'aria-pressed': project.visual.look === look.id,
                onClick: () => patch((draft) => { draft.visual.look = look.id }),
              }, h('i', { style: { background: `linear-gradient(160deg, ${look.colors[0]} 0%, ${look.colors[1]} 62%, ${look.colors[2]} 100%)` } }), h('span', null, look.name))))),
            h('div', { className: 'db-form-row' },
              h(Field, { label: '补充风格词', hint: '选填' }, h('input', { className: 'db-input', value: project.visual.extra, placeholder: '例：胶片颗粒，王家卫式抽帧', onChange: (e) => patch((draft) => { draft.visual.extra = e.target.value }) })),
              h(Field, { label: '不想出现的内容', hint: '选填，部分引擎支持' }, h('input', { className: 'db-input', value: project.visual.negative, placeholder: '例：文字水印，多余的手指', onChange: (e) => patch((draft) => { draft.visual.negative = e.target.value }) }))),
            h('p', { className: 'db-note' }, STYLE_PROMPTS[brief.style], LOOKS.find((look) => look.id === project.visual.look)?.prompt ? `，${LOOKS.find((look) => look.id === project.visual.look).prompt}` : ''))),

        h('aside', { className: 'db-stack' },
          h('section', { className: 'db-card' },
            h('header', { className: 'db-section-head' }, h('h2', null, '没想好？从这里起步')),
            h('div', { className: 'db-seeds' }, SEEDS.map(([genre, title, logline]) => h('button', {
              key: title, type: 'button', disabled: Boolean(brief.logline.trim()),
              onClick: () => patch((draft) => { draft.brief.logline = logline; draft.brief.genre = genre }),
            }, h('strong', null, title, h(Tag, null, genre)), h('span', null, logline)))),
            brief.logline.trim() ? h('p', { className: 'db-note' }, '已经有梗概了。清空梗概后可以改用这些起点。') : null),
          h('section', { className: 'db-card db-tools' },
            h('header', { className: 'db-section-head' }, h('h2', null, '项目')),
            h(Btn, { kind: 'ghost', icon: 'copy', onClick: studio.duplicateProject }, '创建副本'),
            h(Btn, { kind: 'ghost', icon: 'download', onClick: studio.backupProject }, '导出备份'),
            h(Btn, { kind: 'ghost', icon: 'trash', className: 'danger', onClick: studio.deleteProject }, '删除项目'))))
    }

    function EpisodesPage() {
      const studio = useStudio()
      const { project, patch, busy, generate, ask, navigate } = studio
      const patchEpisode = (id, field, value) => patch((draft) => {
        const target = draft.episodes.find((e) => e.id === id)
        if (target) target[field] = value
      })
      return h('div', { className: 'db-stack' },
        h('div', { className: 'db-toolbar' },
          h(Btn, { kind: 'primary', icon: 'sparkles', busy: busy === 'episodes', disabled: Boolean(busy), onClick: () => generate('episodes') }, busy === 'episodes' ? '生成中' : 'AI 生成分集'),
          h(Btn, { icon: 'plus', onClick: () => patch((draft) => { draft.episodes.push(blankEpisode(draft.episodes.length + 1)); draft.brief.episodes = Math.max(draft.brief.episodes, draft.episodes.length) }) }, '添加一集'),
          h('span', { className: 'db-grow' }),
          h('span', { className: 'db-muted' }, `共 ${project.episodes.length} 集`)),
        project.episodes.length === 0
          ? h(Empty, { icon: 'episodes', title: '还没有分集' }, '点「AI 生成分集」，按题材和角色写出每一集的钩子与卡点；也可以手动添加。')
          : project.episodes.map((episode) => {
            const shots = shotsOf(project, episode.index)
            return h('section', { key: episode.id, className: 'db-episode' },
              h('header', null,
                h('span', { className: 'db-ep-num' }, pad2(episode.index)),
                h('input', { className: 'db-input db-input-bare', 'aria-label': `第 ${episode.index} 集标题`, value: episode.title, onChange: (e) => patchEpisode(episode.id, 'title', e.target.value) }),
                shots.length ? h(Tag, { icon: 'board' }, `${shots.length} 镜`) : null,
                h(Btn, { kind: 'ghost', size: 'sm', icon: 'board', onClick: () => navigate('board', episode.index) }, shots.length ? '看分镜' : '拆分镜'),
                h(IconBtn, {
                  icon: 'trash', size: 'sm', className: 'ghost danger', label: `删除第 ${episode.index} 集`,
                  onClick: async () => {
                    if (!await ask('删除这一集？', `第 ${episode.index} 集及其分镜将一起删除，其余分镜会随分集自动重新编号。`, '删除分集', { danger: true })) return
                    studio.setUndoStore(studio.store)
                    patch((draft) => removeEpisode(draft, episode.id))
                  },
                })),
              h('div', { className: 'db-episode-body' },
                h(Field, { label: '前 3 秒钩子', wide: true }, h('textarea', { className: 'db-textarea', rows: 2, value: episode.hook, placeholder: '例：镜头怼脸——“你被退婚，是因为你配不上我。”', onChange: (e) => patchEpisode(episode.id, 'hook', e.target.value) })),
                h(Field, { label: '本集冲突' }, h('textarea', { className: 'db-textarea', rows: 3, value: episode.conflict, placeholder: '谁和谁、因为什么、冲突升级到什么程度', onChange: (e) => patchEpisode(episode.id, 'conflict', e.target.value) })),
                h(Field, { label: '结尾卡点' }, h('textarea', { className: 'db-textarea', rows: 3, value: episode.cliffhanger, placeholder: '最后一秒抛出的信息，让人非看下一集不可', onChange: (e) => patchEpisode(episode.id, 'cliffhanger', e.target.value) }))))
          }))
    }
    //#endregion

    //#region 52-cast.js
    // 角色：固定外貌、定妆照、配音音色。

    /** 可选的音色：系统语音列出本机中文语音，云端配音列出引擎自带音色。 */
    function useVoiceOptions() {
      const { engine } = useStudio()
      return useMemo(() => {
        const vendor = engine?.settings?.tts?.vendor || 'system'
        if (vendor === 'system') return (engine?.voices || []).map((voice) => ({ id: voice.id, name: `${voice.id}（${voice.locale === 'zh_CN' ? '普通话' : voice.locale === 'zh_HK' ? '粤语' : voice.locale === 'zh_TW' ? '台湾国语' : voice.locale}）` }))
        const item = engine?.catalog?.tts?.find((entry) => entry.id === vendor)
        return (item?.voices || []).map((voice) => ({ id: voice, name: voice }))
      }, [engine])
    }

    function VoiceSelect({ value, onChange, label = '配音音色' }) {
      const options = useVoiceOptions()
      const { toast } = useStudio()
      const [testing, setTesting] = useState(false)
      const audition = async () => {
        setTesting(true)
        try {
          const payload = await request('settings/test', { capability: 'tts', voice: value || undefined, text: '你好，这是我的声音。你觉得合适吗？' })
          playingAudio?.pause()
          playingAudio = new Audio(mediaUrl(payload.asset))
          await playingAudio.play()
        } catch (error) {
          toast('err', `试听失败：${error.message}`)
        } finally {
          setTesting(false)
        }
      }
      return h('div', { className: 'db-voice' },
        h('select', { className: 'db-select', 'aria-label': label, value, onChange: (e) => onChange(e.target.value) },
          h('option', { value: '' }, '跟随默认音色'),
          options.map((voice) => h('option', { key: voice.id, value: voice.id }, voice.name)),
          value && !options.some((voice) => voice.id === value) ? h('option', { value }, `${value}（当前引擎没有）`) : null),
        h(IconBtn, { icon: testing ? 'clock' : 'volume', label: '试听音色', disabled: testing, onClick: audition }))
    }

    function CastPage() {
      const studio = useStudio()
      const { project, patch, busy, generate, generatePortrait, jobFor, toast } = studio
      const patchCharacter = (id, mutate) => patch((draft) => {
        const target = draft.characters.find((c) => c.id === id)
        if (target) mutate(target)
      })
      const upload = async (character, file) => {
        try {
          const asset = await uploadMedia(project.id, file, { name: `${character.name} 定妆照`, target: { kind: 'character', id: character.id } })
          if (asset.kind !== 'image') throw new Error('定妆照需要是图片')
          studio.applyJob({ pid: project.id, target: { kind: 'character', id: character.id }, result: { asset } })
        } catch (error) {
          toast('err', error.message)
        }
      }
      const missing = project.characters.filter((c) => c.appearance.trim() && !c.portrait)

      return h('div', { className: 'db-stack' },
        h('div', { className: 'db-toolbar' },
          h(Btn, { kind: 'primary', icon: 'sparkles', busy: busy === 'characters', disabled: Boolean(busy), onClick: () => generate('characters') }, busy === 'characters' ? '生成中' : 'AI 设计角色'),
          h(Btn, { icon: 'plus', onClick: () => patch((draft) => { draft.characters.push({ id: uid('c'), name: '新角色', identity: '', personality: '', appearance: '', portrait: null, portraits: [], voice: '' }) }) }, '添加角色'),
          missing.length ? h(Btn, { icon: 'image', onClick: () => missing.forEach((c) => generatePortrait(c.id)) }, `补齐 ${missing.length} 张定妆照`) : null,
          h('span', { className: 'db-grow' }),
          h('label', { className: 'db-inline-field' }, h('span', { className: 'db-muted' }, '旁白与默认音色'),
            h(VoiceSelect, { label: '旁白与默认音色', value: project.narratorVoice, onChange: (value) => patch((draft) => { draft.narratorVoice = value }) }))),

        project.characters.length === 0
          ? h(Empty, { icon: 'cast', title: '还没有角色' }, '角色的固定外貌会逐字写进每个出镜镜头的提示词；定妆照会作为参考图，让同一个人在不同镜头里长得一样。')
          : h('div', { className: 'db-cast' }, project.characters.map((character, index) => {
            const job = jobFor({ kind: 'character', id: character.id })
            return h('article', { key: character.id, className: 'db-char' },
              h('div', { className: 'db-char-photo' },
                h(Frame, {
                  asset: character.portrait, job, ratio: '3 / 4', position: 'center 18%', emptyLabel: '定妆照',
                  onOpen: character.portrait ? () => studio.setLightbox({ items: character.portraits.map((asset) => ({ asset, title: `${character.name} 定妆照`, note: asset.provider })), start: Math.max(0, character.portraits.findIndex((a) => a.file === character.portrait.file)) }) : undefined,
                }),
                h('div', { className: 'db-char-photo-actions' },
                  h(Btn, { size: 'sm', kind: character.portrait ? undefined : 'primary', icon: character.portrait ? 'refresh' : 'sparkles', disabled: Boolean(job), onClick: () => generatePortrait(character.id) }, character.portrait ? '重拍' : '生成定妆照'),
                  h(FilePick, { size: 'sm', kind: 'ghost', icon: 'upload', accept: 'image/png,image/jpeg,image/webp', onPick: (file) => upload(character, file) }, '上传')),
                character.portraits.length > 1 ? h('div', { className: 'db-versions' }, character.portraits.map((asset) => h('button', {
                  key: asset.file, type: 'button', 'aria-pressed': asset.file === character.portrait?.file, 'aria-label': '改用这一版定妆照',
                  onClick: () => patchCharacter(character.id, (c) => { c.portrait = asset }),
                }, h('img', { src: mediaUrl(asset), alt: '', loading: 'lazy' })))) : null),
              h('div', { className: 'db-char-body' },
                h('div', { className: 'db-row' },
                  h('input', { className: 'db-input db-input-bare db-char-name', 'aria-label': '角色姓名', value: character.name, placeholder: `角色 ${index + 1}`, onChange: (e) => patchCharacter(character.id, (c) => { c.name = e.target.value }) }),
                  h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost danger', label: `删除角色 ${character.name}`, onClick: async () => { if (await studio.ask('删除这个角色？', `「${character.name || '未命名角色'}」的角色卡会被删除，镜头里的文字不受影响。`, '删除角色', { danger: true })) { studio.setUndoStore(studio.store); patch((draft) => { draft.characters = draft.characters.filter((c) => c.id !== character.id) }) } } })),
                h('div', { className: 'db-form-row' },
                  h(Field, { label: '身份' }, h('input', { className: 'db-input', value: character.identity, placeholder: '例：外卖员，隐藏的继承人', onChange: (e) => patchCharacter(character.id, (c) => { c.identity = e.target.value }) })),
                  h(Field, { label: '性格' }, h('input', { className: 'db-input', value: character.personality, placeholder: '例：隐忍，嘴硬心软', onChange: (e) => patchCharacter(character.id, (c) => { c.personality = e.target.value }) }))),
                h(Field, { label: '固定外貌', hint: '全剧不变，会逐字写进提示词' },
                  h('textarea', { className: 'db-textarea', rows: 4, value: character.appearance, placeholder: '年龄、发型、服装、体型、一个辨识特征。40~80 字。', onChange: (e) => patchCharacter(character.id, (c) => { c.appearance = e.target.value }) })),
                h('div', { className: 'db-row' },
                  h(Field, { label: '配音音色' }, h(VoiceSelect, { value: character.voice, onChange: (value) => patchCharacter(character.id, (c) => { c.voice = value }) })),
                  h('span', { className: 'db-grow' }),
                  h(Btn, { kind: 'ghost', size: 'sm', icon: 'copy', disabled: !character.appearance.trim(), onClick: () => studio.copy(`${character.name}：${character.appearance}`, '外貌描述') }, '复制外貌'))))
          })))
    }
    //#endregion

    //#region 53-board.js
    // 分镜：画格墙 + 镜头检查器。每个镜头的文字、画面、配音、视频都在这里。

    function EpisodeTabs({ extra }) {
      const { project, episodeIndex, setEpisodeIndex, setSelectedShot } = useStudio()
      const count = Math.max(project.episodes.length, 1)
      return h('div', { className: 'db-ep-tabs', role: 'tablist', 'aria-label': '选择分集' },
        Array.from({ length: count }, (_, i) => {
          const episode = project.episodes[i]
          const index = i + 1
          const progress = episodeProgress(project, index)
          return h('button', {
            key: index, type: 'button', role: 'tab', 'aria-selected': episodeIndex === index,
            onClick: () => { setEpisodeIndex(index); setSelectedShot(null) },
          },
            h('span', { className: 'db-ep-num' }, pad2(index)),
            h('span', { className: 'db-ep-tab-title' }, episode?.title?.replace(/^第\s*\d+\s*集[：:\s]*/, '') || `第${index}集`),
            progress.shots ? h('i', { className: cx('db-dot', progress.render ? 'rec' : progress.images === progress.shots ? 'ok' : progress.images ? 'part' : '') }) : null)
        }),
        extra || null)
    }

    function ShotTile({ shot, index, selected, onSelect }) {
      const studio = useStudio()
      const job = studio.jobFor({ shotId: shot.id, field: 'image' }) || studio.jobFor({ shotId: shot.id, field: 'video' })
      const spoken = parseDialogue(shot.dialogue)
      return h('article', { className: cx('db-tile', selected && 'selected') },
        h(Frame, { asset: shot.image, video: shot.video, shot, index, job, onOpen: onSelect },
          h('div', { className: 'db-slate' }, h('b', null, pad2(index + 1)), h('span', null, shot.shotSize), h('span', null, shot.camera)),
          h('div', { className: 'db-tile-foot' },
            shot.video ? h('i', { title: '已有视频' }, h(Icon, { name: 'film', size: 12 })) : null,
            shot.audio ? h('i', { title: '已配音' }, h(Icon, { name: 'mic', size: 12 })) : spoken ? h('i', { className: 'todo', title: '有台词，还没配音' }, h(Icon, { name: 'mic', size: 12 })) : null,
            h('span', { className: 'db-grow' }),
            h('time', null, `${shot.duration}s`))),
        h('p', { className: 'db-tile-text' }, shot.description || '还没有画面描述'),
        spoken ? h('p', { className: 'db-tile-line' }, spoken.speaker ? `${spoken.speaker}：` : '', spoken.line) : null)
    }

    function ShotInspector({ shot, index, total, onClose }) {
      const studio = useStudio()
      const { project, episodeIndex, patch, patchShot, toast, jobFor } = studio
      const [showFinal, setShowFinal] = useState(false)
      const composed = composeImagePrompt(project, shot)
      const spoken = parseDialogue(shot.dialogue)
      const imageJob = jobFor({ shotId: shot.id, field: 'image' })
      const audioJob = jobFor({ shotId: shot.id, field: 'audio' })
      const videoJob = jobFor({ shotId: shot.id, field: 'video' })
      const stale = shot.audio && spoken && shot.audioText && shot.audioText !== spoken.line
      const set = (field) => (event) => patchShot(shot.id, (target) => { target[field] = event.target.value })
      const mutateList = (fn) => patch((draft) => { fn(draft.boards[String(episodeIndex)]) })
      const upload = async (file) => {
        try {
          const asset = await uploadMedia(project.id, file, { name: `第${episodeIndex}集 镜头${index + 1}`, target: { kind: 'shot', shotId: shot.id } })
          if (asset.kind === 'audio') studio.applyJob({ pid: project.id, target: { kind: 'shot', shotId: shot.id, field: 'audio', text: spoken?.line || '' }, result: { asset } })
          else studio.applyJob({ pid: project.id, target: { kind: 'shot', shotId: shot.id, field: asset.kind === 'video' ? 'video' : 'image' }, result: { asset } })
        } catch (error) {
          toast('err', error.message)
        }
      }
      const neighbors = shotsOf(project, episodeIndex)

      return h('aside', { className: 'db-inspector', 'aria-label': `镜头 ${index + 1} 详情` },
        h('header', { className: 'db-inspector-head' },
          h('strong', null, `镜头 ${pad2(index + 1)}`), h('span', { className: 'db-muted' }, `共 ${total} 个`),
          h('span', { className: 'db-grow' }),
          h(IconBtn, { icon: 'back', size: 'sm', className: 'ghost', label: '上一个镜头', disabled: index === 0, onClick: () => studio.setSelectedShot(neighbors[index - 1].id) }),
          h(IconBtn, { icon: 'chevron', size: 'sm', className: 'ghost', label: '下一个镜头', disabled: index === total - 1, onClick: () => studio.setSelectedShot(neighbors[index + 1].id) }),
          h(Menu, {
            button: ({ toggle }) => h(IconBtn, { icon: 'more', size: 'sm', className: 'ghost', label: '更多操作', onClick: toggle }),
            items: [
              { label: '前移一位', icon: 'up', disabled: index === 0, onClick: () => mutateList((list) => { [list[index - 1], list[index]] = [list[index], list[index - 1]] }) },
              { label: '后移一位', icon: 'down', disabled: index === total - 1, onClick: () => mutateList((list) => { [list[index], list[index + 1]] = [list[index + 1], list[index]] }) },
              { label: '复制镜头', icon: 'copy', onClick: () => mutateList((list) => list.splice(index + 1, 0, { ...clone(shot), id: uid('s') })) },
              { label: '删除镜头', icon: 'trash', danger: true, onClick: () => { studio.setUndoStore(studio.store); mutateList((list) => list.splice(index, 1)); studio.setSelectedShot(neighbors[index + 1]?.id || neighbors[index - 1]?.id || null) } },
            ],
          }),
          h(IconBtn, { icon: 'close', size: 'sm', className: 'ghost', label: '关闭镜头详情', onClick: onClose })),

        h('div', { className: 'db-inspector-scroll' },
          h('div', { className: 'db-inspector-media' },
            h(Frame, {
              asset: shot.image, shot, index, job: imageJob, emptyLabel: '还没有关键帧',
              onOpen: shot.image ? () => studio.setLightbox({ items: (shot.images.length ? shot.images : [shot.image]).map((asset, i) => ({ asset, title: `第${episodeIndex}集 镜头${index + 1}`, note: asset.source === 'sketch' ? '本地草图' : asset.source === 'upload' ? '上传' : asset.provider })), start: Math.max(0, shot.images.findIndex((a) => a.file === shot.image.file)) }) : undefined,
            }),
            h('div', { className: 'db-inspector-actions' },
              h(Btn, { kind: 'primary', icon: shot.image ? 'refresh' : 'sparkles', disabled: Boolean(imageJob), onClick: () => studio.generateImages(episodeIndex, [shot.id]) }, imageJob ? '出图中' : shot.image ? '重新出图' : 'AI 出图'),
              h(Btn, { icon: 'pencil', onClick: () => studio.sketchShots(episodeIndex, [shot.id]) }, '画草图'),
              h(FilePick, { icon: 'upload', accept: 'image/png,image/jpeg,image/webp,video/mp4,video/webm', onPick: upload }, '上传'),
              imageJob ? h(Btn, { kind: 'ghost', onClick: () => studio.cancelJobs([imageJob.id]) }, '取消') : null,
              shot.images.length > 1 ? h('div', { className: 'db-versions' }, shot.images.map((asset) => h('button', {
                key: asset.file, type: 'button', 'aria-pressed': asset.file === shot.image?.file, 'aria-label': '改用这一版画面',
                onClick: () => patchShot(shot.id, (target) => { target.image = asset }),
              }, h('img', { src: mediaUrl(asset), alt: '', loading: 'lazy' })))) : null,
              shot.images.length > 1 ? h('span', { className: 'db-muted' }, `${shot.images.length} 个版本，点击切换`) : null)),

          h('div', { className: 'db-form-row three' },
            h(Field, { label: '景别' }, h('select', { className: 'db-select', value: shot.shotSize, onChange: set('shotSize') }, SHOT_SIZES.map((size) => h('option', { key: size }, size)))),
            h(Field, { label: '运镜' }, h('select', { className: 'db-select', value: shot.camera, onChange: set('camera') }, CAMERAS.map((camera) => h('option', { key: camera }, camera)))),
            h(Field, { label: '时长（秒）' }, h('input', { className: 'db-input', type: 'number', min: 0, step: 0.5, value: shot.duration, onChange: (e) => patchShot(shot.id, (target) => { target.duration = Math.max(0, Number(e.target.value) || 0) }) }))),

          project.characters.length ? h('div', { className: 'db-field' },
            h('span', { className: 'db-label' }, '出镜角色', h('em', null, '外貌和定妆照会自动带进出图')),
            h('div', { className: 'db-chips' }, project.characters.filter((c) => c.name.trim()).map((character) => {
              const on = composed.cast.some((c) => c.id === character.id)
              return h('button', {
                key: character.id, type: 'button', className: 'db-chip person', 'aria-pressed': on,
                onClick: () => patchShot(shot.id, (target) => {
                  const names = composed.cast.map((c) => c.name.trim())
                  target.cast = on ? names.filter((name) => name !== character.name.trim()) : [...names, character.name.trim()]
                  target.castSet = true
                }),
              }, character.portrait ? h('img', { src: mediaUrl(character.portrait), alt: '' }) : h('i', null, character.name.slice(0, 1)), character.name)
            }))) : null,

          h(Field, { label: '画面描述' }, h('textarea', { className: 'db-textarea', rows: 3, value: shot.description, placeholder: '谁、在哪、做什么、什么情绪', onChange: set('description') })),

          h(Field, { label: '台词 / 旁白', hint: '格式：角色名：台词' }, h('textarea', { className: 'db-textarea', rows: 2, value: shot.dialogue, placeholder: '没有台词就留空或写（无）', onChange: set('dialogue') })),
          h('div', { className: 'db-inline-actions' },
            h(Btn, { size: 'sm', icon: 'mic', disabled: !spoken || Boolean(audioJob), busy: Boolean(audioJob), onClick: () => studio.generateVoices(episodeIndex, [shot.id]) }, shot.audio ? '重新配音' : '配音'),
            shot.audio ? h(AudioChip, { asset: shot.audio }) : null,
            stale ? h(Tag, { tone: 'warn', icon: 'warning' }, '台词改过了，配音还是旧的') : null,
            spoken && !shot.audio ? h('span', { className: 'db-muted' }, spoken.speaker ? `由 ${spoken.speaker} 的音色朗读` : '由默认音色朗读') : null,
            shot.audio ? h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: '移除配音', onClick: () => patchShot(shot.id, (target) => { target.audio = null; target.audioText = '' }) }) : null),

          h(Field, { label: '生图提示词', hint: '只写画面，人物写姓名即可' }, h('textarea', { className: 'db-textarea', rows: 4, value: shot.imagePrompt, placeholder: '留空时使用画面描述', onChange: set('imagePrompt') })),
          h('div', { className: 'db-inline-actions' },
            h(Btn, { size: 'sm', kind: 'ghost', icon: showFinal ? 'up' : 'down', onClick: () => setShowFinal(!showFinal) }, '实际发送的提示词'),
            h(Btn, { size: 'sm', kind: 'ghost', icon: 'copy', disabled: !composed.prompt, onClick: () => studio.copy(composed.prompt, '提示词') }, '复制'),
            composed.refs.length ? h(Tag, { tone: 'info', icon: 'image' }, `带 ${composed.refs.length} 张定妆照参考`) : null),
          showFinal ? h('p', { className: 'db-final-prompt' }, composed.prompt || '画面描述和提示词都是空的。') : null,

          h(Field, { label: '视频提示词', hint: '只写运动：镜头怎么动、人怎么动' }, h('textarea', { className: 'db-textarea', rows: 2, value: shot.videoPrompt, onChange: set('videoPrompt') })),
          h('div', { className: 'db-inline-actions' },
            h(Btn, { size: 'sm', icon: 'film', disabled: Boolean(videoJob) || !shot.image, busy: Boolean(videoJob), onClick: () => studio.generateVideos(episodeIndex, [shot.id]) }, videoJob ? videoJob.message || '生成中' : shot.video ? '重新生成视频' : '图生视频'),
            shot.video ? h(Btn, { size: 'sm', kind: 'ghost', icon: 'play', onClick: () => studio.setLightbox({ items: [{ asset: shot.video, title: `第${episodeIndex}集 镜头${index + 1} 视频`, note: shot.video.provider }] }) }, '播放') : null,
            shot.video ? h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: '移除视频', onClick: () => patchShot(shot.id, (target) => { target.video = null }) }) : null,
            videoJob ? h(Btn, { size: 'sm', kind: 'ghost', onClick: () => studio.cancelJobs([videoJob.id]) }, '取消') : null,
            !shot.video && !videoJob ? h('span', { className: 'db-muted' }, studio.videoVendor === 'local' ? `合成时自动加「${shot.camera}」动效` : '') : null)))
    }

    function BoardTable({ shots }) {
      const { patchShot, patch, episodeIndex } = useStudio()
      const cell = (shot, field, rows) => h('textarea', { className: 'db-cell', rows, value: shot[field], onChange: (e) => patchShot(shot.id, (target) => { target[field] = e.target.value }) })
      return h('div', { className: 'db-table-wrap' }, h('table', { className: 'db-table' },
        h('thead', null, h('tr', null, ['镜号', '画面', '景别', '运镜', '画面描述', '台词 / 旁白', '秒', '生图提示词', '视频提示词', ''].map((title, i) => h('th', { key: i }, title)))),
        h('tbody', null, shots.map((shot, index) => h('tr', { key: shot.id },
          h('td', { className: 'c-no' }, index + 1),
          h('td', { className: 'c-thumb' }, h(Frame, { asset: shot.image, shot })),
          h('td', null, h('select', { className: 'db-select', 'aria-label': '景别', value: shot.shotSize, onChange: (e) => patchShot(shot.id, (target) => { target.shotSize = e.target.value }) }, SHOT_SIZES.map((size) => h('option', { key: size }, size)))),
          h('td', null, h('select', { className: 'db-select', 'aria-label': '运镜', value: shot.camera, onChange: (e) => patchShot(shot.id, (target) => { target.camera = e.target.value }) }, CAMERAS.map((camera) => h('option', { key: camera }, camera)))),
          h('td', null, cell(shot, 'description', 3)),
          h('td', null, cell(shot, 'dialogue', 3)),
          h('td', null, h('input', { className: 'db-input', type: 'number', min: 0, step: 0.5, 'aria-label': '时长', value: shot.duration, onChange: (e) => patchShot(shot.id, (target) => { target.duration = Math.max(0, Number(e.target.value) || 0) }) })),
          h('td', null, cell(shot, 'imagePrompt', 3)),
          h('td', null, cell(shot, 'videoPrompt', 3)),
          h('td', null, h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: `删除镜头 ${index + 1}`, onClick: () => patch((draft) => { draft.boards[String(episodeIndex)] = draft.boards[String(episodeIndex)].filter((item) => item.id !== shot.id) }) })))))))
    }

    function BoardPage() {
      const studio = useStudio()
      const { project, episodeIndex, selectedShot, setSelectedShot, patch, busy, generate } = studio
      const [view, setView] = useState('grid')
      const shots = shotsOf(project, episodeIndex)
      const episode = project.episodes.find((e) => e.index === episodeIndex)
      const total = totalDuration(shots)
      const over = total > 120
      const missing = shots.filter((shot) => !shot.image)
      const selectedIndex = shots.findIndex((shot) => shot.id === selectedShot)
      const selected = selectedIndex >= 0 ? shots[selectedIndex] : null
      const exportBase = `${safeName(project.name)}-第${episodeIndex}集`
      const activeImageJobs = studio.jobs.filter((job) => isActive(job) && job.type === 'image' && shots.some((shot) => shot.id === job.target?.shotId))

      const addShot = () => {
        const shot = emptyShot()
        patch((draft) => {
          const key = String(episodeIndex)
          while (draft.episodes.length < episodeIndex) draft.episodes.push(blankEpisode(draft.episodes.length + 1))
          if (!Array.isArray(draft.boards[key])) draft.boards[key] = []
          draft.boards[key].push(shot)
        })
        setSelectedShot(shot.id)
      }

      return h('div', { className: cx('db-board', selected && view === 'grid' && 'with-inspector') },
        h('div', { className: 'db-board-main' },
          h(EpisodeTabs),
          episode && (episode.hook || episode.conflict) ? h('p', { className: 'db-board-brief' }, h('b', null, '钩子'), episode.hook || '未填写', h('b', null, '卡点'), episode.cliffhanger || '未填写') : null,
          h('div', { className: 'db-toolbar' },
            h(Btn, { kind: shots.length ? undefined : 'primary', icon: 'sparkles', busy: busy === 'storyboard', disabled: Boolean(busy), onClick: () => generate('storyboard') }, busy === 'storyboard' ? '生成中' : shots.length ? '重新拆分镜' : 'AI 拆分镜'),
            shots.length && (missing.length || activeImageJobs.length) ? h(Btn, { kind: 'primary', icon: 'image', disabled: activeImageJobs.length > 0, busy: activeImageJobs.length > 0, onClick: () => studio.generateImages(episodeIndex, missing.map((shot) => shot.id)) },
              activeImageJobs.length ? `出图中，还剩 ${activeImageJobs.length} 张` : `给 ${missing.length} 个镜头出图`) : null,
            shots.length && !missing.length && !activeImageJobs.length ? h(Btn, { kind: 'primary', icon: 'studio', onClick: () => studio.navigate('studio', episodeIndex) }, '关键帧已齐，去成片') : null,
            h(Btn, { icon: 'plus', onClick: addShot }, '添加镜头'),
            shots.length ? h(Menu, {
              align: 'left',
              button: ({ toggle }) => h(Btn, { icon: 'more', onClick: toggle }, '批量'),
              items: [
                { label: '全部重新出图', hint: `${shots.length} 张，保留旧版本`, icon: 'refresh', onClick: () => studio.generateImages(episodeIndex, shots.map((shot) => shot.id)) },
                { label: '给缺图的镜头画草图', hint: '本地绘制，不消耗额度', icon: 'pencil', disabled: !missing.length, onClick: () => studio.sketchShots(episodeIndex, missing.map((shot) => shot.id)) },
                { label: '给所有台词配音', icon: 'mic', onClick: () => studio.generateVoices(episodeIndex, shots.filter((shot) => !shot.audio).map((shot) => shot.id)) },
                { label: '图生视频', hint: '给有关键帧的镜头生成动态画面', icon: 'film', onClick: () => studio.generateVideos(episodeIndex, shots.filter((shot) => shot.image && !shot.video).map((shot) => shot.id)) },
                { label: '导出 Markdown', icon: 'download', onClick: () => download(`${exportBase}.md`, toMarkdown(project, episodeIndex, shots), 'text/markdown;charset=utf-8') },
                { label: '导出 CSV', icon: 'download', onClick: () => download(`${exportBase}.csv`, toCsv(project, episodeIndex, shots), 'text/csv;charset=utf-8') },
              ],
            }) : null,
            activeImageJobs.length ? h(Btn, { kind: 'ghost', onClick: () => studio.cancelJobs(activeImageJobs.map((job) => job.id)) }, '停止出图') : null,
            h('span', { className: 'db-grow' }),
            shots.length ? h('span', { className: cx('db-total', over && 'over') }, h('b', null, clock(total)), `${shots.length} 个镜头`, over ? '，超过 2 分钟' : '') : null,
            h(Segment, { label: '分镜视图', value: view, onChange: setView, options: [['grid', '画格', 'grid'], ['table', '表格', 'list']] })),

          shots.length === 0
            ? h(Empty, { icon: 'board', title: `第 ${episodeIndex} 集还没有分镜`, action: h('div', { className: 'db-row' }, h(Btn, { kind: 'primary', icon: 'sparkles', disabled: Boolean(busy), onClick: () => generate('storyboard') }, 'AI 拆分镜'), h(Btn, { icon: 'plus', onClick: addShot }, '手动添加')) },
              '按这一集的钩子、冲突和卡点拆成 8~14 个镜头，每个镜头自带画面描述、台词和提示词。')
            : view === 'grid'
              ? h('div', { className: 'db-wall' },
                shots.map((shot, index) => h(ShotTile, { key: shot.id, shot, index, selected: shot.id === selectedShot, onSelect: () => setSelectedShot(shot.id === selectedShot ? null : shot.id) })),
                h('button', { type: 'button', className: 'db-tile-add', onClick: addShot, 'aria-label': '添加镜头' }, h(Icon, { name: 'plus', size: 22 }), '添加镜头'))
              : h(BoardTable, { shots })),
        selected && view === 'grid' ? h(ShotInspector, { key: selected.id, shot: selected, index: selectedIndex, total: shots.length, onClose: () => setSelectedShot(null) }) : null)
    }
    //#endregion

    //#region 54-studio.js
    // 成片：试映播放器、胶片时间线、配音与合成。

    const MOTION_CLASS = { 固定: 'still', 推: 'push', 拉: 'pull', 摇: 'pan', 移: 'truck', 跟: 'follow', 升降: 'crane' }

    /** 试映时每个镜头实际停留多久：台词比镜头长，就等台词念完（与合成规则一致）。 */
    const playLength = (shot) => Math.max(Number(shot.duration) || 3, shot.audio?.dur ? Math.round((shot.audio.dur + 0.45) * 10) / 10 : 0, 0.5)

    /**
     * 试映：不用等合成，直接按分镜顺序播放关键帧，带运镜动效、字幕和配音。
     * seek 变化时跳到指定镜头。
     */
    function Screening({ shots, title, seek, onShot, fitAudio = true }) {
      const [at, setAt] = useState(0)
      const [playing, setPlaying] = useState(false)
      const [muted, setMuted] = useState(false)
      const [tick, setTick] = useState(0)
      const [run, setRun] = useState(0)
      const audio = useRef(null)
      const video = useRef(null)
      const index = Math.min(at, Math.max(0, shots.length - 1))
      const shot = shots[index]
      const lengths = useMemo(() => shots.map((item) => (fitAudio ? playLength(item) : Math.max(0.5, Number(item.duration) || 3))), [shots, fitAudio])
      const total = lengths.reduce((sum, value) => sum + value, 0)
      const before = lengths.slice(0, index).reduce((sum, value) => sum + value, 0)
      const length = lengths[index] || 1

      useEffect(() => {
        if (!seek) return
        setAt(Math.max(0, Math.min(shots.length - 1, seek.index)))
        setTick(0)
        setRun((n) => n + 1)
        if (seek.play) setPlaying(true)
      }, [seek])

      useEffect(() => {
        if (!playing) return undefined
        let last = performance.now()
        let frame
        const loop = (now) => {
          const delta = Math.min(0.1, (now - last) / 1000)
          last = now
          setTick((value) => value + delta)
          frame = requestAnimationFrame(loop)
        }
        frame = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(frame)
      }, [playing])

      useEffect(() => {
        if (!playing || tick < length) return
        if (index < shots.length - 1) { setAt(index + 1); setTick(0); setRun((n) => n + 1) }
        else { setPlaying(false); setTick(length) }
      }, [tick, playing, length, index, shots.length])

      useEffect(() => { onShot?.(shot?.id || null) }, [shot?.id])

      // 配音跟着镜头走：进入镜头 0.15 秒后开口，暂停时一起停。
      useEffect(() => {
        const element = audio.current
        if (!element) return undefined
        element.pause()
        if (!playing || !shot?.audio || muted) return undefined
        element.src = mediaUrl(shot.audio)
        const offset = Math.max(0, tick - 0.15)
        const timer = setTimeout(() => {
          element.currentTime = offset
          element.play().catch(() => {})
        }, tick < 0.15 ? (0.15 - tick) * 1000 : 0)
        return () => { clearTimeout(timer); element.pause() }
      }, [shot?.id, run, playing, muted])

      useEffect(() => {
        const element = video.current
        if (!element) return
        if (playing) element.play().catch(() => {})
        else element.pause()
      }, [playing, shot?.id, run])

      useEffect(() => () => { audio.current?.pause() }, [])

      if (!shot) return h('div', { className: 'db-screen empty' }, h('div', { className: 'db-screen-frame' }, h('span', null, '这一集还没有镜头')))

      const spoken = parseDialogue(shot.dialogue)
      const cues = spoken ? splitSubtitle(spoken.line) : []
      let cue = ''
      if (cues.length) {
        const lead = shot.audio ? 0.15 : 0.1
        const span = shot.audio?.dur ? Math.min(length - lead, shot.audio.dur + 0.2) : length - lead - 0.1
        const chars = cues.reduce((sum, item) => sum + item.length, 0)
        let cursor = lead
        for (const item of cues) {
          const piece = Math.max(0.5, span * item.length / chars)
          if (tick >= cursor && tick < cursor + piece) { cue = item; break }
          cursor += piece
        }
      }
      const toggle = () => {
        if (!playing && index === shots.length - 1 && tick >= length) { setAt(0); setTick(0); setRun((n) => n + 1) }
        setPlaying(!playing)
      }
      const jump = (next) => { setAt(Math.max(0, Math.min(shots.length - 1, next))); setTick(0); setRun((n) => n + 1) }
      const atStart = index === 0 && tick < 0.05 && !playing

      return h('div', { className: 'db-screen' },
        h('div', {
          className: 'db-screen-frame', tabIndex: 0, role: 'button', 'aria-label': playing ? '暂停试映' : '播放试映',
          onClick: toggle, onKeyDown: (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle() } if (e.key === 'ArrowRight') jump(index + 1); if (e.key === 'ArrowLeft') jump(index - 1) },
        },
          shot.video
            ? h('video', { key: `${shot.id}-${run}`, ref: video, src: mediaUrl(shot.video), muted: true, playsInline: true, preload: 'auto' })
            : shot.image
              ? h('img', { key: `${shot.id}-${run}`, className: `db-kb ${MOTION_CLASS[shot.camera] || 'still'}`, src: mediaUrl(shot.image), alt: '', draggable: false, style: { '--dur': `${length}s`, animationPlayState: playing ? 'running' : 'paused' } })
              : h('div', { className: 'db-frame-ph' }, h('i', { className: 'tl' }), h('i', { className: 'tr' }), h('i', { className: 'bl' }), h('i', { className: 'br' }), h('span', null, h('b', null, `镜头 ${pad2(index + 1)}`), h('small', null, '还没有关键帧'))),
          h('div', { className: 'db-screen-bars', 'aria-hidden': true }, shots.map((item, i) => h('i', { key: item.id, style: { flexGrow: lengths[i] } }, h('b', { style: { width: i < index ? '100%' : i === index ? `${Math.min(100, tick / length * 100)}%` : '0%' } })))),
          atStart && title ? h('div', { className: 'db-screen-title' }, title) : null,
          cue ? h('div', { className: 'db-screen-sub' }, cue) : null,
          !playing ? h('span', { className: 'db-screen-play', 'aria-hidden': true }, h(Icon, { name: 'play', size: 30 })) : null),
        h('audio', { ref: audio, preload: 'auto' }),
        h('div', { className: 'db-screen-controls' },
          h(IconBtn, { icon: 'prev', size: 'sm', className: 'ghost', label: '上一个镜头', disabled: index === 0, onClick: () => jump(index - 1) }),
          h(IconBtn, { icon: playing ? 'pause' : 'play', className: 'primary', label: playing ? '暂停' : '播放', onClick: toggle }),
          h(IconBtn, { icon: 'next', size: 'sm', className: 'ghost', label: '下一个镜头', disabled: index === shots.length - 1, onClick: () => jump(index + 1) }),
          h('span', { className: 'db-timecode' }, `${clock(before + Math.min(tick, length))} / ${clock(total)}`),
          h('span', { className: 'db-grow' }),
          h(IconBtn, { icon: muted ? 'mute' : 'volume', size: 'sm', className: 'ghost', label: muted ? '打开声音' : '静音', onClick: () => setMuted(!muted) })))
    }

    /** 胶片时间线：每格宽度与时长成正比，下面两条轨是字幕和配音。 */
    function Timeline({ shots, current, onPick, onOpen }) {
      const studio = useStudio()
      const scale = 26
      return h('div', { className: 'db-timeline', role: 'list', 'aria-label': '时间线' },
        h('div', { className: 'db-timeline-track' }, shots.map((shot, index) => {
          const length = playLength(shot)
          const spoken = parseDialogue(shot.dialogue)
          const job = studio.jobFor({ shotId: shot.id, field: 'image' }) || studio.jobFor({ shotId: shot.id, field: 'video' })
          return h('div', { key: shot.id, role: 'listitem', className: cx('db-cell-shot', shot.id === current && 'on'), style: { width: Math.max(62, length * scale) } },
            h('button', { type: 'button', className: 'db-film', onClick: () => onPick(index), onDoubleClick: () => onOpen(shot.id), 'aria-label': `镜头 ${index + 1}，${length} 秒`, title: '单击定位，双击去分镜页修改' },
              shot.image ? h('img', { src: mediaUrl(shot.image), alt: '', loading: 'lazy', draggable: false }) : h('span', { className: 'db-film-empty' }, shot.shotSize),
              job ? h('span', { className: 'db-frame-sweep' }) : null,
              h('b', null, pad2(index + 1)),
              shot.video ? h('i', null, h(Icon, { name: 'film', size: 11 })) : null,
              h('time', null, `${length}s`)),
            h('div', { className: cx('db-track-sub', !spoken && 'none') }, spoken ? spoken.line : ''),
            h('div', { className: cx('db-track-voice', shot.audio ? 'has' : spoken ? 'need' : 'none') },
              shot.audio ? h('span', { style: { width: `${Math.min(100, (shot.audio.dur || length) / length * 100)}%` } }) : null))
        })),
        h('div', { className: 'db-timeline-legend' }, h('span', null, '画面'), h('span', null, '字幕'), h('span', null, '配音')))
    }

    function Step({ n, name, done, total, state, children }) {
      const complete = total > 0 && done >= total
      return h('li', { className: cx('db-step', complete && 'done') },
        h(Ring, { value: total ? done / total : 0, size: 36 }, complete ? h(Icon, { name: 'check', size: 14 }) : n),
        h('div', { className: 'db-step-body' },
          h('div', { className: 'db-step-head' }, h('strong', null, name), h('span', { className: 'db-muted' }, state)),
          children))
    }

    function StudioPage() {
      const studio = useStudio()
      const { project, episodeIndex, engine, jobs, navigate, patch, toast } = studio
      const [seek, setSeek] = useState(null)
      const [current, setCurrent] = useState(null)
      const shots = shotsOf(project, episodeIndex)
      const episode = project.episodes.find((e) => e.index === episodeIndex)
      const progress = episodeProgress(project, episodeIndex)
      const options = engine?.settings?.render || {}
      const tools = engine?.tools
      const renderJob = jobs.find((job) => isActive(job) && job.type === 'render' && job.target?.id === episode?.id)
      const voiceJobs = jobs.filter((job) => isActive(job) && job.type === 'tts' && shots.some((shot) => shot.id === job.target?.shotId))
      const imageJobs = jobs.filter((job) => isActive(job) && job.type === 'image' && shots.some((shot) => shot.id === job.target?.shotId))
      const videoJobs = jobs.filter((job) => isActive(job) && job.type === 'video' && shots.some((shot) => shot.id === job.target?.shotId))
      const missing = shots.filter((shot) => !shot.image)
      const unvoiced = shots.filter((shot) => parseDialogue(shot.dialogue) && (!shot.audio || (shot.audioText && shot.audioText !== parseDialogue(shot.dialogue).line)))
      const latest = episode?.renders?.[0] || null
      const setOption = (change) => studio.saveEngine({ render: change })
      const length = shots.reduce((sum, shot) => sum + playLength(shot), 0)
      const title = episode ? `第${episodeIndex}集 ${episode.title.replace(/^第\s*\d+\s*集[：:\s]*/, '')}` : ''

      const uploadBgm = async (file) => {
        try {
          const asset = await uploadMedia(project.id, file, { name: `配乐 ${file.name}` })
          if (asset.kind !== 'audio') throw new Error('配乐需要是音频文件（MP3 / M4A / WAV）')
          patch((draft) => { const target = draft.episodes.find((e) => e.id === episode.id); if (target) target.bgm = asset })
        } catch (error) {
          toast('err', error.message)
        }
      }

      if (!shots.length) {
        return h('div', { className: 'db-stack' }, h(EpisodeTabs),
          h(Empty, { icon: 'studio', title: `第 ${episodeIndex} 集还没有镜头`, action: h(Btn, { kind: 'primary', icon: 'board', onClick: () => navigate('board', episodeIndex) }, '去拆分镜') }, '成片从分镜开始：先把这一集拆成镜头，再回来配音和合成。'))
      }

      return h('div', { className: 'db-stack' },
        h(EpisodeTabs),
        h('div', { className: 'db-studio' },
          h(Screening, { key: `${project.id}-${episodeIndex}`, shots, title, seek, onShot: setCurrent, fitAudio: options.fitAudio !== false }),

          h('div', { className: 'db-studio-side' },
            h('ol', { className: 'db-steps' },
              h(Step, { n: 1, name: '关键帧', done: progress.images, total: shots.length, state: `${progress.images} / ${shots.length} 个镜头有画面` },
                h('div', { className: 'db-row' },
                  missing.length
                    ? h(Btn, { size: 'sm', kind: 'primary', icon: 'image', disabled: imageJobs.length > 0, busy: imageJobs.length > 0, onClick: () => studio.generateImages(episodeIndex, missing.map((shot) => shot.id)) }, imageJobs.length ? `出图中，还剩 ${imageJobs.length} 张` : `给 ${missing.length} 个镜头出图`)
                    : null,
                  missing.length && !imageJobs.length ? h(Btn, { size: 'sm', icon: 'pencil', onClick: () => studio.sketchShots(episodeIndex, missing.map((shot) => shot.id)) }, '先画草图') : null,
                  h(Btn, { size: 'sm', kind: 'ghost', icon: 'board', onClick: () => navigate('board', episodeIndex) }, '去分镜页调整'))),

              h(Step, { n: 2, name: '配音', done: progress.voiced - progress.stale, total: progress.spoken, state: progress.spoken ? `${progress.voiced} / ${progress.spoken} 句台词${progress.stale ? `，${progress.stale} 句需要重配` : ''}` : '这一集没有台词' },
                progress.spoken ? h('div', { className: 'db-row' },
                  h(Btn, { size: 'sm', kind: unvoiced.length ? 'primary' : undefined, icon: 'mic', disabled: voiceJobs.length > 0 || !unvoiced.length, busy: voiceJobs.length > 0, onClick: () => studio.generateVoices(episodeIndex, unvoiced.map((shot) => shot.id)) },
                    voiceJobs.length ? `配音中，还剩 ${voiceJobs.length} 句` : unvoiced.length ? `给 ${unvoiced.length} 句台词配音` : '配音已齐'),
                  h(Btn, { size: 'sm', kind: 'ghost', icon: 'cast', onClick: () => navigate('cast') }, '调整音色'),
                  h('span', { className: 'db-muted' }, engine?.settings?.tts?.vendor === 'system' ? '系统语音' : engine?.catalog?.tts?.find((item) => item.id === engine.settings.tts.vendor)?.name)) : null),

              h(Step, { n: 3, name: '动态', done: studio.videoVendor === 'local' ? progress.images : progress.videos, total: shots.length, state: studio.videoVendor === 'local' ? '本地运镜动效，合成时自动添加' : `${progress.videos} / ${shots.length} 个镜头有 AI 视频` },
                h('div', { className: 'db-row' },
                  studio.videoVendor !== 'local'
                    ? h(Btn, { size: 'sm', icon: 'film', disabled: videoJobs.length > 0, busy: videoJobs.length > 0, onClick: () => studio.generateVideos(episodeIndex, shots.filter((shot) => shot.image && !shot.video).map((shot) => shot.id)) }, videoJobs.length ? `生成中，还剩 ${videoJobs.length} 段` : '给有画面的镜头生成视频')
                    : h(Btn, { size: 'sm', kind: 'ghost', icon: 'engine', onClick: () => navigate('engine') }, '接入图生视频'),
                  videoJobs.length ? h(Btn, { size: 'sm', kind: 'ghost', onClick: () => studio.cancelJobs(videoJobs.map((job) => job.id)) }, '停止') : null)),

              h(Step, { n: 4, name: '合成', done: latest ? 1 : 0, total: 1, state: latest ? `已合成 ${clock(latest.dur || 0)}` : `预计 ${clock(length)}` },
                h('div', { className: 'db-options' },
                  h('label', null, h('input', { type: 'checkbox', checked: options.subtitles !== false, onChange: (e) => setOption({ subtitles: e.target.checked }) }), '烧录字幕'),
                  h('label', null, h('input', { type: 'checkbox', checked: options.titleCard !== false, onChange: (e) => setOption({ titleCard: e.target.checked }) }), '开头显示集标题'),
                  h('label', null, h('input', { type: 'checkbox', checked: options.fitAudio !== false, onChange: (e) => setOption({ fitAudio: e.target.checked }) }), '台词没念完时延长镜头'),
                  h('label', null, '清晰度', h('select', { className: 'db-select', value: options.width || 720, onChange: (e) => setOption({ width: Number(e.target.value) }) }, h('option', { value: 540 }, '540p（快）'), h('option', { value: 720 }, '720p'), h('option', { value: 1080 }, '1080p（慢）')))),
                h('div', { className: 'db-row' },
                  episode.bgm
                    ? h(Fragment, null, h(Tag, { icon: 'music' }, '已添加配乐'), h(AudioChip, { asset: episode.bgm }),
                      h('label', { className: 'db-range' }, '音量', h('input', { type: 'range', min: 0, max: 0.6, step: 0.02, value: options.bgmVolume ?? 0.22, onChange: (e) => setOption({ bgmVolume: Number(e.target.value) }) })),
                      h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: '移除配乐', onClick: () => patch((draft) => { const target = draft.episodes.find((e) => e.id === episode.id); if (target) target.bgm = null }) }))
                    : h(FilePick, { size: 'sm', kind: 'ghost', icon: 'music', accept: 'audio/*,.mp3,.m4a,.wav', onPick: uploadBgm }, '添加配乐')),
                tools && !tools.ffmpeg
                  ? h('p', { className: 'db-warn' }, h(Icon, { name: 'warning', size: 15 }), '没有找到 ffmpeg，无法合成。macOS 可运行 brew install ffmpeg，或到「生成引擎」填写它的路径。')
                  : null,
                renderJob
                  ? h('div', { className: 'db-render-progress', role: 'status' },
                    h('div', { className: 'db-bar rec' }, h('span', { style: { width: `${Math.round((renderJob.progress || 0) * 100)}%` } })),
                    h('span', null, renderJob.message, ` ${Math.round((renderJob.progress || 0) * 100)}%`),
                    h(Btn, { size: 'sm', kind: 'ghost', onClick: () => studio.cancelJobs([renderJob.id]) }, '取消'))
                  : h(Btn, { kind: latest ? undefined : 'primary', className: latest ? '' : 'rec', icon: 'film', disabled: tools && !tools.ffmpeg, onClick: () => studio.renderEpisode(episodeIndex) }, latest ? '重新合成 MP4' : '合成 MP4'))),

            latest ? h('section', { className: 'db-output' },
              h(Frame, { video: latest, onOpen: () => studio.setLightbox({ items: [{ asset: latest, title: `${project.name} ${title}`, note: `${latest.w}×${latest.h}` }] }) }, h('span', { className: 'db-play-badge' }, h(Icon, { name: 'play', size: 16 }))),
              h('div', { className: 'db-output-body' },
                h('strong', null, `${project.name} ${title}`),
                h('span', { className: 'db-muted' }, `${latest.w}×${latest.h}，${clock(latest.dur || 0)}，${new Date(latest.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`),
                h('div', { className: 'db-row' },
                  h(Btn, { kind: 'primary', size: 'sm', icon: 'download', onClick: () => downloadUrl(mediaUrl(latest), `${safeName(project.name)}-第${episodeIndex}集.mp4`) }, '下载 MP4'),
                  h(Btn, { size: 'sm', icon: 'publish', onClick: () => navigate('publish', episodeIndex) }, '准备发布'),
                  episode.renders.length > 1 ? h('span', { className: 'db-muted' }, `另有 ${episode.renders.length - 1} 个旧版本在素材库`) : null))) : null)),

        h(Timeline, { shots, current, onPick: (index) => setSeek({ index, nonce: Date.now() }), onOpen: (shotId) => navigate('board', episodeIndex, shotId) }))
    }
    //#endregion

    //#region 55-publish.js
    // 发布与素材库。

    /** 发布前按平台规则检查一遍。state：ok | warn | bad。 */
    function publishChecks(platform, { publish, title, cover, latest }) {
      const checks = []
      const titleText = title.trim()
      if (!latest) {
        checks.push({ state: 'bad', label: '成片', detail: '还没有合成 MP4。发布页只交付成品，先去「成片」页合成。' })
      } else {
        const ratio = latest.w && latest.h ? latest.w / latest.h : 0
        const vertical = Math.abs(ratio - 9 / 16) < 0.02
        checks.push({
          state: vertical ? 'ok' : 'warn',
          label: '画面比例',
          detail: `${latest.w || '?'}×${latest.h || '?'}${vertical ? '，标准竖屏' : '，不是 9:16，平台可能加黑边'}`,
        })
        checks.push({ state: 'ok', label: '时长', detail: clock(latest.dur || 0) })
      }
      checks.push(!titleText
        ? { state: 'bad', label: '标题', detail: '还没有标题，点「AI 写文案」或自己填一个。' }
        : titleText.length > platform.titleMax
          ? { state: 'bad', label: `标题 ${titleText.length}/${platform.titleMax} 字`, detail: `超出 ${titleText.length - platform.titleMax} 字，${platform.name}会截断或拒绝。` }
          : { state: 'ok', label: `标题 ${titleText.length}/${platform.titleMax} 字` })
      if (platform.id === 'shipinhao' && /[^\u4e00-\u9fa5A-Za-z0-9 ]/.test(titleText)) {
        checks.push({ state: 'warn', label: '短标题字符', detail: '视频号的短标题只收中文、字母、数字和空格，标点和表情可能存不进去。' })
      }
      const caption = String(publish.caption || '').trim()
      checks.push(!caption
        ? { state: 'warn', label: '简介', detail: '留空也能发，但少了一次把人留住的机会。' }
        : caption.length > platform.captionMax
          ? { state: 'bad', label: `简介 ${caption.length}/${platform.captionMax} 字`, detail: '超出后平台会截断或拒绝。' }
          : { state: 'ok', label: `简介 ${caption.length}/${platform.captionMax} 字` })
      const tagCount = publish.tags.length
      checks.push(tagCount === 0
        ? { state: 'warn', label: '话题标签', detail: '一个都没有，推荐页很难把你分到对的池子里。' }
        : tagCount > platform.tagMax
          ? { state: 'warn', label: `话题 ${tagCount}/${platform.tagMax} 个`, detail: `超出 ${tagCount - platform.tagMax} 个，只带前 ${platform.tagMax} 个就好。` }
          : { state: 'ok', label: `话题 ${tagCount}/${platform.tagMax} 个` })
      checks.push(cover
        ? { state: 'ok', label: '封面', detail: platform.coverAspect === '16:9' ? '已选关键帧；B站按 16:9 显示，9:16 的画面会被裁切。' : '已选关键帧。' }
        : { state: 'warn', label: '封面', detail: '没选封面，平台会自己截第一帧。' })
      if (publish.coverText && publish.coverText.length > 10) {
        checks.push({ state: 'warn', label: `封面大字 ${publish.coverText.length}/10 字`, detail: '太长了，手机上会糊成一片。' })
      }
      return checks
    }

    function PublishPage() {
      const studio = useStudio()
      const { project, episodeIndex, patch, busy, generate, navigate } = studio
      const episode = project.episodes.find((e) => e.index === episodeIndex)
      const shots = shotsOf(project, episodeIndex)
      if (!episode) return h('div', { className: 'db-stack' }, h(EpisodeTabs), h(Empty, { icon: 'publish', title: '还没有这一集' }, '先在分集页写好故事。'))
      const publish = episode.publish
      const platform = platformOf(publish.platform)
      const withImage = shots.filter((shot) => shot.image)
      const cover = withImage.find((shot) => shot.id === episode.cover) || withImage[0] || null
      const title = publish.titles[publish.pick] || publish.titles[0] || ''
      // B站的话题是独立标签框，粘贴时不用带 #；其余三家写在描述里，要 # 才会变话题。
      const tags = platform.id === 'bilibili' ? publish.tags.join(' ') : publish.tags.map((tag) => `#${tag}`).join(' ')
      const latest = episode.renders[0] || null
      const setPublish = (mutate) => patch((draft) => { const target = draft.episodes.find((e) => e.id === episode.id); if (target) mutate(target.publish, target) })
      const fullText = [title, '', publish.caption, '', tags].join('\n').trim()
      const checks = publishChecks(platform, { publish, title, cover, latest })
      const blocking = checks.filter((item) => item.state === 'bad')
      const titleLabel = platform.id === 'shipinhao' ? '短标题' : '标题'

      return h('div', { className: 'db-stack' },
        h(EpisodeTabs),
        h('section', { className: 'db-card' },
          h('header', { className: 'db-section-head' },
            h('h2', null, '发布到哪个平台'),
            h('span', { className: 'db-muted' }, '四家的接口开放程度不同，选中后按它的规矩检查文案')),
          h('div', { className: 'db-platforms', role: 'group', 'aria-label': '发布平台' },
            PLATFORMS.map((item) => h('button', {
              key: item.id, type: 'button', className: cx('db-platform', item.id === platform.id && 'on'),
              'aria-pressed': item.id === platform.id, style: { '--platform-color': item.color },
              onClick: () => setPublish((target) => { target.platform = item.id }),
            },
              h('span', { className: 'db-platform-badge', 'aria-hidden': true }, item.short),
              h('span', { className: 'db-platform-text' },
                h('strong', null, item.name),
                h('small', null, item.api === 'open' ? '有官方接口' : '无发布接口')),
              item.id === platform.id ? h(Icon, { name: 'check', size: 15, className: 'db-platform-check' }) : null))),
          h('div', { className: 'db-platform-detail' },
            h('p', null, platform.apiDetail,
              h('a', { className: 'db-link', href: platform.doc, target: '_blank', rel: 'noreferrer noopener' }, '接口文档')),
            h('ul', { className: 'db-platform-limits' }, platform.limits.map((line) => h('li', { key: line }, line))),
            h('p', { className: 'db-muted' }, platform.api === 'open'
              ? '接口还没接进工作台（要开放平台应用凭证 + 账号授权）。现在用「复制发布包 → 打开创作中心 → 上传成片」，一分钟能发完。'
              : '视频号没有对外接口，只能手动：打开助手 → 上传成片 → 粘贴文案。'))),

        h('div', { className: 'db-publish' },
          h('div', { className: 'db-phone' },
            h('div', { className: 'db-phone-screen' },
              cover ? h('img', { src: mediaUrl(cover.image), alt: '封面' }) : h('div', { className: 'db-frame-ph' }, h('span', null, h('small', null, '出图后可以选封面'))),
              publish.coverText ? h('div', { className: 'db-phone-cover-text' }, publish.coverText) : null,
              latest ? h('button', { type: 'button', className: 'db-phone-play', 'aria-label': '播放成片', onClick: () => studio.setLightbox({ items: [{ asset: latest, title: `${project.name} 第${episodeIndex}集`, note: `${latest.w}×${latest.h}` }] }) }, h(Icon, { name: 'play', size: 26 })) : null,
              h('div', { className: 'db-phone-rail', 'aria-hidden': true }, h(Icon, { name: 'heart', size: 22 }), h(Icon, { name: 'comment', size: 22 }), h(Icon, { name: 'share', size: 22 })),
              h('div', { className: 'db-phone-caption', 'aria-hidden': true },
                h('strong', null, `@${project.name.slice(0, 12)}`),
                h('p', null, title || '这里显示你选的标题'),
                tags ? h('span', null, tags) : null)),
            h('p', { className: 'db-muted' }, `${platform.name}里的样子。点播放键看成片。`)),

          h('div', { className: 'db-stack' },
            h('section', { className: 'db-card' },
              h('header', { className: 'db-section-head' }, h('h2', null, '发布检查'), h(Tag, { tone: blocking.length ? 'warn' : 'ok', icon: blocking.length ? 'warning' : 'check' }, blocking.length ? `${blocking.length} 项要改` : '可以发')),
              h('ul', { className: 'db-checks' }, checks.map((item, i) => h('li', { key: `${item.label}-${i}`, className: cx('db-check', item.state) },
                h(Icon, { name: item.state === 'ok' ? 'check' : 'warning', size: 15 }),
                h('div', null, h('span', null, item.label), item.detail ? h('small', null, item.detail) : null)))),
              h('div', { className: 'db-row' },
                h('a', { className: 'db-btn primary db-link-btn', href: platform.studio, target: '_blank', rel: 'noreferrer noopener' }, h(Icon, { name: 'link', size: 17 }), `打开${platform.studioName}`),
                h(Btn, { icon: 'copy', disabled: !fullText, onClick: () => studio.copy(fullText, `${platform.name}发布包`) }, '复制发布包'))),

            h('section', { className: 'db-card' },
              h('header', { className: 'db-section-head' }, h('h2', null, '发布文案'),
                h(Btn, { kind: publish.titles.length ? undefined : 'primary', size: 'sm', icon: 'sparkles', busy: busy === 'publish', disabled: Boolean(busy), onClick: () => generate('publish') }, busy === 'publish' ? '生成中' : publish.titles.length ? '重新生成' : 'AI 写文案')),
              publish.titles.length === 0 && !publish.caption
                ? h('p', { className: 'db-note' }, '按这一集的钩子和卡点写 3 个候选标题、一段简介和 5 个话题标签。也可以直接在下面手写。')
                : null,
              h('div', { className: 'db-field' },
                h('span', { className: 'db-label' }, titleLabel, h('em', null, platform.titleHint)),
                h('div', { className: 'db-titles' },
                  (publish.titles.length ? publish.titles : ['']).map((text, i) => h('label', { key: i, className: cx('db-title-option', publish.pick === i && 'on') },
                    h('input', { type: 'radio', name: `title-${episode.id}`, checked: publish.pick === i, onChange: () => setPublish((target) => { target.pick = i }) }),
                    h('input', { className: 'db-input db-input-bare', value: text, placeholder: '写一个带悬念的标题', 'aria-label': `候选标题 ${i + 1}`, onChange: (e) => setPublish((target) => { const list = target.titles.length ? target.titles : ['']; list[i] = e.target.value; target.titles = list }) }),
                    h('span', { className: cx('db-count', text.length > platform.titleMax && 'over') }, `${text.length}/${platform.titleMax}`))),
                  publish.titles.length < 5 ? h(Btn, { kind: 'ghost', size: 'sm', icon: 'plus', onClick: () => setPublish((target) => { target.titles = [...(target.titles.length ? target.titles : ['']), ''] }) }, '再加一个') : null)),
              h(Field, { label: '简介', hint: `不超过 ${platform.captionMax} 字` }, h('textarea', { className: 'db-textarea', rows: 3, value: publish.caption, placeholder: '一两句话勾起好奇，结尾留一个让人想评论的问题', onChange: (e) => setPublish((target) => { target.caption = e.target.value }) })),
              h(Field, { label: '话题标签', hint: `用空格分开，不用写 #；${platform.name}最多 ${platform.tagMax} 个` }, h('input', { className: 'db-input', value: publish.tags.join(' '), placeholder: 'AI短剧 悬疑 反转', onChange: (e) => setPublish((target) => { target.tags = e.target.value.split(/[\s,，#]+/).filter(Boolean).slice(0, 8) }) })),
              h(Field, { label: '封面大字', hint: '不超过 10 个字' }, h('input', { className: 'db-input', value: publish.coverText, onChange: (e) => setPublish((target) => { target.coverText = e.target.value }) })),
              h('div', { className: 'db-row' },
                h(Btn, { kind: 'primary', icon: 'copy', disabled: !fullText, onClick: () => studio.copy(fullText, '标题、简介和标签') }, '复制全部文案'),
                h(Btn, { icon: 'copy', disabled: !title, onClick: () => studio.copy(title, '标题') }, '只复制标题'))),

            h('section', { className: 'db-card' },
              h('header', { className: 'db-section-head' }, h('h2', null, '封面'), h('span', { className: 'db-muted' }, withImage.length ? (platform.coverAspect === '16:9' ? `B站按 ${platform.coverAspect} 显示，竖屏关键帧会被裁切` : '点一张关键帧作为封面') : '这一集还没有关键帧')),
              withImage.length ? h('div', { className: 'db-strip pick' }, withImage.map((shot) => h('button', {
                key: shot.id, type: 'button', className: 'db-cover-option', 'aria-pressed': cover?.id === shot.id, 'aria-label': '设为封面',
                onClick: () => setPublish((_, target) => { target.cover = shot.id }),
              }, h('img', { src: mediaUrl(shot.image), alt: '', loading: 'lazy' })))) : h(Btn, { icon: 'board', onClick: () => navigate('board', episodeIndex) }, '去分镜页出图'),
              cover ? h('div', { className: 'db-row' }, h(Btn, { size: 'sm', icon: 'download', onClick: () => downloadUrl(mediaUrl(cover.image), `${safeName(project.name)}-第${episodeIndex}集-封面.${cover.image.file.split('.').pop()}`) }, '下载封面图')) : null),

            h('section', { className: 'db-card' },
              h('header', { className: 'db-section-head' }, h('h2', null, '交付文件'), h('span', { className: 'db-muted' }, `${platform.name}要的竖屏成片`)),
              h('div', { className: 'db-deliver' },
                h('div', null, h('strong', null, '成片 MP4'), h('span', { className: 'db-muted' }, latest ? `${latest.w}×${latest.h}，${clock(latest.dur || 0)}` : '还没有合成')),
                latest ? h(Btn, { size: 'sm', kind: 'primary', icon: 'download', onClick: () => downloadUrl(mediaUrl(latest), `${safeName(project.name)}-第${episodeIndex}集.mp4`) }, '下载') : h(Btn, { size: 'sm', icon: 'studio', onClick: () => navigate('studio', episodeIndex) }, '去合成')),
              h('div', { className: 'db-deliver' },
                h('div', null, h('strong', null, '分镜表'), h('span', { className: 'db-muted' }, `${shots.length} 个镜头，含完整提示词`)),
                h('div', { className: 'db-row tight' },
                  h(Btn, { size: 'sm', disabled: !shots.length, onClick: () => download(`${safeName(project.name)}-第${episodeIndex}集.md`, toMarkdown(project, episodeIndex, shots), 'text/markdown;charset=utf-8') }, 'Markdown'),
                  h(Btn, { size: 'sm', disabled: !shots.length, onClick: () => download(`${safeName(project.name)}-第${episodeIndex}集.csv`, toCsv(project, episodeIndex, shots), 'text/csv;charset=utf-8') }, 'CSV'))),
              h('div', { className: 'db-deliver' },
                h('div', null, h('strong', null, '项目备份'), h('span', { className: 'db-muted' }, '全部文字与素材引用（JSON）')),
                h(Btn, { size: 'sm', onClick: studio.backupProject }, '导出'))))))
    }

    const KIND_NAME = { image: '图片', video: '视频', audio: '配音', render: '成片' }

    function LibraryPage() {
      const studio = useStudio()
      const { project, toast } = studio
      const [assets, setAssets] = useState(null)
      const [filter, setFilter] = useState('all')
      const [reload, setReload] = useState(0)

      // 这个项目用到的素材可能来自别的项目目录（副本、导入），一并列出。
      const pids = useMemo(() => {
        const set = new Set([project.id])
        const visit = (ref) => { if (ref?.pid) set.add(ref.pid) }
        project.characters.forEach((c) => { visit(c.portrait); c.portraits.forEach(visit) })
        project.episodes.forEach((e) => { e.renders.forEach(visit); visit(e.bgm) })
        Object.values(project.boards).flat().forEach((shot) => { visit(shot.image); shot.images.forEach(visit); visit(shot.video); visit(shot.audio) })
        return Array.from(set)
      }, [project])
      const inUse = useMemo(() => {
        const set = new Set()
        const visit = (ref) => { if (ref?.file) set.add(ref.file) }
        project.characters.forEach((c) => visit(c.portrait))
        project.episodes.forEach((e) => { visit(e.renders[0]); visit(e.bgm) })
        Object.values(project.boards).flat().forEach((shot) => { visit(shot.image); visit(shot.video); visit(shot.audio) })
        return set
      }, [project])
      const jobCount = studio.jobs.length

      useEffect(() => {
        let alive = true
        request(`assets?pids=${pids.join(',')}`).then((payload) => { if (alive) setAssets(payload.assets.map((item) => ({ ...item, ref: normalizeRef(item) })).filter((item) => item.ref)) }).catch((error) => { if (alive) { setAssets([]); toast('err', `读取素材失败：${error.message}`) } })
        return () => { alive = false }
      }, [pids.join(','), reload, jobCount])

      const list = (assets || []).filter((item) => filter === 'all' || item.kind === filter)
      const counts = (assets || []).reduce((map, item) => ({ ...map, [item.kind]: (map[item.kind] || 0) + 1 }), {})
      const bytes = (assets || []).reduce((sum, item) => sum + (item.bytes || 0), 0)
      const remove = async (item) => {
        if (inUse.has(item.file)) { toast('info', '这个素材正在被镜头或角色使用。先在分镜或角色页换掉它，再来删除。'); return }
        if (!await studio.ask('删除这个素材？', '文件会从本机素材目录里删除，无法恢复。', '删除素材', { danger: true })) return
        try {
          await request('media/delete', { pid: item.pid, file: item.file })
          studio.patch((draft) => {
            draft.characters.forEach((c) => { c.portraits = c.portraits.filter((ref) => ref.file !== item.file) })
            draft.episodes.forEach((e) => { e.renders = e.renders.filter((ref) => ref.file !== item.file) })
            Object.values(draft.boards).flat().forEach((shot) => { shot.images = shot.images.filter((ref) => ref.file !== item.file) })
          })
          setReload((n) => n + 1)
        } catch (error) {
          toast('err', `删除失败：${error.message}`)
        }
      }
      const open = (item) => {
        const visual = list.filter((entry) => entry.kind !== 'audio')
        if (item.kind === 'audio') { studio.setLightbox({ items: [{ asset: item.ref, title: item.prompt || '配音', note: item.provider }] }); return }
        studio.setLightbox({
          items: visual.map((entry) => ({ asset: entry.ref, title: entry.target?.kind === 'character' ? '定妆照' : KIND_NAME[entry.kind], note: [entry.source === 'sketch' ? '本地草图' : entry.source === 'upload' ? '上传' : entry.provider, entry.model].filter(Boolean).join(' / ') })),
          start: visual.indexOf(item),
        })
      }

      return h('div', { className: 'db-stack' },
        h('div', { className: 'db-toolbar' },
          h(Segment, { label: '素材类型', value: filter, onChange: setFilter, options: [['all', `全部 ${assets?.length ?? ''}`], ['image', `图片 ${counts.image || 0}`], ['video', `视频 ${counts.video || 0}`], ['audio', `配音 ${counts.audio || 0}`], ['render', `成片 ${counts.render || 0}`]] }),
          h('span', { className: 'db-grow' }),
          h('span', { className: 'db-muted' }, assets ? `占用 ${(bytes / 1024 / 1024).toFixed(1)} MB` : '读取中'),
          h(IconBtn, { icon: 'refresh', label: '刷新素材列表', className: 'ghost', onClick: () => setReload((n) => n + 1) })),
        assets && list.length === 0
          ? h(Empty, { icon: 'library', title: '这里还没有素材' }, '出图、配音、图生视频和合成的结果都会自动收进素材库，旧版本也在这里。')
          : h('div', { className: 'db-library' }, list.map((item) => h('figure', { key: `${item.pid}/${item.file}`, className: cx('db-asset', item.kind) },
            item.kind === 'audio'
              ? h('div', { className: 'db-asset-audio' }, h(AudioChip, { asset: item.ref }), h('p', null, item.prompt || '配音'))
              : h(Frame, { asset: item.kind === 'image' ? item.ref : null, video: item.kind !== 'image' ? item.ref : null, onOpen: () => open(item) }),
            h('figcaption', null,
              h('span', null, item.target?.kind === 'character' ? '定妆照' : KIND_NAME[item.kind], inUse.has(item.file) ? h(Tag, { tone: 'ok' }, '使用中') : null),
              h('small', null, item.source === 'sketch' ? '本地草图' : item.source === 'upload' ? '上传' : item.provider || '本机'),
              h('div', { className: 'db-asset-actions' },
                item.prompt && item.kind !== 'audio' ? h(IconBtn, { icon: 'copy', size: 'sm', className: 'ghost', label: '复制提示词', onClick: () => studio.copy(item.prompt, '提示词') }) : null,
                h(IconBtn, { icon: 'download', size: 'sm', className: 'ghost', label: '下载', onClick: () => downloadUrl(mediaUrl(item.ref), item.file) }),
                h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: '删除素材', onClick: () => remove(item) })))))))
    }
    //#endregion

    //#region 57-engine.js
    // 生成引擎：文本、出图、视频、配音、合成各用哪一家，以及各家的 API Key。

    function KeyRow({ entry, state, onSave }) {
      const [value, setValue] = useState('')
      const [saving, setSaving] = useState(false)
      const save = async (next) => {
        setSaving(true)
        await onSave(entry.id, next)
        setSaving(false)
        setValue('')
      }
      return h('div', { className: 'db-key', id: `db-key-${entry.id}` },
        h('div', { className: 'db-key-name' },
          h('strong', null, entry.name),
          entry.hint ? h('span', { className: 'db-muted' }, entry.hint) : null),
        h('input', {
          className: 'db-input', type: 'password', autoComplete: 'off', spellCheck: false, value,
          placeholder: state?.set ? `已保存 ${state.hint}，输入新的可替换` : '粘贴 API Key', 'aria-label': `${entry.name} API Key`,
          onChange: (e) => setValue(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter' && value.trim()) save(value) },
        }),
        h(Btn, { size: 'sm', kind: value.trim() ? 'primary' : undefined, disabled: !value.trim() || saving, busy: saving, onClick: () => save(value) }, '保存'),
        state?.set ? h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: `清除 ${entry.name} 的 Key`, onClick: () => save(null) }) : null,
        entry.url ? h('a', { className: 'db-link', href: entry.url, target: '_blank', rel: 'noreferrer noopener' }, '去获取') : h('span'))
    }

    /** 一种能力（出图 / 视频 / 配音 / 文本）的引擎选择。 */
    function VendorPicker({ section, title, intro, children }) {
      const { engine, saveEngine } = useStudio()
      const config = engine.settings[section]
      const vendors = engine.catalog[section]
      const vendor = vendors.find((item) => item.id === config.vendor) || vendors[0]
      const keyState = vendor.key ? engine.settings.keys[vendor.key] : null
      const needsKey = vendor.key && !keyState?.set && !vendor.keyOptional
      const listId = `db-models-${section}`
      const [model, setModel] = useState(config.model || '')
      const [baseUrl, setBaseUrl] = useState(config.baseUrl || '')
      useEffect(() => { setModel(config.model || ''); setBaseUrl(config.baseUrl || '') }, [config.vendor, config.model, config.baseUrl])

      return h('section', { className: 'db-card db-engine' },
        h('header', { className: 'db-section-head' }, h('h2', null, title), h('span', { className: 'db-muted' }, intro)),
        h('div', { className: 'db-vendors', role: 'radiogroup', 'aria-label': title }, vendors.map((item) => h('button', {
          key: item.id, type: 'button', role: 'radio', 'aria-checked': item.id === vendor.id, className: 'db-vendor',
          onClick: () => saveEngine({ [section]: { vendor: item.id, model: '', baseUrl: item.id === config.vendor ? config.baseUrl : '' } }),
        }, h('strong', null, item.name), item.key && !item.keyOptional && !engine.settings.keys[item.key]?.set ? h('small', null, '需要 Key') : item.key ? h('small', { className: 'ok' }, item.keyOptional && !engine.settings.keys[item.key]?.set ? '免 Key' : 'Key 已填') : h('small', { className: 'ok' }, '无需配置')))),
        vendor.note ? h('p', { className: 'db-note' }, vendor.note) : null,
        needsKey ? h('p', { className: 'db-warn' }, h(Icon, { name: 'key', size: 15 }), `还没有填写${engine.catalog.keys.find((key) => key.id === vendor.key)?.name || ''}的 API Key。`,
          h('button', { type: 'button', className: 'db-link', onClick: () => document.getElementById(`db-key-${vendor.key}`)?.querySelector('input')?.focus() }, '现在填写')) : null,
        vendor.models.length || vendor.custom ? h('div', { className: 'db-form-row' },
          vendor.custom ? h(Field, { label: '接口地址（Base URL）', hint: '到 /v1 为止' }, h('input', { className: 'db-input', value: baseUrl, placeholder: 'https://example.com/v1', onChange: (e) => setBaseUrl(e.target.value), onBlur: () => { if (baseUrl !== (config.baseUrl || '')) saveEngine({ [section]: { baseUrl: baseUrl.trim() } }) } })) : null,
          h(Field, { label: '模型', hint: vendor.custom ? '填写服务商给出的模型名称' : '可以改成控制台里的其他模型 ID' },
            h('input', { className: 'db-input', list: listId, value: model, placeholder: vendor.models[0] || '模型名称', onChange: (e) => setModel(e.target.value), onBlur: () => { if (model !== (config.model || '')) saveEngine({ [section]: { model: model.trim() } }) } }),
            h('datalist', { id: listId }, vendor.models.map((name) => h('option', { key: name, value: name }))))) : null,
        children ? children({ vendor, config, needsKey }) : null)
    }

    function EnginePage() {
      const studio = useStudio()
      const { engine, saveEngine, toast, model } = studio
      const [testing, setTesting] = useState('')
      const [sample, setSample] = useState(null)

      if (!engine) return h('div', { className: 'db-skel' })
      if (engine.error) {
        return h(Empty, { icon: 'warning', title: '读取引擎配置失败', action: h(Btn, { kind: 'primary', onClick: studio.reloadEngine }, '重新读取') }, engine.error)
      }
      const { settings, catalog, tools, voices } = engine
      const name = (section) => catalog[section].find((item) => item.id === settings[section].vendor)?.name || ''
      const saveKey = async (id, value) => {
        const view = await saveEngine({ keys: { [id]: value } })
        if (view) toast('ok', value === null ? 'Key 已清除。' : 'Key 已保存在本机。')
      }
      const test = async (capability) => {
        setTesting(capability)
        try {
          const payload = await request('settings/test', { capability })
          if (capability === 'image') { setSample(normalizeRef(payload.asset)); toast('ok', `出图成功，用时 ${(payload.ms / 1000).toFixed(1)} 秒。`) }
          if (capability === 'text') toast('ok', `文本模型可用（${payload.model?.model || ''}），用时 ${(payload.ms / 1000).toFixed(1)} 秒。`)
          if (capability === 'tts') { playingAudio?.pause(); playingAudio = new Audio(mediaUrl(payload.asset)); playingAudio.play().catch(() => {}) }
        } catch (error) {
          toast('err', `测试没有通过：${error.message}`)
        } finally {
          setTesting('')
        }
      }
      const textReady = Boolean(model)
      const line = [
        ['text', '写剧本', model ? (model.via === 'harness' ? `Harness：${model.model}` : `${model.provider}：${model.model}`) : '未连接', textReady],
        ['image', '出图', settings.image.vendor === 'none' ? '本地草图' : name('image'), settings.image.vendor === 'none' || catalog.image.find((i) => i.id === settings.image.vendor)?.keyOptional || Boolean(settings.keys[catalog.image.find((i) => i.id === settings.image.vendor)?.key]?.set) || settings.image.vendor === 'custom'],
        ['video', '动态', name('video'), settings.video.vendor === 'local' ? tools.motion : Boolean(settings.keys[catalog.video.find((i) => i.id === settings.video.vendor)?.key]?.set)],
        ['tts', '配音', name('tts'), settings.tts.vendor === 'system' ? tools.systemVoice : settings.tts.vendor === 'custom' || Boolean(settings.keys.siliconflow?.set)],
        ['render', '合成', tools.ffmpeg ? `ffmpeg ${tools.ffmpegVersion}` : '未找到 ffmpeg', tools.ffmpeg],
      ]

      return h('div', { className: 'db-stack db-engine-page' },
        h('ol', { className: 'db-line', 'aria-label': '当前产线' }, line.map(([id, label, value, ready]) => h('li', { key: id, className: ready ? 'ok' : 'off' },
          h('button', { type: 'button', onClick: () => document.getElementById(`db-engine-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
            h('span', null, label), h('strong', null, value), h('i', null, ready ? '就绪' : '待配置'))))),

        h('section', { className: 'db-card', id: 'db-engine-keys' },
          h('header', { className: 'db-section-head' }, h('h2', null, 'API Key'), h('span', { className: 'db-muted' }, '每家只填一次，出图、视频、配音共用')),
          h('div', { className: 'db-keys' }, catalog.keys.map((entry) => h(KeyRow, { key: entry.id, entry, state: settings.keys[entry.id], onSave: saveKey }))),
          h('p', { className: 'db-note' }, `Key 只保存在这台电脑上（${engine.dataDir}/settings.json，仅本人可读），页面拿不到明文，也不会写进项目备份。生成时由本机后端直接请求对应的服务商。`)),

        h('div', { id: 'db-engine-image' }, h(VendorPicker, { section: 'image', title: '出图', intro: '关键帧与定妆照' }, ({ vendor, config, needsKey }) => h(Fragment, null,
          vendor.refs ? h('label', { className: 'db-checkline' }, h('input', { type: 'checkbox', checked: config.useRefs !== false, onChange: (e) => saveEngine({ image: { useRefs: e.target.checked } }) }), '出图时附带出镜角色的定妆照作为参考图') : null,
          vendor.id !== 'none' ? h('div', { className: 'db-row' },
            h(Btn, { icon: 'bolt', disabled: needsKey || Boolean(testing), busy: testing === 'image', onClick: () => test('image') }, testing === 'image' ? '正在出一张测试图' : '出一张测试图'),
            h('span', { className: 'db-muted' }, '会真实调用一次接口')) : null,
          sample ? h('div', { className: 'db-sample' }, h(Frame, { asset: sample, onOpen: () => studio.setLightbox({ items: [{ asset: sample, title: '测试图' }] }) }), h('span', { className: 'db-muted' }, '测试图：清晨的地铁站台')) : null))),

        h('div', { id: 'db-engine-video' }, h(VendorPicker, { section: 'video', title: '动态', intro: '让关键帧动起来' })),

        h('div', { id: 'db-engine-tts' }, h(VendorPicker, { section: 'tts', title: '配音', intro: '把台词读出来' }, ({ vendor, config, needsKey }) => h(Fragment, null,
          vendor.id === 'system' && !tools.systemVoice ? h('p', { className: 'db-warn' }, h(Icon, { name: 'warning', size: 15 }), '这台电脑没有可用的系统语音（仅 macOS 支持），请改用云端配音。') : null,
          h('div', { className: 'db-form-row' },
            h(Field, { label: '默认音色' },
              vendor.id === 'system'
                ? h('select', { className: 'db-select', value: config.voice, onChange: (e) => saveEngine({ tts: { voice: e.target.value } }) }, h('option', { value: '' }, '系统默认'), voices.map((voice) => h('option', { key: voice.id, value: voice.id }, `${voice.id}（${voice.locale}）`)))
                : vendor.voices?.length
                  ? h('select', { className: 'db-select', value: config.voice, onChange: (e) => saveEngine({ tts: { voice: e.target.value } }) }, vendor.voices.map((voice) => h('option', { key: voice, value: voice }, voice)))
                  : h('input', { className: 'db-input', defaultValue: config.voice, placeholder: '音色名称', onBlur: (e) => saveEngine({ tts: { voice: e.target.value.trim() } }) })),
            vendor.id === 'system'
              ? h(Field, { label: `语速（每分钟 ${config.rate} 字）` }, h('input', { type: 'range', min: 140, max: 260, step: 5, value: config.rate, onChange: (e) => saveEngine({ tts: { rate: Number(e.target.value) } }) }))
              : h(Field, { label: `语速（${Number(config.speed || 1).toFixed(2)} 倍）` }, h('input', { type: 'range', min: 0.7, max: 1.5, step: 0.05, value: config.speed || 1, onChange: (e) => saveEngine({ tts: { speed: Number(e.target.value) } }) }))),
          h('div', { className: 'db-row' }, h(Btn, { icon: 'volume', disabled: needsKey || Boolean(testing), busy: testing === 'tts', onClick: () => test('tts') }, '试听'), h('span', { className: 'db-muted' }, '每个角色可以在角色页单独指定音色'))))),

        h('section', { className: 'db-card db-engine', id: 'db-engine-text' },
          h('header', { className: 'db-section-head' }, h('h2', null, '写剧本'), h('span', { className: 'db-muted' }, '大纲、角色、分集、分镜和发布文案')),
          engine.harness.available ? h('div', { className: 'db-vendors', role: 'radiogroup', 'aria-label': '文本模型来源' },
            h('button', { type: 'button', role: 'radio', 'aria-checked': settings.text.mode !== 'custom', className: 'db-vendor', onClick: () => saveEngine({ text: { mode: 'harness' } }) }, h('strong', null, '跟随 Harness'), h('small', { className: engine.harness.model ? 'ok' : '' }, engine.harness.model?.model || '还没有登录模型')),
            h('button', { type: 'button', role: 'radio', 'aria-checked': settings.text.mode === 'custom', className: 'db-vendor', onClick: () => saveEngine({ text: { mode: 'custom' } }) }, h('strong', null, '用自己的 Key'), h('small', null, 'DeepSeek / 智谱 / 硅基流动 / 自定义')))
            : h('p', { className: 'db-note' }, '现在是独立运行，没有 Harness 的模型可用，需要填自己的文本模型 Key。'),
          settings.text.mode === 'custom' || !engine.harness.available ? h(TextVendor) : null,
          h('div', { className: 'db-row' }, h(Btn, { icon: 'bolt', disabled: Boolean(testing), busy: testing === 'text', onClick: () => test('text') }, '测试连接'))),

        h('section', { className: 'db-card db-engine', id: 'db-engine-render' },
          h('header', { className: 'db-section-head' }, h('h2', null, '合成'), h('span', { className: 'db-muted' }, '在本机用 ffmpeg 拼接画面、字幕、配音和配乐')),
          tools.ffmpeg
            ? h('p', { className: 'db-done' }, h(Icon, { name: 'check', size: 16 }), `已找到 ffmpeg ${tools.ffmpegVersion}（${tools.ffmpegPath}），编码器 ${tools.encoder}${tools.subtitles ? '' : '；这个版本不带字幕滤镜，成片不会有字幕'}。`)
            : h('p', { className: 'db-warn' }, h(Icon, { name: 'warning', size: 15 }), '没有找到 ffmpeg。macOS 可以在终端运行 brew install ffmpeg，装好后回到这里。'),
          h(Field, { label: 'ffmpeg 路径', hint: '自动找不到时再填' }, h('input', { className: 'db-input', defaultValue: settings.render.ffmpegPath, placeholder: '/opt/homebrew/bin/ffmpeg', onBlur: (e) => { if (e.target.value.trim() !== settings.render.ffmpegPath) saveEngine({ render: { ffmpegPath: e.target.value.trim() } }) } })),
          h('p', { className: 'db-note' }, `项目、素材和成片保存在 ${engine.dataDir}`)))
    }

    function TextVendor() {
      const { engine, saveEngine } = useStudio()
      const config = engine.settings.text
      const vendors = engine.catalog.text
      const vendor = vendors.find((item) => item.id === config.vendor) || vendors[0]
      const [model, setModel] = useState(config.model || '')
      const [baseUrl, setBaseUrl] = useState(config.baseUrl || '')
      useEffect(() => { setModel(config.model || ''); setBaseUrl(config.baseUrl || '') }, [config.vendor, config.model, config.baseUrl])
      const missing = !engine.settings.keys[vendor.key]?.set
      return h(Fragment, null,
        h('div', { className: 'db-form-row' },
          h(Field, { label: '服务商' }, h('select', { className: 'db-select', value: vendor.id, onChange: (e) => saveEngine({ text: { vendor: e.target.value, model: '', baseUrl: '' } }) }, vendors.map((item) => h('option', { key: item.id, value: item.id }, item.name)))),
          h(Field, { label: '模型' },
            h('input', { className: 'db-input', list: 'db-models-text', value: model, placeholder: vendor.models[0] || '模型名称', onChange: (e) => setModel(e.target.value), onBlur: () => { if (model !== (config.model || '')) saveEngine({ text: { model: model.trim() } }) } }),
            h('datalist', { id: 'db-models-text' }, vendor.models.map((name) => h('option', { key: name, value: name }))))),
        vendor.custom ? h(Field, { label: '接口地址（Base URL）', hint: '到 /v1 为止' }, h('input', { className: 'db-input', value: baseUrl, placeholder: 'https://example.com/v1', onChange: (e) => setBaseUrl(e.target.value), onBlur: () => { if (baseUrl !== (config.baseUrl || '')) saveEngine({ text: { baseUrl: baseUrl.trim() } }) } })) : null,
        missing ? h('p', { className: 'db-warn' }, h(Icon, { name: 'key', size: 15 }), `还没有填写${engine.catalog.keys.find((key) => key.id === vendor.key)?.name || ''}的 API Key。`,
          h('button', { type: 'button', className: 'db-link', onClick: () => document.getElementById(`db-key-${vendor.key}`)?.querySelector('input')?.focus() }, '现在填写')) : null)
    }
    //#endregion

    //#region 90-app.js
    // 外壳：侧栏、顶栏、任务面板、弹窗，以及向 Harness 注册插件。

    const PAGES = [
      { id: 'overview', title: '总览', icon: 'home', hint: '这部剧做到哪一步了', group: 'flow' },
      { id: 'brief', title: '立项', icon: 'brief', hint: '一句话定下故事和画面风格', group: 'flow' },
      { id: 'cast', title: '角色', icon: 'cast', hint: '固定外貌、定妆照和音色，让人物始终是同一个人', group: 'flow' },
      { id: 'episodes', title: '分集', icon: 'episodes', hint: '每一集的钩子、冲突和卡点', group: 'flow' },
      { id: 'board', title: '分镜', icon: 'board', hint: '把一集拆成镜头，给每个镜头出图', group: 'flow' },
      { id: 'studio', title: '成片', icon: 'studio', hint: '试映、配音，合成可以发布的 MP4', group: 'flow' },
      { id: 'publish', title: '发布', icon: 'publish', hint: '选平台、写文案、导出发布包', group: 'flow' },
      { id: 'library', title: '素材库', icon: 'library', hint: '这个项目生成过的所有图片、视频、配音和成片', group: 'tool' },
      { id: 'engine', title: '生成引擎', icon: 'engine', hint: '选择出图、视频、配音用哪一家', group: 'tool' },
    ]

    const JOB_ICON = { image: 'image', video: 'film', tts: 'mic', render: 'studio' }

    function JobsButton() {
      const { jobs, cancelJobs, dismissJobs } = useStudio()
      const [open, setOpen] = useState(false)
      const box = useRef(null)
      const active = jobs.filter(isActive)
      const failed = jobs.filter((job) => job.status === 'error')
      useEffect(() => {
        if (!open) return undefined
        const close = (event) => { if (!box.current?.contains(event.target)) setOpen(false) }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
      }, [open])
      if (!jobs.length) return null
      const overall = active.length ? active.reduce((sum, job) => sum + (job.progress || 0), 0) / active.length : 1
      return h('span', { className: 'db-jobs', ref: box },
        h('button', { type: 'button', className: cx('db-jobs-btn', active.length && 'busy', failed.length && 'err'), onClick: () => setOpen(!open), 'aria-expanded': open, 'aria-label': `后台任务，${active.length} 个进行中` },
          active.length ? h(Ring, { value: overall, size: 22, stroke: 3 }) : h(Icon, { name: failed.length ? 'warning' : 'check', size: 16 }),
          active.length ? `${active.length} 个任务` : failed.length ? `${failed.length} 个失败` : '任务'),
        open ? h('div', { className: 'db-jobs-pop', role: 'dialog', 'aria-label': '后台任务' },
          h('header', null, h('strong', null, '后台任务'),
            active.length > 1 ? h(Btn, { kind: 'ghost', size: 'sm', onClick: () => cancelJobs(active.map((job) => job.id)) }, '全部取消') : null,
            failed.length ? h(Btn, { kind: 'ghost', size: 'sm', onClick: () => dismissJobs(failed.map((job) => job.id)) }, '清除失败记录') : null),
          h('ul', null, jobs.slice().reverse().map((job) => h('li', { key: job.id, className: job.status },
            h(Icon, { name: JOB_ICON[job.type] || 'sparkles', size: 16 }),
            h('div', null,
              h('strong', null, job.label || job.type),
              job.status === 'error' ? h('p', null, job.error) : h('span', { className: 'db-muted' }, job.status === 'queued' ? '排队中' : job.message),
              isActive(job) ? h('div', { className: 'db-bar' }, h('span', { style: { width: `${Math.round((job.progress || 0) * 100)}%` } })) : null),
            isActive(job)
              ? h(IconBtn, { icon: 'close', size: 'sm', className: 'ghost', label: '取消任务', onClick: () => cancelJobs([job.id]) })
              : h(IconBtn, { icon: 'close', size: 'sm', className: 'ghost', label: '清除记录', onClick: () => dismissJobs([job.id]) }))))) : null)
    }

    function Dialog() {
      const { dialog, answer } = useStudio()
      useEffect(() => {
        if (!dialog) return undefined
        const handler = (event) => {
          if (event.key === 'Escape') answer(false)
          if (event.key === 'Tab') {
            const controls = Array.from(document.querySelectorAll('.db-modal button'))
            const first = controls[0]
            const last = controls[controls.length - 1]
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
          }
        }
        const previous = document.activeElement
        const timer = setTimeout(() => document.querySelector('.db-modal .db-btn.primary, .db-modal .db-btn.danger')?.focus(), 0)
        document.addEventListener('keydown', handler)
        return () => { clearTimeout(timer); document.removeEventListener('keydown', handler); previous?.focus?.() }
      }, [dialog, answer])
      if (!dialog) return null
      return h('div', { className: 'db-modal-backdrop', onClick: (e) => { if (e.target === e.currentTarget) answer(false) } },
        h('section', { className: 'db-modal', role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'db-dialog-title', 'aria-describedby': 'db-dialog-text' },
          h('h2', { id: 'db-dialog-title' }, dialog.title),
          h('p', { id: 'db-dialog-text' }, dialog.text),
          h('div', { className: 'db-row end' },
            h(Btn, { onClick: () => answer(false) }, '取消'),
            dialog.alt ? h(Btn, { onClick: () => answer('alt') }, dialog.alt) : null,
            h(Btn, { kind: dialog.danger ? 'danger' : 'primary', onClick: () => answer(true) }, dialog.action))))
    }

    function Toasts() {
      const { toasts, dismissToast } = useStudio()
      return h('div', { className: 'db-toasts', 'aria-live': 'polite' }, toasts.map((item) => h('div', { key: item.id, className: cx('db-toast', item.tone), role: item.tone === 'err' ? 'alert' : 'status' },
        h(Icon, { name: item.tone === 'err' ? 'warning' : item.tone === 'ok' ? 'check' : 'sparkles', size: 16 }),
        h('span', null, item.text),
        h('button', { type: 'button', onClick: () => dismissToast(item.id), 'aria-label': '关闭提示' }, h(Icon, { name: 'close', size: 14 })))))
    }

    const BUSY_TEXT = { outline: '正在写剧本大纲', characters: '正在设计角色', episodes: '正在写分集', storyboard: '正在拆分镜', publish: '正在写发布文案' }

    function Shell() {
      const studio = useStudio()
      const { store, project, tab, navigate, busy, elapsed, theme, setTheme, model, jobs } = studio
      const [search, setSearch] = useState('')
      const importInput = useRef(null)
      const pageBox = useRef(null)
      // 文本生成期间整页不可操作（避免生成结果盖掉刚敲的字）。用 DOM 属性设置，兼容不同版本的 React。
      const locked = Boolean(busy) && tab !== 'engine'
      useEffect(() => { if (pageBox.current) pageBox.current.inert = locked })
      const page = PAGES.find((item) => item.id === tab) || PAGES[0]
      const projects = store.projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      const badge = (id) => {
        if (!project) return null
        if (id === 'cast') return project.characters.length || null
        if (id === 'episodes') return project.episodes.length || null
        if (id === 'board') { const shots = Object.values(project.boards).flat(); return shots.length ? `${shots.filter((shot) => shot.image).length}/${shots.length}` : null }
        if (id === 'studio') { const done = project.episodes.filter((e) => e.renders.length).length; return done ? `${done} 集` : null }
        return null
      }
      const renderPage = () => {
        if (tab === 'engine') return h(EnginePage)
        if (!project) {
          return h(Empty, { icon: 'board', title: '把下一个故事拍出来', action: h('div', { className: 'db-row' }, h(Btn, { kind: 'primary', icon: 'plus', onClick: studio.createProject }, '新建短剧'), h(Btn, { icon: 'upload', onClick: () => importInput.current?.click() }, '导入备份')) },
            '从一句话梗概开始，依次完成角色、分集、分镜、出图、配音，最后合成一条可以发布的竖屏视频。')
        }
        if (tab === 'brief') return h(BriefPage)
        if (tab === 'cast') return h(CastPage)
        if (tab === 'episodes') return h(EpisodesPage)
        if (tab === 'board') return h(BoardPage)
        if (tab === 'studio') return h(StudioPage)
        if (tab === 'publish') return h(PublishPage)
        if (tab === 'library') return h(LibraryPage)
        return h(OverviewPage)
      }
      const navButton = (item) => h('button', {
        key: item.id, type: 'button', 'aria-current': tab === item.id ? 'page' : undefined, onClick: () => navigate(item.id),
      }, h(Icon, { name: item.icon, size: 18 }), h('span', null, item.title), badge(item.id) ? h('small', null, badge(item.id)) : null)

      return h('div', { className: 'db-root', 'data-theme': theme },
        h('aside', { className: 'db-side', 'aria-label': '工作台导航' },
          h('div', { className: 'db-brand' }, h('span', { className: 'db-brand-mark', 'aria-hidden': true }, h('i'), h('i')), h('div', null, h('strong', null, '映序'), h('small', null, 'AI 短剧工作台'))),
          h('nav', { className: 'db-nav', 'aria-label': '制作流程' }, PAGES.filter((item) => item.group === 'flow').map(navButton)),
          h('nav', { className: 'db-nav tools', 'aria-label': '工具' }, PAGES.filter((item) => item.group === 'tool').map(navButton)),
          h('div', { className: 'db-side-projects' },
            h('div', { className: 'db-side-label' }, h('span', null, `项目 ${store.projects.length}`), h(IconBtn, { icon: 'plus', size: 'sm', className: 'ghost', label: '新建短剧', disabled: Boolean(busy), onClick: studio.createProject })),
            store.projects.length > 4 ? h('label', { className: 'db-search' }, h(Icon, { name: 'search', size: 14 }), h('input', { value: search, onChange: (e) => setSearch(e.target.value), placeholder: '搜索项目', 'aria-label': '搜索项目' })) : null,
            h('div', { className: 'db-project-list' }, projects.map((item) => {
              const poster = posterOf(item)
              return h('button', { key: item.id, type: 'button', className: 'db-project', 'aria-current': item.id === store.activeId ? 'true' : undefined, disabled: Boolean(busy), title: item.name, onClick: () => { studio.switchProject(item.id); if (tab === 'engine') navigate('overview') } },
                poster ? h('img', { src: mediaUrl(poster), alt: '', loading: 'lazy' }) : h('i', null, item.name.slice(0, 1)),
                h('span', null, item.name))
            }))),
          h('button', { type: 'button', className: 'db-model', onClick: () => navigate('engine'), title: '打开生成引擎' },
            h('span', { className: cx('db-dot', busy || jobs.some(isActive) ? 'part' : model ? 'ok' : '') }),
            h('span', null, model ? model.model : '文本模型未连接'),
            h(Icon, { name: 'engine', size: 15 }))),

        h('div', { className: 'db-main' },
          h('header', { className: 'db-top' },
            h('div', { className: 'db-top-title' }, h('h1', null, page.title), h('p', null, project && tab !== 'engine' ? project.name : page.hint)),
            h('span', { className: 'db-grow' }),
            h(JobsButton),
            h('span', { className: cx('db-save', studio.saveError && 'err'), role: 'status' }, h(Icon, { name: studio.saveError ? 'warning' : studio.saving ? 'clock' : 'check', size: 14 }), studio.saveError ? '未保存' : studio.saving ? '保存中' : '已保存'),
            studio.saveError ? h(Btn, { size: 'sm', onClick: studio.retry }, '重试') : null,
            studio.undoStore ? h(IconBtn, { icon: 'undo', className: 'ghost', label: '撤销上次操作', disabled: Boolean(busy), onClick: studio.undo }) : null,
            h(Menu, {
              button: ({ toggle }) => h(IconBtn, { icon: 'more', className: 'ghost', label: '项目菜单', onClick: toggle }),
              items: [
                ...store.projects.filter((item) => item.id !== store.activeId).slice(0, 6).map((item) => ({ label: `切换到「${item.name.slice(0, 14)}」`, icon: 'film', disabled: Boolean(busy), onClick: () => { studio.switchProject(item.id); if (tab === 'engine') navigate('overview') } })),
                { label: '新建短剧', icon: 'plus', disabled: Boolean(busy), onClick: studio.createProject },
                { label: '导入备份', icon: 'upload', disabled: Boolean(busy), onClick: () => importInput.current?.click() },
                project ? { label: '导出备份', icon: 'download', onClick: studio.backupProject } : null,
                project ? { label: '创建副本', icon: 'copy', onClick: studio.duplicateProject } : null,
                project ? { label: '删除项目', icon: 'trash', danger: true, disabled: Boolean(busy), onClick: studio.deleteProject } : null,
              ],
            }),
            h(IconBtn, { icon: theme === 'light' ? 'moon' : 'sun', className: 'ghost', label: theme === 'light' ? '切换深色外观' : '切换浅色外观', onClick: () => setTheme(theme === 'light' ? 'dark' : 'light') })),
          h('input', { type: 'file', accept: '.json,application/json', ref: importInput, hidden: true, onChange: (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) studio.importBackup(file) } }),
          studio.engine?.error ? h('div', { className: 'db-busy warn', role: 'alert' }, h(Icon, { name: 'warning', size: 16 }), h('span', null, `出图、配音和合成暂时不可用：${studio.engine.error}`), h(Btn, { size: 'sm', kind: 'ghost', onClick: studio.reloadEngine }, '重试')) : null,
          busy ? h('div', { className: 'db-busy', role: 'status' }, h(Spinner), h('span', null, `${BUSY_TEXT[busy] || 'AI 正在创作'}，已等待 ${elapsed} 秒。通常需要 20~40 秒，完成后自动填入。`), h(Btn, { size: 'sm', kind: 'ghost', onClick: studio.cancelGenerate }, '取消')) : null,
          h('main', { className: cx('db-scroll', tab === 'board' && project && 'fill') },
            h('div', { className: cx('db-page', `page-${tab}`, locked && 'locked'), ref: pageBox, key: `${project?.id || 'none'}-${tab}` }, renderPage()))),

        h(Dialog),
        h(Toasts),
        studio.lightbox ? h(Lightbox, { items: studio.lightbox.items, start: studio.lightbox.start || 0, onClose: () => studio.setLightbox(null) }) : null)
    }

    function DramaBoardPage() {
      const studio = useStudioState()
      if (!studio.loaded) {
        return h('div', { className: 'db-root', 'data-theme': studio.theme }, h('div', { className: 'db-boot' },
          studio.loadError
            ? h(Empty, { icon: 'warning', title: '暂时无法读取项目', action: h(Btn, { kind: 'primary', onClick: () => window.location.reload() }, '重新读取') }, `${studio.loadError}。为避免覆盖还没读到的项目，现在不能编辑。`)
            : h(Fragment, null, h('div', { className: 'db-skel' }), h('div', { className: 'db-skel tall' }))))
      }
      return h(StudioContext.Provider, { value: studio }, h(Shell))
    }

    function DramaIcon({ size, active }) {
      return h(Icon, { name: 'studio', size: Number(size) || 20, style: { opacity: active ? 1 : 0.82, color: active ? '#0a7cff' : 'currentColor' } })
    }

    function ensureStyle() {
      if (typeof document === 'undefined') return
      document.querySelectorAll('style[data-plugin="dsh-drama-board"]').forEach((tag) => tag.remove())
      const tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-drama-board'
      tag.dataset.version = VERSION
      tag.textContent = CSS
      document.head.appendChild(tag)
    }

    const LOCALE = { zh: { title: 'AI短剧工作台' }, en: { title: 'AI drama studio' } }

    const plugin = {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ensureStyle()
        let translate = (key) => LOCALE.zh[key] || key
        try {
          ctx.effect(() => ctx.locale.register('drama-board', LOCALE), 'drama-board: locale')
          const bound = ctx.locale.bind('drama-board')
          translate = (key) => {
            try {
              const value = bound(key)
              if (typeof value === 'string' && value && value !== key) return value
            } catch { /* 退回内置文案 */ }
            return LOCALE.zh[key] || key
          }
        } catch { /* 没有 locale 服务时用内置中文 */ }

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: 'drama-board', order: 20, label: () => translate('title'),
        }, DramaIcon))

        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'drama-board' }, DramaBoardPage))
      },
    }
    //#endregion

    return plugin
  },
})

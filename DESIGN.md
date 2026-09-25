# Forward Pass: design notes

## Concept

The site is one model running inference, and the output is Uttam. Scrolling moves data through the
network: every section is a **layer** (`LAYER 03 / 07 · ATTENTION`), projects are **models** with
cards, and the UI speaks the language of the work (tokens, epochs, checkpoints, attention weights)
in mono micro-labels. It stays quiet elsewhere: an editorial serif for big moments, a grotesk for
reading, and one electric accent.

| Layer | Section | Signature moment | Why it's him |
|---|---|---|---|
| 01 INPUT | Hero | Live neural network; the name streams in token by token | The pointer is the input signal and the output is *him*: "I build AI that ships." |
| 02 EMBEDDING | About | Key-facts table + 9 capabilities as `d_00…d_08` | Role, what he ships and the two companies, readable in 5 seconds |
| 03 ATTENTION | Work | Model cards flip into a streamed inference readout; filters re-sort like a dataset | Each project is a shipped model with a stack, a status and one real metric |
| 04 LATENT SPACE | Skills | 3D embedding space (R3F): kNN lines, cluster isolation | Skills relate to each other the way embeddings do |
| 05 TRAINING | Experience | Training log: EPOCHs, CHECKPOINTs, a scroll-drawn loss curve | A career as a run that keeps converging |
| 06 EVALUATION | FAQ | Held-out questions | The eval set |
| 07 OUTPUT | Contact | `POST /collaborate` request builder, `200 OK` | He builds APIs, so the form is one |
| Global | Header | Temperature dial as the theme control (0.0 paper → 1.0 dark and expressive) | A real LLM parameter reused as UI |
| Global | Everywhere | Attention cursor with live softmax weights; Ctrl/⌘K "Ask my portfolio"; "overfit" easter egg | The interface itself behaves like a model |

## Structure

```
src/
  design/tokens.ts          palette, category colors, fonts, easing, durations, layers, z-index
  data/                     all copy and facts: edit these, not components
    profile.ts              name, role, tagline, services, FAQ, links, contact endpoint, CV
    projects.ts             every project (a "model"), with `category`, `metric`, `status`, `role`
    skills.ts               embedding-space clusters
    experience.ts           training-log epochs and checkpoints
    commandBar.ts           Q&A pairs + keyword matcher for "Ask my portfolio"
  hooks/                    useCursor, useReducedMotion, useTemperature, useDeviceTier, useInView, useEasterEgg
  lib/                      color.ts (WCAG contrast solver), scroll.ts (Lenis + GSAP, lazy)
  components/
    signature/              one file per signature moment (+ lazy chunks: networkRenderer, EmbeddingScene, CommandBar, AttentionCursor)
    ui/                     Layer, DataStreamWipe, TokenStream, Ticker, Magnetic, Todo
    sections/               Chrome (header, layer HUD, footer), Sections, Work
  entry-server.tsx          build-time prerender entry
scripts/prerender.mjs       injects the prerendered HTML into dist/index.html
public/fonts/               self-hosted latin woff2 subsets (SIL OFL)
```

Packages (already in package.json): `react`, `react-dom`, `framer-motion`, `gsap`, `lenis`,
`three`, `@react-three/fiber`, `@react-three/drei`; dev: `typescript`, `vite`, `@vitejs/plugin-react`,
`@types/*`. No new installs were needed. Styling uses CSS Modules plus CSS custom properties
(Tailwind was optional in the brief and is not used).

`npm run build` = client build → SSR build → prerender. `npm run dev` renders client-side only.

## Checklist

**Reduced motion** (`prefers-reduced-motion: reduce`)
- [x] Hero network draws one static, fully assembled frame; name, tagline and outputs show at full opacity at once
- [x] No Lenis smooth scroll, no GSAP reveals, no data-stream wipes; the loss curve is shown fully drawn
- [x] Model cards swap faces without the 3D flip; readouts and command-bar answers appear whole
- [x] Embedding space stops drifting; the attention cursor is off (native cursor)
- [x] Easter egg shows only the `model converged.` toast; dial-driven theme flips without the wipe
- [x] Global CSS clamps all remaining animation/transition durations to 1ms

**Mobile**
- [x] Hero network reacts to scroll position and device tilt; it owns the top half on phones
- [x] Attention cursor and magnetic effects run on fine pointers only
- [x] Command bar opens from a floating `>_ Ask` button and renders as a bottom sheet
- [x] Card readouts open with a tap ("Run inference"); skills are tappable chips
- [x] No horizontal overflow at 390px (verified: `scrollWidth === clientWidth`)

**Accessibility**
- [x] Temperature dial is `role="slider"` with arrow/Page/Home/End keys and a spoken value
- [x] Contrast solved at runtime for every temperature: worst case over t = 0.00…1.00 is body 10.6:1, muted 4.7:1, accent 4.8:1, on-accent 5.0:1; category marks ≥ 4.2:1
- [x] Command bar is a native modal `<dialog>` (focus trap, Esc, inert page), fully keyboard-operable, answers in a polite live region
- [x] Visible 2px focus rings; skip links ("Skip to work", "Skip to content"); `header`/`nav`/`main`/`footer` landmarks; every layer is a labelled `section`
- [x] Canvas/3D have `role="img"` + descriptive labels; the skill list and kNN readout are the text alternative; streamed text is always in the DOM for screen readers
- [x] Lighthouse accessibility: 100

**Performance** (Lighthouse 12, mobile, local `vite preview`, headless Edge)
- [x] Initial JS: one 108 KB gzip chunk + 8 KB CSS. Three.js/R3F (251 KB gz), GSAP, Lenis, Framer features, the command bar, the cursor and the hero renderer are all dynamic imports
- [x] HTML is prerendered, and each layer hydrates in its own Suspense boundary; off-screen layers use `content-visibility: auto`
- [x] Hero canvas and 3D scene start after first paint, pause off-screen and in hidden tabs, and cap at 60fps (30fps when `hardwareConcurrency ≤ 4` or `deviceMemory ≤ 2`)
- [x] Fonts: self-hosted latin woff2 subsets, `font-display: swap`
- [x] CLS 0.00–0.015 (target < 0.05)
- [~] Default (simulated) throttling: Performance 91–96, SEO/A11y/Best practices 100, but LCP 2.1–3.0s. The simulator replays the localhost trace, where first paint happens after all JS and fonts; re-measure on the real host
- [~] Real (devtools) throttling: FCP = LCP = 1.8s ✓, but Performance 84–85 because TBT is ~450ms (React hydration + canvas on 4× CPU) and Speed Index is 3.4–4.7s (the hero never stops animating)
- n/a No raster images exist yet; if you add screenshots, ship AVIF/WebP with `srcset`

**Content rules**
- [x] Medical-imaging, MRI, brain-segmentation, radiology, regulatory and clearance references removed from copy, meta, JSON-LD, alt/ARIA text, comments and assets. Search over `src/ public/ scripts/ index.html` and the built `dist/` returns **zero** matches (only false positives excluded: `.slice()`, "JetBrains Mono", npm's `"type": "consulting"` in the lockfile, and "customer segmentation", the marketing term in the RFM project and its repo URL)
- [x] No employer product named; no invented metrics, clients or awards. Every gap is a `TODO` in `src/data/*`, shown as an amber chip in `npm run dev` and hidden in production

## Sources for filled content
Links, employer (IBM) and the open-source projects come from the public GitHub profile
(github.com/Uttampatel1). Every metric on those cards is the key result in that repo's README;
most of them come from synthetic data, and the card label says so.

## Open TODOs (only you can fill these)
`profile.cvHref` (CV PDF in `public/`), `profile.yearsExperience`, `contactEndpoint` (until then
the form opens a pre-filled email and says so), college + years, years for each epoch, real
milestones for the IBM epoch, a role for each project, and status/metric for n8n + Gemini,
CliniqEase, the Web3 project and Hunexture.

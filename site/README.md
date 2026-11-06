# Handoff Bench – website prototype (v2)

Static site. Open `index.html` in a browser, or publish the folder with GitHub Pages.

Pages follow the story in this order (the header nav and the Previous/Next buttons use it):

| # | Page | File | What it does |
|---|---|---|---|
| 1 | Home | `index.html` | Project overview, five-step pipeline, two key results (computed from the data), the three handoff levels |
| 2 | Methodology | `methodology.html` | Why the project, stakeholders, what we measure, domains, scenarios, conditions, scoring, references, BibTeX |
| 3 | Benchmark | `benchmark.html` | 5 × 3 coverage matrix, search, step-by-step case viewer, JSON/CSV download |
| 4 | Results | `results.html` | Headline tiles, breakdown tabs (Domain / Age / Guardrail / Model), expandable rows, confusion matrix |
| 5 | Analysis | `analysis.html` | What the results suggest (per research question), limitations, how to improve |

`compare.html` (arena-style pairs) is no longer in the navigation. The file is kept in case you want it back; add it to `nav` in `assets/common.js`, or delete it.

Files live in `assets/` (`style.css`, `common.js`, `data.js`) and `data/` (`benchmark.json`, `benchmark.csv`).

## Data
All content lives in `assets/data.js`.
- `cases` – the 45 prompts (illustrative drafts).
- `run(id, model, guard)` – returns the model output. **Currently mock values**, generated deterministically
  plus a few hand-written responses in `overrides`. Replace it with a lookup into your real results.
- `pairs` – which cases appear on the Compare page.
- `data/benchmark.json` and `data/benchmark.csv` are the download files; regenerate them from your real data.

Fill in every `[bracketed placeholder]` (authors, model versions, license, canary string, papers) before publishing.
Never put API keys in these files: the site should only show precomputed results.

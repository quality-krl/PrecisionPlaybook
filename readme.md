# PrecisionPlaybook

A single-page, bilingual (HE/EN) micro-site that frames QA through a training mindset: process, measurement, and repeatable protocols. It includes a 4×4 bug-report generator that outputs a clean, copy-ready report you can paste into Jira, Notion, Slack, or an email.

## What’s inside

- Bilingual UI (Hebrew / English) with RTL ↔ LTR switching
- Sticky top bar with language toggle and quick “Links” jump
- Hero media: training video + 3 photo tiles
- “Creed” section that connects discipline in training to discipline in QA
- 4×4 Protocol generator:
  - Observe (facts only)
  - Reproduce (minimal steps)
  - Isolate (remove variables)
  - Guard (reduce future risk)
- Copy to clipboard for the generated output
- Mobile-first layout with responsive desktop breakpoints
- Reduced-motion friendly behavior

## How to run

1. Clone the repo
2. Open `index.html` (or run a simple local server)

Example with VS Code:
- Install “Live Server”
- Right-click `index.html` → **Open with Live Server**

## Project structure

- `index.html` — the page
- `styles.css` — styling (responsive + RTL/LTR)
- `app.js` — language switching, protocol generator, copy action, video behavior
- `media/`
  - `training-video.mp4`
  - `p1.jpg`, `p2.jpg`, `p3.jpg`
- `favicon.svg`

## Notes

- The protocol output is designed to be readable in both languages and stable across mixed RTL/LTR content.
- Language preference is saved locally in the browser.

## Links

- GitHub: https://github.com/quality-krl/PrecisionPlaybook  
- LinkedIn: https://www.linkedin.com/in/kirill-kovalevski-b6a258257  
- Email: kirill.kovalevski@mail.huji.ac.il

## License

MIT License

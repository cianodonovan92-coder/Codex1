# XR Decision Lab

XR Decision Lab is a premium browser-based prototype for immersive cognitive decision training in elite sport environments. It simulates pressure moments, captures athlete decision behavior, and presents coach-ready analytics.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Three Fiber + drei
- Framer Motion
- Recharts
- Local mock data only (no backend)

## Routes

- `/` — Landing page with product positioning and capability highlights
- `/demo` — Demo setup (sport, role, difficulty, scenario cards)
- `/simulation` — First-person-style scenario simulation with timer and decision outcomes
- `/analytics` — Coach dashboard with trends, scores, and recommendations
- `/replay` — Explainable review of chosen vs elite decision

## Local Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## How prototype logic works

- Athlete choices and setup are stored in client-side React context (`SessionProvider`).
- Decision score combines:
  - action expected value and success profile,
  - decision speed,
  - hesitation penalty,
  - difficulty weighting.
- Tailored coach feedback is generated from the selected action and decision speed.

## Future expansion ideas

1. **Voice AI coach**
   - Add real-time spoken prompts and post-rep debrief narration.
2. **Adaptive scenario engine**
   - Sequence drills based on prior weaknesses (e.g., hesitation vs pressure).
3. **WebXR headset support**
   - Move from browser camera controls to headset tracking and controller gestures.
4. **Multi-athlete cohort analytics**
   - Compare players by role, age-band, and tactical system.

# Aai

Aai is a web app that takes the small, everyday decisions off your plate.

You tell it a bit about yourself once — your goals, what you want to stop having
to think about, and what stage of life you're in — and it builds you a simple
daily plan: what to do, when, and why. Each day you just confirm or skip each
item instead of deciding everything from scratch. At the end of the day it
shows you how many decisions it handled for you, so you can see the time and
energy you got back.

It's a front-end-only prototype: everything is generated on the fly from your
answers and saved in your browser (no account, no server, no data leaves your
machine).

## How it works

1. **Setup** — answer three quick questions and pick a visual mode (Focused,
   Energized, or Grounded).
2. **Today** — see today's plan, laid out by time, with a reason for each
   item. Tap "Do it" or "Skip" on each one.
3. **Your Rhythm** — a summary of what Aai handled, what you confirmed, and
   how many decisions you freed up today.

## Running it locally

You'll need [Node.js](https://nodejs.org/) (v18 or later) installed.

```bash
# install dependencies
npm install

# start the app
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`) in your browser.

Other useful commands:

```bash
npm run build    # build a production version
npm run preview  # preview the production build locally
```

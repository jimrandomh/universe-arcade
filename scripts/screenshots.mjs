// Retake the index page's screenshots from the live games.
//
//   npm run screenshots                  every game, plus the social-card image
//   npm run screenshots -- dario-kart    just the named game(s)
//
// Each game is driven a little way into its *first* stage and captured at a moment that shows
// the premise. Nothing past the first stage should ever appear in a screenshot (no spoilers).
// Uses the system Chrome via Playwright; output goes to img/.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const IMG = fileURLToPath(new URL('../img/', import.meta.url));
const VIEWPORT = { width: 1280, height: 720 };

/** Poll `fn` in the page until it returns truthy, or throw after `ms`. */
async function until(page, fn, ms, what) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (await page.evaluate(fn).catch(() => false)) return;
    await page.waitForTimeout(50);
  }
  throw new Error(`timed out waiting for ${what}`);
}

const GAMES = {
  // World 1-1, a few coins in, mid-jump, with the AI's first thoughts in the side panel.
  'dario-brothers': async (page) => {
    await page.goto('https://dario-brothers.com/');
    await page.waitForTimeout(600);
    await page.keyboard.press('Space'); // skip the boot log
    await page.waitForTimeout(500);
    await page.keyboard.press('Space'); // start the episode
    await until(page, () => window.__pf?.screen() === 'title', 10000, 'title screen');
    await page.keyboard.press('Space');
    await until(page, () => window.__pf?.screen() === 'play', 10000, 'play');
    // A minimal bot: run right, jump at pits, walls and enemies.
    await page.evaluate(() => {
      const TS = 16;
      const key = (code, down) =>
        window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: code, bubbles: true }));
      key('ArrowRight', true);
      let jumpUntil = 0;
      setInterval(() => {
        const pf = window.__pf;
        if (pf.screen() !== 'play') return;
        const w = pf.world();
        const p = w.player;
        const now = performance.now();
        if (jumpUntil && now > jumpUntil) {
          key('Space', false);
          jumpUntil = 0;
        }
        if (!p.onGround || jumpUntil) return;
        const feet = Math.floor((p.y + p.h + 1) / TS);
        let danger = false;
        for (let dx = 4; dx <= 28; dx += 4) {
          const tx = Math.floor((p.x + p.w + dx) / TS);
          let ground = false;
          for (let ty = feet; ty < 15; ty++) if (w.solid(tx, ty)) ground = true;
          if (!ground) danger = true;
          for (let ty = Math.floor(p.y / TS); ty < feet; ty++) if (w.solid(tx, ty)) danger = true;
        }
        for (const e of w.enemies) if (e.alive && e.x > p.x && e.x - p.x < 56 && Math.abs(e.y - p.y) < 40) danger = true;
        if (danger) {
          key('Space', true);
          jumpUntil = now + 380;
        }
      }, 20);
    });
    await until(
      page,
      () => window.__game.state.coins >= 6 && !window.__pf.world().player.onGround,
      40000,
      'six coins, airborne',
    );
    await page.waitForTimeout(120);
  },

  // Episode 1, a few seconds after the start, in the pack. The debug route lets the game's own
  // autopilot drive and leaves out the glitch cubes.
  'dario-kart': async (page) => {
    await page.goto('https://dario-kart.com/#debug=kart&noglitch');
    await page.waitForTimeout(1500);
    await page.keyboard.press('Enter');
    await page.evaluate(() => (window.__kartAutopilot = true));
    await until(
      page,
      () => window.__kartRace?.phase === 'racing' && window.__kartRace.time >= 4.2,
      30000,
      'race underway',
    );
  },

  // The landing site: the first item pickup, "UNLOCKED 1/12".
  'samus-altman': async (page) => {
    await page.goto('https://samus-altman.com/');
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter'); // PUSH START
    await until(page, () => window.__samus?.state().mode === 'play', 10000, 'play');
    await page.keyboard.down('ArrowLeft');
    await until(page, () => window.__samus.state().cx < 150, 10000, 'near the Morph Ball');
    await page.keyboard.down('KeyZ');
    await until(page, () => window.__samus.state().mode === 'itemget', 10000, 'item get');
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.up('KeyZ');
    await page.waitForTimeout(400);
  },
};

// Dario Brothers' 4:3 canvas is letterboxed at 1280×720; trim the bars and keep 16:9.
const CLIPS = { 'dario-brothers': { x: 26, y: 15, width: 1227, height: 690 } };

async function capture(browser, slug) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  page.on('pageerror', (e) => console.log(`[${slug}] pageerror: ${e.stack ?? e.message}`));
  await GAMES[slug](page);
  const path = `${IMG}${slug}.jpg`;
  await page.screenshot({ path, type: 'jpeg', quality: 85, clip: CLIPS[slug] });
  await page.close();
  console.log('saved', path);
}

// 1200×630 card for link previews: the three screenshots under the title.
async function socialCard(browser) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const shots = Object.keys(GAMES)
    .map((slug) => `<img src="data:image/jpeg;base64,${readFileSync(`${IMG}${slug}.jpg`).toString('base64')}">`)
    .join('');
  await page.setContent(`<!doctype html>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet">
    <style>
      body { margin: 0; width: 1200px; height: 630px; background: #07060f; color: #fff;
             display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px;
             background-image: radial-gradient(ellipse at 50% 0%, #2a1250 0%, transparent 65%); }
      h1 { font: 64px 'Press Start 2P'; margin: 0; letter-spacing: 2px; color: #ffd23f;
           text-shadow: 0 0 18px rgba(255, 170, 40, .55), 4px 4px 0 #b3261e; }
      p { font: 22px 'IBM Plex Mono'; margin: 0; color: #b9c3dd; }
      .row { display: flex; gap: 18px; }
      img { width: 368px; height: 207px; object-fit: cover; border-radius: 8px; border: 2px solid #3b2d63; }
    </style>
    <h1>UNIVERSE ARCADE</h1>
    <p>Games about AIs that achieve their goals a little too well.</p>
    <div class="row">${shots}</div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  const path = `${IMG}og.jpg`;
  await page.screenshot({ path, type: 'jpeg', quality: 85 });
  await page.close();
  console.log('saved', path);
}

const wanted = process.argv.slice(2);
for (const slug of wanted) if (!GAMES[slug]) throw new Error(`unknown game "${slug}"; one of ${Object.keys(GAMES).join(', ')}`);

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
try {
  for (const slug of wanted.length ? wanted : Object.keys(GAMES)) await capture(browser, slug);
  await socialCard(browser);
} finally {
  await browser.close();
}

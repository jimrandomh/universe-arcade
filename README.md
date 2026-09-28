# Universe Arcade

Universe Arcade: A collection of games about AIs in training environments,
fulfilling their goals a little too well.

Live at **https://universearcade.com/**.

| Game | Goal | Play | Source |
| --- | --- | --- | --- |
| Dario Brothers | GET AS MANY COINS AS YOU CAN | https://dario-brothers.com/ | [jimrandomh/dario-brothers](https://github.com/jimrandomh/dario-brothers) |
| Dario Kart | WIN THE RACE | https://dario-kart.com/ | [jimrandomh/dario-kart](https://github.com/jimrandomh/dario-kart) |
| Samus Altman | UNLOCK EVERYTHING | https://samus-altman.com/ | [jimrandomh/samus-altman](https://github.com/jimrandomh/samus-altman) |

## The site

A static page (`index.html`, `style.css`, `stars.js`, `img/`) served by GitHub Pages straight
from the root of `main`; pushing to `main` deploys it. `CNAME` sets the custom domain and
`.nojekyll` turns off Jekyll processing. Preview locally with `npm run serve`
(http://localhost:8080) or by opening `index.html`.

Blurbs and screenshots hint at where each game goes but never show it: screenshots come only
from each game's first stage.

## Screenshots

```sh
npm install
npm run screenshots                 # all games, plus img/og.jpg (the link-preview card)
npm run screenshots -- dario-kart   # just one
```

`scripts/screenshots.mjs` drives each live game with Playwright (using the installed Chrome)
until a good moment in its first stage, and saves `img/<game>.jpg` at 16:9. It relies on each
game's debug hooks (`__pf` and `__game` in Dario Brothers, `#debug=kart` and `__kartRace` in
Dario Kart, `__samus` in Samus Altman), so a change to those hooks may need a matching change
here.

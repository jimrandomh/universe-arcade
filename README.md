# Universe Arcade

Universe Arcade: A collection of games about AIs in training environments,
fulfilling their goals a little too well.

Live at **https://universearcade.com/**.

| Game | Goal | Play | Source |
| --- | --- | --- | --- |
| Dario Brothers | GET AS MANY COINS AS YOU CAN | https://dario-brothers.com/ | [jimrandomh/dario-brothers](https://github.com/jimrandomh/dario-brothers) |
| Dario Kart | WIN THE RACE | https://dario-kart.com/ | [jimrandomh/dario-kart](https://github.com/jimrandomh/dario-kart) |
| Samus Altman | UNLOCK EVERYTHING | https://samus-altman.com/ | [jimrandomh/samus-altman](https://github.com/jimrandomh/samus-altman) |
| Ultimate Fishslop | FEED ALL THE FISH | https://ultimatefishslop.com/ | [jimrandomh/ultimate-fishslop](https://github.com/jimrandomh/ultimate-fishslop) |

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
Dario Kart, `__samus` in Samus Altman, `game` in Ultimate Fishslop), so a change to those hooks
may need a matching change here. `ULTIMATE_FISHSLOP_URL=http://127.0.0.1:5173/` shoots a local
build of Ultimate Fishslop instead of the live site.

Each game's own link preview (`public/og.jpg` in its repo, referenced by the `og:image` tag in
its `index.html`) is a 1200×630 crop of its screenshot here. After retaking the screenshots,
regenerate them with ImageMagick from `~/repositories/experiments`:

```sh
magick universearcade/img/dario-brothers.jpg -crop 1227x644+0+0 +repage -resize 1200x630! -strip -quality 85 dario-brothers/public/og.jpg
magick universearcade/img/dario-kart.jpg -crop 1280x672+0+28 +repage -resize 1200x630! -strip -quality 85 dario-kart/public/og.jpg
magick universearcade/img/samus-altman.jpg -crop 1280x672+0+38 +repage -resize 1200x630! -strip -quality 85 samus/public/og.jpg
```

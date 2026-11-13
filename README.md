# Charisma30 — sito web

Sito statico di presentazione dell'app Charisma30, in inglese, italiano e francese.
Nessun framework e nessuna dipendenza: HTML, CSS e un piccolo script.

## Struttura

```
src/i18n/en.json, it.json, fr.json   tutti i testi, una lingua per file
build.mjs                            genera le pagine in site/ (e contiene CONFIG)
site/assets/styles.css               stile (colori del brand, tema chiaro e scuro)
site/assets/main.js                  lingua del browser, menu lingue, comparsa al scroll
site/assets/img/screens/             screenshot ricavati dall'app (utente di esempio, giorno 6)
.github/workflows/pages.yml          pubblicazione automatica su GitHub Pages
```

Pagine generate: `/`, `/privacy/`, `/terms/` in inglese; le stesse sotto `/it/` e `/fr/`.

## Modificare

1. Cambia i testi in `src/i18n/*.json` (o la struttura in `build.mjs`).
2. `node build.mjs`
3. Anteprima: `cd site && python3 -m http.server 8130`, poi apri http://127.0.0.1:8130

Le pagine in `site/*.html` sono generate: non modificarle a mano.

## Quando l'app esce sugli store

In `build.mjs`, blocco `CONFIG`:

- `appStoreUrl` e `playStoreUrl`: incolla i link; i pulsanti passano da "Coming soon" a link veri.
- `siteUrl`: l'indirizzo definitivo del sito (es. `https://<utente>.github.io/charisma30`),
  per canonical, hreflang e anteprima social.

Poi `node build.mjs` e pubblica.

## Pubblicare su GitHub Pages

1. Crea un repository **pubblico** su GitHub (es. `charisma30`) e caricaci il contenuto di questa cartella.
2. Nel repository: Settings → Pages → Source: **GitHub Actions**.
3. Ogni push su `main` ricostruisce e pubblica il sito. L'indirizzo sarà
   `https://<utente>.github.io/<repository>/`.
4. Usa `https://<utente>.github.io/<repository>/privacy/` come URL della privacy policy
   in App Store Connect e Google Play Console.

## Screenshot

Ricavati dalla versione web dell'app (`npx expo start --web`) con uno stato di esempio
(Alex, giorno 6, serie di 5 giorni, due strumenti sbloccati), a 390×844 in chiaro e scuro.
Per rifarli dopo un cambio di design conviene usare il simulatore o un telefono vero.

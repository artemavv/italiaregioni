# Regioni d'Italia

A small learning tool for memorizing the 20 regions of Italy. You can tap the map, or practice with two training modes. Progress is stored in the browser.

Live: https://italiaregioni.ddnsfree.com

## Features

- Interactive map: tapping a region shows its name.
- **Trova la regione** - a name is shown ("dov'è Lombardia?"), you need to find and tap the region on the map.
- **Indovina il nome** - a region is highlighted and you need to pick its name from a dropdown (or type it).
- A practice run is 5 attempts.
- **Regions** panel has a "Completata" checkbox that removes a region from training (completed regions are shown in light green on the map).

## Tech stack

Vue 3 and Vite, plain CSS, no backend. Stats are kept in `localStorage`. 
The map is inline SVG generated from open ISTAT-derived GeoJSON ([openpolis/geojson-italy](https://github.com/openpolis/geojson-italy)).

## Deployment

The build output in `dist/` is plain static files. You can copy it to any static web server.

```bash
npm run build
rsync -av --delete dist/ user@host:/var/www/your-site/
```


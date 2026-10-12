# Minta Manufaktúra - projektútmutató

Önálló gyártási mintaalkalmazás kitalált adatokkal. Az indítás, az adatmodell és a kódbázis térképe a [README.md](README.md)-ben van, az aktuális feladat a [TASK.md](TASK.md)-ben.

## Munkavégzés

- Kódos munka előtt nézd meg a `git status --short` kimenetét. Más változását ne írd felül.
- Kizárólag helyi, szintetikus adatokkal dolgozz. Ne kérj produkciós hozzáférést vagy titkot, ne indíts deployt, és ne írj külső rendszerbe.
- A `.wrangler/` a helyi adatbázisállapotot tárolja; ne töröld rutinszerűen.

## Kód

- Stack: React 19, TypeScript, Vite, Tailwind v4, TanStack Query, Hono, Zod, Drizzle és helyi Cloudflare D1.
- Kövesd a meglévő utat: form → közös Zod-séma (`src/shared/schemas/`) → Hono route → Drizzle → React Query hook (`src/client/hooks/use-data.ts`). Mintának a termék szerkesztése és a gyártási tétel létrehozása a legjobb.
- Az üzleti szabályokat a szerver ellenőrzi; a kliensoldali ellenőrzés csak kényelmi réteg.
- Adatmodell-változáshoz módosítsd a Drizzle sémát, majd `npm run db:generate` és `npm run db:migrate`. Meglévő migrációt ne írj át.
- A navigáció hash alapú (`#modul/azonosító`); a modulok listája az `App.tsx`-ben van.

## Felület

- IBM Plex Sans, sötét oldalsáv, narancssárga (`#ff8803`) akcentus. Új betűtípust, színpalettát vagy árnyékstílust ne vezess be; a színeket a `globals.css` tokenjeiből vedd, az állapotokhoz a `--color-status-*` tokeneket használd.
- Használd a meglévő elemeket: `Panel`, `ListToolbar`, `DataTable`, `BackLink`, `InteractiveRow`, `FormFooter`, állapotjelvények és dátumcímke (`src/client/components/features/common.tsx`), valamint `src/client/components/ui/` (gomb, mező, dialógus, táblázat).
- Lista: cím nélküli panel, az eszköztárban keresés és szűrők, találatszám, jobbra az elsődleges gomb. Számoszlopok jobbra igazítva (`number`), a sorok a részletekre vezetnek.
- Részletoldal: a címsor a rekord neve, a modul a breadcrumbban látszik, visszalépés `BackLink`-kel. Szerkesztés dialógusban.
- Üres állapotnál konkrét, a helyzethez illő mondatot írj, ne általános „nincs adat” szöveget.
- WCAG AA kontraszt, látható fókusz, mobilon 44 px érintési cél, `prefers-reduced-motion` tisztelete. 390 px szélességen is használható legyen.

## Szöveg

- A felület magyar, ékezetekkel. `&` helyett „és”, en-dash helyett sima kötőjel.
- A felületre ne kerüljön technikai jelzés (például „szintetikus adatok” vagy „helyi környezet”).

## Ellenőrzés

- `npm run typecheck`, `npm run build`, `npm test` (saját ideiglenes adatbázissal fut). Az új működést böngészőben is próbáld ki.
- A munka végén röviden írd le, mi működik, mit futtattál, és mi hiányzik.

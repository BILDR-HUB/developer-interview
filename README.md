# BILDR HUB · Fejlesztői interjú

A **Minta Manufaktúra** egy kitalált kozmetikai gyártócég önálló mintaalkalmazása. A rendelések, a gyártás és a termékkatalógus együtt működik, valódi helyi adatbázissal. Az interjú során ebbe a meglévő rendszerbe kell új funkciót beilleszteni.

A feladat leírása és a keretek: [TASK.md](TASK.md).

## Indítás

Node.js 24 LTS és npm szükséges. Nem kell Cloudflare-fiók, Docker, API-kulcs vagy `.env` fájl.

```sh
git clone https://github.com/BILDR-HUB/developer-interview.git
cd developer-interview
npm ci
npm run setup
npm run dev
```

Nyisd meg: **http://127.0.0.1:5173**. A telepítés nem része a 60 perces feladatnak. Foglalt portnál: `npm run dev -- --port 5174`.

A kliens és a Hono API ugyanazon a porton fut. A helyi Cloudflare futtatókörnyezet SQLite-ként tárolja a D1 adatbázist a `.wrangler/` könyvtárban. Szerverújraindításkor megmaradnak az adatok. A fejlesztői identitás **Demó Elek**, `users.id = 1`.

## Meglévő modulok

| Modul                   | Működő funkciók                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| Áttekintő               | KPI-k, közelgő és lejárt szállítások, gyártási folyamat, linkek a részletekre            |
| Termékek                | Keresés, részletek, létrehozás és szerkesztés                                            |
| Kiszerelések            | Több kiszerelés termékenként, egyedi cikkszám, listaár, létrehozás és szerkesztés        |
| Vevői rendelések        | Ügyfél, kiszerelés, mennyiség, határidő, létrehozás, állapotváltás, kapcsolódó gyártások |
| Gyártási tételek        | Létrehozás, felelős, rendeléskapcsolat, szerkesztés, állapotváltás, megjegyzés, szűrés   |
| Ügyfelek és munkatársak | Olvasható törzsadatok, kapcsolódó rendelések és aktív gyártások száma                    |

A részletezők saját hash URL-t kapnak, például `#orders/4` és `#batches/10`; oldalfrissítés és a böngésző vissza gombja is használható.

## Adatmodell és szabályok

Termék → több kiszerelés. Ügyfél → több rendelés. Rendelés → egy kiszerelés, több gyártási tétel. Gyártási tétel → egy kiszerelés, egy felelős és opcionális rendelés.

- A rendelés állapotai: **Piszkozat → Visszaigazolt → Teljesített**. Kapcsolódó gyártás nélkül lemondható. Teljesített és lemondott rendelés nem nyitható vissza.
- Csak visszaigazolt rendeléshez indítható gyártás. A rendelés és a tétel kiszerelésének egyeznie kell. Rendelés nélkül saját készletre is lehet gyártani.
- Gyártási sorrend: **Tervezett → Keverés → Minőségellenőrzés → Töltés → Csomagolás → Lezárt**. Egyszerre egy lépés tehető előre vagy vissza, a lezárt tétel már nem módosítható.
- Elindított gyártásnál a kiszerelés, a rendelés és a mennyiség rögzített; a felelős, dátum, megjegyzés és a következő állapot szerkeszthető.
- A rendelés akkor jelölhető teljesítettnek, ha a kapcsolt lezárt gyártások összmennyisége eléri a rendelt mennyiséget. A lezárás kézi művelet; nem automatikus készlet- vagy szállításkezelés.
- A kiszerelés listaára tájékoztató katalógusadat. Nincs számlázás vagy éles kereskedelmi integráció.
- A dátumok naptári napok; a lejáratjelzés Europe/Budapest szerinti mai dátummal számol.

## Szintetikus adatok

**8 termék, 16 kiszerelés, 5 ügyfél, 12 rendelés, 16 gyártási tétel és 6 munkatárs.** Minden adat kitalált; az e-mailek az `example.test` tartományt használják. Nincs ügyféladat, termelési export, valódi receptúra vagy integrációs titok.

Van lejárt rendelés, több gyártással teljesülő rendelés, lezárt gyártás, piszkozat, lemondás és rendelés nélküli gyártás is. A dátumok az első seedelés napjához képest számítódnak. Az `npm run setup` újrafuttatása nem írja felül a meglévő adatokat.

A v1-ről érkezők adatait a migráció megőrzi. A régi táblák `legacy_products` és `legacy_batches` néven mentésként megmaradnak; az alkalmazás már nem használja őket. A régi tételek rendeléskapcsolat nélkül maradnak, Tervezett állapotban utólag összekapcsolhatók.

## Kódbázis

React, TypeScript, Vite, Tailwind CSS, shadcn alapú UI-elemek, TanStack Query; Hono, Zod, Drizzle ORM és helyi Cloudflare D1.

```text
src/client/App.tsx                   Alkalmazáskeret és hash navigáció
src/client/components/features/      Áttekintő, termék-, rendelés- és gyártásmodul
src/client/components/ui/            Újrahasználható felületi elemek
src/client/hooks/use-data.ts         Típusos lekérések, mentés, cache-frissítés
src/client/lib/api.ts                Hono kliens és hibakezelés
src/server/routes/                   API-k és üzleti ellenőrzések
src/server/db/schema.ts              Aktív adatmodell
src/shared/schemas/                  Közös típusok és Zod validáció
drizzle/                            Verziózott SQL migrációk
scripts/seed.sql                    Kitalált induló adatok
tests/                              Elkülönített adatbázisos API-tesztek
```

Új táblához módosítsd a Drizzle sémát, majd `npm run db:generate` és `npm run db:migrate`.

Mintának nézd meg a termék szerkesztését vagy a gyártási tétel létrehozását: form → közös típus → Hono API → Zod validáció → Drizzle → React Query frissítés.

## Ellenőrzés

```sh
npm run typecheck
npm run build
npm test
```

Az `npm test` saját ideiglenes adatbázist hoz létre, lefuttatja a migrációkat és seedet, indít egy tesztszervert, majd eltakarítja azt. Nem kell futó dev szerver, és nem módosítja a helyi adataidat. Ellenőrzi az adatkapcsolatokat, a termék és kiszerelés mentését, a teljes gyártási folyamatot és a hibás műveletek elutasítását.

## Interjúkeretek

**60 perc fejlesztés, utána 30 perc bemutató és beszélgetés.** A telepítés és az alaprendszer indítása nem része a 60 percnek; a fejlesztés, az ellenőrzés és a rövid átadási jegyzet igen. Az idő végén állj meg, a bemutató nem további fejlesztési idő.

A [kiírás](TASK.md) ügyfélbrief. A részletes működést és az első verzió határait a jelölt alakítja ki. A bemutatón az eredményről, az ellenőrzésekről, a döntésekről és a folytatásról beszélünk.

Claude, ChatGPT, Codex és más AI-eszköz használható. A bemutatón a használatáról és az eredmény ellenőrzéséről beszélünk; privát beszélgetés vagy titok átadását nem kérjük.

Saját klónban dolgozz. A megoldást a megbeszélt módon, külön repóval vagy Git diffel add át, rövid futtatási jegyzettel. Az alaprepóba nem kell push vagy pull request. Nyilvános fork esetén mások is látják a megoldásod; privát átadáshoz külön privát repó vagy patch fájl használható.

Ez helyi interjúalkalmazás, valódi hitelesítés és éles deploy nélkül. Az API localhostra korlátozott. A publikus minta önálló alkalmazás; nem tartalmazza egy ügyfél teljes üzemi rendszerét.

## Munka AI-agenttel

Az agenteknek szóló projektútmutató (kódminták, felületi szabályok, ellenőrzés) az [AGENTS.md](AGENTS.md) fájlban van; a [CLAUDE.md](CLAUDE.md) erre hivatkozik.

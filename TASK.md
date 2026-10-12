# Ügyfélbrief: a gyártás körüli teendők követése

## A helyzet

A Minta Manufaktúra a rendeléseit és gyártási tételeit már ebben az alkalmazásban kezeli. A körülöttük felmerülő kisebb teendők viszont szóban és üzenetekben maradnak: egy ellenőrző minta kérése, egy címke jóváhagyása vagy a következő heti műszakbeosztás egyeztetése.

Emiatt nehéz átlátni, ki mivel foglalkozik, mi sürgős, és hol akadt el valami.

## Amit az ügyfél szeretne

> „Jó lenne, ha a teendőinket is ebben a rendszerben tudnánk kezelni. Lehessen új feladatot felvenni, követni, ki felel érte, mikorra kell elkészülnie, és hol tart.
>
> Van, ami egy gyártási tételhez kapcsolódik, más inkább általános szervezési feladat. Mindkettőnek szeretnénk helyet.
>
> A kollégák egy kereshető listában szeretnek dolgozni, én pedig Kanban táblán nézném át a munkát. Ugyanazokat a feladatokat lássuk, csak más elrendezésben.”

A meglévő alkalmazást egy **Feladatok modullal, lista- és Kanban-nézettel** bővítsd. Egy használható első verziót szeretnénk látni, amelyben a feladatok rögzíthetők, és a munka előrehaladása követhető.

## Ami biztosan kell

- A feladatok a meglévő adatbázisban tárolódjanak, verziózott migrációval, ne csak a kliensben.
- A felelős a meglévő munkatársak közül kerüljön ki, a gyártáshoz kapcsolódó feladat pedig egy gyártási tételhez legyen köthető.
- A feladat állapota külön adat, nem azonos a gyártási tétel állapotával.

## Amire később is gondolunk

Később más csapatok is használnák a modult. Eltérhet a munkafolyamatuk, és az is, hogy kinek milyen információ fontos a saját nézetében. Legyen a megoldás moduláris, továbbfejleszthető, és később személyre szabható.

Teljes testreszabási rendszert most nem várunk. Te döntsd el, minek készítesz helyet már az első verzióban, és mit hagysz későbbre.

A mezők, az állapotok, a feladatfelvitel és a nézetek részletes működését rád bízzuk. Az igényből te alakítsd ki a megoldást; a nyitott kérdéseknél mondd el, milyen feltételezéssel dolgoztál.

## Keretek

**60 perc fejlesztés, majd 30 perc bemutató és beszélgetés.** A telepítés és a működő alaprendszer elindítása nem része a 60 percnek. A tervezés, a megvalósítás és az ellenőrzés igen.

Válassz egy bemutatható első verziót, és az idő végén állj meg. Egy kisebb, működő és ellenőrzött megoldás többet ér, mint egy nagyobb, félkész. Nem kell minden jövőbeli igényt megoldani. Ha valami kimarad vagy csak részben működik, jelezd egyértelműen. Az elkészült rész legyen kipróbálható a meglévő alkalmazásban.

Claude, ChatGPT, Codex és más AI-eszköz használható. A megoldás megértése és ellenőrzése a te felelősséged.

A 30 perces beszélgetésben mutasd meg, mit készítettél, hogyan illeszkedik a rendszerbe, mit ellenőriztél, és miért ezeket a döntéseket hoztad. Beszéljünk arról is, hogyan folytatnád, ha a csapatok később eltérő működést vagy saját nézeteket kérnének. Privát AI-beszélgetés vagy titok átadását nem kérjük.

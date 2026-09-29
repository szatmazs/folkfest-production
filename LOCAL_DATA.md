# Helyi adat- és feltöltéskezelés

## Hivatalos helyek

- A helyi SQLite-adatbázis: `prisma/production.db`
- A Prisma-adatbázis URL-je helyben: `DATABASE_URL="file:./production.db"`
  - A Prisma ezt a `prisma/schema.prisma` helyéhez viszonyítja, ezért a tényleges fájl a `prisma/production.db`.
- A webes feltöltések: `public/uploads/`
- A plakátok statikus fájljai: `public/posters/`

## Szinkronizálás

A szerverről letöltött adatbázist mindig közvetlenül ide kell másolni:

```bash
cp <letöltött-adatbázis> prisma/production.db
```

Az adatbázist nem szabad a projekt gyökerébe `production.db` néven másolni, mert az félrevezető és nem ezt használja a Prisma.

Az éles szerverhez tartozó beállítások az `.env` fájlban, a localhost beállításai az `.env.local` fájlban vannak. Az `.env` fájlt helyben nem kell módosítani.

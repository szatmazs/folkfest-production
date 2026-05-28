const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const privacyPolicyContent = [
  { id: 'h1', type: 'heading', level: 1, content: 'Adatkezelési Tájékoztató' },
  { id: 't1', type: 'text', content: 'Ez az adatkezelési tájékoztató a FolkFest Kulturális Egyesület (székhely: 1024 Budapest Lövőház u. 29. III/3, elnök: Bakó Krisztián Zsolt, a továbbiakban: Adatkezelő) által üzemeltetett weboldal látogatóinak adataira vonatkozik.' },
  { id: 'h2', type: 'heading', level: 2, content: '1. Milyen adatokat kezelünk?' },
  { id: 't2', type: 'text', content: 'A weboldal böngészése során technikai adatokat (pl. IP-cím, böngésző típusa) rögzítünk statisztikai célból, valamint az Ön által megadott adatokat (pl. kapcsolatfelvételi űrlap esetén név, e-mail cím).' },
  { id: 'h3', type: 'heading', level: 2, content: '2. Az adatkezelés célja' },
  { id: 't3', type: 'text', content: 'Az adatok kezelésének célja a weboldal működtetése, a látogatókkal való kapcsolattartás és a felhasználói élmény javítása.' },
  { id: 'h4', type: 'heading', level: 2, content: '3. Jogorvoslat' },
  { id: 't4', type: 'text', content: 'Ön kérheti adatai törlését vagy módosítását az info@folkfest.hu e-mail címen.' }
];

const cookiePolicyContent = [
  { id: 'h1', type: 'heading', level: 1, content: 'Sütikezelési Szabályzat (Cookie Policy)' },
  { id: 't1', type: 'text', content: 'A weboldalunk sütiket (cookie-kat) használ a jobb felhasználói élmény biztosítása érdekében.' },
  { id: 'h2', type: 'heading', level: 2, content: 'Mik azok a sütik?' },
  { id: 't2', type: 'text', content: 'A sütik kisméretű szöveges fájlok, amelyeket a weboldal helyez el az Ön eszközén. Segítenek megjegyezni a beállításait és javítani az oldal teljesítményét.' },
  { id: 'h3', type: 'heading', level: 2, content: 'Milyen sütiket használunk?' },
  { id: 't3', type: 'text', content: 'Használunk alapvető működéshez szükséges sütiket, valamint statisztikai célú (Google Analytics) sütiket.' }
];

async function main() {
  await prisma.page.upsert({
    where: { slug: 'adatkezelesi-tajekoztato' },
    update: {},
    create: {
      title: 'Adatkezelési Tájékoztató',
      slug: 'adatkezelesi-tajekoztato',
      content: JSON.stringify(privacyPolicyContent),
      heroTitle: 'Adatkezelési Tájékoztató',
      heroSubtitle: 'Jognyilatkozat',
    }
  });

  await prisma.page.upsert({
    where: { slug: 'sutikezeles' },
    update: {},
    create: {
      title: 'Sütikezelési Szabályzat',
      slug: 'sutikezeles',
      content: JSON.stringify(cookiePolicyContent),
      heroTitle: 'Sütikezelési Szabályzat',
      heroSubtitle: 'Cookie Policy',
    }
  });

  console.log('Policy pages created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

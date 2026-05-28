import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const existing = await prisma.release.findFirst({
        where: { title: "Melyik úton..." }
    });

    if (existing) {
        console.log("Release already exists, skipping seed.");
        return;
    }

    const tracklist = JSON.stringify([
        "Imitálás", "Cifraország", "Zengedelem", "Piculás", "Keletre",
        "Városiasan", "Azt a hétszen'csóráját!", "Ontsad, ontsad...",
        "Legyen buffja!", "Emlékükre", "Magyarosan", "Ropogtatni való",
        "Kakukktojás Ferinek"
    ]);

    const streamingLinks = JSON.stringify({
        spotify: "https://open.spotify.com/album/11bvxn5ZnaMc5JlFRMhvW9?go=1",
        apple: "https://music.apple.com/album/1320659195",
        youtube: "https://music.youtube.com/playlist?list=OLAK5uy_nTCrjk3EuisupoPqOpQr7TgJiHUDEqJ4c",
        deezer: "https://www.deezer.com/album/52825402",
        tidal: "http://www.tidal.com/album/329294881",
        amazon: "https://music.amazon.com/albums/B0CXRG928Z"
    });

    await prisma.release.create({
        data: {
            artist: "Mihó Attila és barátai",
            title: "Melyik úton...",
            year: 2017,
            coverUrl: "https://linkstorage.linkfire.com/medialinks/images/c2440800-1398-4600-af29-01e91acc19e8/artwork-440x440.jpg",
            promoLink: "https://artists.landr.com/800739242050",
            tracklist: tracklist,
            streamingLinks: streamingLinks
        }
    })

    console.log("Seeded 'Melyik úton...' release.");
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

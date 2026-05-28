import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

import sharp from 'sharp';

async function toDataUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    let buf: Buffer;
    if (url.startsWith('/')) {
      buf = await readFile(join(process.cwd(), 'public', url));
    } else if (url.startsWith('http')) {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) return null;
      buf = Buffer.from(await r.arrayBuffer());
    } else {
      return null;
    }

    const pngBuf = await sharp(buf).png().toBuffer();
    return `data:image/png;base64,${pngBuf.toString('base64')}`;
  } catch (e) {
    console.error('[OG] toDataUrl error for:', url, e);
  }
  return null;
}

export async function GET(_req: NextRequest) {
  const project = await prisma.project.findFirst({
    where: { OR: [{ slug: 'future-tense-everyone-deserves-a-pen-friend' }, { slugEn: 'future-tense-everyone-deserves-a-pen-friend' }] },
    include: { partners: true },
  });
  if (!project) return new Response('Not found', { status: 404 });

  const cover = await toDataUrl(project.mainImage ?? '/projektek-bg.jpg');
  const sponsor = await toDataUrl(project.sponsorLogo);
  const partnerUrls = project.partners.map(p => p.logoUrl).filter((u): u is string => !!u).slice(0, 1);
  const partnerLogos: string[] = [];
  for (const u of partnerUrls) {
    const d = await toDataUrl(u);
    if (d) partnerLogos.push(d);
  }

  const partner0 = partnerLogos[0] ?? null;
  const hasBar = !!sponsor || !!partner0;

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', backgroundColor: '#111', position: 'relative' }}>
        {cover ? <img src={cover} alt="" width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }} /> : null}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.88) 100%)', display: 'flex' }} />
        <span style={{ position: 'absolute', color: '#ffffff', fontSize: 58, fontWeight: 700, bottom: hasBar ? 160 : 80, left: 80, right: 80 }}>
          {project.title}
        </span>
        {hasBar ? (
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 1200, height: 108, backgroundColor: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: 80, paddingRight: 80, borderTop: '4px solid #f59e0b', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {partner0 ? <img src={partner0} alt="" height={50} width={120} style={{ objectFit: 'contain' }} /> : null}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {sponsor ? <img src={sponsor} alt="" height={56} width={220} style={{ objectFit: 'contain' }} /> : null}
            </div>
          </div>
        ) : null}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

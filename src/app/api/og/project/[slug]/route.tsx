/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

async function getProject(slug: string) {
  return await prisma.project.findFirst({
    where: { OR: [{ slug }, { slugEn: slug }] },
    include: { partners: true },
  });
}

import sharp from 'sharp';

async function toDataUrl(url: string | null | undefined): Promise<string> {
  if (!url) return '';
  try {
    let buf: Buffer;
    if (url.startsWith('/')) {
      buf = await readFile(join(process.cwd(), 'public', url));
    } else if (url.startsWith('http')) {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) return '';
      buf = Buffer.from(await r.arrayBuffer());
    } else {
      return '';
    }

    const pngBuf = await sharp(buf).png().toBuffer();
    return `data:image/png;base64,${pngBuf.toString('base64')}`;
  } catch (e) {
    console.error('[OG] toDataUrl error for:', url, e);
  }
  return '';
}

// Build an <img> element for each partner logo, returning a flat array of img nodes
function buildPartnerImgs(urls: string[]): React.ReactNode {
  if (urls.length === 0) return null;
  if (urls.length === 1) {
    return <img src={urls[0]} alt="" width={120} height={50} style={{ objectFit: 'contain' }} />;
  }
  if (urls.length === 2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <img src={urls[0]} alt="" width={120} height={50} style={{ objectFit: 'contain', marginRight: 20 }} />
        <img src={urls[1]} alt="" width={120} height={50} style={{ objectFit: 'contain' }} />
      </div>
    );
  }
  if (urls.length === 3) {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <img src={urls[0]} alt="" width={120} height={50} style={{ objectFit: 'contain', marginRight: 20 }} />
        <img src={urls[1]} alt="" width={120} height={50} style={{ objectFit: 'contain', marginRight: 20 }} />
        <img src={urls[2]} alt="" width={120} height={50} style={{ objectFit: 'contain' }} />
      </div>
    );
  }
  // 4+: show up to 4
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <img src={urls[0]} alt="" width={100} height={44} style={{ objectFit: 'contain', marginRight: 16 }} />
      <img src={urls[1]} alt="" width={100} height={44} style={{ objectFit: 'contain', marginRight: 16 }} />
      <img src={urls[2]} alt="" width={100} height={44} style={{ objectFit: 'contain', marginRight: 16 }} />
      <img src={urls[3]} alt="" width={100} height={44} style={{ objectFit: 'contain' }} />
    </div>
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const locale = request.nextUrl.searchParams.get('locale') ?? 'hu';
  const isEn = locale === 'en';

  const project = await getProject(slug);
  if (!project) return new Response('Not found', { status: 404 });

  const title = isEn ? (project.titleEn ?? project.title) : project.title;
  const coverUrl = project.mainImage ?? '/projektek-bg.jpg';
  const sponsorUrl = isEn ? (project.sponsorLogoEn ?? project.sponsorLogo) : project.sponsorLogo;

  // Gather partner URLs (max 4)
  const rawPartnerUrls = Array.isArray(project.partners)
    ? project.partners
        .map((p) => p.logoUrl)
        .filter((u): u is string => !!u)
        .slice(0, 4)
    : [];

  // Fetch all assets in parallel
  const [cover, sponsor, logo] = await Promise.all([
    toDataUrl(coverUrl),
    toDataUrl(sponsorUrl),
    toDataUrl('/logo.png'),
  ]);

  const partnerDataUrls: string[] = [];
  for (const u of rawPartnerUrls) {
    const d = await toDataUrl(u);
    if (d && d !== '') partnerDataUrls.push(d);
  }

  const hasPartners = partnerDataUrls.length > 0;
  const hasSponsor = !!sponsor && sponsor !== '';
  const hasBar = true;

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: 'flex', flexDirection: 'column', backgroundColor: '#111', fontFamily: 'sans-serif', position: 'relative' }}>
        {/* Background */}
        {cover && cover !== ''
          ? <img src={cover} alt="" width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }} />
          : null}
        {/* Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.88) 100%)', display: 'flex' }} />
        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', left: 80, right: 80, bottom: 160 }}>
          <span style={{ color: '#ffffff', fontSize: 58, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {title}
          </span>
        </div>
        {/* Logo bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 1200, height: 116, backgroundColor: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0 80px', borderTop: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {logo && logo.length > 10 ? <img src={logo} alt="FolkFest" width={110} height={52} style={{ objectFit: 'contain', marginRight: 24 }} /> : null}
            {partnerDataUrls[0] && partnerDataUrls[0].length > 10 ? <img src={partnerDataUrls[0]} alt="" width={100} height={48} style={{ objectFit: 'contain', marginRight: 16 }} /> : null}
            {partnerDataUrls[1] && partnerDataUrls[1].length > 10 ? <img src={partnerDataUrls[1]} alt="" width={100} height={48} style={{ objectFit: 'contain', marginRight: 16 }} /> : null}
            {partnerDataUrls[2] && partnerDataUrls[2].length > 10 ? <img src={partnerDataUrls[2]} alt="" width={100} height={48} style={{ objectFit: 'contain', marginRight: 16 }} /> : null}
            {partnerDataUrls[3] && partnerDataUrls[3].length > 10 ? <img src={partnerDataUrls[3]} alt="" width={100} height={48} style={{ objectFit: 'contain' }} /> : null}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {hasSponsor
              ? <img src={sponsor} alt="" height={64} width={240} style={{ objectFit: 'contain' }} />
              : null}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

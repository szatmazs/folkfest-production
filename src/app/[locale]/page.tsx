import { Hero } from "@/components/layout/hero";
import { FacebookCarousel } from "@/components/features/facebook-carousel";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getFacebookPosts } from "@/actions/facebook";
import { getHomeSettings } from "@/app/actions/settings-admin";
import { getReleases } from "@/app/actions/release";
import { PosterGallery } from "@/components/features/poster-gallery";
import { ReleaseCarousel } from "@/components/features/release-carousel";
import { prisma } from "@/lib/prisma";
import { HomeVideoCarousel } from "@/components/features/home-video-carousel";
import { getTranslations } from 'next-intl/server';

import { getPartners } from "@/app/actions/partner-admin";
import { PartnerGrid } from "@/components/features/partner-grid";

export const dynamic = 'force-dynamic';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const t = await getTranslations('home');

  const [facebookData, homeData, releasesData, videos, partners, slides] = await Promise.all([
    getFacebookPosts(),
    getHomeSettings(),
    getReleases(),
    prisma.video.findMany({
      where: { featured: true },
      orderBy: { publishedAt: 'desc' },
      take: 10
    }),
    getPartners(),
    prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
  ]);

  const { posts, profilePicture } = facebookData;
  const rawReleases = releasesData.success && releasesData.releases ? releasesData.releases : [];

  // Localize Releases
  const releases = rawReleases.map(release => ({
    ...release,
    title: isEn ? (release.titleEn || release.title) : release.title
  }));

  // Localize Videos
  const localizedVideos = videos.map(video => ({
    ...video,
    title: isEn ? (video.titleEn || video.title) : video.title,
    description: isEn ? (video.descriptionEn || video.description) : video.description
  }));

  // Localize Hero Slides
  const localizedSlides = slides.map(slide => ({
    ...slide,
    title: isEn ? (slide.titleEn || slide.title) : slide.title,
    subtitle: isEn ? (slide.subtitleEn || slide.subtitle) : slide.subtitle,
    titleHighlight: isEn ? (slide.titleHighlightEn || slide.titleHighlight) : slide.titleHighlight,
    leftButtonLabel: isEn ? (slide.leftButtonLabelEn || slide.leftButtonLabel) : slide.leftButtonLabel,
    rightButtonLabel: isEn ? (slide.rightButtonLabelEn || slide.rightButtonLabel) : slide.rightButtonLabel,
    logoUrl: isEn ? (slide.logoUrlEn || slide.logoUrl) : slide.logoUrl,
  }));

  // Transform API data to Component props format
  const formattedPosts = posts.length > 0
    ? posts.map(post => {

      let content = isEn ? (post.messageEn || post.message || "") : (post.message || "");
      const attachments = post.attachments?.data?.[0];
      const link = attachments?.target?.url || attachments?.url;
      const title = attachments?.title;
      const description = attachments?.description;

      // Check if it's a YouTube video
      let videoUrl = null;

      // 1. Direct embed source from Facebook (best for directly embedded videos)
      if (attachments?.media?.source) {
        const source = attachments.media.source;
        if (source.includes("youtube.com") || source.includes("youtu.be")) {
          // Remove autoplay=1 if present
          videoUrl = source.replace(/[?&]autoplay=1/, "");
        }
      }

      // 2. Fallback: Parse URL from link (handling l.facebook.com wrapper)
      if (!videoUrl && link) {
        let cleanLink = link;
        if (link.includes("l.facebook.com/l.php")) {
          try {
            const urlParams = new URLSearchParams(new URL(link).search);
            cleanLink = urlParams.get("u") || link;
          } catch (e) {
            // Ignore parsing errors
          }
        }

        if (cleanLink.includes("youtube.com") || cleanLink.includes("youtu.be")) {
          const match = cleanLink.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
          if (match && match[1]) {
            videoUrl = `https://www.youtube.com/embed/${match[1]}`;
          }
        }
      }

      // Extract YouTube thumbnail if we have a video URL
      let ytThumbnail = null;
      if (videoUrl) {
        const idMatch = videoUrl.match(/\/embed\/([^/?]+)/);
        if (idMatch && idMatch[1]) {
          ytThumbnail = `https://img.youtube.com/vi/${idMatch[1]}/maxresdefault.jpg`;
        }
      }

      // If content is just a URL or empty, and we have a title, use the title
      const isUrl = /^(http|https):\/\/[^ "]+$/.test(content);
      if ((!content || isUrl) && title) {
        content = description ? `${title}\n\n${description}` : title;
      } else if (!content) {
        content = isEn ? "View post on Facebook" : "Kép megtekintése Facebookon";
      }

      return {
        id: post.id,
        date: new Date(post.created_time).toLocaleDateString(isEn ? "en-US" : "hu-HU", { year: 'numeric', month: 'long', day: 'numeric' }),
        content: content,
        image: ytThumbnail || post.full_picture || null,
        likes: post.likes?.summary.total_count || 0,
        videoUrl: videoUrl,
        link: post.permalink_url,
        customTitle: isEn ? (post.customTitleEn || post.customTitle) : post.customTitle
      };
    })
    : []; // Fallback handled inside component

  // Default Fallbacks
  const heroSubtitle = isEn 
    ? (homeData?.heroSubtitleEn || homeData?.heroSubtitle || "Cultural Association")
    : (homeData?.heroSubtitle || "Kulturális Egyesület");
  
  const heroTitle = isEn
    ? (homeData?.heroTitleEn || homeData?.heroTitle || "Tradition")
    : (homeData?.heroTitle || "Hagyomány");
    
  const heroTitleHighlight = isEn
    ? (homeData?.heroTitleHighlightEn || homeData?.heroTitleHighlight || "In Modern Form")
    : (homeData?.heroTitleHighlight || "Modern Formában");

  const heroLeftButtonLabel = isEn
    ? (homeData?.heroLeftButtonLabelEn || homeData?.heroLeftButtonLabel || "Events")
    : (homeData?.heroLeftButtonLabel || "Események");
    
  const heroLeftButtonLink = homeData?.heroLeftButtonLink 
    ? (homeData.heroLeftButtonLink.startsWith('http') ? homeData.heroLeftButtonLink : `/${locale}${homeData.heroLeftButtonLink}`) 
    : `/${locale}/${isEn ? 'events' : 'esemenyek'}`;
  
  const heroRightButtonLabel = isEn
    ? (homeData?.heroRightButtonLabelEn || homeData?.heroRightButtonLabel || "About Us")
    : (homeData?.heroRightButtonLabel || "Rólunk");
    
  const heroRightButtonLink = homeData?.heroRightButtonLink 
    ? (homeData.heroRightButtonLink.startsWith('http') ? homeData.heroRightButtonLink : `/${locale}${homeData.heroRightButtonLink}`) 
    : `/${locale}/${isEn ? 'folkfest-cultural-association' : 'folkfest-kulturalis-egyesulet'}`;

  // Default Sections if not in DB
  const defaultSections: any[] = [
    { 
      id: 'news', 
      isVisible: true, 
      order: 0, 
      title: isEn ? 'News & Updates' : 'Hírek, aktualitások', 
      buttonLabel: isEn ? 'View more' : 'További híreink',
      buttonLink: '/hirek'
    },
    { 
      id: 'somlo', 
      isVisible: true, 
      order: 1, 
      title: isEn ? 'Folk Music Festival \n on Somló Hill' : 'Népzenei mikrofesztivál \n a Somló hegyen', 
      buttonLabel: isEn ? 'More information' : 'További információk', 
      buttonLink: '/somlo-folkfest', 
      backgroundUrl: '/vineyard-bg.jpg', 
      logoUrl: '/somlo-logo-white.png', 
      posters: [
        { year: 2020, src: "/posters/poster-2020.jpg" },
        { year: 2021, src: "/posters/poster-2021.jpg" },
        { year: 2022, src: "/posters/poster-2022.jpg" },
        { year: 2023, src: "/posters/poster-2023.jpg" },
        { year: 2024, src: "/posters/poster-2024.jpg" },
        { year: 2025, src: "/posters/poster-2025.jpg" },
      ] 
    },
    { 
      id: 'publications', 
      isVisible: true, 
      order: 2, 
      title: isEn ? 'Our Publications' : 'Kiadványaink', 
      buttonLabel: isEn ? 'All publications' : 'Összes kiadvány', 
      buttonLink: '/kiadvanyok' 
    },
    { 
      id: 'videos', 
      isVisible: true, 
      order: 3, 
      title: isEn ? 'Video Gallery' : 'Videógaléria', 
      buttonLabel: isEn ? 'More videos' : 'További videók', 
      buttonLink: '/videos' 
    },
    { 
      id: 'partners', 
      isVisible: true, 
      order: 4, 
      title: isEn ? 'Supporters & Partners' : 'Támogatóink és partnereink' 
    }
  ];

  let sections = defaultSections;
  if (homeData?.sections) {
    try {
      sections = JSON.parse(homeData.sections);
    } catch (e) {
      console.error("Failed to parse sections", e);
    }
  }

  // Filter and sort sections
  const activeSections = sections
    .filter((s: any) => s.isVisible)
    .sort((a: any, b: any) => a.order - b.order);

  return (
    <div className="flex flex-col">
      <Hero
        subtitle={heroSubtitle}
        title={heroTitle}
        titleHighlight={heroTitleHighlight}
        leftButtonLabel={heroLeftButtonLabel}
        leftButtonLink={heroLeftButtonLink}
        rightButtonLabel={heroRightButtonLabel}
        rightButtonLink={heroRightButtonLink}
        slides={localizedSlides}
      />

      {activeSections.map((section: any) => {
        const displayTitle = isEn ? (section.titleEn || section.title) : section.title;
        const displayButtonLabel = isEn ? (section.buttonLabelEn || section.buttonLabel) : section.buttonLabel;
        const buttonLink = section.buttonLink || '/';

        switch (section.id) {
          case 'news':
            return (
              <section key="news" className="py-20 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-bold uppercase tracking-wide mb-12 text-center text-black">
                    {displayTitle || (isEn ? "News & Updates" : "Hírek, aktualitások")}
                  </h2>
                  <div className="w-full relative">
                    <FacebookCarousel posts={formattedPosts} profilePicture={profilePicture} />
                  </div>

                  <div className="flex justify-center mt-12">
                    <Button variant="outline" asChild className="border-black !text-black hover:bg-black hover:!text-white hover:border-black uppercase tracking-widest font-bold px-8 transition-all duration-300">
                      <Link href="/hirek">{displayButtonLabel || (isEn ? "View more" : "További híreink")}</Link>
                    </Button>
                  </div>
                </div>
              </section>
            );

          case 'somlo':
            return (
              <section key="somlo" className="relative w-full min-h-[600px] flex items-center overflow-hidden py-16">
                <div className="absolute inset-0 z-0">
                  <Image
                    src={section.backgroundUrl || "/vineyard-bg.jpg"}
                    alt="Somló Hegy"
                    fill
                    className="object-cover"
                    quality={100}
                    priority
                    unoptimized
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 z-0" />

                <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center gap-12">
                  <div className="flex flex-col md:flex-row items-center w-full gap-8 md:gap-16">
                    <div className="relative flex-none w-48 h-48 md:w-80 md:h-80 opacity-90">
                      <Image
                        src={section.logoUrl || "/somlo-logo-white.png"}
                        alt="Logo"
                        fill
                        className="object-contain object-center md:object-left"
                      />
                    </div>

                    <div className="flex-1 w-full h-48 md:h-80 overflow-hidden">
                      <PosterGallery posters={section.posters?.map((p: any, i: number) => ({ id: i, year: p.year, src: p.src }))} />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-end justify-between w-full border-t border-white/20 pt-8 gap-6">
                    <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-wider text-white drop-shadow-lg text-center md:text-left whitespace-pre-line">
                      {displayTitle || (isEn ? "Folk Music Festival \n on Somló Hill" : "Népzenei mikrofesztivál \n a Somló hegyen")}
                    </h2>

                    <Button variant="outline" asChild className="bg-transparent border-white !text-white hover:bg-white hover:!text-black uppercase tracking-widest font-bold px-8 h-12 text-lg transition-all duration-300">
                      <Link href={buttonLink || "/somlo-folkfest"}>{displayButtonLabel || (isEn ? "More information" : "További információk")}</Link>
                    </Button>
                  </div>
                </div>
              </section>
            );

          case 'publications':
            return (
              <section key="publications" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                  <h2 className="text-3xl font-bold uppercase tracking-wide mb-12 text-center text-black">
                    {displayTitle || (isEn ? "Our Publications" : "Kiadványaink")}
                  </h2>
                  <ReleaseCarousel releases={releases} />

                  <div className="flex justify-center mt-12">
                    <Button variant="outline" asChild className="border-black !text-black hover:bg-black hover:!text-white hover:border-black uppercase tracking-widest font-bold px-8 transition-all duration-300">
                      <Link href="/kiadvanyok">{displayButtonLabel || (isEn ? "All publications" : "Összes kiadvány")}</Link>
                    </Button>
                  </div>
                </div>
              </section>
            );

          case 'videos':
            return (
              <section key="videos" className="relative py-20 text-white overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/videok-bg.jpg"
                    alt="Background"
                    fill
                    className="object-cover"
                    quality={90}
                  />
                  <div className="absolute inset-0 bg-black/80" />
                </div>

                <div className="container mx-auto px-4 md:px-0 relative z-10">
                  <h2 className="text-3xl font-bold uppercase tracking-wide mb-12 text-center text-white">
                    {displayTitle || (isEn ? "Video Gallery" : "Videógaléria")}
                  </h2>
                  <HomeVideoCarousel videos={localizedVideos} />

                  <div className="flex justify-center mt-12 pb-12">
                    <Button variant="outline" asChild className="bg-transparent border-white !text-white hover:bg-white hover:!text-black hover:border-white uppercase tracking-widest font-bold px-8 transition-all duration-300">
                      <Link href="/videos">{displayButtonLabel || (isEn ? "More videos" : "További videók")}</Link>
                    </Button>
                  </div>
                </div>
              </section>
            );

          case 'partners':
            return (
              <PartnerGrid key="partners" partners={partners} title={displayTitle} />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

"use server";

import { prisma } from "@/lib/prisma";
import { downloadFacebookImage } from "@/lib/download-image";
import { translateText } from "@/lib/translate";

// Define types for API responses to avoid 'any'
interface FacebookApiPost {
    id: string;
    message?: string;
    created_time: string;
    full_picture?: string;
    permalink_url: string;
    likes?: {
        summary: {
            total_count: number;
        };
    };
    attachments?: {
        data: Array<{
            description?: string;
            media?: {
                image?: {
                    src: string;
                };
                source?: string;
            };
            target?: {
                id?: string;
                url: string;
            };
            title?: string;
            type: string;
            url: string;
        }>;
    };
    status_type?: string;
}

interface FacebookApiEvent {
    id: string;
    name: string;
    description?: string;
    start_time: string;
    end_time?: string;
    cover?: {
        source: string;
    };
    place?: {
        name: string;
    };
}

export interface FacebookPost {
    id: string;
    message?: string;
    messageEn?: string; // Added field
    created_time: string;
    full_picture?: string;
    permalink_url: string;
    customTitle?: string | null;
    customTitleEn?: string | null; // Added field
    attachments?: {
        data: Array<{
            description?: string;
            media?: {
                image?: {
                    src: string;
                };
                source?: string;
            };
            target?: {
                url: string;
            };
            title?: string;
            type: string;
            url: string;
        }>;
    };
    likes?: {
        summary: {
            total_count: number;
        };
    };
}

export interface FacebookData {
    posts: FacebookPost[];
    profilePicture: string | null;
}

export interface FacebookEvent {
    id: string;
    name: string;
    nameEn?: string; // Added field
    description?: string;
    descriptionEn?: string; // Added field
    start_time: string;
    end_time?: string;
    cover?: {
        source: string;
    };
    place?: {
        name: string;
    };
    placeEn?: {
        name: string;
    }; // Added field
}

export async function getFacebookEvents(): Promise<FacebookEvent[]> {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    let shouldSync = false;
    let awaitSync = false;
    if (process.env.NODE_ENV === 'development') {
        const latestEvent = await prisma.facebookEvent.findFirst({
            orderBy: { updatedAt: 'desc' },
            select: { updatedAt: true }
        });
        const count = await prisma.facebookEvent.count();
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        if (count === 0) {
            shouldSync = true;
            awaitSync = true;
        } else if (latestEvent && latestEvent.updatedAt < sixHoursAgo) {
            shouldSync = true;
        }
    }

    if (pageId && accessToken && shouldSync) {
        const syncFn = async () => {
            try {
                const fields = "id,name,description,start_time,end_time,cover,place";
                const upcomingUrl = `https://graph.facebook.com/v19.0/${pageId}/events?fields=${fields}&time_filter=upcoming&access_token=${accessToken}`;
                const sinceTimestamp = 1593813600; // 2020-07-04
                const pastUrl = `https://graph.facebook.com/v19.0/${pageId}/events?fields=${fields}&time_filter=past&since=${sinceTimestamp}&limit=50&access_token=${accessToken}`;

                const [upcomingRes, pastRes] = await Promise.all([
                    fetch(upcomingUrl, { next: { revalidate: 3600 } }),
                    fetch(pastUrl, { next: { revalidate: 3600 } }),
                ]);

                let apiEvents: FacebookApiEvent[] = [];
                if (upcomingRes.ok) {
                    const data = await upcomingRes.json();
                    apiEvents = [...apiEvents, ...(data.data || [])];
                }
                if (pastRes.ok) {
                    const data = await pastRes.json();
                    apiEvents = [...apiEvents, ...(data.data || [])];
                }

                if (apiEvents.length > 0) {
                    // Sync events
                    for (const event of apiEvents) {
                        const existing = await prisma.facebookEvent.findUnique({
                            where: { id: event.id },
                            select: { nameEn: true, descriptionEn: true, placeEn: true }
                        });

                        const coverUrl = event.cover?.source;
                        const localCover = coverUrl ? await downloadFacebookImage(coverUrl, event.id, 'events') : null;

                        // Automatic Translation - ONLY if missing
                        const nameEn = (existing?.nameEn) ? existing.nameEn : await translateText(event.name || '', 'en');
                        const descriptionEn = (existing?.descriptionEn) ? existing.descriptionEn : (event.description ? await translateText(event.description, 'en') : null);
                        const placeEn = (existing?.placeEn) ? existing.placeEn : (event.place?.name ? await translateText(event.place.name, 'en') : null);

                        await prisma.facebookEvent.upsert({
                            where: { id: event.id },
                            create: {
                                id: event.id,
                                name: event.name,
                                nameEn: nameEn,
                                description: event.description,
                                descriptionEn: descriptionEn,
                                startTime: new Date(event.start_time),
                                endTime: event.end_time ? new Date(event.end_time) : null,
                                coverUrl: coverUrl,
                                localCoverPath: localCover,
                                place: event.place?.name,
                                placeEn: placeEn,
                            },
                            update: {
                                name: event.name,
                                nameEn: nameEn,
                                description: event.description,
                                descriptionEn: descriptionEn,
                                startTime: new Date(event.start_time),
                                endTime: event.end_time ? new Date(event.end_time) : null,
                                coverUrl: coverUrl,
                                place: event.place?.name,
                                placeEn: placeEn,
                                ...(localCover ? { localCoverPath: localCover } : {}),
                            }
                        });

                        await new Promise(r => setTimeout(r, 600)); // Delay to avoid 429
                    }
                }
            } catch (error) {
                console.error("Failed to fetch/sync Facebook events:", error);
            }
        };

        if (awaitSync) {
            await syncFn();
        } else {
            console.log("[Facebook] Triggering background non-blocking event sync since DB has records...");
            syncFn().catch(e => console.error("Background event sync error:", e));
        }
    }

    // Always fetch from DB to respect isVisible (if we add it later) and ensure consistency
    try {
        const dbEvents = await prisma.facebookEvent.findMany({
            where: { isVisible: true },
            orderBy: { startTime: 'desc' }
        });

        return dbEvents.map((e: any) => ({
            id: e.id,
            name: e.name,
            nameEn: e.nameEn || undefined,
            description: e.description || undefined,
            descriptionEn: e.descriptionEn || undefined,
            start_time: e.startTime.toISOString(),
            end_time: e.endTime?.toISOString(),
            cover: (e.localCoverPath || e.coverUrl) ? { source: e.localCoverPath || e.coverUrl! } : undefined,
            place: e.place ? { name: e.place } : undefined,
            placeEn: e.placeEn ? { name: e.placeEn } : undefined
        }));
    } catch (e) {
        return [];
    }
}

export async function getFacebookPosts(options: { forceRefresh?: boolean } = {}): Promise<FacebookData> {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    let profilePicture: string | null = null;
    let shouldSync = options.forceRefresh;
    let awaitSync = options.forceRefresh || false;

    // Auto-sync in development if DB is empty or data is older than 24h
    if (process.env.NODE_ENV === 'development' && !shouldSync) {
        try {
            const latestPost = await prisma.facebookPost.findFirst({
                orderBy: { updatedAt: 'desc' },
                select: { updatedAt: true }
            });

            const count = await prisma.facebookPost.count();

            // Sync if empty OR if latest update was > 24h ago
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            if (count === 0) {
                console.log("[Facebook] Local DB is empty, triggering initial sync...");
                shouldSync = true;
                awaitSync = true;
            } else if (latestPost && latestPost.updatedAt < twentyFourHoursAgo) {
                console.log("[Facebook] Data is older than 24h, triggering background sync...");
                shouldSync = true;
            }
        } catch (e) {
            console.error("[Facebook] Error checking sync status", e);
        }
    }

    if (pageId && accessToken && shouldSync) {
        const syncFn = async () => {
            try {
                const fields = "id,message,created_time,full_picture,permalink_url,likes.summary(true),status_type,attachments{title,description,url,type,media,target{id,url}}";
                const postsUrl = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=${fields}&access_token=${accessToken}&limit=10`;
                const pictureUrl = `https://graph.facebook.com/v19.0/${pageId}/picture?type=large&redirect=false&access_token=${accessToken}`;

                const fetchOptions: RequestInit = { cache: 'no-store' };

                const [postsRes, pictureRes] = await Promise.all([
                    fetch(postsUrl, fetchOptions),
                    fetch(pictureUrl, { next: { revalidate: 86400 } }) // Profile pic changes rarely
                ]);

                if (postsRes.ok) {
                    const postsData = await postsRes.json();
                    const rawPosts = (postsData.data || []) as FacebookApiPost[];
                    console.log(`[Facebook Sync] Processing ${rawPosts.length} posts...`);

                    // Get deleted posts to exclude
                    const deletedPosts = await prisma.deletedFacebookPost.findMany({ select: { id: true } });
                    const deletedIds = new Set(deletedPosts.map((d: any) => d.id));

                    // Sync Posts
                    // Filter items with pictures for sync, or sync all? Previously filtered.
                    // We sync items that HAVE pictures to be consistent with previous logic
                    for (const post of rawPosts) {
                        if (deletedIds.has(post.id)) continue; // Skip deleted posts

                        try {
                            const firstAttach = post.attachments?.data?.[0];
                            if (firstAttach?.title === 'Attachment Unavailable' ||
                                firstAttach?.title === 'Ez a tartalom jelenleg nem érhető el' ||
                                post.message?.includes('Ez a tartalom jelenleg nem érhető el')) {
                                continue;
                            }

                            let enhancedAttachments = post.attachments;
                            let hadNetworkCall = false;

                            // Enhance Event Description
                            if (firstAttach && firstAttach.target?.id && (firstAttach.type === 'event' || firstAttach.type === 'native_templates')) {
                                console.log(`[Facebook Sync] Enhancing event ${firstAttach.target.id}`);
                                try {
                                    hadNetworkCall = true;
                                    const eventRes = await fetch(
                                        `https://graph.facebook.com/v19.0/${firstAttach.target.id}?fields=description&access_token=${accessToken}`,
                                        { cache: 'no-store' }
                                    );

                                    if (eventRes.ok) {
                                        const eventData = await eventRes.json();
                                        if (eventData.description) {
                                            console.log(`[Facebook Sync] Found description: ${eventData.description.substring(0, 20)}...`);
                                            // Deep copy to ensure modification sticks
                                            enhancedAttachments = JSON.parse(JSON.stringify(post.attachments));
                                            if (enhancedAttachments?.data?.[0]) {
                                                enhancedAttachments.data[0].description = eventData.description;
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.error('[Facebook Sync] Event fetch error', e);
                                }
                            }

                            const existing = await prisma.facebookPost.findUnique({
                                where: { id: post.id },
                                select: { messageEn: true }
                            });

                            let localPath: string | null = null;
                            if (post.full_picture) {
                                // Check if we need to download (downloadFacebookImage checks if exists internally but we still count it)
                                const publicDir = path.join(process.cwd(), 'public');
                                const targetPath = path.join(publicDir, 'uploads', 'posts', `${post.id}${post.full_picture.includes('.png') ? '.png' : '.jpg'}`);
                                
                                try {
                                    const fsNode = await import('fs/promises');
                                    await fsNode.access(targetPath);
                                    localPath = `/uploads/posts/${post.id}${post.full_picture.includes('.png') ? '.png' : '.jpg'}`;
                                } catch {
                                    hadNetworkCall = true;
                                    localPath = await downloadFacebookImage(post.full_picture, post.id, 'posts');
                                }
                            }

                            // Automatic Translation - ONLY if missing
                            let messageEn = existing?.messageEn;
                            if (!messageEn) {
                                hadNetworkCall = true;
                                messageEn = await translateText(post.message || '', 'en');
                            }

                            await prisma.facebookPost.upsert({
                                where: { id: post.id },
                                create: {
                                    id: post.id,
                                    message: post.message,
                                    messageEn: messageEn,
                                    createdTime: new Date(post.created_time),
                                    fullPicture: post.full_picture,
                                    localImagePath: localPath,
                                    permalinkUrl: post.permalink_url,
                                    likes: post.likes?.summary?.total_count || 0,
                                    attachments: enhancedAttachments ? JSON.stringify(enhancedAttachments) : null
                                },
                                update: {
                                    message: post.message,
                                    messageEn: messageEn,
                                    likes: post.likes?.summary?.total_count || 0,
                                    permalinkUrl: post.permalink_url,
                                    attachments: enhancedAttachments ? JSON.stringify(enhancedAttachments) : null,
                                    ...(localPath ? { localImagePath: localPath } : {}),
                                }
                            });
                            
                            if (hadNetworkCall) {
                                await new Promise(r => setTimeout(r, 600)); // Delay only to avoid 429 when network calls were made
                            }
                        } catch (err) {
                            console.error(`[Facebook Sync] Error syncing post ${post.id}:`, err);
                        }
                    }
                } else {
                    const errorData = await postsRes.json().catch(() => ({}));
                    console.error(`[Facebook Sync] API Error: ${postsRes.status} ${postsRes.statusText}`, errorData);
                }

                if (pictureRes.ok) {
                    const pictureData = await pictureRes.json();
                    const url = pictureData.data?.url;
                    if (url) {
                        const localPath = await downloadFacebookImage(url, 'profile-pic', 'system');
                        profilePicture = localPath || url;
                    }
                }
            } catch (error) {
                console.error("Sync failed:", error);
            }
        };

        if (awaitSync) {
            await syncFn();
        } else {
            console.log("[Facebook] Triggering background non-blocking sync since DB has records...");
            syncFn().catch(e => console.error("Background sync error:", e));
        }
    }

    // FETCH FROM DB
    try {
        const dbPosts = await prisma.facebookPost.findMany({
            where: { isVisible: true },
            orderBy: { createdTime: 'desc' },
            take: 10
        });

        const mappedPosts = dbPosts.map((p: any) => ({
            id: p.id,
            message: p.message || undefined,
            messageEn: p.messageEn || undefined,
            created_time: p.createdTime.toISOString(),
            full_picture: p.localImagePath || p.fullPicture || undefined,
            permalink_url: p.permalinkUrl || "",
            customTitle: p.customTitle,
            customTitleEn: p.customTitleEn,
            likes: { summary: { total_count: p.likes } },
            attachments: p.attachments ? JSON.parse(p.attachments) : undefined
        }));

        // Ensure profile pic is available if not fetched in this turn
        if (!profilePicture) {
            const fs = await import('fs/promises');
            const path = await import('path');
            try {
                const picPath = path.join(process.cwd(), 'public', 'uploads', 'system', 'profile-pic.jpg');
                await fs.access(picPath);
                profilePicture = "/uploads/system/profile-pic.jpg";
            } catch { }
        }

        return { posts: mappedPosts, profilePicture };
    } catch (e) {
        console.error("DB Fetch failed", e);
        return { posts: [], profilePicture: null };
    }
}

export async function getNewsPosts(page = 1, limit = 50): Promise<FacebookData> {
    // Get profile pic
    let profilePicture: string | null = null;
    try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const picPath = path.join(process.cwd(), 'public', 'uploads', 'system', 'profile-pic.jpg');
        await fs.access(picPath);
        profilePicture = "/uploads/system/profile-pic.jpg";
    } catch { }

    try {
        const dbPosts = await prisma.facebookPost.findMany({
            where: { isVisible: true },
            orderBy: { createdTime: 'desc' },
            take: limit
        });

        const mappedPosts = dbPosts.map((p: any) => ({
            id: p.id,
            message: p.message || undefined,
            messageEn: p.messageEn || undefined,
            created_time: p.createdTime.toISOString(),
            full_picture: p.localImagePath || p.fullPicture || undefined,
            permalink_url: p.permalinkUrl || "",
            customTitle: p.customTitle,
            customTitleEn: p.customTitleEn,
            likes: { summary: { total_count: p.likes } },
            attachments: p.attachments ? JSON.parse(p.attachments) : undefined
        }));

        return { posts: mappedPosts, profilePicture };
    } catch (e) {
        console.error("News Fetch failed", e);
        return { posts: [], profilePicture: null };
    }
}


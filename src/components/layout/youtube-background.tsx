"use client";

import React, { useEffect, useRef, useState } from "react";

interface YoutubeBackgroundProps {
    videoId: string;
    start?: number;
    end?: number;
    isActive: boolean;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export function YoutubeBackground({ videoId, start = 0, end = 0, isActive }: YoutubeBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        // Load YouTube API script if not already loaded
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const initPlayer = () => {
            if (!containerRef.current) return;
            
            // Create a div for the player
            const playerDiv = document.createElement("div");
            playerDiv.style.pointerEvents = 'none'; // Absolutely prevent any interaction
            containerRef.current.innerHTML = ""; // Clear existing
            containerRef.current.appendChild(playerDiv);

            playerRef.current = new window.YT.Player(playerDiv, {
                videoId: videoId,
                width: '100%',
                height: '100%',
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    loop: 1, // Native loop for the whole video as fallback
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    mute: 1,
                    playsinline: 1,
                    start: start > 0 ? start : undefined,
                    playlist: videoId, // Required for native loop fallback
                },
                events: {
                    onReady: (event: any) => {
                        event.target.mute();
                        event.target.playVideo();
                        setIsReady(true);
                    },
                    onStateChange: (event: any) => {
                        // When it actually starts playing, we reveal the iframe to avoid showing the loading/play icon
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            setHasStarted(true);
                        }
                        
                        // If video ends natively (e.g. end time not set but reached the end)
                        if (event.data === window.YT.PlayerState.ENDED) {
                            event.target.seekTo(start > 0 ? start : 0, true);
                            event.target.playVideo();
                        }
                    }
                }
            });
        };

        // If API is already ready, init immediately
        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            // Otherwise wait for the callback
            const prevCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (prevCallback) prevCallback();
                initPlayer();
            };
        }

        return () => {
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }
        };
    }, [videoId, start]);

    // Interval to check for specific end time and loop back to start
    useEffect(() => {
        if (!isReady || !isActive) return;

        const interval = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
                const currentTime = playerRef.current.getCurrentTime();
                const duration = playerRef.current.getDuration();
                
                // If end is set, use it. Otherwise use the total duration minus a small buffer
                // to prevent the native YouTube "Ended" screen (which flashes a play/pause button).
                const targetEnd = (end && end > 0) ? end : (duration ? duration - 0.5 : 0);

                if (targetEnd > 0 && currentTime >= targetEnd) {
                    playerRef.current.seekTo(start > 0 ? start : 0, true);
                    playerRef.current.playVideo(); // ensure it keeps playing
                }
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isReady, start, end, isActive]);

    // Ensure it's playing if active
    useEffect(() => {
        if (isReady && playerRef.current && isActive) {
            playerRef.current.playVideo();
        }
    }, [isActive, isReady]);

    // Only show if it's both active AND has started playing (to hide the initial YT play button)
    const isVisible = isActive && hasStarted;

    return (
        <div className={`w-full h-full relative pointer-events-none transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-1/2 left-1/2 w-[300vw] md:w-[150vw] h-[300vh] md:h-[150vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div ref={containerRef} className="w-full h-full" />
            </div>
        </div>
    );
}

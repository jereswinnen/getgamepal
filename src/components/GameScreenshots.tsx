"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

interface Screenshot {
  id: number;
  url: string;
}

interface GameScreenshotsProps {
  screenshots: Screenshot[];
  gameName: string;
  autoplayInterval?: number;
}

export default function GameScreenshots({
  screenshots,
  gameName,
  autoplayInterval = 4000, // Default to 4 seconds
}: GameScreenshotsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer when component mounts or activeIndex changes
  useEffect(() => {
    if (!screenshots || screenshots.length <= 1) return;

    const startTimer = () => {
      if (isAutoplay) {
        // Clear any existing timer
        if (timerRef.current) clearTimeout(timerRef.current);

        // Set new timer
        timerRef.current = setTimeout(() => {
          setActiveIndex((prev) => (prev + 1) % screenshots.length);
        }, autoplayInterval);
      }
    };

    startTimer();

    // Cleanup function
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIndex, screenshots, isAutoplay, autoplayInterval]);

  // Pause autoplay when user interacts with thumbnails
  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    setIsAutoplay(false);
  };

  // Toggle autoplay on/off
  const toggleAutoplay = () => {
    setIsAutoplay((prev) => !prev);
  };

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">
        <span className="text-gray-500 dark:text-gray-400">
          No screenshots available
        </span>
      </div>
    );
  }

  // Format the screenshot URL to get a bigger image
  const formatScreenshotUrl = (url: string) => {
    return `https:${url.replace("t_thumb", "t_screenshot_big_2x")}`;
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full [&>*]:rounded-md">
        {screenshots.map((screenshot, index) => (
          <React.Fragment key={screenshot.id}>
            <Image
              src={formatScreenshotUrl(screenshot.url)}
              alt={`${gameName} screenshot ${index + 1}`}
              fill
              className={`absolute -z-10 translate-y-[2px] blur-md object-cover transition-opacity duration-800 ease-in-out ${
                index === activeIndex ? "opacity-30" : "opacity-0"
              }`}
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <Image
              src={formatScreenshotUrl(screenshot.url)}
              alt={`${gameName} screenshot ${index + 1}`}
              fill
              className={`object-cover transition-opacity duration-800 ease-in-out ${
                index === activeIndex ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </React.Fragment>
        ))}

        {screenshots.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 overflow-x-auto bg-gradient-to-b from-transparent to-black/80">
            {screenshots.map((screenshot, index) => (
              <button
                key={screenshot.id}
                onClick={() => handleThumbnailClick(index)}
                className={`relative aspect-square w-14 flex-shrink-0 overflow-hidden rounded-sm transition shadow cursor-pointer ${
                  index === activeIndex ? "ring-2 ring-white" : ""
                }`}
              >
                <Image
                  src={`https:${screenshot.url.replace(
                    "t_thumb",
                    "t_thumb_2x"
                  )}`}
                  alt={`${gameName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

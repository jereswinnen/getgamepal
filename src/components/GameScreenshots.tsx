"use client";

import Image from "next/image";
import { useState } from "react";

interface Screenshot {
  id: number;
  url: string;
}

interface GameScreenshotsProps {
  screenshots: Screenshot[];
  gameName: string;
}

export default function GameScreenshots({
  screenshots,
  gameName,
}: GameScreenshotsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-xl">
        <span className="text-gray-500 dark:text-gray-400">
          No screenshots available
        </span>
      </div>
    );
  }

  // Format the screenshot URL to get a bigger image
  const formatScreenshotUrl = (url: string) => {
    return `https:${url.replace("t_thumb", "t_screenshot_big")}`;
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={formatScreenshotUrl(screenshots[activeIndex].url)}
          alt={`${gameName} screenshot ${activeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>

      {screenshots.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {screenshots.map((screenshot, index) => (
            <button
              key={screenshot.id}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-video w-24 flex-shrink-0 overflow-hidden rounded-md transition ${
                index === activeIndex
                  ? "ring-2 ring-primary"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={`https:${screenshot.url.replace("t_thumb", "t_thumb")}`}
                alt={`${gameName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

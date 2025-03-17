"use client";

import Image from "next/image";

interface GameCoverBackgroundProps {
  coverUrl?: string;
  gameName: string;
}

export default function GameCoverBackground({
  coverUrl,
  gameName,
}: GameCoverBackgroundProps) {
  // Format the cover URL to get a bigger image if it exists
  const formattedCoverUrl = coverUrl
    ? `https:${coverUrl.replace("t_thumb", "t_1080p")}`
    : null;

  if (!formattedCoverUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden w-screen h-screen">
      <div className="absolute inset-0 bg-white/70 dark:bg-black/70 z-10" />
      <Image
        src={formattedCoverUrl}
        alt={`${gameName} background`}
        fill
        className="object-cover blur-xl saturate-115 scale-110 opacity-60"
        priority
        sizes="100vw"
      />
    </div>
  );
}

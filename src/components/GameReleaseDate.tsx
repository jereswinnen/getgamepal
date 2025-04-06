"use client";

import { format, isPast } from "date-fns";
import { Clock } from "@phosphor-icons/react";

interface GameReleaseDateProps {
  timestamp?: number; // Unix timestamp
  className?: string;
}

export default function GameReleaseDate({
  timestamp,
  className = "",
}: GameReleaseDateProps) {
  if (!timestamp) return null;

  const releaseDate = new Date(timestamp * 1000);
  const isReleased = isPast(releaseDate);

  const releaseDateDisplay = isReleased
    ? `${format(releaseDate, "MMM d, yyyy")}`
    : `${format(releaseDate, "MMM d, yyyy")}`;

  return (
    <p className={`flex items-center gap-1 ${className}`}>
      <Clock size={16} weight="bold" className="opacity-80" />
      {isReleased ? "Released on" : "Releases on"} {releaseDateDisplay}
    </p>
  );
}

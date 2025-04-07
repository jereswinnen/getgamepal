"use client";

import { useState } from "react";

interface Video {
  id: number;
  video_id: string;
  name?: string;
}

interface GameVideosProps {
  videos: Video[];
}

export default function GameVideos({ videos }: GameVideosProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!videos || videos.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-xl">
        <span className="text-gray-500 dark:text-gray-400">
          No videos available
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full overflow-hidden rounded-md">
        <iframe
          src={`https://www.youtube.com/embed/${videos[activeIndex].video_id}`}
          title={videos[activeIndex].name || `Game video ${activeIndex + 1}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>

      {videos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded-sm transition shadow cursor-pointer ${
                index === activeIndex
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                alt={video.name || `Video thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

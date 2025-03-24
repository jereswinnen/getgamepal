import Image from "next/image";

interface GameCoverProps {
  coverUrl?: string;
  gameName: string;
  className?: string;
  aspectRatio?: "3/4" | "1/1" | "16/9";
  sizes?: string;
}

export default function GameCover({
  coverUrl,
  gameName,
  className = "",
  aspectRatio = "3/4",
  sizes = "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: GameCoverProps) {
  // Format the cover URL to get a bigger image if it exists and ensure it has https protocol
  const formattedCoverUrl = coverUrl
    ? coverUrl.startsWith("//")
      ? `https:${coverUrl.replace("t_thumb", "t_cover_big_2x")}`
      : coverUrl.startsWith("http")
      ? coverUrl.replace("t_thumb", "t_cover_big_2x")
      : `https://${coverUrl.replace("t_thumb", "t_cover_big_2x")}`
    : null;

  return (
    <div
      className={`relative aspect-[${aspectRatio}] w-full overflow-hidden rounded-xl ${className}`}
    >
      {formattedCoverUrl ? (
        <Image
          src={formattedCoverUrl}
          alt={`${gameName} cover`}
          fill
          className="object-cover"
          sizes={sizes}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
          <span className="text-gray-500 dark:text-gray-400 text-sm text-center px-2">
            No cover available
          </span>
        </div>
      )}
    </div>
  );
}

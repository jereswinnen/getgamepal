"use client";

import React from "react";

interface SectionDividerProps {
  label?: string;
  className?: string;
}

export default function SectionDivider({
  label = "Section",
  className = "",
}: SectionDividerProps) {
  return (
    <div className={`w-full flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </span>
      )}
      <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

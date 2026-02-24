"use client";

import { Icon } from "@iconify/react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  color?: "primary" | "white" | "gray";
}

export default function Loader({
  size = "md",
  text,
  fullScreen = false,
  color = "primary",
}: LoaderProps) {
  const sizeClass = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }[size];

  const colorClass = {
    primary: "text-primary",
    white: "text-white",
    gray: "text-gray-400 dark:text-gray-600",
  }[color];

  const loader = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Icon
        icon="solar:refresh-linear"
        className={`${sizeClass} ${colorClass} animate-spin`}
        width="100%"
      />
      {text && (
        <p
          className={`text-sm ${
            color === "white"
              ? "text-white"
              : color === "gray"
                ? "text-black/60 dark:text-white/60"
                : "text-black/60 dark:text-white/60"
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-2xl">
          {loader}
        </div>
      </div>
    );
  }

  return loader;
}

"use client";

import { useEffect, useState } from "react";
import { useLoading } from "@/context/LoadingContext";

export default function LoadingBar() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { isLoading } = useLoading();

  useEffect(() => {
    let progressTimer;
    let hideTimer;

    if (isLoading) {
      setIsVisible(true);
      setProgress(0);
      // Quickly jump to 80% to indicate loading
      progressTimer = setTimeout(() => {
        setProgress(80);
      }, 100);
    } else if (progress > 0) {
      // When loading finishes, complete the progress bar
      setProgress(100);
      hideTimer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 400);
    }

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(hideTimer);
    };
  }, [isLoading, progress]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div 
        className="h-1 bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
} 
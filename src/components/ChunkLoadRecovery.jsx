"use client";

import { useEffect } from "react";

const isChunkLoadFailure = (value) => {
  const msg = String(value?.message || value || "");
  return (
    value?.name === "ChunkLoadError" ||
    msg.includes("Loading chunk") ||
    msg.includes("ChunkLoadError") ||
    msg.includes("Failed to fetch dynamically imported module")
  );
};

/**
 * Dev HMR and stale browser tabs often request old chunk URLs after a rebuild.
 * Reload once so the page picks up the latest webpack manifest.
 */
export default function ChunkLoadRecovery() {
  useEffect(() => {
    const reloadOnce = () => {
      try {
        const key = "ew_chunk_reload";
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
      } catch (_) {
        // ignore storage errors
      }
      window.location.reload();
    };

    const onError = (event) => {
      if (isChunkLoadFailure(event)) reloadOnce();
    };

    const onRejection = (event) => {
      if (isChunkLoadFailure(event?.reason)) reloadOnce();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}

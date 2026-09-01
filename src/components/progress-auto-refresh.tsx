"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProgressAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Refresh server data every 5 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    // Refresh immediately when user returns to the tab
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }

    // Refresh when window gets focus
    function handleFocus() {
      router.refresh();
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [router]);

  return null;
}
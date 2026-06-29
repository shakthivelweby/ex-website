"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

/** Shows a button loader while a client navigation is in progress. */
export function useNavigateWithLoading() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useCallback(
    (href) => {
      if (isNavigating) return;
      setIsNavigating(true);
      router.push(href);
    },
    [router, isNavigating]
  );

  return { isNavigating, navigate, setIsNavigating };
}

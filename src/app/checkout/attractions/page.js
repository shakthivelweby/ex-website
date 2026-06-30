"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageLoader from "@/components/loading/PageLoader";

/** Legacy route — redirects to the integrated booking page. */
export default function LegacyAttractionCheckoutRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const attractionId = searchParams.get("attraction_id");
    if (attractionId) {
      router.replace(`/attractions/${attractionId}/booking`);
      return;
    }
    router.replace("/attractions");
  }, [router, searchParams]);

  return <PageLoader message="Redirecting to booking..." />;
}

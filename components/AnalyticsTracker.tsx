"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/supabase";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef<string>("");

  useEffect(() => {
    // Avoid tracking in admin pages
    if (!pathname || pathname.startsWith("/admin")) return;

    const fullUrl = `${pathname}?${searchParams?.toString() || ""}`;
    if (lastTrackedRef.current === fullUrl) return;
    lastTrackedRef.current = fullUrl;

    let linea: "practica" | "premium" | "general" = "general";
    if (pathname.startsWith("/compra-facil") || pathname === "/practica") {
      linea = "practica";
    } else if (pathname.startsWith("/interiorismo") || pathname === "/premium") {
      linea = "premium";
    } else {
      const qLinea = searchParams?.get("linea");
      if (qLinea === "practica" || qLinea === "premium") {
        linea = qLinea as "practica" | "premium";
      } else {
        const stored = typeof window !== "undefined" ? localStorage.getItem("acasa_line") : null;
        if (stored === "practica" || stored === "premium") {
          linea = stored as "practica" | "premium";
        }
      }
    }

    // 1. Track page view
    trackAnalyticsEvent({
      event_type: "page_view",
      linea,
      path: pathname,
      metadata: {
        queryString: searchParams?.toString() || "",
      },
    });

    // 2. Track line entry if entering home/landing of that line
    if (pathname === "/compra-facil" || pathname === "/practica") {
      trackAnalyticsEvent({
        event_type: "line_entry",
        linea: "practica",
        path: pathname,
        metadata: { source: "direct_or_gateway" },
      });
    } else if (pathname === "/interiorismo" || pathname === "/premium") {
      trackAnalyticsEvent({
        event_type: "line_entry",
        linea: "premium",
        path: pathname,
        metadata: { source: "direct_or_gateway" },
      });
    }
  }, [pathname, searchParams]);

  return null;
}

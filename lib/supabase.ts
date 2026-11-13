import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rtjdydvndaqrokaaqcqh.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0amR5ZHZuZGFxcm9rYWFxY3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NzQ5NDIsImV4cCI6MjExMDE1MDk0Mn0.P1Vt4vxyHtNFexctFMR41b4GdQkRuwDkSvRxmr-K40w";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server_session";
  try {
    let sid = sessionStorage.getItem("acasa_session_id");
    if (!sid) {
      sid = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("acasa_session_id", sid);
    }
    return sid;
  } catch (_) {
    return `ses_${Date.now()}_rand`;
  }
}

export async function trackAnalyticsEvent(params: {
  event_type: "page_view" | "whatsapp_click" | "line_entry" | "add_to_cart" | "checkout_start";
  linea?: "practica" | "premium" | "general" | null;
  path?: string;
  metadata?: Record<string, any>;
}) {
  if (typeof window === "undefined") return;

  try {
    const sessionId = getOrCreateSessionId();
    const currentPath = params.path || window.location.pathname;

    let detectedLinea = params.linea;
    if (!detectedLinea) {
      if (currentPath.startsWith("/compra-facil") || currentPath === "/practica") {
        detectedLinea = "practica";
      } else if (currentPath.startsWith("/interiorismo") || currentPath === "/premium") {
        detectedLinea = "premium";
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const l = urlParams.get("linea");
        if (l === "practica" || l === "premium") {
          detectedLinea = l;
        } else {
          const stored = localStorage.getItem("acasa_line");
          if (stored === "practica" || stored === "premium") {
            detectedLinea = stored as "practica" | "premium";
          } else {
            detectedLinea = "general";
          }
        }
      }
    }

    const payload = {
      session_id: sessionId,
      event_type: params.event_type,
      linea: detectedLinea || "general",
      path: currentPath,
      metadata: {
        ...(params.metadata || {}),
        referrer: document.referrer || null,
        screen_width: window.innerWidth,
        user_agent: navigator.userAgent,
      },
    };

    await supabase.from("analytics_events").insert(payload);
  } catch (err) {
    console.debug("[Analytics]", err);
  }
}

export interface AnalyticsSummary {
  totalPageviews: number;
  uniqueVisitors: number;
  
  // Entradas y vistas por línea
  practicaTotalViews: number;
  premiumTotalViews: number;
  practicaEntries: number;
  premiumEntries: number;
  
  // Consultas WhatsApp
  whatsappTotalClicks: number;
  whatsappPracticaClicks: number;
  whatsappPremiumClicks: number;
  whatsappGeneralClicks: number;

  // Productos más consultados
  topConsultedProducts: {
    title: string;
    sku?: string;
    linea: string;
    clicks: number;
  }[];

  // Registro reciente
  recentEvents: {
    id: string;
    event_type: string;
    linea: string;
    path: string;
    created_at: string;
    metadata?: any;
  }[];
}

export async function getAnalyticsSummary(timeRange: "today" | "7d" | "30d" | "all" = "7d"): Promise<AnalyticsSummary> {
  try {
    let query = supabase
      .from("analytics_events")
      .select("id, event_type, linea, path, session_id, metadata, created_at")
      .order("created_at", { ascending: false });

    const now = new Date();
    if (timeRange === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      query = query.gte("created_at", startOfDay);
    } else if (timeRange === "7d") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", sevenDaysAgo);
    } else if (timeRange === "30d") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", thirtyDaysAgo);
    }

    const { data, error } = await query.limit(2000);

    if (error || !data) {
      console.error("Error fetching analytics events:", error);
      return getEmptySummary();
    }

    const totalPageviews = data.filter((e) => e.event_type === "page_view").length;
    const uniqueSessions = new Set(data.map((e) => e.session_id)).size;

    const practicaTotalViews = data.filter(
      (e) => e.linea === "practica" && e.event_type === "page_view"
    ).length;

    const premiumTotalViews = data.filter(
      (e) => e.linea === "premium" && e.event_type === "page_view"
    ).length;

    const practicaEntries = data.filter(
      (e) => e.event_type === "line_entry" && e.linea === "practica"
    ).length;

    const premiumEntries = data.filter(
      (e) => e.event_type === "line_entry" && e.linea === "premium"
    ).length;

    // WhatsApp Clicks
    const waEvents = data.filter((e) => e.event_type === "whatsapp_click");
    const whatsappTotalClicks = waEvents.length;
    const whatsappPracticaClicks = waEvents.filter((e) => e.linea === "practica").length;
    const whatsappPremiumClicks = waEvents.filter((e) => e.linea === "premium").length;
    const whatsappGeneralClicks = waEvents.filter((e) => !e.linea || e.linea === "general").length;

    // Top consulted products
    const productCounts: Record<string, { title: string; sku?: string; linea: string; clicks: number }> = {};
    waEvents.forEach((ev) => {
      const meta = ev.metadata || {};
      const title = meta.product_title;
      if (title) {
        if (!productCounts[title]) {
          productCounts[title] = {
            title,
            sku: meta.product_sku || "",
            linea: ev.linea || "practica",
            clicks: 0,
          };
        }
        productCounts[title].clicks += 1;
      }
    });

    const topConsultedProducts = Object.values(productCounts).sort((a, b) => b.clicks - a.clicks);

    return {
      totalPageviews,
      uniqueVisitors: uniqueSessions,
      practicaTotalViews,
      premiumTotalViews,
      practicaEntries,
      premiumEntries,
      whatsappTotalClicks,
      whatsappPracticaClicks,
      whatsappPremiumClicks,
      whatsappGeneralClicks,
      topConsultedProducts,
      recentEvents: data.slice(0, 20),
    };
  } catch (err) {
    console.error("Error aggregating analytics:", err);
    return getEmptySummary();
  }
}

function getEmptySummary(): AnalyticsSummary {
  return {
    totalPageviews: 0,
    uniqueVisitors: 0,
    practicaTotalViews: 0,
    premiumTotalViews: 0,
    practicaEntries: 0,
    premiumEntries: 0,
    whatsappTotalClicks: 0,
    whatsappPracticaClicks: 0,
    whatsappPremiumClicks: 0,
    whatsappGeneralClicks: 0,
    topConsultedProducts: [],
    recentEvents: [],
  };
}

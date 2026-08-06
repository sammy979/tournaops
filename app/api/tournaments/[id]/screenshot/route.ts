import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    
    const format = searchParams.get("format") || "youtube";
    const sizes: Record<string, { w: number; h: number }> = {
      youtube: { w: 1920, h: 1080 },
      instagram: { w: 1080, h: 1080 },
      story: { w: 1080, h: 1920 },
    };
    const { w, h } = sizes[format] || sizes.youtube;

    // Build preview URL
    const previewParams = new URLSearchParams();
    searchParams.forEach((v, k) => previewParams.set(k, v));
    const baseUrl = "http://localhost:3001";
    const previewUrl = baseUrl + "/preview/" + id + "?" + previewParams.toString();

    console.log("[SCREENSHOT] Loading:", previewUrl);
    
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    console.log("[SCREENSHOT] Browser launched");
    
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 2000, deviceScaleFactor: 2 });
    
    // Forward auth cookies
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map(c => {
        const [name, ...rest] = c.trim().split("=");
        return { name, value: rest.join("="), domain: "localhost", path: "/" };
      });
      try {
        await page.setCookie(...cookies as any);
      } catch (e) {
        console.warn("[SCREENSHOT] Cookie error:", e);
      }
    }
    
    await page.goto(previewUrl, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluate(() => (document as any).fonts?.ready);
    await new Promise(r => setTimeout(r, 1500));
    
    // Get the ACTUAL card element and screenshot just that
    const cardElement = await page.$("[data-broadcast-card]");
    if (!cardElement) {
      throw new Error("Card element not found in preview");
    }
    
    console.log("[SCREENSHOT] Taking screenshot of card...");
    const screenshot = await cardElement.screenshot({
      type: "png",
      omitBackground: false,
    });

    await browser.close();
    console.log("[SCREENSHOT] Done! Size:", (screenshot as any).length, "bytes");

    return new NextResponse(screenshot as any, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="standings.png"',
        "Cache-Control": "no-cache",
      },
    });
  } catch (err: any) {
    console.error("[SCREENSHOT] ERROR:", err.message);
    console.error(err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, lang } = await req.json();

    if (!text || !lang) {
      return NextResponse.json({ error: "Text and language are required" }, { status: 400 });
    }

    if (lang === "en") {
      return NextResponse.json({ translated: text });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();

    let translated = text;
    if (Array.isArray(data) && Array.isArray(data[0])) {
      translated = data[0].map((seg: unknown[]) => seg[0]).join("");
    }

    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}

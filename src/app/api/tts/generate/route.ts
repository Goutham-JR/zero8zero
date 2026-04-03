import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, lang, speed, translate } = await req.json();

    if (!text || !lang) {
      return NextResponse.json({ error: "Text and language are required" }, { status: 400 });
    }

    let finalText = text;

    // Translate English text to target language if requested
    if (translate && lang !== "en") {
      try {
        const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
        const tRes = await fetch(translateUrl);
        const tData = await tRes.json();
        if (Array.isArray(tData) && Array.isArray(tData[0])) {
          finalText = tData[0].map((seg: unknown[]) => seg[0]).join("");
        }
      } catch {
        // If translation fails, use original text
      }
    }

    const ttsSpeed = speed && speed < 0.8 ? 0.24 : 1;

    // Split text into chunks of ~200 chars for Google TTS
    const chunks = splitText(finalText, 200);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&total=1&idx=0&textlen=${chunk.length}&client=tw-ob&prev=input&ttsspeed=${ttsSpeed}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://translate.google.com/",
        },
      });

      if (!res.ok) {
        return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      audioBuffers.push(buffer);
    }

    const combined = Buffer.concat(audioBuffers);

    return new NextResponse(combined, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(combined.length),
      },
    });
  } catch (error) {
    console.error("TTS generate error:", error);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }
}

function splitText(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?।]+[.!?।]?\s*/g) || [text];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // Further split any chunk still over maxLen
  const result: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxLen) {
      result.push(chunk);
    } else {
      for (let i = 0; i < chunk.length; i += maxLen) {
        result.push(chunk.slice(i, i + maxLen));
      }
    }
  }
  return result;
}

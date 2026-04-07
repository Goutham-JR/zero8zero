import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, number, email, message } = await req.json();

    if (!name?.trim() || !number?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("DISCORD_WEBHOOK_URL not configured");
      return NextResponse.json({ error: "Contact service unavailable" }, { status: 503 });
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Zero8Zero",
        avatar_url: "https://zero8zero.com/favicon.ico",
        embeds: [{
          title: "New Contact Form Submission",
          description: `**${name}** has sent a message from the Zero8Zero website.`,
          color: 0x4A35E0,
          thumbnail: {
            url: "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=4A35E0&color=fff&size=128&bold=true",
          },
          fields: [
            { name: "\ud83d\udc64 Name", value: `\`${name}\``, inline: true },
            { name: "\ud83d\udcde Phone", value: `\`${number}\``, inline: true },
            { name: "\ud83d\udce7 Email", value: `\`${email}\``, inline: true },
            { name: "\ud83d\udcac Message", value: `>>> ${message}` },
          ],
          footer: {
            text: "Zero8Zero Contact Form \u2022 Cloud Central",
            icon_url: "https://ui-avatars.com/api/?name=Z8Z&background=4A35E0&color=fff&size=32&bold=true",
          },
          timestamp: new Date().toISOString(),
        }],
      }),
    });

    if (res.ok || res.status === 204) {
      return NextResponse.json({ status: "ok" });
    }

    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

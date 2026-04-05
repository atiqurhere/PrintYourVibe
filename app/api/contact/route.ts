import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;
  const TO_EMAIL   = process.env.CONTACT_TO_EMAIL || "hello@printyourvibe.co.uk";

  if (!RESEND_KEY) {
    // Log and still return success so the user isn't blocked
    console.warn("[Contact] RESEND_API_KEY not set — email not sent but contact logged.");
    console.log("[Contact]", { name, email, subject, message });
    return NextResponse.json({ ok: true });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    "PrintYourVibe Contact <noreply@printyourvibe.co.uk>",
      to:      [TO_EMAIL],
      reply_to: email,
      subject: `[Contact] ${subject || "New message"} — ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject || "—"}</p>
        <hr />
        <pre style="white-space: pre-wrap; font-family: inherit;">${message}</pre>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[Contact] Resend error:", err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

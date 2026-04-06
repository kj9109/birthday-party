import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { setKey } from "@/lib/db";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_SITE_URL || "https://partyfordaria.com"}/api/calendar/oauth-callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Store refresh token in KV for persistence
    await setKey("google_calendar_tokens", {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
      scope: tokens.scope,
    });

    return new NextResponse(
      `<html><body style="font-family:system-ui;text-align:center;padding:60px;">
        <h1 style="color:#D4AF37;">Calendar Connected!</h1>
        <p>Google Calendar authorization successful. The RSVP system will now auto-add guests to your calendar events.</p>
        <p style="color:#888;font-size:14px;">You can close this tab.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err: any) {
    console.error("[OAuth] Token exchange failed:", err);
    return NextResponse.json(
      { error: "OAuth failed", message: err?.message },
      { status: 500 }
    );
  }
}

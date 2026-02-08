/**
 * GET /api/admin/telegram/get-updates
 * Returns recent Telegram chat IDs that messaged the bot (for linking to staff).
 * Admin auth required. Requires TELEGRAM_BOT_TOKEN.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth/admin";
import { unauthorized, serverError } from "@/lib/api/response";

type TelegramUpdate = {
  update_id: number;
  message?: {
    chat: {
      id: number;
      type: string;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  };
};

type GetUpdatesResponse = {
  ok: boolean;
  result?: TelegramUpdate[];
  description?: string;
};

export type TelegramChatSummary = {
  chatId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  display: string;
};

export async function GET(request: NextRequest) {
  if (!requireAdminAuth(request)) {
    return unauthorized();
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN not set" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getUpdates?limit=50`,
      { next: { revalidate: 0 } }
    );
    const data = (await res.json()) as GetUpdatesResponse;

    if (!data.ok || !Array.isArray(data.result)) {
      return NextResponse.json(
        { error: data.description ?? "Telegram API error" },
        { status: 502 }
      );
    }

    const seen = new Set<number>();
    const chats: TelegramChatSummary[] = [];

    for (const u of data.result) {
      const chat = u.message?.chat;
      if (!chat || seen.has(chat.id)) continue;
      seen.add(chat.id);

      const display = [chat.first_name, chat.last_name].filter(Boolean).join(" ") ||
        chat.username ||
        String(chat.id);
      chats.push({
        chatId: String(chat.id),
        username: chat.username,
        firstName: chat.first_name,
        lastName: chat.last_name,
        display: display.trim() || String(chat.id),
      });
    }

    return NextResponse.json({ chats });
  } catch (e) {
    console.error("[api/admin/telegram/get-updates]", e);
    return serverError();
  }
}

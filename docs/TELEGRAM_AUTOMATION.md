# Telegram automation — lawyer notifications

When a client pays (**online** via Stripe or **in person** and you record the payment in the receipt page), the assigned lawyer receives a Telegram message with:
- **Client name** and **phone number**
- **Service** and **date/time**
- **Amount paid**
- **Online** or **In sede** (in person)
- **Video link** (only for online consultations)

The lawyer gets this on their phone or desktop — no need to open the admin dashboard.

---

## What you need

1. **Telegram bot** — You already created one via [@BotFather](https://t.me/BotFather) and have the token.
2. **`TELEGRAM_BOT_TOKEN`** — Set in Vercel (or `.env`). You have this.
3. **Lawyer’s chat ID** — The bot must know *where* to send the message. Each staff member who should receive notifications needs their Telegram **chat ID** stored in the database.

---

## Getting the lawyer’s chat ID (recommended: admin page)

The **Telegram** item in the admin menu is only for this one-time setup: getting the lawyer’s chat ID and linking it to their staff profile. The lawyer does not use the dashboard for Telegram; they only receive messages on their phone.

1. The **lawyer** opens Telegram and sends **any message** to your bot (e.g. `/start` or “Ciao”).
2. You (admin) go to **Admin → Telegram** in the dashboard.
3. Click **“Recupera chat”** / **“Fetch chat IDs”**. The page shows everyone who recently messaged the bot.
4. You see a list like: `123456789 — Mario Rossi` (or the username).
5. In **“Link to staff”**, select the lawyer and assign that chat ID (dropdown or paste the number), then click **Save**.
6. Done. From then on, every paid booking assigned to that lawyer (online or in person) will trigger a Telegram message with client name, phone, amount, and video link (if online).

The chat ID is stored in the `staff` table, column `telegram_chat_id`.

---

## Alternative: get chat ID manually

If you prefer not to use the admin page:

1. Lawyer sends a message to the bot.
2. Open in the browser (replace `YOUR_BOT_TOKEN` with your real token):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
3. In the JSON, find `"message":{"chat":{"id": 123456789, ...}}`. The number `123456789` is the chat ID.
4. In **Supabase** → Table **`staff`** → find the lawyer’s row → set **`telegram_chat_id`** to `123456789` (as text).

**Note:** Don’t share the URL with the token; use it only on your machine.

---

## When the notification is sent

1. **Online payment (Stripe):** When the Stripe webhook receives `checkout.session.completed`, the appointment is confirmed, the video room is created, and if the assigned staff has `telegram_chat_id` set, the lawyer gets a Telegram message (client name, phone, amount, service, date/time, “Online”, and video link).

2. **In-person payment:** When you record the payment on the receipt page (Admin → Appointments → Print receipt → “Record payment” and Save), if the appointment has an assigned staff with `telegram_chat_id`, the lawyer gets the same style of message (client name, phone, amount, service, date/time, “In sede”, no video link).

---

## Troubleshooting

| Problem | Check |
|--------|--------|
| Lawyer doesn’t get Telegram | `TELEGRAM_BOT_TOKEN` set in Vercel? Staff row has `telegram_chat_id`? Appointment has `assigned_staff_id`? |
| “No chats found” after Fetch | Lawyer must send a **new** message to the bot, then click Fetch again. |
| “TELEGRAM_BOT_TOKEN not set” | Add the token in Vercel (Environment variables) and redeploy. |

---

## Technical summary

- **Notification function:** `lib/notifications/index.ts` → `notifyLawyerTelegram()`.
- **Called from:** `app/api/webhooks/stripe/route.ts` after confirming the appointment and creating the video room.
- **Admin APIs:**  
  - `GET /api/admin/telegram/get-updates` — returns recent chat IDs from the bot.  
  - `GET /api/admin/staff` — list staff.  
  - `PATCH /api/admin/staff/[id]` — set `telegramChatId` for a staff member.

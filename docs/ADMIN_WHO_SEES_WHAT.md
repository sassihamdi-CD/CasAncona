# Who sees what: Secretary vs Lawyer

- **Secretary** (or staff who manage bookings) use the **admin dashboard** on their computer: they see appointments, create walk-in appointments, and can open the **video link** from the dashboard (Appointments → "Video" column → "Open video").
- **Lawyer** (different computer): the lawyer gets the **appointment time and video link** automatically when a client pays, so they don’t have to log into the dashboard.

---

## How the lawyer gets the video link and time

When a client completes an online payment (Stripe), the system:

1. Creates/updates the appointment with the video room link.
2. Sends an **email** to the **client** (confirmation with date, time, and video link).
3. Sends a **Telegram** message to the **lawyer** (the staff member assigned to that slot) with:
   - Client name  
   - Service  
   - Date and time  
   - **Video link**

So the **lawyer** receives the video link and time on **Telegram** (phone or desktop). They don’t need to open the dashboard.

---

## What you need for the lawyer to receive Telegram notifications

1. **Telegram bot**  
   Create a bot (e.g. with @BotFather), get the token, and add it in Vercel (and local `.env`) as **`TELEGRAM_BOT_TOKEN`**.

2. **Lawyer’s Telegram Chat ID**  
   The lawyer must start a chat with the bot (e.g. send `/start`). Then you need their **chat ID** and store it in the database:
   - In **Supabase** → Table Editor → **staff**  
   - Find the row for the lawyer (the one used when assigning appointments to that lawyer).  
   - Set **`telegram_chat_id`** to the lawyer’s chat ID (numeric, e.g. `123456789`).

When an online appointment is assigned to that lawyer and the client pays, the webhook sends the Telegram message to that `telegram_chat_id`, so the lawyer gets the video link and time on their device.

---

## Summary

| Person     | Where they work        | How they get the video link and time                    |
|-----------|------------------------|---------------------------------------------------------|
| Secretary | Admin dashboard (their PC) | Opens **Appointments** → clicks **Open video** in the list. |
| Lawyer    | Their own computer/phone | Gets a **Telegram** message with time + video link (if bot and `telegram_chat_id` are set). |

If Telegram is not set up, the lawyer can still get the link from the secretary (who sees it in the dashboard) or by logging into the dashboard themselves.

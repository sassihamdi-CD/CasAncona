# Brevo Email Setup (Booking Confirmations)

This guide explains how to configure Brevo so clients receive booking confirmation emails with their appointment details and online video link (for video consultations).

## 1. Brevo Account

You’ve already subscribed to Brevo. If not: sign up at [brevo.com](https://www.brevo.com).

## 2. Get the Right API Key

Brevo provides different API keys. For sending transactional emails, you need the **SMTP & API key**.

1. In Brevo: **SMTP & API** → **API Keys**
2. Create or copy an API key (format `xkeysib-...`)
3. ⚠️ **Do not use the “MCP API key”** — that’s for connecting AI tools to Brevo. Use the regular **transactional API key**.

## 3. Register a Sender (Required)

Before Brevo can send emails, you must register and verify a sender:

1. Brevo → **Senders** → **Add a sender**
2. Enter:
   - **Sender name:** e.g. `Studio CAS` or your firm name
   - **Sender email:** a verified email such as `noreply@yourdomain.com` or `prenotazioni@yourdomain.com`
3. Verify the sender by:
   - Adding the DNS records Brevo provides (SPF, DKIM), or
   - Using Brevo’s test sender for development (e.g. `hello@brevo.com` if they provide it)

See [Brevo: Create a sender](https://help.brevo.com/hc/en-us/articles/208836149-Create-a-new-sender-From-name-and-From-email).

## 4. Environment Variables

Add these to your `.env` (and to your hosting provider, e.g. Vercel):

```bash
# Brevo ( transactional emails )
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Studio CAS
```

| Variable          | Description |
|-------------------|-------------|
| `BREVO_API_KEY`   | Your Brevo API key from SMTP & API → API Keys |
| `EMAIL_FROM`      | Verified sender email (must match a registered Brevo sender) |
| `EMAIL_FROM_NAME` | Optional. Sender display name; defaults to `Studio CAS` |

## 5. What Clients Receive

After payment, clients receive an email containing:

- **Subject:** `Conferma prenotazione — [Service Name]`
- **Body:**
  - Greeting with their name
  - Service name
  - Date and time of the appointment
  - **Video link** (for online consultations only) — they can join the Jitsi room from this link
  - Reminder to open the link a few minutes before the appointment

## 6. Flow in the App

1. Client completes booking and pays (Stripe).
2. Stripe webhook `checkout.session.completed` is received.
3. For online consultations, a video room (Jitsi) is created.
4. Confirmation email is sent via Brevo with all details including the video URL.
5. Lawyer is notified via Telegram (if configured).

## 7. Troubleshooting

| Issue                         | Check |
|------------------------------|-------|
| No emails sent               | Ensure `BREVO_API_KEY` and `EMAIL_FROM` are set in `.env` and the server was restarted. |
| Emails not delivered          | Verify the sender in Brevo and that DNS (SPF/DKIM) is configured. |
| Wrong API key type           | Use the SMTP & API key, not the MCP key. |
| Wrong sender email           | `EMAIL_FROM` must match a verified sender in Brevo. |

## 8. Testing

1. Run a test booking (Stripe test mode).
2. Complete payment.
3. Check the client’s inbox (and spam folder).
4. For online consultations, the email should include a link like `https://meet.jit.si/StudioCAS-{id}`.

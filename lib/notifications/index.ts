/**
 * Notifications: Brevo (email) and Telegram.
 * Set BREVO_API_KEY + EMAIL_FROM + EMAIL_FROM_NAME for email; TELEGRAM_BOT_TOKEN for Telegram.
 *
 * Brevo: https://www.brevo.com — get your API key from SMTP & API → API Keys.
 * You must register a verified sender (from name/email) in Brevo before sending.
 */

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("it-IT", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Rome",
    });
  } catch {
    return iso;
  }
}

export async function sendBookingConfirmationEmail(params: {
  to: string;
  clientName: string;
  serviceName: string;
  requestedStartAt: string;
  videoRoomUrl: string | null;
}): Promise<void> {
  const { to, clientName, serviceName, requestedStartAt, videoRoomUrl } = params;
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME ?? "Studio CAS";

  if (!apiKey) {
    console.log("[notifications] sendBookingConfirmationEmail skipped (no BREVO_API_KEY):", to);
    return;
  }
  if (!fromEmail) {
    console.log("[notifications] sendBookingConfirmationEmail skipped (no EMAIL_FROM):", to);
    return;
  }

  const dateTime = formatDateTime(requestedStartAt);
  const html = `
    <h2>Conferma prenotazione</h2>
    <p>Ciao ${escapeHtml(clientName)},</p>
    <p>La tua consulenza è confermata.</p>
    <ul>
      <li><strong>Servizio:</strong> ${escapeHtml(serviceName)}</li>
      <li><strong>Data e ora:</strong> ${escapeHtml(dateTime)}</li>
      ${videoRoomUrl ? `<li><strong>Link video:</strong> <a href="${escapeHtml(videoRoomUrl)}">Apri la video consulenza</a></li>` : ""}
    </ul>
    ${videoRoomUrl ? `<p>Apri il link sopra pochi minuti prima dell'orario per unirti alla videochiamata.</p>` : ""}
    <p>— Studio CAS</p>
  `;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: to, name: clientName }],
        subject: `Conferma prenotazione — ${serviceName}`,
        htmlContent: html,
      }),
    });

    const data = (await res.json()) as { messageId?: string; code?: string; message?: string };
    if (!res.ok) {
      console.error("[notifications] Brevo error:", res.status, data);
      return;
    }
    console.log("[notifications] Email sent:", data.messageId ?? "ok");
  } catch (e) {
    console.error("[notifications] sendBookingConfirmationEmail failed:", e);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Format amount for display (e.g. 10000 cents + eur → "100,00 €") */
function formatAmount(cents: number | null, currency: string): string {
  if (cents == null) return "—";
  const amount = (cents / 100).toFixed(2).replace(".", ",");
  const c = (currency || "eur").toUpperCase();
  if (c === "EUR") return `${amount} €`;
  return `${amount} ${c}`;
}

export async function notifyLawyerTelegram(params: {
  telegramChatId: string;
  clientName: string;
  clientPhone: string | null;
  serviceName: string;
  requestedStartAt: string;
  amountPaidCents: number | null;
  currency: string | null;
  consultationType: "online" | "in_person";
  videoRoomUrl: string | null;
}): Promise<void> {
  const {
    telegramChatId,
    clientName,
    clientPhone,
    serviceName,
    requestedStartAt,
    amountPaidCents,
    currency,
    consultationType,
    videoRoomUrl,
  } = params;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.log("[notifications] notifyLawyerTelegram skipped (no TELEGRAM_BOT_TOKEN)");
    return;
  }

  const dateTime = formatDateTime(requestedStartAt);
  const amountStr = formatAmount(amountPaidCents, currency ?? "eur");
  const typeLabel = consultationType === "online" ? "Online" : "In sede";

  const lines = [
    "📅 Nuova prenotazione confermata (pagata)",
    "",
    `👤 Cliente: ${clientName}`,
    clientPhone ? `📞 Tel: ${clientPhone}` : null,
    `📋 Servizio: ${serviceName}`,
    `🕐 Quando: ${dateTime}`,
    `💰 Importo: ${amountStr}`,
    `📍 Tipo: ${typeLabel}`,
  ].filter(Boolean) as string[];

  if (videoRoomUrl) {
    lines.push("");
    lines.push(`🔗 Video: ${videoRoomUrl}`);
  }

  const text = lines.join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const data = (await res.json()) as { ok?: boolean; description?: string };
    if (!data.ok) {
      console.error("[notifications] Telegram error:", data.description);
      return;
    }
    console.log("[notifications] Telegram sent to", telegramChatId);
  } catch (e) {
    console.error("[notifications] notifyLawyerTelegram failed:", e);
  }
}

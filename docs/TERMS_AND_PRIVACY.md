# Terms and conditions / Privacy policy

The site has two legal pages for European compliance (payments, personal data, GDPR):

- **Terms and conditions** (Termini e condizioni): `/termini-condizioni` (or `/it/termini-condizioni`, `/en/termini-condizioni`, etc.)
- **Privacy policy** (Informativa sulla privacy): `/privacy`

Both are linked in the **footer** of every page.

---

## Content (templates)

The text is **template content** suitable for:

- Acceptance of terms when booking and paying
- Description of services, booking, payment (Stripe; no card data stored)
- Cancellation and liability
- **Privacy**: data controller (Studio CAS), data collected (identity, contact, payment via Stripe, documents), legal basis, retention, **GDPR rights** (access, rectification, erasure, portability, objection, complaint to Garante), security, cookies, contact

The **lawyer must review and adapt** the wording to the actual practice (e.g. cancellation/refund policy, retention periods, any specific disclosures). The structure and EU/GDPR-related sections are in place.

---

## Where to edit the text

- **Italian (IT)** and **English (EN)** full text: `messages/it.json` and `messages/en.json` → keys `terms.*` and `privacy.*`.
- **French (FR)** and **Arabic (AR)**: `messages/fr.json` and `messages/ar.json` → same keys (currently shorter versions; can be expanded to match IT/EN).

After editing, rebuild/redeploy so the changes appear on the site.

---

## “Last updated” date

The pages show “Last updated: 2025”. To change the date, add a key e.g. `lastUpdateDate` in the `terms` and `privacy` namespaces and use it in the page component, or edit the page component directly (currently it shows the year only).

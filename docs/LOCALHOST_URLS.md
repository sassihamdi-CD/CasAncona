# Working URLs on localhost

After `npm run dev`, the app runs at **http://localhost:3000** (or 3001 / 3002 if 3000 is in use — check the terminal).

---

## Page URLs (with locale)

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Redirects to default locale (e.g. `/it`) |
| http://localhost:3000/it | Home (Italian) |
| http://localhost:3000/en | Home (English) |
| http://localhost:3000/fr | Home (French) |
| http://localhost:3000/ar | Home (Arabic) |
| http://localhost:3000/it/servizi | Servizi online |
| http://localhost:3000/it/chi-siamo | Chi siamo |
| http://localhost:3000/it/contatti | Contatti |
| http://localhost:3000/it/book | Prenota (booking) |
| http://localhost:3000/it/booking/confirm | Confirmation (`?appointment_id=...` or `?session_id=...`) |

Same paths work for `/en`, `/fr`, `/ar` (e.g. http://localhost:3000/en/book).

---

## API URLs (no locale prefix)

| Method | URL | Description |
|--------|-----|-------------|
| GET | http://localhost:3000/api/services | List active services |
| GET | http://localhost:3000/api/slots?date=YYYY-MM-DD&serviceId=UUID | Available slots |
| POST | http://localhost:3000/api/booking | Create booking (JSON body) |
| GET | http://localhost:3000/api/booking/confirm?session_id=... or ?appointment_id=... | Booking details for confirmation page |
| GET | http://localhost:3000/api/admin/appointments | List appointments (header `x-admin-key` if `ADMIN_API_KEY` set) |

/**
 * Admin dashboard UI strings — Italian and English only.
 * Locale is stored in localStorage (client); admin routes stay /admin (no URL locale).
 */

export type AdminLocale = "it" | "en";

export const adminMessages: Record<
  AdminLocale,
  {
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      signIn: string;
      signingIn: string;
      loginFailed: string;
      connectionError: string;
      footerHint: string;
    };
    shell: {
      adminTitle: string;
      navDashboard: string;
      navAppointments: string;
      navServices: string;
      logout: string;
      language: string;
    };
    dashboard: {
      title: string;
      today: string;
      appointments: string;
      next7Days: string;
      activeServices: string;
      ofTotal: string;
      panel: string;
      panelDesc: string;
      quickAccess: string;
      viewAppointments: string;
      editServices: string;
    };
    appointments: {
      title: string;
      refresh: string;
      loading: string;
      noAppointments: string;
      dateTime: string;
      client: string;
      service: string;
      type: string;
      status: string;
      video: string;
      openVideo: string;
      online: string;
      inPerson: string;
      note: string;
      sessionExpired: string;
      loadError: string;
    };
    services: {
      title: string;
      addService: string;
      description: string;
      noServices: string;
      name: string;
      active: string;
      yes: string;
      no: string;
      order: string;
      duration: string;
      price: string;
      actions: string;
      edit: string;
      deactivate: string;
      reactivate: string;
      sessionExpired: string;
      loadError: string;
      errorDeactivate: string;
      errorReactivate: string;
    };
    serviceForm: {
      editService: string;
      addService: string;
      cancel: string;
      save: string;
      saving: string;
      nameDefault: string;
      nameEn: string;
      nameAr: string;
      nameFr: string;
      descriptionDefault: string;
      descriptionEn: string;
      descriptionAr: string;
      descriptionFr: string;
      documentsDefault: string;
      documentsEn: string;
      documentsAr: string;
      documentsFr: string;
      documentsPlaceholder: string;
      durationMin: string;
      priceCents: string;
      currency: string;
      active: string;
      activeHint: string;
      sortOrder: string;
      stripePriceId: string;
      optional: string;
      autoTranslateNote: string;
    };
  }
> = {
  it: {
    login: {
      title: "Admin",
      subtitle: "Accedi al pannello di gestione",
      email: "Email",
      password: "Password",
      signIn: "Accedi",
      signingIn: "Accesso in corso…",
      loginFailed: "Accesso non riuscito",
      connectionError: "Errore di connessione",
      footerHint: "Usa le credenziali configurate in .env (ADMIN_EMAIL, ADMIN_PASSWORD).",
    },
    shell: {
      adminTitle: "Studio CAS Admin",
      navDashboard: "Dashboard",
      navAppointments: "Prenotazioni",
      navServices: "Servizi",
      logout: "Esci",
      language: "Lingua",
    },
    dashboard: {
      title: "Dashboard",
      today: "Oggi",
      appointments: "prenotazioni",
      next7Days: "Prossimi 7 giorni",
      activeServices: "Servizi attivi",
      ofTotal: "di {total} totali",
      panel: "Pannello",
      panelDesc: "Gestisci prenotazioni e servizi dal menu.",
      quickAccess: "Accesso rapido",
      viewAppointments: "→ Vedi tutte le prenotazioni",
      editServices: "→ Modifica servizi e documenti richiesti",
    },
    appointments: {
      title: "Prenotazioni",
      refresh: "Aggiorna",
      loading: "Caricamento…",
      noAppointments: "Nessuna prenotazione nei prossimi 14 giorni.",
      dateTime: "Data e ora",
      client: "Cliente",
      service: "Servizio",
      type: "Tipo",
      status: "Stato",
      video: "Video",
      openVideo: "Apri video",
      online: "Online",
      inPerson: "In sede",
      note: "Mostra prenotazioni da oggi ai prossimi 14 giorni.",
      sessionExpired: "Sessione scaduta. Effettua di nuovo l'accesso.",
      loadError: "Errore di caricamento",
    },
    services: {
      title: "Servizi",
      addService: "Aggiungi servizio",
      description:
        "Inserisci titolo, descrizione e documenti in italiano: il sistema li traduce in EN, AR e FR per il sito.",
      noServices: "Nessun servizio presente.",
      name: "Nome",
      active: "Attivo",
      yes: "Sì",
      no: "No",
      order: "Ordine",
      duration: "Durata",
      price: "Prezzo",
      actions: "Azioni",
      edit: "Modifica",
      deactivate: "Disattiva",
      reactivate: "Riattiva",
      sessionExpired: "Sessione scaduta. Effettua di nuovo l'accesso.",
      loadError: "Errore di caricamento",
      errorDeactivate: "Errore disattivazione",
      errorReactivate: "Errore riattivazione",
    },
    serviceForm: {
      editService: "Modifica servizio",
      addService: "Aggiungi servizio",
      cancel: "Annulla",
      save: "Salva",
      saving: "Salvataggio…",
      nameDefault: "Nome (default) *",
      nameEn: "Nome (EN)",
      nameAr: "Nome (AR)",
      nameFr: "Nome (FR)",
      descriptionDefault: "Descrizione (default)",
      descriptionEn: "Descrizione (EN)",
      descriptionAr: "Descrizione (AR)",
      descriptionFr: "Descrizione (FR)",
      documentsDefault: "Documenti richiesti (default)",
      documentsEn: "Documenti richiesti (EN)",
      documentsAr: "Documenti richiesti (AR)",
      documentsFr: "Documenti richiesti (FR)",
      documentsPlaceholder: "Separati da virgola o uno per riga",
      durationMin: "Durata (min) *",
      priceCents: "Prezzo (centesimi) *",
      currency: "Valuta *",
      active: "Attivo (visibile in sito)",
      activeHint: "Attivo (visibile in sito)",
      sortOrder: "Ordine",
      stripePriceId: "Stripe Price ID (opzionale)",
      optional: "opzionale",
      autoTranslateNote:
        "Inserisci tutto in italiano. Il sistema traduce automaticamente in inglese, arabo e francese per il sito (gratuito, MyMemory).",
    },
  },
  en: {
    login: {
      title: "Admin",
      subtitle: "Sign in to the management panel",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      signingIn: "Signing in…",
      loginFailed: "Login failed",
      connectionError: "Connection error",
      footerHint: "Use the credentials set in .env (ADMIN_EMAIL, ADMIN_PASSWORD).",
    },
    shell: {
      adminTitle: "Studio CAS Admin",
      navDashboard: "Dashboard",
      navAppointments: "Appointments",
      navServices: "Services",
      logout: "Log out",
      language: "Language",
    },
    dashboard: {
      title: "Dashboard",
      today: "Today",
      appointments: "appointments",
      next7Days: "Next 7 days",
      activeServices: "Active services",
      ofTotal: "of {total} total",
      panel: "Panel",
      panelDesc: "Manage appointments and services from the menu.",
      quickAccess: "Quick access",
      viewAppointments: "→ View all appointments",
      editServices: "→ Edit services and required documents",
    },
    appointments: {
      title: "Appointments",
      refresh: "Refresh",
      loading: "Loading…",
      noAppointments: "No appointments in the next 14 days.",
      dateTime: "Date & time",
      client: "Client",
      service: "Service",
      type: "Type",
      status: "Status",
      video: "Video",
      openVideo: "Open video",
      online: "Online",
      inPerson: "In person",
      note: "Showing appointments from today for the next 14 days.",
      sessionExpired: "Session expired. Please sign in again.",
      loadError: "Load error",
    },
    services: {
      title: "Services",
      addService: "Add service",
      description:
        "Enter title, description and documents in Italian; the system translates them into EN, AR and FR for the website.",
      noServices: "No services yet.",
      name: "Name",
      active: "Active",
      yes: "Yes",
      no: "No",
      order: "Order",
      duration: "Duration",
      price: "Price",
      actions: "Actions",
      edit: "Edit",
      deactivate: "Deactivate",
      reactivate: "Reactivate",
      sessionExpired: "Session expired. Please sign in again.",
      loadError: "Load error",
      errorDeactivate: "Deactivation error",
      errorReactivate: "Reactivation error",
    },
    serviceForm: {
      editService: "Edit service",
      addService: "Add service",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving…",
      nameDefault: "Name (default) *",
      nameEn: "Name (EN)",
      nameAr: "Name (AR)",
      nameFr: "Name (FR)",
      descriptionDefault: "Description (default)",
      descriptionEn: "Description (EN)",
      descriptionAr: "Description (AR)",
      descriptionFr: "Description (FR)",
      documentsDefault: "Required documents (default)",
      documentsEn: "Required documents (EN)",
      documentsAr: "Required documents (AR)",
      documentsFr: "Required documents (FR)",
      documentsPlaceholder: "Comma-separated or one per line",
      durationMin: "Duration (min) *",
      priceCents: "Price (cents) *",
      currency: "Currency *",
      active: "Active (visible on site)",
      activeHint: "Active (visible on site)",
      sortOrder: "Order",
      stripePriceId: "Stripe Price ID (optional)",
      optional: "optional",
      autoTranslateNote:
        "Enter everything in Italian. The system automatically translates into English, Arabic and French for the website (free, MyMemory).",
    },
  },
};

const STORAGE_KEY = "cas-admin-locale";

export function getStoredAdminLocale(): AdminLocale {
  if (typeof window === "undefined") return "it";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : "it";
}

export function setStoredAdminLocale(locale: AdminLocale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, locale);
}

export function t(
  locale: AdminLocale,
  key: string,
  params?: Record<string, string | number>
): string {
  const parts = key.split(".");
  let value: unknown = adminMessages[locale];
  for (const part of parts) {
    value = (value as Record<string, unknown>)?.[part];
  }
  let str = typeof value === "string" ? value : key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
  }
  return str;
}

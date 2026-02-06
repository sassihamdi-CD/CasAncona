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
      navCreateAppointment: string;
      navClients: string;
      navContactHours: string;
      navServices: string;
      logout: string;
      language: string;
    };
    siteContact: {
      title: string;
      description: string;
      phone: string;
      email: string;
      hours: string;
      hoursPlaceholder: string;
      save: string;
      saving: string;
      success: string;
      loadError: string;
      saveError: string;
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
      createAppointment: string;
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
      createTitle: string;
      createService: string;
      createDate: string;
      createTime: string;
      createClientName: string;
      createClientEmail: string;
      createClientPhone: string;
      createClientMessage: string;
      createSubmit: string;
      createSubmitting: string;
      createSuccess: string;
      createErrorSlot: string;
      createError: string;
      slotBooked: string;
      selectDate: string;
      selectTime: string;
      noSlots: string;
    };
    clients: {
      title: string;
      searchPlaceholder: string;
      name: string;
      email: string;
      phone: string;
      totalPaid: string;
      appointments: string;
      noClients: string;
      loadError: string;
      clientCount: string;
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
      deletePermanently: string;
      confirmDeletePermanently: string;
      sessionExpired: string;
      loadError: string;
      errorDeactivate: string;
      errorReactivate: string;
      errorDeletePermanent: string;
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
      priceEurosHint: string;
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
      navCreateAppointment: "Nuova prenotazione",
      navClients: "Clienti",
      navContactHours: "Telefono e orari",
      navServices: "Servizi",
      logout: "Esci",
      language: "Lingua",
    },
    siteContact: {
      title: "Telefono e orari",
      description: "Questi dati sono mostrati nella sezione Contatti del sito. Modifica e salva.",
      phone: "Telefono",
      email: "Email",
      hours: "Orari di apertura",
      hoursPlaceholder: "Es: Lun–Ven 9:00–13:00, 14:00–18:00",
      save: "Salva",
      saving: "Salvataggio…",
      success: "Modifiche salvate.",
      loadError: "Errore di caricamento",
      saveError: "Errore durante il salvataggio",
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
      createAppointment: "Crea prenotazione (in sede)",
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
      createTitle: "Nuova prenotazione (cliente in ufficio)",
      createService: "Servizio",
      createDate: "Data",
      createTime: "Ora",
      createClientName: "Nome cliente",
      createClientEmail: "Email",
      createClientPhone: "Telefono",
      createClientMessage: "Note",
      createSubmit: "Crea prenotazione",
      createSubmitting: "Creazione…",
      createSuccess: "Prenotazione creata.",
      createErrorSlot: "Orario non più disponibile. Scegli un altro slot (in rosso = già occupato).",
      createError: "Errore durante la creazione.",
      slotBooked: "Occupato",
      selectDate: "Scegli data",
      selectTime: "Scegli orario",
      noSlots: "Nessun orario disponibile in questa data.",
    },
    clients: {
      title: "Clienti",
      searchPlaceholder: "Cerca per nome o email…",
      name: "Nome",
      email: "Email",
      phone: "Telefono",
      totalPaid: "Totale pagato",
      appointments: "Prenotazioni",
      noClients: "Nessun cliente trovato.",
      loadError: "Errore di caricamento",
      clientCount: "{count} clienti",
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
      deletePermanently: "Elimina definitivamente",
      confirmDeletePermanently: "Eliminare questo servizio? Non si può annullare. Se ha prenotazioni non è possibile.",
      sessionExpired: "Sessione scaduta. Effettua di nuovo l'accesso.",
      loadError: "Errore di caricamento",
      errorDeactivate: "Errore disattivazione",
      errorReactivate: "Errore riattivazione",
      errorDeletePermanent: "Impossibile eliminare (ci sono prenotazioni). Disattiva il servizio.",
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
      priceCents: "Prezzo (€) *",
      priceEurosHint: "Solo euro interi (es. 50 = 50 €)",
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
      navCreateAppointment: "Create appointment",
      navClients: "Clients",
      navContactHours: "Phone and hours",
      navServices: "Services",
      logout: "Log out",
      language: "Language",
    },
    siteContact: {
      title: "Phone and hours",
      description: "This information is shown on the Contact section of the website. Edit and save.",
      phone: "Phone",
      email: "Email",
      hours: "Opening hours",
      hoursPlaceholder: "E.g. Mon–Fri 9am–1pm, 2pm–6pm",
      save: "Save",
      saving: "Saving…",
      success: "Changes saved.",
      loadError: "Load error",
      saveError: "Error saving",
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
      createAppointment: "Create appointment (walk-in)",
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
      createTitle: "New appointment (client at office)",
      createService: "Service",
      createDate: "Date",
      createTime: "Time",
      createClientName: "Client name",
      createClientEmail: "Email",
      createClientPhone: "Phone",
      createClientMessage: "Notes",
      createSubmit: "Create appointment",
      createSubmitting: "Creating…",
      createSuccess: "Appointment created.",
      createErrorSlot: "This slot is no longer available. Choose another time (red = already booked).",
      createError: "Error creating appointment.",
      slotBooked: "Booked",
      selectDate: "Select date",
      selectTime: "Select time",
      noSlots: "No slots available on this date.",
    },
    clients: {
      title: "Clients",
      searchPlaceholder: "Search by name or email…",
      name: "Name",
      email: "Email",
      phone: "Phone",
      totalPaid: "Total paid",
      appointments: "Appointments",
      noClients: "No clients found.",
      loadError: "Load error",
      clientCount: "{count} clients",
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
      deletePermanently: "Delete permanently",
      confirmDeletePermanently: "Delete this service? This cannot be undone. If it has appointments, deletion is not allowed.",
      sessionExpired: "Session expired. Please sign in again.",
      loadError: "Load error",
      errorDeactivate: "Deactivation error",
      errorReactivate: "Reactivation error",
      errorDeletePermanent: "Cannot delete (service has appointments). Deactivate it instead.",
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
      priceCents: "Price (€) *",
      priceEurosHint: "Whole euros only (e.g. 50 = 50 €)",
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

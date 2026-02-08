"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminLocale } from "../../AdminLocaleProvider";
import type { Staff } from "@/lib/types";
import type { TelegramChatSummary } from "@/app/api/admin/telegram/get-updates/route";

export default function AdminTelegramPage() {
  const { t } = useAdminLocale();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [chats, setChats] = useState<TelegramChatSummary[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);
  const [hasFetchedChats, setHasFetchedChats] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ id: string; ok: boolean } | null>(null);

  const loadStaff = useCallback(async () => {
    setLoadingStaff(true);
    try {
      const res = await fetch("/api/admin/staff", { credentials: "include" });
      if (!res.ok) throw new Error("Load failed");
      const data = (await res.json()) as { staff: Staff[] };
      setStaff(data.staff ?? []);
    } catch {
      setStaff([]);
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const fetchChatIds = async () => {
    setLoadingChats(true);
    setNoToken(false);
    setChats([]);
    setHasFetchedChats(false);
    try {
      const res = await fetch("/api/admin/telegram/get-updates", { credentials: "include" });
      const data = (await res.json()) as { chats?: TelegramChatSummary[]; error?: string };
      setHasFetchedChats(true);
      if (!res.ok) {
        if (res.status === 503) setNoToken(true);
        return;
      }
      setChats(data.chats ?? []);
    } finally {
      setLoadingChats(false);
    }
  };

  const saveTelegramForStaff = async (staffId: string, chatId: string | null) => {
    setSavingId(staffId);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/admin/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ telegramChatId: chatId || null }),
      });
      const ok = res.ok;
      if (ok) await loadStaff();
      setSaveMessage({ id: staffId, ok });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">{t("telegram.title")}</h1>
      <p className="text-stone-600">{t("telegram.description")}</p>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-700">1. {t("telegram.step1")}</h2>
        <p className="mt-2 text-sm text-stone-500">2. {t("telegram.step2")}</p>
        <button
          type="button"
          onClick={fetchChatIds}
          disabled={loadingChats}
          className="mt-4 rounded-lg bg-[#0088cc] px-4 py-2 text-sm font-medium text-white hover:bg-[#0077b5] disabled:opacity-50"
        >
          {loadingChats ? "…" : t("telegram.fetchChatIds")}
        </button>
        {noToken && (
          <p className="mt-3 text-sm text-amber-600">{t("telegram.noToken")}</p>
        )}
        {hasFetchedChats && !loadingChats && chats.length === 0 && !noToken && (
          <p className="mt-3 text-sm text-stone-500">{t("telegram.noChats")}</p>
        )}
        {chats.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {chats.map((c) => (
              <li key={c.chatId} className="font-mono text-stone-600">
                <span className="font-semibold text-stone-800">{c.chatId}</span>
                {c.display !== c.chatId && ` — ${c.display}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-700">{t("telegram.linkToStaff")}</h2>
        {loadingStaff ? (
          <p className="mt-3 text-sm text-stone-500">{t("appointments.loading")}</p>
        ) : staff.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">{t("telegram.loadStaffError")}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {staff.map((s) => (
              <StaffTelegramRow
                key={s.id}
                staff={s}
                chats={chats}
                saving={savingId === s.id}
                saveMessage={saveMessage?.id === s.id ? saveMessage.ok : null}
                onSave={(chatId) => saveTelegramForStaff(s.id, chatId)}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StaffTelegramRow({
  staff,
  chats,
  saving,
  saveMessage,
  onSave,
  t,
}: {
  staff: Staff;
  chats: TelegramChatSummary[];
  saving: boolean;
  saveMessage: boolean | null;
  onSave: (chatId: string | null) => void;
  t: (key: string) => string;
}) {
  const [selectedChatId, setSelectedChatId] = useState(staff.telegramChatId ?? "");

  useEffect(() => {
    setSelectedChatId(staff.telegramChatId ?? "");
  }, [staff.telegramChatId]);

  const handleSave = () => {
    onSave(selectedChatId.trim() || null);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-100 bg-stone-50/50 p-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-stone-900">{staff.name}</p>
        <p className="text-xs text-stone-500">{staff.email}</p>
        {staff.telegramChatId && (
          <p className="mt-1 text-xs text-stone-500">
            {t("telegram.currentChatId")}: {staff.telegramChatId}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {chats.length > 0 ? (
          <select
            value={selectedChatId}
            onChange={(e) => setSelectedChatId(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="">—</option>
            {chats.map((c) => (
              <option key={c.chatId} value={c.chatId}>
                {c.chatId} — {c.display}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={selectedChatId}
            onChange={(e) => setSelectedChatId(e.target.value)}
            placeholder="Chat ID"
            className="w-32 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
          />
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {saving ? t("telegram.saving") : t("telegram.save")}
        </button>
      </div>
      {saveMessage === true && <span className="text-sm text-green-600">{t("telegram.saved")}</span>}
      {saveMessage === false && <span className="text-sm text-red-600">{t("telegram.error")}</span>}
    </div>
  );
}

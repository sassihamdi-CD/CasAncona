"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminLocale } from "../../../../AdminLocaleProvider";
import Link from "next/link";

export default function AdminPassportViewPage() {
  const params = useParams();
  const { t } = useAdminLocale();
  const id = typeof params?.id === "string" ? params.id : null;
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid appointment");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/appointments/${id}/passport-url`, {
          credentials: "include",
        });
        if (!res.ok) {
          if (!cancelled) setError("Document not found");
          return;
        }
        const data = (await res.json()) as { url: string };
        if (!cancelled && data.url) setUrl(data.url);
      } catch {
        if (!cancelled) setError("Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-stone-600">{t("appointments.loading")}</p>
      </div>
    );
  }
  if (error || !url) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-red-600">{error ?? "Document not found"}</p>
        <Link
          href="/admin/appointments"
          className="inline-block rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          ← {t("appointments.title")}
        </Link>
      </div>
    );
  }

  const isPdf = url.toLowerCase().includes(".pdf") || url.includes("application/pdf");

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .passport-print-area,
          .passport-print-area * { visibility: visible; }
          .passport-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .passport-no-print { display: none !important; }
          @page { size: A4; margin: 1cm; }
          .passport-doc-wrap { width: 100%; height: 100%; min-height: 25cm; }
          .passport-doc-wrap img,
          .passport-doc-wrap iframe { max-width: 100%; max-height: 28cm; object-fit: contain; }
        }
      `}</style>
      <div className="space-y-4 p-6 passport-no-print">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/appointments"
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            ← {t("appointments.title")}
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            {t("appointments.printPassport")}
          </button>
        </div>
        <p className="text-sm text-stone-500">
          {t("appointments.printPassportHint")}
        </p>
      </div>
      <div className="passport-print-area px-6 pb-12">
        <div className="passport-doc-wrap rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          {isPdf ? (
            <iframe
              src={url}
              title="Passport document"
              className="h-[80vh] w-full min-h-[600px] border-0"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="Passport first page"
              className="max-h-[80vh] w-auto max-w-full object-contain"
            />
          )}
        </div>
      </div>
    </>
  );
}

import { Suspense } from "react";
import { RetrieveBookingContent } from "@/components/booking/RetrieveBookingContent";

export default function RetrieveBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-stone-500">
          Loading…
        </div>
      }
    >
      <RetrieveBookingContent />
    </Suspense>
  );
}

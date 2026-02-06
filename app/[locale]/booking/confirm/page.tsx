import { Suspense } from "react";
import { BookingConfirmContent } from "@/components/booking/BookingConfirmContent";

export default function BookingConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-stone-500">
          Loading…
        </div>
      }
    >
      <BookingConfirmContent />
    </Suspense>
  );
}

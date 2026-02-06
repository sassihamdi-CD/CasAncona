import { AdminLocaleProvider } from "./AdminLocaleProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLocaleProvider>{children}</AdminLocaleProvider>;
}

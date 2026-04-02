import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </ToastProvider>
  );
}

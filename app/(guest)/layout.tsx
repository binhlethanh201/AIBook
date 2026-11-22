import Header from "@/components/guest/Header";
import Footer from "@/components/guest/Footer";
import BackToTop from "@/components/guest/BackToTop";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header />
      {children}
      <Footer />
      <BackToTop />
    </div>
  );
}
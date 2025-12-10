// app/(main)/layout.js
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WeatherWidget from "@/components/common/WeatherWidget";
import ContactFloating from "@/components/common/ContactFloating";
import SupportChatWidget from "@/components/support-chat/SupportChatWidget";
export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main className="pt-16">{children}</main>
      <Footer />
      <WeatherWidget />
      <ContactFloating />
      <SupportChatWidget />
    </>
  );
}

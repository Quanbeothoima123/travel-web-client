import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { SocketProvider } from "@/contexts/SocketContext";
const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata = {
  title: "Travel Web",
  description: "Your travel companion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={roboto.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>{children}</SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { MainLayout } from "@/components/layout/MainLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });

export const metadata: Metadata = {
  title: "Studio Thalia Abdo | Contabilidade",
  description: "Sistema de contabilidade profissional para Studio Thalia Abdo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Studio Thalia",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF6B00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans bg-[#FDFDFD] text-slate-900 antialiased tracking-tight">
        <AuthProvider>
          <AppProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

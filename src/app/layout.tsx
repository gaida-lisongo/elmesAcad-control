import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Layout/Header";
import { ThemeProvider } from "next-themes";
import SessionProviderComp from "@/app/provider/nextauth/SessionProvider";
import { AuthDialogProvider } from "../context/AuthDialogContext";
import NextTopLoader from "nextjs-toploader";
import Footer from "@/app/components/Layout/Footer";
import ScrollToTop from "@/app/components/ScrollToTop";

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={manrope.className}>
        <NextTopLoader color="#EE7B11" />
        <AuthDialogProvider>
          <SessionProviderComp>
            <ThemeProvider
              attribute="class"
              enableSystem={false}
              defaultTheme="dark"
            >
              <Header />
              {children}
              <Footer />
              <ScrollToTop />
            </ThemeProvider>
          </SessionProviderComp>
        </AuthDialogProvider>
      </body>
    </html>
  );
}

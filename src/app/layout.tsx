import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CourseGuide AI",
  description:
    "Find the right courses, learn difficult topics, practice what you learn, and stay on track with CourseGuide AI.",
  icons: {
    icon: "/logo2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body className="font-inter">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
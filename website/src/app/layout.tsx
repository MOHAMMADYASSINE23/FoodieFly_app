import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "FoodieFly | Food delivery", description: "Fresh food delivered across Lebanon." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
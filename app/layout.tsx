import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Musikonnect — Find your people through music",
  description: "Meet people who hear the world a little like you do. Music first, people next.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

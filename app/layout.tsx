import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PlacidWay Evidence Desk",
    template: "%s · PlacidWay",
  },
  description:
    "A bounded, source-grounded assistant for the supplied PlacidWay pages.",
  applicationName: "PlacidWay Evidence Desk",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crie sua foto · Jair Martins 1011",
  description: "Coloque sua foto na moldura oficial da campanha de Jair Martins.",
  applicationName: "Jair Martins 1011",
  icons: { icon: "/jair-1011.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#012D61",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}

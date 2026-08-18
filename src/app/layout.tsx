import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gerador.jairmartins.com.br"),
  title: "Crie sua foto com Jair Martins 1011",
  description: "Escolha sua foto, use uma moldura oficial da campanha de Jair Martins 1011 e compartilhe seu apoio.",
  applicationName: "Jair Martins 1011",
  keywords: ["Jair Martins", "Jair Martins 1011", "Deputado Federal", "Pará", "gerador de foto"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: { icon: "/jair-1011.svg" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Jair Martins 1011",
    title: "Crie sua foto com Jair Martins 1011",
    description: "Faça parte desse movimento. Crie sua foto com uma moldura oficial da campanha.",
    images: [{
      url: "/campaign/jair-martins-social.jpg",
      width: 1920,
      height: 1440,
      alt: "Jair Martins, candidato a Deputado Federal pelo Pará, número 1011",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crie sua foto com Jair Martins 1011",
    description: "Faça parte desse movimento. Crie sua foto com uma moldura oficial da campanha.",
    images: ["/campaign/jair-martins-social.jpg"],
  },
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

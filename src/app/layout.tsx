import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Perfume Store",
  description: "Cửa hàng nước hoa trực tuyến",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${geist.className} mdl-js`}>
      <body className="antialiased">{children}</body>
    </html>
  )
} 
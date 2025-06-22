import type React from "react"
import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export const metadata = {
  title: "Omnyla - AI-Powered Medical Assistant",
  description: "Advanced AI-powered medical assistant for precision healthcare, genomic analysis, and medical collaboration.",
  keywords: "AI medical assistant, healthcare, genomics, precision medicine, VCF analysis, medical collaboration, tumor board",
  authors: [{ name: "Omnyla Team" }],
  robots: "index, follow",
  generator: 'v0.dev',
  openGraph: {
    title: "Omnyla - AI-Powered Medical Assistant",
    description: "Advanced AI-powered medical assistant for precision healthcare and genomic analysis.",
    type: "website",
    locale: "en_US",
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#0a0a1e] min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  )
}

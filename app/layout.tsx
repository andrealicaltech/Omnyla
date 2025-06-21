import type React from "react"
import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export const metadata = {
  title: "Nila Genomics - AI-Powered Genomic Analysis Platform",
  description: "Advanced genomic analysis platform with AI-powered pathology assistance, tumor board collaboration, and pharmacogenomic insights for precision medicine.",
  keywords: "genomics, AI pathology, tumor board, pharmacogenomics, precision medicine, VCF analysis, biomarkers",
  authors: [{ name: "Nila Genomics Team" }],
  robots: "index, follow",
  generator: 'v0.dev',
  openGraph: {
    title: "Nila Genomics - AI-Powered Genomic Analysis",
    description: "Advanced genomic analysis platform with AI-powered pathology assistance and tumor board collaboration.",
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

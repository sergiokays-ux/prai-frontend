// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PRAI — Curate with Intelligence",
  description: "Luxury-caliber influencer intelligence and curation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <div className="app-shell">
          <header className="app-header">
            <div className="logo-group">
              <div className="logo-shimmer">PRAI</div>
              <div className="subtext">Curated Intelligence</div>
            </div>
            <nav className="top-nav">
              <a href="#" className="nav-link">Dashboard</a>
              <a href="#" className="nav-link">Clients</a>
              <a href="#" className="nav-link">Projects</a>
              <a href="#" className="nav-link">Settings</a>
            </nav>
          </header>

          {children}

          <footer className="app-footer">
            <span>© {new Date().getFullYear()} PRAI</span>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Status</span>
          </footer>
        </div>
      </body>
    </html>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/employees", label: "Employees" },
  { href: "/upload", label: "Generate Slips" },
  { href: "/logs", label: "Email Logs" },
];

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PaySlip Pro | Employee Salary Automation</title>
        <meta name="description" content="Automate employee salary slip generation and emailing" />
      </head>
      <body>
        <div className="app-container">
          {/* Mobile Sidebar Backdrop */}
          <div 
            className={`sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar Navigation */}
          <Aside pathname={pathname} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Content Area */}
          <main className="main-content">
            <header className="topbar">
              <div className="flex items-center">
                <button 
                  className="mobile-menu-btn mr-4"
                  onClick={() => setSidebarOpen(true)}
                >
                  ☰
                </button>
                <div style={{ display: 'none' }} className="mobile-only-title">
                  <span style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Pay</span>Slip
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  A
                </div>
                <div style={{ fontSize: '14px' }}>
                  <div style={{ fontWeight: '600' }}>Admin</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>admin@company.com</div>
                </div>
              </div>
            </header>

            <div className="page-content">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

function Aside({ pathname, sidebarOpen, setSidebarOpen }) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <span>Pay</span>Slip Pro
      </div>
      <nav className="nav-links">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', padding: '24px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>PaySlip Pro v1.0.0</p>
      </div>
    </aside>
  );
}

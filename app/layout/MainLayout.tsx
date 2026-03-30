'use client'

import Header from '@/components/Header'
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mt-17 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
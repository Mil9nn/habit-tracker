import Header from '@/components/Header'
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mt-14">{children}</main>
    </>
  )
}
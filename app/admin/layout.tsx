"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      try {
        // Include dev bypass header if password is stored in sessionStorage
        const devPassword = typeof window !== "undefined" 
          ? sessionStorage.getItem("admin_dev_password") 
          : null
        
        const headers: HeadersInit = {}
        if (devPassword) {
          headers["x-admin-dev-bypass"] = devPassword
        }
        
        const res = await fetch("/api/admin/auth", { headers })
        const data = await res.json()
        setIsAuthenticated(data.authenticated)
        
        // Redirect logic
        if (!data.authenticated && !isLoginPage) {
          router.push("/admin/login")
        } else if (data.authenticated && isLoginPage) {
          router.push("/admin")
        }
      } catch {
        setIsAuthenticated(false)
        if (!isLoginPage) {
          router.push("/admin/login")
        }
      }
    }
    
    checkAuth()
  }, [pathname, isLoginPage, router])

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  // Show login page without sidebar
  if (isLoginPage) {
    return <div className="min-h-screen bg-muted/30">{children}</div>
  }

  // Show dashboard with sidebar
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Fallback loading
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  )
}

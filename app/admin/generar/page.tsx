import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin/auth"
import { createClient } from "@/lib/supabase/server"
import { GeneratePanel } from "@/components/admin/generate-panel"

export default async function GeneratePage() {
  const isValid = await verifyAdminSession()
  if (!isValid) redirect("/admin/login")

  const supabase = await createClient()

  // Get stats
  const [
    { count: pendingCount },
    { count: publishedCount },
    { data: pendingPages },
  ] = await Promise.all([
    supabase.from("pages").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("pages").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase
      .from("pages")
      .select(`
        id,
        slug,
        services:service_id(name),
        cities:city_id(name)
      `)
      .eq("status", "pending")
      .limit(20),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generar con IA</h1>
        <p className="text-muted-foreground mt-1">
          Genera contenido automáticamente para las páginas pendientes
        </p>
      </div>

      <GeneratePanel 
        pendingCount={pendingCount || 0}
        publishedCount={publishedCount || 0}
        pendingPages={pendingPages || []}
      />
    </div>
  )
}

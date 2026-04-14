import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { verifyAdminSession } from "@/lib/admin/auth"

export async function POST(request: NextRequest) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { paths, tags } = body

    // Revalidar paths especificos
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path)
      }
    }

    // Revalidar tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        revalidateTag(tag)
      }
    }

    // Revalidar el sitemap - forzar regeneración completa
    revalidatePath("/sitemap.xml")
    revalidatePath("/")

    return NextResponse.json({ 
      success: true, 
      revalidated: { paths: paths || [], tags: tags || [], sitemap: true }
    })
  } catch (error) {
    console.error("Error revalidating:", error)
    return NextResponse.json(
      { error: "Error al revalidar" },
      { status: 500 }
    )
  }
}

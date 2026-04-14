import { del } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from "@/lib/admin/auth"

export async function POST(request: NextRequest) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'No se proporcionó URL' }, { status: 400 })
    }

    // Only delete from our blob storage
    if (!url.includes('blob.vercel-storage.com')) {
      return NextResponse.json({ error: 'URL no válida para eliminar' }, { status: 400 })
    }

    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar archivo' }, 
      { status: 500 }
    )
  }
}

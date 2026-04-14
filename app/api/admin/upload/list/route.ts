import { list } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from "@/lib/admin/auth"

export async function GET(request: NextRequest) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const folder = searchParams.get('folder') || ''
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    const { blobs, cursor, hasMore } = await list({
      prefix: folder,
      limit,
    })

    return NextResponse.json({
      files: blobs.map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        filename: blob.pathname.split('/').pop() || 'unknown',
      })),
      cursor,
      hasMore,
    })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al listar archivos' }, 
      { status: 500 }
    )
  }
}

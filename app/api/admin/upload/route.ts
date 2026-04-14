import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { verifyAdminSession } from "@/lib/admin/auth"
import sharp from "sharp"

// Max dimensions for hero images
const MAX_WIDTH = 1200
const MAX_HEIGHT = 800
const QUALITY = 85

export async function POST(request: NextRequest) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string || "uploads"
    const optimize = formData.get("optimize") !== "false" // Default to true

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 })
    }

    // Validate file size (max 10MB before optimization)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo no puede superar 10MB" }, { status: 400 })
    }

    // Generate unique filename (always use webp for optimized images)
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)

    let finalBuffer: Buffer
    let filename: string

    if (optimize) {
      // Convert to buffer and optimize with sharp
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Get image metadata
      const metadata = await sharp(buffer).metadata()
      
      // Resize if larger than max dimensions, maintaining aspect ratio
      let sharpInstance = sharp(buffer)
      
      if (metadata.width && metadata.height) {
        if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
          sharpInstance = sharpInstance.resize(MAX_WIDTH, MAX_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true
          })
        }
      }

      // Convert to WebP for better compression
      finalBuffer = await sharpInstance
        .webp({ quality: QUALITY })
        .toBuffer()

      filename = `${folder}/${timestamp}-${randomStr}.webp`
    } else {
      // Upload original without optimization
      const arrayBuffer = await file.arrayBuffer()
      finalBuffer = Buffer.from(arrayBuffer)
      const extension = file.name.split(".").pop() || "jpg"
      filename = `${folder}/${timestamp}-${randomStr}.${extension}`
    }

    // Upload to Vercel Blob
    const blob = await put(filename, finalBuffer, {
      access: "public",
      contentType: optimize ? "image/webp" : file.type,
    })

    return NextResponse.json({ 
      url: blob.url,
      pathname: blob.pathname,
      optimized: optimize,
      originalSize: file.size,
      finalSize: finalBuffer.length,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/admin/auth"
import { createClient } from "@/lib/supabase/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()

    const { data: city, error } = await supabase
      .from("cities")
      .update({
        name: body.name,
        slug: body.slug,
        province: body.province,
        autonomous_community: body.autonomous_community,
        population: body.population || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        neighborhoods: body.neighborhoods || [],
        landmarks: body.landmarks || [],
        local_context: body.local_context || null,
        city_image_url: body.city_image_url || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating city:", error)
      return NextResponse.json(
        { error: "Error al actualizar la ciudad" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, city })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const supabase = await createClient()

    // Delete related pages first
    await supabase.from("pages").delete().eq("city_id", id)

    // Delete city
    const { error } = await supabase.from("cities").delete().eq("id", id)

    if (error) {
      return NextResponse.json(
        { error: "Error al eliminar la ciudad" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: city, error } = await supabase
    .from("cities")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !city) {
    return NextResponse.json({ error: "Ciudad no encontrada" }, { status: 404 })
  }

  return NextResponse.json({ city })
}

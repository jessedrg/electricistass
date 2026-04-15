"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, Pause, Play } from "lucide-react"

export function CronToggle() {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/settings/cron")
      if (res.ok) {
        const data = await res.json()
        setEnabled(data.enabled)
      }
    } catch (error) {
      console.error("Error fetching cron status:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCron = async (newValue: boolean) => {
    setUpdating(true)
    try {
      const res = await fetch("/api/admin/settings/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newValue }),
      })
      if (res.ok) {
        setEnabled(newValue)
      }
    } catch (error) {
      console.error("Error updating cron status:", error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              enabled ? "bg-emerald-50" : "bg-amber-50"
            }`}>
              {enabled ? (
                <Play className="h-5 w-5 text-emerald-600" />
              ) : (
                <Pause className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Generacion Automatica (Cron)
                <Badge 
                  variant="outline" 
                  className={enabled 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-amber-50 text-amber-700 border-amber-200"
                  }
                >
                  {enabled ? "Activo" : "Pausado"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Genera paginas automaticamente cada 2 minutos desde la cola
              </CardDescription>
            </div>
          </div>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-2">
              {updating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Switch
                checked={enabled}
                onCheckedChange={toggleCron}
                disabled={updating}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {enabled 
              ? "El cron esta procesando 10 ciudades cada 2 minutos" 
              : "El cron esta pausado. No se generaran paginas automaticamente."}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

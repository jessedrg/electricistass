"use client"

import { MessageCircle, Phone } from "lucide-react"

const WHATSAPP_NUMBER = "34711267223"
const WHATSAPP_MESSAGE = "Hola, me gustaría solicitar información sobre sus servicios."
const PHONE_NUMBER = "900433214"

export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Boton de llamada con numero */}
      <a
        href={`tel:+34${PHONE_NUMBER}`}
        className="flex items-center gap-2 px-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold text-sm whitespace-nowrap"
        aria-label="Llamar ahora"
      >
        <Phone className="h-4 w-4 flex-shrink-0" />
        <span>900 433 214</span>
      </a>
      {/* Boton de WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center h-14 w-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-7 w-7 fill-current" />
      </a>
    </div>
  )
}

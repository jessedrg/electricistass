"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Menu, X, Zap } from "lucide-react"

const PHONE_NUMBER = "900433214"
const PHONE_DISPLAY = "900 433 214"

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Servicios", href: "/#servicios" },
  { name: "Ciudades", href: "/electricista-main" },
  { name: "Blog", href: "/blog" },
  { name: "Contacto", href: "/#contacto" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top utility bar */}
      <div className="bg-emerald-700 text-white text-xs sm:text-sm">
        <div className="container mx-auto px-4 flex items-center justify-between h-8 sm:h-9">
          <div className="flex items-center gap-4">
            <a href={`tel:+34${PHONE_NUMBER}`} className="flex items-center gap-1.5 hover:text-emerald-200 transition-colors">
              <Phone className="h-3 w-3" />
              <span className="font-medium">{PHONE_DISPLAY}</span>
            </a>
            <a href="mailto:info@instalacioneselectricasjj.com" className="hidden sm:flex items-center gap-1.5 hover:text-emerald-200 transition-colors">
              <Mail className="h-3 w-3" />
              info@instalacioneselectricasjj.com
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-yellow-300" />
            <span>Servicio 24h · 365 días</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-600 text-white">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg leading-tight text-foreground">
                Electricistas 24H
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                Servicio urgente en toda España
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-emerald-50 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Button asChild size="sm" className="ml-3 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5">
              <a href={`tel:+34${PHONE_NUMBER}`}>
                <Phone className="h-4 w-4" />
                Llámanos
              </a>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background shadow-lg">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-2.5 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex gap-2 mt-2">
              <Button asChild className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-full">
                <a href={`tel:+34${PHONE_NUMBER}`}>
                  <Phone className="h-4 w-4" />
                  {PHONE_DISPLAY}
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

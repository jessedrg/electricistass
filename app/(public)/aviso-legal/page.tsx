import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aviso Legal",
  description: "Aviso legal y condiciones de uso de Electricistas 24H - Servicios del hogar en toda España.",
}

export default function AvisoLegalPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Aviso Legal</h1>
        
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Datos Identificativos</h2>
            <p className="text-muted-foreground mb-4">
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico, se informa:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Denominación social:</strong> Electricistas 24H</li>
              <li><strong>Dominio web:</strong> www.electricistass.com</li>
              <li><strong>Teléfono:</strong> 900 433 214</li>
              <li><strong>Email:</strong> info@electricistass.com</li>
              <li><strong>Actividad:</strong> Servicios de reparación y mantenimiento del hogar</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Objeto</h2>
            <p className="text-muted-foreground">
              El presente aviso legal regula el uso del sitio web www.electricistass.com, del que es titular Electricistas 24H. La navegación por el sitio web atribuye la condición de usuario del mismo e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Condiciones de Uso</h2>
            <p className="text-muted-foreground mb-4">
              El usuario se compromete a utilizar el sitio web, sus contenidos y servicios de conformidad con la Ley, el presente Aviso Legal, las buenas costumbres y el orden público. El usuario se obliga a no utilizar el sitio web o los servicios que se presten a través de él con fines o efectos ilícitos o contrarios al contenido del presente Aviso Legal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Propiedad Intelectual</h2>
            <p className="text-muted-foreground">
              Todos los contenidos del sitio web (incluyendo, sin carácter limitativo, bases de datos, imágenes, dibujos, gráficos, archivos de texto, audio, vídeo y software) son propiedad de Electricistas 24H o de sus proveedores de contenidos y están protegidos por las normas nacionales e internacionales de propiedad intelectual e industrial.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Exclusión de Responsabilidad</h2>
            <p className="text-muted-foreground">
              Electricistas 24H no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran derivarse de la falta de disponibilidad o continuidad del funcionamiento del sitio web, de la defraudación de la utilidad que los usuarios hubieran podido atribuir al sitio web, de la fiabilidad del sitio web, y en particular, aunque no de modo exclusivo, de los fallos en el acceso a las distintas páginas web del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Legislación Aplicable</h2>
            <p className="text-muted-foreground">
              Las presentes condiciones se regirán por la legislación española, siendo competentes los Juzgados y Tribunales españoles para conocer de cuantas cuestiones se susciten sobre la interpretación, aplicación y cumplimiento de las mismas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contacto</h2>
            <p className="text-muted-foreground">
              Para cualquier consulta relacionada con este aviso legal, puede contactar con nosotros a través del teléfono <strong>900 433 214</strong> o enviando un email a <strong>info@electricistass.com</strong>.
            </p>
          </section>

          <p className="text-sm text-muted-foreground pt-8 border-t">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </main>
  )
}

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Política de cookies de Electricistas 24H - Información sobre el uso de cookies en nuestro sitio web.",
}

export default function PoliticaCookiesPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Política de Cookies</h1>
        
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. ¿Qué son las cookies?</h2>
            <p className="text-muted-foreground">
              Las cookies son pequeños archivos de texto que los sitios web almacenan en su dispositivo (ordenador, tablet o móvil) cuando los visita. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Tipos de cookies que utilizamos</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6">Cookies técnicas (necesarias)</h3>
            <p className="text-muted-foreground mb-4">
              Son aquellas que permiten al usuario la navegación a través del sitio web y la utilización de las diferentes opciones o servicios que en ella existen. Son imprescindibles para el funcionamiento del sitio.
            </p>
            
            <h3 className="text-xl font-medium mb-3">Cookies analíticas</h3>
            <p className="text-muted-foreground mb-4">
              Son aquellas que nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del sitio web. Para ello se analiza su navegación con el fin de mejorar la oferta de productos o servicios.
            </p>
            
            <h3 className="text-xl font-medium mb-3">Cookies de preferencias</h3>
            <p className="text-muted-foreground">
              Son aquellas que permiten recordar información para que el usuario acceda al servicio con determinadas características que pueden diferenciar su experiencia de la de otros usuarios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cookies utilizadas en este sitio web</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-3 text-left">Nombre</th>
                    <th className="border border-gray-200 p-3 text-left">Tipo</th>
                    <th className="border border-gray-200 p-3 text-left">Duración</th>
                    <th className="border border-gray-200 p-3 text-left">Finalidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 p-3">_ga</td>
                    <td className="border border-gray-200 p-3">Analítica</td>
                    <td className="border border-gray-200 p-3">2 años</td>
                    <td className="border border-gray-200 p-3">Distinguir usuarios únicos</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-3">_gid</td>
                    <td className="border border-gray-200 p-3">Analítica</td>
                    <td className="border border-gray-200 p-3">24 horas</td>
                    <td className="border border-gray-200 p-3">Distinguir usuarios</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-3">cookie_consent</td>
                    <td className="border border-gray-200 p-3">Técnica</td>
                    <td className="border border-gray-200 p-3">1 año</td>
                    <td className="border border-gray-200 p-3">Guardar preferencias de cookies</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. ¿Cómo gestionar las cookies?</h2>
            <p className="text-muted-foreground mb-4">
              Puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador. A continuación le ofrecemos enlaces donde encontrará información sobre cómo gestionar las cookies en los navegadores más comunes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Actualización de la política</h2>
            <p className="text-muted-foreground">
              Esta política de cookies puede ser actualizada periódicamente, por lo que le recomendamos revisarla cada vez que acceda a nuestro sitio web con el objetivo de estar adecuadamente informado sobre cómo y para qué usamos las cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contacto</h2>
            <p className="text-muted-foreground">
              Si tiene alguna duda sobre esta política de cookies, puede contactar con nosotros a través del teléfono <strong>900 433 214</strong> o enviando un email a <strong>info@instalacioneselectricasjj.com</strong>.
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

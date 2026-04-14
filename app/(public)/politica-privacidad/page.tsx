import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de Electricistas 24H - Información sobre el tratamiento de datos personales.",
}

export default function PoliticaPrivacidadPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
        
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Responsable del Tratamiento</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Responsable:</strong> Electricistas 24H</li>
              <li><strong>Teléfono:</strong> 900 433 214</li>
              <li><strong>Email:</strong> info@electricistass.com</li>
              <li><strong>Web:</strong> www.electricistass.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Finalidad del Tratamiento</h2>
            <p className="text-muted-foreground mb-4">
              Los datos personales que nos facilite serán tratados con las siguientes finalidades:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Gestionar las solicitudes de información y presupuestos.</li>
              <li>Prestar los servicios contratados.</li>
              <li>Enviar comunicaciones comerciales sobre nuestros servicios (solo si ha dado su consentimiento).</li>
              <li>Mantener la relación comercial y contractual.</li>
              <li>Cumplir con las obligaciones legales aplicables.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Legitimación</h2>
            <p className="text-muted-foreground">
              La base legal para el tratamiento de sus datos es el consentimiento del interesado, la ejecución de un contrato o la aplicación de medidas precontractuales, y el cumplimiento de obligaciones legales. La oferta prospectiva de productos y servicios está basada en el consentimiento que se le solicita.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Destinatarios</h2>
            <p className="text-muted-foreground">
              Sus datos no serán cedidos a terceros, salvo obligación legal o cuando sea necesario para la prestación del servicio (por ejemplo, a los profesionales que realizarán el trabajo en su domicilio). En ningún caso venderemos sus datos a terceros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Derechos del Interesado</h2>
            <p className="text-muted-foreground mb-4">
              Puede ejercer los siguientes derechos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Acceso:</strong> Conocer qué datos personales tenemos sobre usted.</li>
              <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos.</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios.</li>
              <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos en determinadas circunstancias.</li>
              <li><strong>Limitación:</strong> Solicitar la limitación del tratamiento en determinados casos.</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Para ejercer estos derechos, puede contactar con nosotros enviando un email a <strong>info@electricistass.com</strong> o llamando al <strong>900 433 214</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Conservación de Datos</h2>
            <p className="text-muted-foreground">
              Sus datos serán conservados mientras dure la relación comercial y, una vez finalizada, durante los plazos de prescripción legalmente aplicables. Cuando los datos dejen de ser necesarios, serán suprimidos con las medidas de seguridad adecuadas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Seguridad</h2>
            <p className="text-muted-foreground">
              Hemos adoptado las medidas técnicas y organizativas necesarias para garantizar la seguridad de sus datos y evitar su alteración, pérdida, tratamiento o acceso no autorizado, habida cuenta del estado de la tecnología, la naturaleza de los datos y los riesgos a los que están expuestos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Reclamaciones</h2>
            <p className="text-muted-foreground">
              Si considera que el tratamiento de sus datos no se ajusta a la normativa vigente, puede presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).
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

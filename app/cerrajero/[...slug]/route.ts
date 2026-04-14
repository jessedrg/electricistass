// URLs antiguas formato /cerrajero/[ciudad] - devolver 410 Gone
// El nuevo formato es /cerrajero-[ciudad] (sin slash)

export async function GET() {
  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <title>410 Gone</title>
  <meta name="robots" content="noindex">
</head>
<body>
  <h1>Esta página ya no existe</h1>
  <p>El contenido ha sido movido. <a href="/">Ir al inicio</a></p>
</body>
</html>`,
    {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex",
      },
    }
  )
}

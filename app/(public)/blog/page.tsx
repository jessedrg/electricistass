import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { CalendarDays, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog - Consejos y Guias para tu Hogar",
  description: "Articulos, consejos y guias sobre mantenimiento del hogar, reparaciones y como elegir los mejores profesionales.",
  alternates: {
    canonical: "/blog",
  },
}

export default async function BlogPage() {
  const supabase = await createClient()
  
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={[{ label: "Blog" }]} />
      </div>

      <section className="py-12 lg:py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Blog de Servicios del Hogar
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Consejos, guias y articulos sobre mantenimiento del hogar y como elegir los mejores profesionales.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {posts && posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    {post.featured_image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <CalendarDays className="h-4 w-4" />
                        {post.published_at && new Date(post.published_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <CardTitle className="text-xl line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 mb-4">
                        {post.meta_description}
                      </p>
                      <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Leer mas
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Proximamente publicaremos articulos utiles sobre servicios del hogar.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { CalendarDays, User } from "lucide-react"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Use dynamic rendering - blog posts are fetched on demand
export const dynamic = "force-dynamic"

// Commented out: generateStaticParams requires cookies-free client
// export async function generateStaticParams() {
//   const supabase = createServiceClient()
//   const { data: posts } = await supabase
//     .from("blog_posts")
//     .select("slug")
//     .eq("status", "published")
//   if (!posts) return []
//   return posts.map((post) => ({ slug: post.slug }))
// }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, meta_description, featured_image_url")
    .eq("slug", slug)
    .eq("status", "published")
    .single()
  
  if (!post) {
    return {
      title: "Articulo no encontrado",
    }
  }

  return {
    title: post.title,
    description: post.meta_description,
    openGraph: {
      title: post.title,
      description: post.meta_description,
      type: "article",
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()
  
  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={[
          { label: "Blog", href: "/blog" },
          { label: post.title }
        ]} />
      </div>

      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {post.featured_image_url && (
              <div className="aspect-video overflow-hidden rounded-xl mb-8">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <header className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {post.published_at && new Date(post.published_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Servicios del Hogar
                </span>
              </div>
            </header>
            
            <div className="prose prose-lg max-w-none">
              {post.content?.split("\n").map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </article>
    </main>
  )
}

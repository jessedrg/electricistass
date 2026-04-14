// Company constants
const COMPANY_NAME = "Electricistas 24H"
const COMPANY_PHONE = "+34900433214"
const COMPANY_URL = "https://www.electricistass.com"

interface ReviewData {
  name: string
  rating: number
  text: string
  date?: string
  location?: string
}

interface LocalBusinessData {
  name: string
  description: string
  serviceName: string
  cityName: string
  latitude: number
  longitude: number
  telephone?: string
  priceRange?: string
  areaServed?: string[]
  reviews?: ReviewData[]
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
}

interface FAQItem {
  question: string
  answer: string
}

interface ServiceData {
  name: string
  description: string
  provider: string
  areaServed: string
  priceRange?: {
    min: number
    max: number
    currency: string
    unit: string
  }
}

// Local Business Schema with Reviews
export function generateLocalBusinessJsonLd(data: LocalBusinessData) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${COMPANY_URL}/#localbusiness-${data.cityName.toLowerCase().replace(/\s+/g, '-')}`,
    "name": `${COMPANY_NAME} - ${data.serviceName} en ${data.cityName}`,
    "description": data.description,
    "url": COMPANY_URL,
    "logo": `${COMPANY_URL}/logo.jpg`,
    "image": `${COMPANY_URL}/logo.jpg`,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": data.latitude,
      "longitude": data.longitude
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": data.cityName,
      "addressCountry": "ES"
    },
    "areaServed": data.areaServed?.map(area => ({
      "@type": "City",
      "name": area
    })) || [{
      "@type": "City", 
      "name": data.cityName
    }],
    "priceRange": data.priceRange || "$$",
    "telephone": data.telephone || COMPANY_PHONE,
    "serviceType": data.serviceName,
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "sameAs": [
      "https://www.facebook.com/electricistass",
      "https://www.instagram.com/electricistass"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `Servicios de ${data.serviceName}`,
      "itemListElement": [{
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": data.serviceName,
          "areaServed": {
            "@type": "City",
            "name": data.cityName
          }
        }
      }]
    }
  }

  // Add aggregate rating if available
  if (data.aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": data.aggregateRating.ratingValue,
      "reviewCount": data.aggregateRating.reviewCount,
      "bestRating": 5,
      "worstRating": 1
    }
  }

  // Add individual reviews if available
  if (data.reviews && data.reviews.length > 0) {
    schema.review = data.reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "reviewBody": review.text,
      "datePublished": review.date || new Date().toISOString().split('T')[0],
      ...(review.location && {
        "locationCreated": {
          "@type": "Place",
          "address": review.location
        }
      })
    }))
  }

  return schema
}

// FAQ Schema
export function generateFAQJsonLd(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

// Service Schema
export function generateServiceJsonLd(data: ServiceData) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": data.name,
    "description": data.description,
    "provider": {
      "@type": "LocalBusiness",
      "name": COMPANY_NAME,
      "telephone": COMPANY_PHONE,
      "url": COMPANY_URL
    },
    "areaServed": {
      "@type": "City",
      "name": data.areaServed
    }
  }

  if (data.priceRange) {
    schema.offers = {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": data.priceRange.min,
        "maxPrice": data.priceRange.max,
        "priceCurrency": data.priceRange.currency,
        "unitText": data.priceRange.unit
      }
    }
  }

  return schema
}

// Organization Schema (for brand recognition)
export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${COMPANY_URL}/#organization`,
    "name": COMPANY_NAME,
    "url": COMPANY_URL,
    "logo": `${COMPANY_URL}/logo.jpg`,
    "telephone": COMPANY_PHONE,
    "email": "info@electricistass.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ES"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": COMPANY_PHONE,
      "contactType": "customer service",
      "availableLanguage": ["Spanish", "English"],
      "areaServed": "ES"
    },
    "sameAs": [
      "https://www.facebook.com/electricistass",
      "https://www.instagram.com/electricistass"
    ]
  }
}

// WebPage Schema (for better page understanding)
interface WebPageData {
  name: string
  description: string
  url: string
  dateModified?: string
  breadcrumb?: object
}

export function generateWebPageJsonLd(data: WebPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${data.url}/#webpage`,
    "name": data.name,
    "description": data.description,
    "url": data.url,
    "isPartOf": {
      "@id": `${COMPANY_URL}/#website`
    },
    "about": {
      "@id": `${COMPANY_URL}/#organization`
    },
    "dateModified": data.dateModified || new Date().toISOString(),
    "inLanguage": "es-ES",
    ...(data.breadcrumb && { "breadcrumb": data.breadcrumb })
  }
}

// Website Schema
export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${COMPANY_URL}/#website`,
    "name": COMPANY_NAME,
    "url": COMPANY_URL,
    "publisher": {
      "@id": `${COMPANY_URL}/#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${COMPANY_URL}/buscar?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "es-ES"
  }
}

// Combined component to render all structured data
interface StructuredDataProps {
  localBusiness?: LocalBusinessData
  faqs?: FAQItem[]
  service?: ServiceData
  breadcrumbJsonLd?: object
  webPage?: WebPageData
  includeOrganization?: boolean
  includeWebsite?: boolean
}

export function StructuredData({ 
  localBusiness, 
  faqs, 
  service,
  breadcrumbJsonLd,
  webPage,
  includeOrganization = true,
  includeWebsite = false,
}: StructuredDataProps) {
  const schemas: object[] = []
  
  // Add organization schema (good for brand recognition)
  if (includeOrganization) {
    schemas.push(generateOrganizationJsonLd())
  }

  // Add website schema (good for site-wide recognition)
  if (includeWebsite) {
    schemas.push(generateWebsiteJsonLd())
  }

  if (localBusiness) {
    schemas.push(generateLocalBusinessJsonLd(localBusiness))
  }
  
  if (faqs && faqs.length > 0) {
    schemas.push(generateFAQJsonLd(faqs))
  }
  
  if (service) {
    schemas.push(generateServiceJsonLd(service))
  }

  if (breadcrumbJsonLd) {
    schemas.push(breadcrumbJsonLd)
  }

  if (webPage) {
    schemas.push(generateWebPageJsonLd(webPage))
  }

  if (schemas.length === 0) return null

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

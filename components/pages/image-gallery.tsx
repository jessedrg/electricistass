import Image from "next/image"

interface ImageGalleryProps {
  images: string[]
  cityName: string
  serviceName: string
}

export function ImageGallery({ images, cityName, serviceName }: ImageGalleryProps) {
  if (!images || images.length === 0) return null

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {serviceName} en {cityName}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.slice(0, 4).map((url, index) => (
          <div 
            key={index}
            className={`relative overflow-hidden rounded-xl shadow-sm ${
              index === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-[4/3]"
            }`}
          >
            <Image
              src={url}
              alt={`${serviceName} en ${cityName} - Imagen ${index + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

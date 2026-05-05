import { MetadataRoute } from "next"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/reservar"], disallow: ["/admin/", "/api/"] },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}

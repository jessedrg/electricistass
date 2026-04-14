"use client"

/**
 * Helper function for making authenticated admin API requests
 * Automatically includes credentials and dev bypass header if available
 */
export async function adminFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Get dev password from sessionStorage if available
  const devPassword = typeof window !== "undefined" 
    ? sessionStorage.getItem("admin_dev_password") 
    : null

  const headers = new Headers(options.headers || {})
  
  // Add dev bypass header if password is stored
  if (devPassword) {
    headers.set("x-admin-dev-bypass", devPassword)
  }
  
  // Ensure content-type is set for POST/PUT/PATCH
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  })
}

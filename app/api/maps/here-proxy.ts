// Helper functions for HERE Maps API proxy
export async function proxyHereRequest(endpoint: string, params: Record<string, string>) {
  const apiKey = process.env.HERE_API_KEY

  if (!apiKey) {
    throw new Error("HERE Maps API key not configured")
  }

  // Build the HERE API URL with all parameters
  const hereParams = new URLSearchParams({
    ...params,
    apiKey,
  })

  const url = `https://js.api.here.com/v3/3.1/${endpoint}?${hereParams.toString()}`

  // Forward the request to HERE Maps API
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HERE Maps API error: ${response.statusText}`)
  }

  return response.json()
}

// Secure map service that doesn't expose API keys

// Initialize map
export async function initializeMap() {
  try {
    const response = await fetch("/api/maps?operation=init")
    if (!response.ok) throw new Error("Failed to initialize map")
    return await response.json()
  } catch (error) {
    console.error("Map initialization error:", error)
    throw error
  }
}

// Get address from coordinates
export async function getAddressFromCoordinates(lat: number, lng: number) {
  try {
    const response = await fetch(`/api/maps?operation=geocode&lat=${lat}&lng=${lng}`)
    if (!response.ok) throw new Error("Geocoding failed")
    const data = await response.json()

    // Process the response to extract address
    if (data.items && data.items.length > 0) {
      return data.items[0].address
    }
    throw new Error("No address found")
  } catch (error) {
    console.error("Geocoding error:", error)
    throw error
  }
}

// Calculate route between two points
export async function calculateRoute(startLat: number, startLng: number, endLat: number, endLng: number) {
  try {
    const response = await fetch(
      `/api/maps?operation=route&startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}`,
    )
    if (!response.ok) throw new Error("Route calculation failed")
    return await response.json()
  } catch (error) {
    console.error("Route calculation error:", error)
    throw error
  }
}

// Get map tile URL (for static maps)
export function getMapTileUrl(x: number, y: number, z: number) {
  return `/api/maps/tile?x=${x}&y=${y}&z=${z}`
}

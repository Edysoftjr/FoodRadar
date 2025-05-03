// HERE Maps API integration

// Initialize HERE Maps platform
export function initializeHereMaps(apiKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Load HERE Maps script dynamically
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = `https://js.api.here.com/v3/3.1/mapsjs-core.js`
    script.async = true
    script.onload = () => {
      // Load additional modules
      loadAdditionalModules()
        .then(() => {
          // Initialize the platform
          const platform = new (window as any).H.service.Platform({
            apikey: apiKey,
          })
          resolve(platform)
        })
        .catch(reject)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Load additional HERE Maps modules
function loadAdditionalModules(): Promise<void> {
  const modules = ["mapsjs-service.js", "mapsjs-mapevents.js", "mapsjs-ui.js", "mapsjs-clustering.js"]

  // Also load CSS
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.type = "text/css"
  link.href = "https://js.api.here.com/v3/3.1/mapsjs-ui.css"
  document.head.appendChild(link)

  return Promise.all(
    modules.map(
      (module) =>
        new Promise<void>((resolve, reject) => {
          const script = document.createElement("script")
          script.type = "text/javascript"
          script.src = `https://js.api.here.com/v3/3.1/${module}`
          script.async = true
          script.onload = () => resolve()
          script.onerror = reject
          document.head.appendChild(script)
        }),
    ),
  ).then(() => {})
}

// Calculate route between two points
export function calculateRoute(
  platform: any,
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const router = platform.getRoutingService(null, 8)

    const routeRequestParams = {
      routingMode: "fast",
      transportMode: "car",
      origin: `${startLat},${startLng}`,
      destination: `${endLat},${endLng}`,
      return: "polyline,turnByTurnActions,actions,instructions,travelSummary",
    }

    router.calculateRoute(
      routeRequestParams,
      (result: any) => {
        resolve(result)
      },
      (error: any) => {
        reject(error)
      },
    )
  })
}

// Get address from coordinates (reverse geocoding)
export function reverseGeocode(platform: any, lat: number, lng: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const geocoder = platform.getSearchService()

    geocoder.reverseGeocode(
      {
        at: `${lat},${lng}`,
      },
      (result: any) => {
        if (result.items && result.items.length > 0) {
          const address = result.items[0].address
          const formattedAddress = `${address.street || ""}, ${address.district || ""}, ${address.city || ""}`
          resolve(formattedAddress)
        } else {
          reject(new Error("No address found"))
        }
      },
      (error: any) => {
        reject(error)
      },
    )
  })
}

// Add marker to map
export function addMarker(map: any, lat: number, lng: number, html?: string, icon?: any): any {
  const marker = new (window as any).H.map.Marker({ lat, lng }, icon ? { icon } : undefined)

  if (html) {
    marker.setData(html)
  }

  map.addObject(marker)
  return marker
}

// Add info bubble to marker
export function addInfoBubble(map: any, marker: any, content: string): any {
  const ui = (window as any).H.ui.UI.createDefault(map, {})
  const bubble = new (window as any).H.ui.InfoBubble(marker.getGeometry(), {
    content,
  })

  ui.addBubble(bubble)
  bubble.close()

  marker.addEventListener("tap", () => {
    bubble.open()
  })

  return { ui, bubble }
}

// Add polyline to map (for routes)
export function addRouteToMap(map: any, route: any): any {
  const routeShape = route.routes[0].sections[0].polyline
  const lineString = new (window as any).H.geo.LineString()

  routeShape.forEach((point: number[]) => {
    lineString.pushLatLngAlt(point[0], point[1])
  })

  const routeLine = new (window as any).H.map.Polyline(lineString, {
    style: {
      lineWidth: 5,
      strokeColor: "#f97316",
      lineTailCap: "arrow-tail",
      lineHeadCap: "arrow-head",
    },
  })

  map.addObject(routeLine)

  // Zoom to the route
  map.getViewModel().setLookAtData({
    bounds: routeLine.getBoundingBox(),
  })

  return routeLine
}

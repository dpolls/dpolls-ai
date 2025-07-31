"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Transportation elements
    const routes = []
    const vehicles = []

    // Generate curved route paths
    for (let i = 0; i < 6; i++) {
      const startX = Math.random() * canvas.width
      const startY = Math.random() * canvas.height
      const endX = Math.random() * canvas.width
      const endY = Math.random() * canvas.height
      const controlX = (startX + endX) / 2 + (Math.random() - 0.5) * 200
      const controlY = (startY + endY) / 2 + (Math.random() - 0.5) * 200

      routes.push({
        startX,
        startY,
        endX,
        endY,
        controlX,
        controlY,
        opacity: 0.15 + Math.random() * 0.1,
        width: 2 + Math.random() * 2,
      })
    }

    // Generate vehicles moving along routes
    for (let i = 0; i < 8; i++) {
      const routeIndex = Math.floor(Math.random() * routes.length)
      vehicles.push({
        routeIndex,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
        type: Math.random() > 0.5 ? "car" : "bus",
        size: 4 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.2,
      })
    }

    // Straight road lines
    const roads = []
    for (let i = 0; i < 4; i++) {
      roads.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 100 + Math.random() * 200,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.1 + Math.random() * 0.1,
        dashOffset: 0,
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Helper function to get point on quadratic curve
    const getQuadraticPoint = (
      t: number,
      startX: number,
      startY: number,
      controlX: number,
      controlY: number,
      endX: number,
      endY: number,
    ) => {
      const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX
      const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY
      return { x, y }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create subtle circular gradient background
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) * 0.6

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, "rgba(249, 115, 22, 0.02)")
      gradient.addColorStop(0.5, "rgba(249, 115, 22, 0.01)")
      gradient.addColorStop(1, "rgba(249, 115, 22, 0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw curved routes
      routes.forEach((route, index) => {
        const distance = Math.min(
          Math.sqrt(Math.pow(mouseRef.current.x - route.startX, 2) + Math.pow(mouseRef.current.y - route.startY, 2)),
          Math.sqrt(Math.pow(mouseRef.current.x - route.endX, 2) + Math.pow(mouseRef.current.y - route.endY, 2)),
          Math.sqrt(
            Math.pow(mouseRef.current.x - route.controlX, 2) + Math.pow(mouseRef.current.y - route.controlY, 2),
          ),
        )

        const isHovered = distance < 120
        const opacity = isHovered ? route.opacity * 4 : route.opacity
        const color = isHovered ? "249, 115, 22" : "75, 85, 99"

        ctx.strokeStyle = `rgba(${color}, ${opacity})`
        ctx.lineWidth = isHovered ? route.width * 1.5 : route.width
        ctx.beginPath()
        ctx.moveTo(route.startX, route.startY)
        ctx.quadraticCurveTo(route.controlX, route.controlY, route.endX, route.endY)
        ctx.stroke()

        // Draw dashed center line for roads
        if (isHovered) {
          ctx.strokeStyle = `rgba(249, 115, 22, ${opacity * 0.6})`
          ctx.lineWidth = 1
          ctx.setLineDash([10, 10])
          ctx.beginPath()
          ctx.moveTo(route.startX, route.startY)
          ctx.quadraticCurveTo(route.controlX, route.controlY, route.endX, route.endY)
          ctx.stroke()
          ctx.setLineDash([])
        }
      })

      // Draw straight roads
      roads.forEach((road) => {
        const roadEndX = road.x + Math.cos(road.angle) * road.length
        const roadEndY = road.y + Math.sin(road.angle) * road.length

        const distance = Math.min(
          Math.sqrt(Math.pow(mouseRef.current.x - road.x, 2) + Math.pow(mouseRef.current.y - road.y, 2)),
          Math.sqrt(Math.pow(mouseRef.current.x - roadEndX, 2) + Math.pow(mouseRef.current.y - roadEndY, 2)),
        )

        const isHovered = distance < 100
        const opacity = isHovered ? road.opacity * 5 : road.opacity
        const color = isHovered ? "249, 115, 22" : "75, 85, 99"

        ctx.strokeStyle = `rgba(${color}, ${opacity})`
        ctx.lineWidth = isHovered ? 4 : 2
        ctx.beginPath()
        ctx.moveTo(road.x, road.y)
        ctx.lineTo(roadEndX, roadEndY)
        ctx.stroke()

        // Animated dashed center line
        if (isHovered) {
          road.dashOffset += 2
          ctx.strokeStyle = `rgba(249, 115, 22, ${opacity * 0.7})`
          ctx.lineWidth = 1
          ctx.setLineDash([8, 8])
          ctx.lineDashOffset = road.dashOffset
          ctx.beginPath()
          ctx.moveTo(road.x, road.y)
          ctx.lineTo(roadEndX, roadEndY)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.lineDashOffset = 0
        }
      })

      // Draw and animate vehicles
      vehicles.forEach((vehicle) => {
        const route = routes[vehicle.routeIndex]
        if (!route) return

        const point = getQuadraticPoint(
          vehicle.progress,
          route.startX,
          route.startY,
          route.controlX,
          route.controlY,
          route.endX,
          route.endY,
        )

        const distance = Math.sqrt(
          Math.pow(mouseRef.current.x - point.x, 2) + Math.pow(mouseRef.current.y - point.y, 2),
        )

        const isHovered = distance < 80
        const opacity = isHovered ? vehicle.opacity * 3 : vehicle.opacity
        const color = isHovered ? "249, 115, 22" : "156, 163, 175"

        // Draw vehicle based on type
        ctx.fillStyle = `rgba(${color}, ${opacity})`

        if (vehicle.type === "car") {
          // Draw car as rectangle
          ctx.fillRect(point.x - vehicle.size / 2, point.y - vehicle.size / 3, vehicle.size, vehicle.size / 1.5)
        } else {
          // Draw bus as larger rectangle
          ctx.fillRect(point.x - vehicle.size / 1.5, point.y - vehicle.size / 2, vehicle.size * 1.3, vehicle.size)
        }

        // Add headlights effect when hovered
        if (isHovered) {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`
          ctx.beginPath()
          ctx.arc(point.x + vehicle.size / 3, point.y, 1, 0, Math.PI * 2)
          ctx.arc(point.x - vehicle.size / 3, point.y, 1, 0, Math.PI * 2)
          ctx.fill()
        }

        // Update vehicle progress
        vehicle.progress += vehicle.speed
        if (vehicle.progress > 1) {
          vehicle.progress = 0
          // Randomly assign new route
          vehicle.routeIndex = Math.floor(Math.random() * routes.length)
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} />
}

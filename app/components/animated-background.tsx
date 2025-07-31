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

    // Chart elements
    const barCharts = []
    const pieCharts = []

    // Generate bar charts with even distribution
    const barPositions = [
      { x: 0.15, y: 0.2 },
      { x: 0.7, y: 0.15 },
      { x: 0.25, y: 0.65 },
      { x: 0.8, y: 0.7 },
      { x: 0.05, y: 0.85 },
    ]

    for (let i = 0; i < 5; i++) {
      const bars = []
      const numBars = 4 + Math.floor(Math.random() * 5)
      const chartX = barPositions[i].x * canvas.width
      const chartY = barPositions[i].y * canvas.height
      
      for (let j = 0; j < numBars; j++) {
        bars.push({
          x: chartX + j * (120 / numBars),
          baseHeight: 15 + Math.random() * 50,
          currentHeight: 15 + Math.random() * 50,
          targetHeight: 15 + Math.random() * 50,
          width: (120 / numBars) * 0.7,
          animationSpeed: 0.015 + Math.random() * 0.02,
        })
      }

      barCharts.push({
        bars,
        baseY: chartY,
        opacity: 0.05 + Math.random() * 0.06,
        color: Math.random() > 0.5 ? "59, 130, 246" : "99, 102, 241",
      })
    }

    // Generate pie charts with even distribution
    const piePositions = [
      { x: 0.85, y: 0.25 },
      { x: 0.1, y: 0.4 },
      { x: 0.6, y: 0.8 },
      { x: 0.9, y: 0.55 },
      { x: 0.4, y: 0.3 },
    ]

    for (let i = 0; i < 5; i++) {
      const segments = []
      const numSegments = 3 + Math.floor(Math.random() * 3)
      let totalValue = 0
      
      // Generate random values
      const values = []
      for (let j = 0; j < numSegments; j++) {
        const value = 10 + Math.random() * 30
        values.push(value)
        totalValue += value
      }

      // Convert to angles
      let currentAngle = 0
      for (let j = 0; j < numSegments; j++) {
        const angle = (values[j] / totalValue) * Math.PI * 2
        segments.push({
          startAngle: currentAngle,
          endAngle: currentAngle + angle,
          color: j % 3 === 0 ? "59, 130, 246" : j % 3 === 1 ? "99, 102, 241" : "147, 51, 234",
          opacity: 0.05 + Math.random() * 0.06,
        })
        currentAngle += angle
      }

      pieCharts.push({
        x: piePositions[i].x * canvas.width,
        y: piePositions[i].y * canvas.height,
        radius: 20 + Math.random() * 25,
        segments,
        rotation: 0,
        rotationSpeed: 0.001 + Math.random() * 0.003,
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener("mousemove", handleMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create subtle circular gradient background
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) * 0.6

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.02)")
      gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.01)")
      gradient.addColorStop(1, "rgba(59, 130, 246, 0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw bar charts
      barCharts.forEach((chart) => {
        chart.bars.forEach((bar) => {
          // Animate bar heights
          const diff = bar.targetHeight - bar.currentHeight
          bar.currentHeight += diff * bar.animationSpeed
          
          // Randomly change target height occasionally
          if (Math.random() < 0.001) {
            bar.targetHeight = 15 + Math.random() * 60
          }

          const distance = Math.sqrt(
            Math.pow(mouseRef.current.x - (bar.x + bar.width/2), 2) + 
            Math.pow(mouseRef.current.y - (chart.baseY - bar.currentHeight/2), 2)
          )

          const isHovered = distance < 100
          const opacity = isHovered ? chart.opacity * 6 : chart.opacity
          const color = isHovered ? "59, 130, 246" : chart.color

          ctx.fillStyle = `rgba(${color}, ${opacity})`
          ctx.fillRect(
            bar.x, 
            chart.baseY - bar.currentHeight, 
            bar.width, 
            bar.currentHeight
          )

          // Add subtle highlight on hover
          if (isHovered) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.4})`
            ctx.lineWidth = 1
            ctx.strokeRect(
              bar.x, 
              chart.baseY - bar.currentHeight, 
              bar.width, 
              bar.currentHeight
            )
          }
        })
      })

      // Draw pie charts
      pieCharts.forEach((pie) => {
        // Slow rotation animation
        pie.rotation += pie.rotationSpeed

        const distance = Math.sqrt(
          Math.pow(mouseRef.current.x - pie.x, 2) + Math.pow(mouseRef.current.y - pie.y, 2)
        )

        const isHovered = distance < pie.radius + 20
        const radiusMultiplier = isHovered ? 1.1 : 1
        const currentRadius = pie.radius * radiusMultiplier

        pie.segments.forEach((segment) => {
          const opacity = isHovered ? segment.opacity * 6 : segment.opacity
          
          ctx.fillStyle = `rgba(${segment.color}, ${opacity})`
          ctx.beginPath()
          ctx.moveTo(pie.x, pie.y)
          ctx.arc(
            pie.x, 
            pie.y, 
            currentRadius, 
            segment.startAngle + pie.rotation, 
            segment.endAngle + pie.rotation
          )
          ctx.closePath()
          ctx.fill()

          // Add subtle stroke on hover
          if (isHovered) {
            ctx.strokeStyle = `rgba(${segment.color}, ${opacity * 0.3})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
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

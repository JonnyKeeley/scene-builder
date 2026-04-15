import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import * as THREE from 'three'
import type { Hotspot } from '@/types/database'

const SPHERE_RADIUS = 5000

export function pitchYawToCartesian(pitch: number, yaw: number): THREE.Vector3 {
  return new THREE.Vector3(
    SPHERE_RADIUS * Math.cos(pitch) * Math.sin(yaw),
    SPHERE_RADIUS * Math.sin(pitch),
    SPHERE_RADIUS * Math.cos(pitch) * Math.cos(yaw)
  )
}

export function cartesianToPitchYaw(point: THREE.Vector3): { pitch: number; yaw: number } {
  const r = point.length()
  return {
    pitch: Math.asin(point.y / r),
    yaw: Math.atan2(point.x, point.z),
  }
}

interface PanoramaViewerProps {
  imageUrl: string | null
  hotspots: Hotspot[]
  placementMode: boolean
  selectedHotspotId: string | null
  onPanoramaClick?: (pitch: number, yaw: number) => void
  onHotspotClick?: (hotspotId: string) => void
  overlayContent?: ReactNode
}

export default function PanoramaViewer({
  imageUrl,
  hotspots,
  placementMode,
  selectedHotspotId,
  onPanoramaClick,
  onHotspotClick,
  overlayContent,
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const rendererRef = useRef<THREE.WebGLRenderer>(null)
  const sphereRef = useRef<THREE.Mesh>(null)
  const markerGroupRef = useRef<THREE.Group>(null)
  const isMouseDown = useRef(false)
  const mouseDownPos = useRef({ x: 0, y: 0 })
  const lon = useRef(0)
  const lat = useRef(0)
  const onPointerDownLon = useRef(0)
  const onPointerDownLat = useRef(0)
  const onPointerDownX = useRef(0)
  const onPointerDownY = useRef(0)
  const animFrameRef = useRef<number>(null)
  const hotspotsRef = useRef(hotspots)
  const selectedIdRef = useRef(selectedHotspotId)
  hotspotsRef.current = hotspots
  selectedIdRef.current = selectedHotspotId

  // Initialize THREE.js scene
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 10000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    // Sphere for the panorama
    const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 60, 40)
    geometry.scale(-1, 1, 1) // Invert so texture faces inward
    const material = new THREE.MeshBasicMaterial({ color: 0x111111 })
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // Group for hotspot markers
    const markerGroup = new THREE.Group()
    scene.add(markerGroup)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    sphereRef.current = sphere
    markerGroupRef.current = markerGroup

    // Render loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)

      // Convert lon/lat to camera target
      const degToRad = (deg: number) => deg * Math.PI / 180
      const phi = degToRad(90 - lat.current)
      const theta = degToRad(lon.current)
      const target = new THREE.Vector3(
        SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta),
        SPHERE_RADIUS * Math.cos(phi),
        SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta)
      )
      camera.lookAt(target)
      renderer.render(scene, camera)

      // Position overlay above selected hotspot
      const overlay = overlayRef.current
      const selId = selectedIdRef.current
      if (overlay && selId) {
        const selHotspot = hotspotsRef.current.find(h => h.id === selId)
        if (selHotspot) {
          const pos3d = pitchYawToCartesian(selHotspot.pitch, selHotspot.yaw)
          const projected = pos3d.clone().project(camera)

          // Check if hotspot is in front of camera
          if (projected.z < 1) {
            const cx = (projected.x * 0.5 + 0.5) * container.clientWidth
            const cy = (-projected.y * 0.5 + 0.5) * container.clientHeight
            overlay.style.transform = `translate(${cx}px, ${cy}px)`
            overlay.style.opacity = '1'
          } else {
            overlay.style.opacity = '0'
          }
        } else {
          overlay.style.opacity = '0'
        }
      } else if (overlay) {
        overlay.style.opacity = '0'
      }
    }
    animate()

    // Resize handler
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    })
    resizeObserver.observe(container)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      resizeObserver.disconnect()
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  // Load panorama texture when imageUrl changes
  useEffect(() => {
    if (!imageUrl || !sphereRef.current) return

    const loader = new THREE.TextureLoader()
    loader.load(imageUrl, (texture) => {
      const material = sphereRef.current!.material as THREE.MeshBasicMaterial
      if (material.map) material.map.dispose()
      material.map = texture
      material.color.set(0xffffff)
      material.needsUpdate = true
    })
  }, [imageUrl])

  // Update hotspot markers
  useEffect(() => {
    const group = markerGroupRef.current
    if (!group) return

    // Clear existing markers
    while (group.children.length > 0) {
      const child = group.children[0]
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        ;(child.material as THREE.Material).dispose()
      }
      group.remove(child)
    }

    // Create new markers — red circle with white dot
    hotspots.forEach(hotspot => {
      const position = pitchYawToCartesian(hotspot.pitch, hotspot.yaw)
      const isSelected = hotspot.id === selectedHotspotId

      // Red outer circle
      const markerGeo = new THREE.SphereGeometry(isSelected ? 120 : 100, 24, 24)
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: isSelected ? 1 : 0.9,
      })
      const marker = new THREE.Mesh(markerGeo, markerMat)
      marker.position.copy(position)
      marker.userData.hotspotId = hotspot.id
      group.add(marker)

      // White center dot
      const dotGeo = new THREE.SphereGeometry(isSelected ? 45 : 35, 16, 16)
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const dot = new THREE.Mesh(dotGeo, dotMat)
      dot.position.copy(position)
      dot.userData.hotspotId = hotspot.id
      group.add(dot)

      // Outer glow ring
      const ringGeo = new THREE.RingGeometry(isSelected ? 140 : 120, isSelected ? 160 : 140, 32)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.copy(position)
      ring.lookAt(0, 0, 0)
      ring.userData.hotspotId = hotspot.id
      group.add(ring)
    })
  }, [hotspots, selectedHotspotId])

  // Mouse/touch controls for panning
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isMouseDown.current = true
    mouseDownPos.current = { x: e.clientX, y: e.clientY }
    onPointerDownX.current = e.clientX
    onPointerDownY.current = e.clientY
    onPointerDownLon.current = lon.current
    onPointerDownLat.current = lat.current
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isMouseDown.current) return
    lon.current = (onPointerDownX.current - e.clientX) * 0.1 + onPointerDownLon.current
    lat.current = (e.clientY - onPointerDownY.current) * 0.1 + onPointerDownLat.current
    lat.current = Math.max(-85, Math.min(85, lat.current))
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isMouseDown.current = false

    // Only treat as click if mouse didn't move much (not a drag)
    const dx = e.clientX - mouseDownPos.current.x
    const dy = e.clientY - mouseDownPos.current.y
    if (Math.sqrt(dx * dx + dy * dy) > 5) return

    const container = containerRef.current
    const camera = cameraRef.current
    if (!container || !camera) return

    const rect = container.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    // Check hotspot markers first
    if (markerGroupRef.current) {
      const markerHits = raycaster.intersectObjects(markerGroupRef.current.children, false)
      if (markerHits.length > 0) {
        const hotspotId = markerHits[0].object.userData.hotspotId
        if (hotspotId && onHotspotClick) {
          onHotspotClick(hotspotId)
          return
        }
      }
    }

    // If in placement mode, raycast onto the sphere
    if (placementMode && sphereRef.current) {
      const sphereHits = raycaster.intersectObject(sphereRef.current, false)
      if (sphereHits.length > 0 && onPanoramaClick) {
        const { pitch, yaw } = cartesianToPitchYaw(sphereHits[0].point)
        onPanoramaClick(pitch, yaw)
      }
    }
  }, [placementMode, onPanoramaClick, onHotspotClick])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const camera = cameraRef.current
    if (!camera) return
    camera.fov = Math.max(30, Math.min(100, camera.fov + e.deltaY * 0.05))
    camera.updateProjectionMatrix()
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        ref={containerRef}
        className={`w-full h-full ${placementMode ? 'cursor-place' : 'cursor-grab active:cursor-grabbing'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      />
      {overlayContent && (
        <div
          ref={overlayRef}
          className="absolute top-0 left-0 pointer-events-none transition-opacity duration-150"
          style={{ opacity: 0 }}
        >
          <div className="-translate-x-1/2 -translate-y-full pb-4">
            {overlayContent}
          </div>
        </div>
      )}
    </div>
  )
}

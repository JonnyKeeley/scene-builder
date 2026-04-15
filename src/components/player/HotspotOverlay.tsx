import type { Hotspot, ChartData } from '@/types/database'
import ChartRenderer from './ChartRenderer'

interface HotspotOverlayProps {
  hotspot: Hotspot
  onClose: () => void
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match?.[1] ?? null
}

export default function HotspotOverlay({ hotspot, onClose }: HotspotOverlayProps) {
  const hasVideo = hotspot.media_type === 'youtube' || hotspot.media_type === 'video'
  const hasChart = hotspot.media_type === 'chart'
  const hasGallery = hotspot.media_type === 'gallery'
  const widthClass = hasVideo || hasChart || hasGallery ? 'w-96' : 'w-72'

  return (
    <div className={`${widthClass} bg-black/75 backdrop-blur-md rounded-xl border border-white/15 shadow-2xl pointer-events-none`}>
      {/* Arrow pointing down to hotspot */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black/75" />

      <div className="flex flex-col max-h-[70vh]">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <h2 className="text-sm font-semibold text-white pr-3 truncate">{hotspot.title}</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0 pointer-events-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-3 space-y-2">
          {hotspot.body && (
            <p className="text-white/75 text-xs leading-relaxed whitespace-pre-wrap">
              {hotspot.body}
            </p>
          )}

          {hotspot.media_type === 'image' && hotspot.media_url && (
            <img
              src={hotspot.media_url}
              alt={hotspot.title}
              className="w-full rounded-lg"
            />
          )}

          {hotspot.media_type === 'youtube' && hotspot.media_url && (() => {
            const videoId = extractYouTubeId(hotspot.media_url!)
            return videoId ? (
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1`}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null
          })()}

          {hotspot.media_type === 'video' && hotspot.media_url && (
            <video
              src={hotspot.media_url}
              controls
              autoPlay
              muted
              className="w-full rounded-lg"
            />
          )}

          {hotspot.media_type === 'chart' && hotspot.media_url && (() => {
            try {
              const chartData = JSON.parse(hotspot.media_url) as ChartData
              return <ChartRenderer data={chartData} />
            } catch {
              return null
            }
          })()}

          {hotspot.media_type === 'gallery' && hotspot.media_url && (() => {
            try {
              const images = JSON.parse(hotspot.media_url) as string[]
              if (!images.length) return null
              return (
                <div className="grid grid-cols-2 gap-1.5">
                  {images.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  ))}
                </div>
              )
            } catch {
              return null
            }
          })()}
        </div>
      </div>
    </div>
  )
}

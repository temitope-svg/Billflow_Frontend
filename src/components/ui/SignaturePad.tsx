import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

type Point = { x: number; y: number }
type Stroke = Point[]

export interface SignaturePadHandle {
  clear: () => void
  undo: () => void
  isEmpty: () => boolean
  toDataURL: () => string
}

interface SignaturePadProps {
  className?: string
  penColor?: string
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ className = '', penColor = '#0F172A' }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const strokesRef = useRef<Stroke[]>([])
    const drawingRef = useRef(false)
    const currentStrokeRef = useRef<Stroke>([])

    const getCtx = () => canvasRef.current?.getContext('2d') ?? null

    const redraw = useCallback(() => {
      const canvas = canvasRef.current
      const ctx = getCtx()
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = penColor
      ctx.lineWidth = 2.25
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      for (const stroke of strokesRef.current) {
        if (stroke.length < 2) continue
        ctx.beginPath()
        ctx.moveTo(stroke[0].x, stroke[0].y)
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y)
        }
        ctx.stroke()
      }
    }, [penColor])

    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const parent = canvas.parentElement
      if (!parent) return
      const ratio = window.devicePixelRatio || 1
      const width = parent.clientWidth
      const height = parent.clientHeight
      canvas.width = Math.max(1, Math.floor(width * ratio))
      canvas.height = Math.max(1, Math.floor(height * ratio))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const ctx = getCtx()
      if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      redraw()
    }, [redraw])

    useEffect(() => {
      resizeCanvas()
      const observer = new ResizeObserver(() => resizeCanvas())
      if (canvasRef.current?.parentElement) {
        observer.observe(canvasRef.current.parentElement)
      }
      return () => observer.disconnect()
    }, [resizeCanvas])

    useImperativeHandle(ref, () => ({
      clear: () => {
        strokesRef.current = []
        redraw()
      },
      undo: () => {
        strokesRef.current = strokesRef.current.slice(0, -1)
        redraw()
      },
      isEmpty: () => strokesRef.current.length === 0,
      toDataURL: () => canvasRef.current?.toDataURL('image/png') ?? '',
    }))

    const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      drawingRef.current = true
      const point = pointFromEvent(e)
      currentStrokeRef.current = [point]
      strokesRef.current = [...strokesRef.current, currentStrokeRef.current]
    }

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return
      const point = pointFromEvent(e)
      currentStrokeRef.current.push(point)
      const ctx = getCtx()
      if (!ctx || currentStrokeRef.current.length < 2) return
      const prev = currentStrokeRef.current[currentStrokeRef.current.length - 2]
      ctx.strokeStyle = penColor
      ctx.lineWidth = 2.25
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
    }

    const onPointerUp = () => {
      drawingRef.current = false
      currentStrokeRef.current = []
    }

    return (
      <canvas
        ref={canvasRef}
        className={`touch-none cursor-crosshair ${className}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    )
  },
)

const traces = [
  { d: 'M0,120 H220 L300,200 V320 L420,440 H700', delay: '0s' },
  { d: 'M120,0 V160 L220,260 H480 L560,340 V620', delay: '0.6s' },
  { d: 'M1600,140 H1360 L1280,220 V360 L1160,480 H860', delay: '0.3s' },
  { d: 'M1480,0 V200 L1380,300 H1080 L1000,380 V700', delay: '0.9s' },
  { d: 'M0,560 H180 L260,640 V820 L340,900', delay: '1.2s' },
  { d: 'M1600,600 H1420 L1340,680 V860 L1260,940', delay: '1.5s' },
]

const nodes = [
  { cx: 220, cy: 120, delay: '0s' },
  { cx: 300, cy: 200, delay: '0.4s' },
  { cx: 420, cy: 440, delay: '0.8s' },
  { cx: 220, cy: 260, delay: '0.2s' },
  { cx: 560, cy: 340, delay: '1s' },
  { cx: 1360, cy: 140, delay: '0.5s' },
  { cx: 1280, cy: 220, delay: '1.1s' },
  { cx: 1160, cy: 480, delay: '0.3s' },
  { cx: 1380, cy: 300, delay: '0.7s' },
  { cx: 1080, cy: 300, delay: '1.3s' },
  { cx: 260, cy: 640, delay: '0.6s' },
  { cx: 1340, cy: 680, delay: '0.9s' },
]

type HeroBackgroundProps = {
  subtle?: boolean
}

function HeroBackground({ subtle = false }: HeroBackgroundProps) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      <div className={subtle ? 'opacity-35' : undefined}>
        <div className="animate-blob-drift absolute -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-gold-500/20 blur-3xl" />
        <div className="animate-blob-drift absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-gold-400/10 blur-3xl [animation-delay:3s]" />

        <svg
          className="absolute inset-0 h-full w-full opacity-70"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          aria-hidden="true"
        >
          {traces.map((trace, i) => (
            <path
              key={i}
              d={trace.d}
              stroke="#fcc101"
              strokeOpacity={0.35}
              strokeWidth={2}
            />
          ))}
          {traces.map((trace, i) => (
            <path
              key={`pulse-${i}`}
              d={trace.d}
              stroke="#fcc101"
              strokeWidth={2}
              strokeDasharray="40 360"
              className="animate-circuit-draw"
              style={{ animationDelay: trace.delay }}
            />
          ))}
          {nodes.map((node, i) => (
            <circle
              key={i}
              cx={node.cx}
              cy={node.cy}
              r={5}
              fill="#fcc101"
              className="animate-node-glow"
              style={{ animationDelay: node.delay }}
            />
          ))}
        </svg>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      </div>
    </div>
  )
}

export default HeroBackground

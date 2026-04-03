export default function Loader() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative flex items-center justify-center w-16 h-16">

        {/* Rotating ring */}
        <div className="loader-ring relative w-16 h-16" />

        {/* SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          className="absolute h-10 w-10 loader-svg"
        >
          <defs>
            <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="80%" stopColor="#6366f1" />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <path
            fill="url(#iconGradient)"
            filter="url(#glow)"
            className="loader-path"
            d="M320 176C311.2 176 304 168.8 304 160L304 144C304 99.8 339.8 64 384 64L400 64C408.8 64 416 71.2 416 80L416 96C416 140.2 380.2 176 336 176L320 176zM96 352C96 275.7 131.7 192 208 192C235.3 192 267.7 202.3 290.7 211.3C309.5 218.6 330.6 218.6 349.4 211.3C372.3 202.4 404.8 192 432.1 192C508.4 192 544.1 275.7 544.1 352C544.1 480 464.1 576 384.1 576C367.6 576 346 569.4 332.6 564.7C324.5 561.9 315.7 561.9 307.6 564.7C294.2 569.4 272.6 576 256.1 576C176.1 576 96.1 480 96.1 352z"
          />
        </svg>

      </div>
    </div>
  )
}
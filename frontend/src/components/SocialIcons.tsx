type IconProps = { size?: number; className?: string }

export function LinkedinIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

export function GithubIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6 0-1.5-.5-2.8-1.4-3.8.1-.4.2-1.5-.2-3.2 0 0-1.2-.4-3.9 1.5-1.6-.5-3.4-.5-5 0C7.8.2 6.6.6 6.6.6c-.4 1.7-.3 2.8-.2 3.2C5.5 4.8 5 6.1 5 7.6c0 4.6 2.7 5.7 5.5 6-.3.6-.5 1.3-.5 2V19" />
    </svg>
  )
}

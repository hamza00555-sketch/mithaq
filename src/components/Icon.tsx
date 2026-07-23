import type { ReactNode } from 'react'

export type IconName =
  | 'home' | 'calendar' | 'games' | 'wish' | 'settings'
  | 'moon' | 'spark' | 'signal' | 'wheel' | 'flame' | 'grid'
  | 'choices' | 'people' | 'cards' | 'dice' | 'rock' | 'paper'
  | 'scissors' | 'target' | 'trophy' | 'medal' | 'star' | 'lock'
  | 'reset' | 'logout' | 'copy' | 'plus' | 'close' | 'check'
  | 'clock' | 'arrow' | 'refresh' | 'eye' | 'gift' | 'chat'
  | 'alert' | 'heart' | 'hand'

const icons: Record<IconName, ReactNode> = {
  home: <><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  games: <><path d="M8.5 8h7a5.5 5.5 0 0 1 5.1 7.6l-1 2.4a2 2 0 0 1-3.3.7L14.8 17H9.2l-1.5 1.7a2 2 0 0 1-3.3-.7l-1-2.4A5.5 5.5 0 0 1 8.5 8Z" /><path d="M8 11v4M6 13h4M17 12h.01M15 14h.01" /></>,
  wish: <><path d="M12 21S4 16.2 4 10a4 4 0 0 1 7-2.6A4 4 0 0 1 18 10c0 6.2-6 11-6 11Z" /><path d="M17 3v4M15 5h4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  moon: <path d="M20.5 15.1A8.5 8.5 0 0 1 8.9 3.5 8.5 8.5 0 1 0 20.5 15Z" />,
  spark: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" /><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" /></>,
  signal: <><path d="M5 12a7 7 0 0 1 14 0" /><path d="M8 12a4 4 0 0 1 8 0" /><circle cx="12" cy="13" r="1" /><path d="M12 17v4" /></>,
  wheel: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><path d="M12 3v7M12 14v7M3 12h7M14 12h7M5.6 5.6l5 5M13.4 13.4l5 5M18.4 5.6l-5 5M10.6 13.4l-5 5" /></>,
  flame: <path d="M12 22c4 0 7-2.8 7-7.1 0-2.7-1.4-5.2-4.2-7.5.1 2.3-1 3.4-2 4.2.2-3.8-1.7-6.3-4.3-8.6.2 4.2-3.5 6.2-3.5 11.9C5 19.2 8 22 12 22Z" />,
  grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
  choices: <><path d="M4 6h16M4 12h10M4 18h7" /><circle cx="18" cy="12" r="2" /><circle cx="15" cy="18" r="2" /></>,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2" /><path d="M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4.6V20" /></>,
  cards: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="m12 8 2 2-2 2-2-2 2-2Z" /><path d="M8 17h8" /></>,
  dice: <><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8" cy="8" r=".8" fill="currentColor" /><circle cx="16" cy="8" r=".8" fill="currentColor" /><circle cx="12" cy="12" r=".8" fill="currentColor" /><circle cx="8" cy="16" r=".8" fill="currentColor" /><circle cx="16" cy="16" r=".8" fill="currentColor" /></>,
  rock: <path d="M6 21c-2-2-3-5-2-8l1-4a2 2 0 0 1 4 1V6a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v4c0 4-3 7-7 7H6Z" />,
  paper: <><path d="M6 2h9l4 4v16H6z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></>,
  scissors: <><circle cx="6" cy="7" r="3" /><circle cx="6" cy="17" r="3" /><path d="m8.5 8.5 11 7.5M8.5 15.5 19.5 8" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6" /></>,
  medal: <><circle cx="12" cy="14" r="5" /><path d="m9 3 3 6 3-6M7 3l3 7M17 3l-3 7" /><path d="m12 12 .7 1.4 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2.7-1.4Z" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  lock: <><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  reset: <><path d="M4 8V4h4" /><path d="M5 5a9 9 0 1 1-1 10" /></>,
  logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" /></>,
  copy: <><rect x="8" y="8" width="11" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  arrow: <><path d="m15 18-6-6 6-6" /></>,
  refresh: <><path d="M20 7v5h-5" /><path d="M19 12a7 7 0 1 0-2 5" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  gift: <><rect x="3" y="9" width="18" height="12" rx="2" /><path d="M12 9v12M3 13h18M12 9H7a2.5 2.5 0 1 1 2.5-2.5C9.5 8 12 9 12 9ZM12 9h5a2.5 2.5 0 1 0-2.5-2.5C14.5 8 12 9 12 9Z" /></>,
  chat: <path d="M20 15a4 4 0 0 1-4 4H8l-5 3 1.5-5A8 8 0 1 1 20 15Z" />,
  alert: <><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
  heart: <path d="M12 21S4 16.2 4 10a4 4 0 0 1 7-2.6A4 4 0 0 1 18 10c0 6.2-6 11-6 11Z" />,
  hand: <path d="M7 11V6a2 2 0 0 1 4 0v4-6a2 2 0 0 1 4 0v6-4a2 2 0 0 1 4 0v7c0 5-3 8-8 8H9c-2 0-3.5-1-4.5-2.5L2 15a2 2 0 0 1 3-2.5L7 14v-3Z" />,
}

export default function Icon({ name, size = 22, className = '', strokeWidth = 1.8 }: {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  )
}

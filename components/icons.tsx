/**
 * Iconos SVG reutilizables, extraídos del prototipo (DIMEX.dc.html).
 * Todos aceptan `size` y `className`. Los de trazo usan `currentColor`,
 * así que su color se controla con utilidades de texto (p. ej. text-wa).
 */

type IconProps = { size?: number; className?: string };

export function WhatsAppIcon({ size = 20, className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16 3.2c-7 0-12.7 5.7-12.7 12.7 0 2.24.6 4.43 1.73 6.36L3.2 28.8l6.7-1.75a12.7 12.7 0 0 0 6.1 1.55h.01c7 0 12.7-5.7 12.7-12.7S23 3.2 16 3.2zm5.8 15.2c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.68.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.32-.02-.49.14-.65.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.76.75.32 1.34.51 1.8.66.76.24 1.44.21 1.98.13.6-.09 1.88-.77 2.15-1.51.27-.74.27-1.38.19-1.51z" />
    </svg>
  );
}

export function CartIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="9" cy="20" r="1.3" />
      <circle cx="18" cy="20" r="1.3" />
      <path d="M2.5 3.5h2.5l2.2 11a1.4 1.4 0 0 0 1.4 1.1h8.4a1.4 1.4 0 0 0 1.4-1.1L21 7H6" />
    </svg>
  );
}

export function SearchIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" className={className}>
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.5" y2="16.5" />
    </svg>
  );
}

export function MenuIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" className={className}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokIcon({ size = 17, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.5 2h-3v13.2a3 3 0 1 1-2.3-2.92v-3.1a6 6 0 1 0 5.3 5.96V8.86a7 7 0 0 0 4 1.25V7.03a4 4 0 0 1-4-4.03z" />
    </svg>
  );
}

export function TruckIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="1.5" y="6" width="12" height="10" rx="1" />
      <path d="M13.5 9h4l3 3v4h-7z" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

export function StoreIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M4 10v9h16v-9" />
      <path d="M2.5 6.5h19l-1 3.7a2.5 2.5 0 0 1-4.9 0 2.5 2.5 0 0 1-4.9 0 2.5 2.5 0 0 1-4.9 0z" />
      <path d="M9 19v-5h6v5" />
    </svg>
  );
}

export function ChatIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M21 11.5a8.4 8.4 0 0 1-11.9 7.6L3 21l1.9-5.9A8.4 8.4 0 1 1 21 11.5z" />
    </svg>
  );
}

export function CheckIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function PinIcon({ size = 17, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

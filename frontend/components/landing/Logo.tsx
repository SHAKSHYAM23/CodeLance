export function Logo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M100 80 L70 130 L100 180"
        stroke="#3b82f6"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ filter: 'drop-shadow(0 0 10px rgba(59,130,246,0.5))' }}
      />
      <path
        d="M125 60 L150 130 L100 200"
        stroke="#f59e0b"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
        style={{ filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.5))' }}
      />
    </svg>
  );
}

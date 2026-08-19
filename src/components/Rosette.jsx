export function Rosette({ className, style }) {
  // Eight-point geometric star (khatam), built from two overlapping squares.
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="4" />
      <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="4" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

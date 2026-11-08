/**
 * Marca d'água em traço para o ingresso de liga (Brasileirão): taça genérica
 * com uma bola no centro. Desenho próprio, não reproduz troféu oficial.
 * O traço usa currentColor; a cor e a transparência vêm do CSS.
 */
export default function TacaTraco({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 240"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* Asas da taça: duas curvas largas que abraçam a bola */}
      <path d="M58 18c-30 40-34 92-6 128 16 20 40 30 68 30s52-10 68-30c28-36 24-88-6-128" />
      <path d="M78 30c-18 32-18 70 2 94 10 12 24 18 40 18s30-6 40-18c20-24 20-62 2-94" />
      {/* Haste e base */}
      <path d="M104 176v20M136 176v20" />
      <path d="M84 196h72l10 26H74z" />
      <path d="M92 210h56" />
      {/* Bola */}
      <circle cx="120" cy="88" r="34" />
      <path d="m120 70 15 11-6 18h-18l-6-18z" />
      <path d="M120 54v16M135 81l16-6M129 99l11 15M111 99l-11 15M105 81l-16-6" />
    </svg>
  );
}

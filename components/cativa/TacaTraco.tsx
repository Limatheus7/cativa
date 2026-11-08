/**
 * Marca d'água em traço do ingresso do Brasileirão: a taça da competição
 * (asas laterais, arco central com a bola e base com o nome), desenhada a
 * partir da referência enviada pelo time de produto.
 * Atenção: reproduz o troféu oficial; uso a confirmar com o jurídico.
 * O traço usa currentColor; cor e transparência vêm do CSS.
 */
export default function TacaTraco({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 340"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* Asas: contorno externo (topo inclinado, cintura estreita, abre na base) */}
      <path d="M26 12 L98 38 C94 110 100 176 98 240" />
      <path d="M214 12 L142 38 C146 110 140 176 142 240" />
      <path d="M26 12 C38 96 72 166 64 206 C60 222 48 234 40 240" />
      <path d="M214 12 C202 96 168 166 176 206 C180 222 192 234 200 240" />
      {/* Contorno interno das asas (traço duplo) */}
      <path d="M38 26 L88 44 C85 112 90 176 89 240" />
      <path d="M38 26 C48 100 80 168 74 208 C71 222 62 232 56 240" />
      <path d="M202 26 L152 44 C155 112 150 176 151 240" />
      <path d="M202 26 C192 100 160 168 166 208 C169 222 178 232 184 240" />

      {/* Arco pontudo central */}
      <path d="M120 56 L72 150 C80 188 90 214 98 240" />
      <path d="M120 56 L168 150 C160 188 150 214 142 240" />

      {/* Bola dentro do círculo */}
      <circle cx="120" cy="158" r="40" />
      <circle cx="120" cy="158" r="31" />
      <path d="m120 145 12.4 9-4.7 14.6h-15.4l-4.7-14.6z" />
      <path d="M120 145v-18M132.4 154l17-5.5M127.7 168.6l10.5 14.5M112.3 168.6l-10.5 14.5M107.6 154l-17-5.5" />

      {/* Base com o nome */}
      <rect x="40" y="240" width="160" height="56" rx="4" />
      <rect x="48" y="248" width="144" height="40" rx="2" />
      <text
        x="120"
        y="275"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontFamily="var(--font-texto), system-ui, sans-serif"
        fontWeight="700"
        fontSize="17"
        letterSpacing="1.5"
      >
        BRASILEIRÃO
      </text>
    </svg>
  );
}

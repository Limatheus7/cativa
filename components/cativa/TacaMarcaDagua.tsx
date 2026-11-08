/**
 * Taça genérica em silhueta, usada como marca d'água no ingresso de copa.
 * Desenho próprio: não reproduz o troféu oficial de nenhuma competição.
 */
export default function TacaMarcaDagua({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 140" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M30 8h40c0 6-1 12-2 17 9 1 17 8 17 18 0 12-10 20-22 22-3 7-8 12-13 14v14h10c4 0 7 3 7 7v6h8c3 0 5 2 5 5v9H20v-9c0-3 2-5 5-5h8v-6c0-4 3-7 7-7h10V79c-5-2-10-7-13-14C25 63 15 55 15 43c0-10 8-17 17-18-1-5-2-11-2-17zm-1 25c-4 1-6 5-6 10 0 6 4 11 11 13-3-7-4-15-5-23zm42 0c-1 8-2 16-5 23 7-2 11-7 11-13 0-5-2-9-6-10z"
      />
    </svg>
  );
}

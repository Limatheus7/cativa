// Roseta "1 de 1": guilloché determinístico a partir dos dados do jogo.
// O mesmo registro dá sempre a mesma roseta, em qualquer aparelho.

export function semente(texto: string): () => number {
  let h = 2166136261;
  for (const c of texto) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return () => {
    h ^= h << 13;
    h >>>= 0;
    h ^= h >> 17;
    h ^= h << 5;
    h >>>= 0;
    return h / 4294967296;
  };
}

export function caminhosRoseta(dados: string): { d: string; opacidade: number; largura: number }[] {
  const rnd = semente(dados);
  const camadas = [
    { R: 400, k: 7 + Math.floor(rnd() * 5), a: 34 + rnd() * 20, n: 60, op: 0.55, w: 1.3 },
    { R: 340, k: 11 + Math.floor(rnd() * 6), a: 26 + rnd() * 14, n: 48, op: 0.45, w: 1.1 },
    { R: 270, k: 5 + Math.floor(rnd() * 4), a: 30 + rnd() * 14, n: 40, op: 0.35, w: 1 },
  ];
  const saida: { d: string; opacidade: number; largura: number }[] = [];
  for (const L of camadas) {
    for (let j = 0; j < L.n; j++) {
      const fase = ((j / L.n) * Math.PI * 2) / L.k;
      let d = "";
      for (let i = 0; i <= 720; i++) {
        const t = (i / 720) * Math.PI * 2;
        const r = L.R + L.a * Math.sin(L.k * t + fase * L.k) + 6 * Math.sin(3 * L.k * t);
        d += (i ? "L" : "M") + (r * Math.cos(t)).toFixed(1) + " " + (r * Math.sin(t)).toFixed(1);
      }
      saida.push({ d, opacidade: L.op * (0.35 + 0.65 * (j % 2)), largura: L.w });
    }
  }
  return saida;
}

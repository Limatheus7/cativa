"use client";

/**
 * Foto de fundo já recortada e suavizada, pronta para o modelo "Canhoto".
 * Não usa `filter: blur()` do CSS (a captura em PNG não o aplica de forma confiável) nem
 * `ctx.filter` (o Safari não tem): reduz a foto e amplia com suavização, o que dá um
 * desfoque leve parecido com blur(3px) em qualquer navegador.
 */
export async function suavizar(src: string, largura: number, altura: number): Promise<string> {
  const img = new Image();
  img.src = src;
  await img.decode();

  // Recorte "cover" centralizado, na proporção do destino.
  const proporcao = largura / altura;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  if (sw / sh > proporcao) sw = sh * proporcao;
  else sh = sw / proporcao;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;

  // Passa por um tamanho menor (1/4) e volta: é isso que suaviza.
  const pequeno = document.createElement("canvas");
  pequeno.width = Math.max(1, Math.round(largura / 4));
  pequeno.height = Math.max(1, Math.round(altura / 4));
  const cp = pequeno.getContext("2d")!;
  cp.imageSmoothingQuality = "high";
  cp.drawImage(img, sx, sy, sw, sh, 0, 0, pequeno.width, pequeno.height);

  const grande = document.createElement("canvas");
  grande.width = largura;
  grande.height = altura;
  const cg = grande.getContext("2d")!;
  cg.imageSmoothingQuality = "high";
  cg.drawImage(pequeno, 0, 0, largura, altura);
  return grande.toDataURL("image/jpeg", 0.9);
}

/** Foto em preto e branco com contraste, pixel a pixel (sem `filter` de CSS nem `ctx.filter`). */
export async function emCinza(src: string, largura: number, altura: number): Promise<string> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const proporcao = largura / altura;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  if (sw / sh > proporcao) sw = sh * proporcao;
  else sh = sw / proporcao;
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, largura, altura);
  const dados = ctx.getImageData(0, 0, largura, altura);
  const px = dados.data;
  for (let i = 0; i < px.length; i += 4) {
    const g = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    const v = Math.max(0, Math.min(255, (g - 128) * 1.15 + 128));
    px[i] = px[i + 1] = px[i + 2] = v;
  }
  ctx.putImageData(dados, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.9);
}

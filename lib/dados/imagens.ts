"use client";

/**
 * Reduz a foto antes de guardar (lado maior em `max` px, JPEG). Sem isso,
 * poucas fotos de celular já estouram o espaço do aparelho.
 * Quando houver backend, a foto original sobe para o armazenamento e aqui
 * fica só a miniatura.
 */
export async function reduzirFoto(arquivo: File, max = 900, qualidade = 0.72): Promise<string> {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, falha) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => falha(new Error("Não conseguimos abrir essa imagem."));
      i.src = url;
    });
    const escala = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", qualidade);
  } finally {
    URL.revokeObjectURL(url);
  }
}

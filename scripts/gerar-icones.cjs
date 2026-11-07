// Gera os ícones do PWA a partir do símbolo oficial (cadeira em papel sobre o verde Cativa).
// Uso: node scripts/gerar-icones.cjs (precisa do playwright instalado)
const { chromium } = require("playwright");
const { readFileSync } = require("node:fs");

const svg = readFileSync("public/marca/cadeira-papel.svg", "utf8");
const icones = [
  { arquivo: "icon-192.png", tamanho: 192, escala: 0.56 },
  { arquivo: "icon-512.png", tamanho: 512, escala: 0.56 },
  { arquivo: "icon-maskable-512.png", tamanho: 512, escala: 0.44 },
  { arquivo: "apple-touch-icon.png", tamanho: 180, escala: 0.56 },
];

(async () => {
const browser = await chromium.launch();
const page = await browser.newPage();
for (const { arquivo, tamanho, escala } of icones) {
  await page.setViewportSize({ width: tamanho, height: tamanho });
  await page.setContent(`<body style="margin:0;width:${tamanho}px;height:${tamanho}px;display:grid;place-items:center;background:#1F4D3A">
    <div style="width:${tamanho * escala}px">${svg.replace("<svg ", '<svg style="width:100%;height:auto;display:block" ')}</div></body>`);
  await page.screenshot({ path: `public/icons/${arquivo}` });
}
await browser.close();
console.log("ícones gerados");
})();

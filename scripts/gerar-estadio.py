"""Gera o fundo de estádio da tela de login (arte procedural, sem fotos nem escudos).

Uso: python3 scripts/gerar-estadio.py public/img/estadio.jpg
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1080, 1920
rng = np.random.default_rng(7)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
img = np.zeros((H, W, 3), np.float32)

# Céu noturno
t = yy / H
img[..., 0] = 8 + 10 * t
img[..., 1] = 16 + 18 * t
img[..., 2] = 18 + 10 * t

cx = W / 2
# Elipses do anel do estádio (externa = topo da arquibancada, interna = borda do campo)
def ell(cy, rx, ry):
    return ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2

outer = ell(1250, 1150, 900)
# Campo em perspectiva (trapézio): topo y=1170, base y=1500
PT, PB = 1170, 1500
half = 330 + (yy - PT) / (PB - PT) * 520
pitch_mask = (yy >= PT) & (yy <= PB) & (np.abs(xx - cx) <= half)
inner = np.where(pitch_mask, 0.0, 2.0)
stands = (outer < 1) & ~pitch_mask & (yy < PB)

# Arquibancada: base escura com textura de torcida (pontos coloridos)
depth = np.clip((yy - 350) / 1000, 0, 1)
base = np.stack([20 + 25 * depth, 32 + 35 * depth, 28 + 25 * depth], -1)
img[stands] = base[stands]

# Fileiras (anéis concêntricos sutis)
rings = (np.sin(np.sqrt(outer) * 260) * 0.5 + 0.5) ** 6
img[stands] *= (1 + 0.08 * rings[stands])[:, None]

# Divisões entre setores (faixas de concreto)
for ty in (560, 820, 1060):
    band = np.exp(-((yy - ty - 0.00012 * (xx - cx) ** 2) / 7) ** 2)
    img[stands] += (band[stands] * 35)[:, None]

# Torcida: pontos de cor aleatórios
crowd = Image.new("RGB", (W, H), (0, 0, 0))
d = ImageDraw.Draw(crowd)
palette = [(230, 230, 220), (200, 60, 50), (240, 200, 90), (60, 120, 200),
           (40, 140, 80), (220, 220, 230), (120, 120, 120)]
for _ in range(70000):
    x = rng.uniform(0, W); y = rng.uniform(250, 1450)
    o = ((x - cx) / 1150) ** 2 + ((y - 1250) / 900) ** 2
    inside = PT <= y <= PB and abs(x - cx) <= 330 + (y - PT) / (PB - PT) * 520
    if o >= 1 or inside or y > PB:
        continue
    r = 0.8 + 2.2 * (y - 250) / 1200
    c = palette[rng.integers(len(palette))]
    k = rng.uniform(0.25, 0.75)
    d.ellipse([x - r, y - r, x + r, y + r], fill=tuple(int(v * k) for v in c))
crowd = np.asarray(crowd.filter(ImageFilter.GaussianBlur(0.8)), np.float32)
img = np.maximum(img, crowd * 0.9)

# Campo com faixas
pitch = inner < 1
img[pitch] = [34, 92, 48]
stripes = (np.floor(np.clip((yy - PT) / (PB - PT), 0, 1) ** 0.8 * 9) % 2 == 0) & pitch
img[stripes] *= 1.12
# Luz no gramado
glow = np.exp(-(((xx - cx) / 600) ** 2 + ((yy - 1320) / 220) ** 2))
img[pitch] *= (0.85 + 0.45 * glow[pitch])[:, None]
# Linhas do campo
lines = Image.new("L", (W, H), 0)
ld = ImageDraw.Draw(lines)
ld.polygon([(cx - 320, PT + 6), (cx + 320, PT + 6), (cx + 840, PB - 6), (cx - 840, PB - 6)], outline=150, width=3)
my = PT + (PB - PT) * 0.42
mh = 330 + (my - PT) / (PB - PT) * 520
ld.line([cx - mh + 8, my, cx + mh - 8, my], fill=150, width=3)
ld.ellipse([cx - 120, my - 34, cx + 120, my + 34], outline=150, width=3)
lines = np.asarray(lines.filter(ImageFilter.GaussianBlur(1)), np.float32) / 255
lines *= pitch
img += lines[..., None] * np.array([150, 170, 150])

# Cobertura (anel escuro no topo) e refletores
roof = (outer >= 1) & (ell(1250, 1250, 1000) < 1)
img[roof] = img[roof] * 0.35 + np.array([6, 12, 10]) * 0.65

lights = np.zeros((H, W), np.float32)
for tx, ty in [(120, 300), (390, 230), (690, 230), (960, 300)]:
    for gx in range(-2, 3):
        for gy in range(-1, 2):
            lx, ly = tx + gx * 16, ty + gy * 14
            dd = (xx - lx) ** 2 + (yy - ly) ** 2
            lights += 1.4 * np.exp(-dd / (2 * 4 ** 2))
    dd = (xx - tx) ** 2 + (yy - ty) ** 2
    lights += 0.45 * np.exp(-dd / (2 * 70 ** 2)) + 0.10 * np.exp(-dd / (2 * 260 ** 2))
img += lights[..., None] * np.array([255, 250, 225])

# Névoa de luz sobre o estádio
haze = np.exp(-(((xx - cx) / 900) ** 2 + ((yy - 900) / 600) ** 2))
img += haze[..., None] * np.array([18, 30, 22])

# Torcida em primeiro plano (silhuetas)
rows = [(1560, 34, (22, 38, 30)), (1650, 46, (14, 26, 20)), (1760, 62, (9, 17, 13)), (1880, 80, (5, 10, 8))]
for row, (y0, s, tone) in enumerate(rows):
    fg = Image.new("L", (W, H), 0)
    fd = ImageDraw.Draw(fg)
    x = -rng.uniform(0, s)
    while x < W + s:
        hy = y0 + rng.uniform(-12, 12) * (1 + row * 0.4)
        hr = s * rng.uniform(0.42, 0.55)
        fd.ellipse([x - hr, hy - hr * 1.15, x + hr, hy + hr * 1.15], fill=255)
        fd.rounded_rectangle([x - s * 1.05, hy + hr * 0.8, x + s * 1.05, H + 50], radius=int(s * 0.7), fill=255)
        if rng.random() < 0.12:  # braço levantado
            fd.line([x + s * 0.7, hy + hr, x + s * 0.9, hy - s * 1.6], fill=255, width=int(s * 0.35))
        x += s * rng.uniform(1.5, 2.1)
    m = np.asarray(fg.filter(ImageFilter.GaussianBlur(1.5 + row)), np.float32) / 255
    # Contraluz no topo de cada fileira
    shifted = np.roll(m, 5, axis=0)
    rim = np.clip(m - shifted, 0, 1)
    img = img * (1 - m[..., None]) + np.array(tone) * m[..., None]
    img += rim[..., None] * np.array([70, 95, 75]) * (1 - row * 0.2)

# Vinheta, desfoque leve e grão
vig = 1 - 0.55 * np.clip(((xx - cx) / W) ** 2 * 1.6 + ((yy - H * 0.55) / H) ** 2 * 1.2, 0, 1)
img *= vig[..., None]
img += rng.normal(0, 3.5, (H, W, 1))
out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))
out.save(sys.argv[1], quality=82, optimize=True, progressive=True)
print("ok", sys.argv[1])

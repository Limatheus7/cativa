# Cativa

Sua cadeira cativa na história do seu time.

PWA mobile-first em Next.js. Por enquanto só as telas de entrada (boas-vindas, telefone, entrar e criar conta), sem backend; o login de verdade vem com o Supabase.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000 (melhor no modo celular do navegador).

## Marca

- `public/marca/` traz o símbolo da cadeira e o logotipo oficiais, só recoloridos para dar contraste (papel sobre o verde).
- `npm run icones` gera os ícones do PWA a partir do símbolo (precisa do Playwright).

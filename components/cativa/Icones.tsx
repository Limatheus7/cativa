// Ícones de traço, mesma espessura e pontas arredondadas da cadeira da marca.

type P = { tamanho?: number };

function Svg({ tamanho = 24, children, espessura = 2 }: P & { children: React.ReactNode; espessura?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconeInicio = (p: P) => (
  <Svg {...p}>
    <path d="M4 11 12 4l8 7" />
    <path d="M6 9.5V20h12V9.5" />
    <path d="M10 20v-5h4v5" />
  </Svg>
);

export const IconeTorcida = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2" />
    <circle cx="17" cy="9" r="2.6" />
    <path d="M16.5 14.6c2.4.2 4 1.8 4.5 4.6" />
  </Svg>
);

/** Cadeira da marca: encosto em arco, assento com pontas arredondadas, placa. */
export const IconeCadeira = (p: P) => (
  <Svg {...p} espessura={2.2}>
    <path d="M7 12V7a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v5" />
    <rect x="4.5" y="12" width="15" height="4" rx="2" />
    <path d="M7 16v5M17 16v5M10.5 6.5h3" />
  </Svg>
);

export const IconeColecao = (p: P) => (
  <Svg {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
    <circle cx="7.5" cy="9" r="1.6" />
    <circle cx="16.5" cy="12" r="1.6" />
  </Svg>
);

export const IconePerfil = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
  </Svg>
);

export const IconeSino = (p: P) => (
  <Svg {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
  </Svg>
);

export const IconeVoltar = (p: P) => (
  <Svg {...p} espessura={2.2}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const IconeCoracao = ({ cheio, ...p }: P & { cheio?: boolean }) => (
  <svg width={p.tamanho ?? 22} height={p.tamanho ?? 22} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"
      fill={cheio ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconeComentario = (p: P) => (
  <Svg {...p}>
    <path d="M4 5h16v11H9l-5 4z" />
  </Svg>
);

export const IconeEstrela = ({ cheia, ...p }: P & { cheia?: boolean }) => (
  <svg width={p.tamanho ?? 20} height={p.tamanho ?? 20} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.6l5.8-.8z"
      fill={cheia ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconeEngrenagem = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
  </Svg>
);

export const IconeLua = (p: P) => (
  <Svg {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </Svg>
);

export const IconeSol = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Svg>
);

export const IconeLapis = (p: P) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="M13.5 6.5l4 4" />
  </Svg>
);

export const IconeMais = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconeFechar = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconeCamera = (p: P) => (
  <Svg {...p}>
    <path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Svg>
);

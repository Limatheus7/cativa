// Roda no <head> antes da primeira pintura: aplica o tema salvo, ou o do celular.
// Fica fora de lib/tema.ts porque o layout (servidor) precisa ler esta string.
export const CHAVE_TEMA = "cativa:tema";

export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("${CHAVE_TEMA}");if(t!=="claro"&&t!=="escuro"){t=matchMedia("(prefers-color-scheme: dark)").matches?"escuro":"claro"}document.documentElement.dataset.tema=t}catch(e){}})()`;

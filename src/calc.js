// Contas do simulador e da calculadora de portabilidade. Funções puras, testadas em tests/.

// Taxas de referência para simulação (% ao mês). INSS usa o teto do CNPS; as demais são
// as referências que a RealCred+ já usava no site, porque a taxa real depende do convênio.
// Prazos de 2026: INSS 108 (IN PRES/INSS 204), SIAPE 120 (Decreto 12.957). Margem de militar
// segue a regra de cada Força, por isso o simulador não confere a renda nesse caso.
export const PRODUTOS = {
  inss: { nome: 'Consignado INSS', taxa: 1.85, prazoMax: 108, margem: 0.35, taxaTexto: 'teto do INSS' },
  servidor: { nome: 'Consignado de servidor público', taxa: 3.55, prazoMax: 120, margem: 0.35, taxaTexto: 'taxa de referência' },
  militar: { nome: 'Consignado de militar', taxa: 3.45, prazoMax: 96, margem: null, taxaTexto: 'taxa de referência' },
  clt: { nome: 'Crédito do Trabalhador', taxa: 4.0, prazoMax: 84, margem: 0.35, taxaTexto: 'taxa de referência' },
  pessoal: { nome: 'Crédito pessoal', taxa: 6.5, prazoMax: 60, margem: null, taxaTexto: 'taxa de referência' },
  fgts: { nome: 'Antecipação do saque-aniversário do FGTS', taxa: 1.8, taxaTexto: 'taxa de referência' },
};

// Tabela oficial do saque-aniversário: percentual do saldo + parcela adicional.
const FAIXAS_FGTS = [
  [500, 0.5, 0],
  [1000, 0.4, 50],
  [5000, 0.3, 150],
  [10000, 0.2, 650],
  [15000, 0.15, 1150],
  [20000, 0.1, 1900],
  [Infinity, 0.05, 2900],
];

export function parcela(valor, taxaMensalPct, meses) {
  if (!(valor > 0) || !(meses > 0)) return 0;
  const i = taxaMensalPct / 100;
  if (i === 0) return valor / meses;
  return (valor * i) / (1 - Math.pow(1 + i, -meses));
}

export function valorPresente(pagamento, taxaMensalPct, meses) {
  if (!(pagamento > 0) || !(meses > 0)) return 0;
  const i = taxaMensalPct / 100;
  if (i === 0) return pagamento * meses;
  return (pagamento * (1 - Math.pow(1 + i, -meses))) / i;
}

export function prazos(tipo) {
  const max = PRODUTOS[tipo]?.prazoMax ?? 0;
  const lista = [];
  for (let n = 12; n <= max; n += 12) lista.push(n);
  return lista;
}

export function saqueAnual(saldo) {
  if (!(saldo > 0)) return 0;
  const [, pct, adicional] = FAIXAS_FGTS.find(([limite]) => saldo <= limite);
  return saldo * pct + adicional;
}

// Até 31/10/2026 são até 5 saques antecipados; a partir de 01/11/2026, até 3.
// Cada saque antecipado fica entre R$ 100 e R$ 500.
export function anosFgts(hoje = new Date()) {
  return hoje < new Date('2026-11-01T00:00:00-03:00') ? 5 : 3;
}

export function antecipacaoFgts(saldo, hoje = new Date(), taxaMensalPct = PRODUTOS.fgts.taxa) {
  const anos = anosFgts(hoje);
  const saques = [];
  let restante = saldo;
  for (let k = 0; k < anos; k++) {
    const saque = Math.min(500, saqueAnual(restante));
    if (saque < 100) break;
    saques.push(Math.round(saque * 100) / 100);
    restante -= saque;
  }
  const i = taxaMensalPct / 100;
  const recebe = saques.reduce((soma, s, k) => soma + s / Math.pow(1 + i, 12 * (k + 1)), 0);
  const bloqueado = saques.reduce((soma, s) => soma + s, 0);
  return { saques, recebe, bloqueado, anos };
}

export function portabilidade({ parcelaAtual, restantes, taxaAtual, taxaNova }) {
  const saldo = valorPresente(parcelaAtual, taxaAtual, restantes);
  const nova = parcela(saldo, taxaNova, restantes);
  const economiaMes = parcelaAtual - nova;
  return { saldo, nova, economiaMes, economiaTotal: economiaMes * restantes };
}

// "5.000" -> 5000; "5.000,50" -> 5000.5; "1,85" -> 1.85; "350" -> 350
export function lerNumero(texto) {
  if (typeof texto === 'number') return texto;
  const limpo = String(texto ?? '')
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? n : 0;
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const percentual = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const brl = (n) => moeda.format(Number.isFinite(n) ? n : 0);
export const pct = (n) => `${percentual.format(n)}%`;

// Formata enquanto a pessoa digita: só reais inteiros, com ponto de milhar.
export function mascaraReais(texto) {
  const digitos = String(texto ?? '').replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return digitos ? inteiro.format(Number(digitos)) : '';
}

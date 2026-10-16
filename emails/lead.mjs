// E-mail que chega em operacional@ a cada mensagem do formulário do site.
// Feito com tabelas e estilos inline porque é o que Gmail, Outlook e celular respeitam.
// As cores e o ritmo seguem o site: moldura marinho, papel claro e o azul do símbolo.

const SITE = 'https://realcredmais.com.br';
const COR = {
  navy: '#061626',
  navy2: '#0e2a47',
  onNavy: '#f2f1ec',
  onNavy2: '#b9c6d4',
  paper: '#f8f7f3',
  tint: '#efede6',
  ink: '#0c1a2b',
  ink2: '#47566a',
  line: '#dcd9cf',
  blue: '#0b67a8',
  blueSoft: '#e3f0fa',
  wa: '#0e7a3c',
};
const FONTE = "'Figtree', 'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif";
const FONTE_TITULO = "'Bricolage Grotesque', 'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif";

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Telefone brasileiro: só dígitos, com 55 na frente para o link do WhatsApp.
export function normalizarTelefone(bruto) {
  let d = String(bruto ?? '').replace(/\D/g, '');
  if (d.startsWith('0')) d = d.replace(/^0+/, '');
  if (d.length === 10 || d.length === 11) d = '55' + d;
  return d;
}

export function formatarTelefone(bruto) {
  const d = normalizarTelefone(bruto).replace(/^55/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return String(bruto ?? '').trim();
}

function dataBrasilia(iso) {
  const data = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
}

export function emailLead({ nome, telefone, assunto, mensagem, recebidoEm, pagina } = {}) {
  const nomeLimpo = String(nome ?? '').trim() || 'Sem nome';
  const primeiroNome = nomeLimpo.split(/\s+/)[0];
  const assuntoLimpo = String(assunto ?? '').trim() || 'Contato pelo site';
  const mensagemLimpa = String(mensagem ?? '').trim();
  const tel = normalizarTelefone(telefone);
  const telTela = formatarTelefone(telefone);
  const quando = dataBrasilia(recebidoEm);

  // "Consignado INSS" vira "consignado INSS": só a primeira letra muda, as siglas ficam.
  const sobre = /^(outro assunto|contato pelo site)$/i.test(assuntoLimpo)
    ? ''
    : ` sobre ${assuntoLimpo.charAt(0).toLowerCase()}${assuntoLimpo.slice(1)}`;
  const textoWa = `Olá, ${primeiroNome}! Aqui é da RealCred+. Recebemos sua mensagem pelo site${sobre}. Podemos conversar agora?`;
  const linkWa = tel ? `https://wa.me/${tel}?text=${encodeURIComponent(textoWa)}` : '';
  const linkTel = tel ? `tel:+${tel}` : '';

  const subject = `Novo contato: ${nomeLimpo} · ${assuntoLimpo}`;
  const preheader = `${telTela || 'Sem telefone'} · ${mensagemLimpa ? mensagemLimpa.slice(0, 90) : 'Sem mensagem'}`;

  const botao = (href, rotulo, fundo, cor, borda) => `
              <td style="padding:0 10px 10px 0;">
                <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:14px 22px;border-radius:999px;background:${fundo};color:${cor};border:2px solid ${borda};font-family:${FONTE};font-size:16px;font-weight:700;line-height:1;text-decoration:none;mso-padding-alt:0;">${rotulo}</a>
              </td>`;

  const linha = (rotulo, valor) => `
            <tr>
              <td style="padding:12px 0;border-top:1px solid ${COR.line};font-family:${FONTE};font-size:13px;font-weight:700;color:${COR.ink2};width:130px;vertical-align:top;">${rotulo}</td>
              <td style="padding:12px 0;border-top:1px solid ${COR.line};font-family:${FONTE};font-size:15px;color:${COR.ink};vertical-align:top;">${valor}</td>
            </tr>`;

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(subject)}</title>
<style>
  @media (max-width: 620px) {
    .moldura { padding: 0 !important; }
    .cartao { border-radius: 0 !important; }
    .miolo { padding-left: 22px !important; padding-right: 22px !important; }
    .nome { font-size: 30px !important; }
    .tel { font-size: 22px !important; }
  }
  a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
</style>
</head>
<body style="margin:0;padding:0;background:${COR.tint};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COR.tint};">
  <tr>
    <td class="moldura" align="center" style="padding:32px 16px;">
      <table role="presentation" class="cartao" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${COR.paper};border-radius:20px;overflow:hidden;">

        <!-- Cabeçalho marinho com o logo -->
        <tr>
          <td style="background:${COR.navy};padding:22px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td><a href="${SITE}" target="_blank"><img src="${SITE}/img/logo.png" width="150" height="42" alt="RealCred+" style="display:block;border:0;width:150px;height:auto;"></a></td>
                <td align="right" style="font-family:${FONTE};font-size:12px;font-weight:600;color:${COR.onNavy2};">Novo contato pelo site</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:4px;line-height:4px;font-size:0;background:${COR.blue};">&nbsp;</td></tr>

        <!-- Quem é e como responder -->
        <tr>
          <td class="miolo" style="padding:36px 40px 12px;">
            <p style="margin:0 0 10px;font-family:${FONTE};font-size:13px;font-weight:700;color:${COR.blue};">${esc(assuntoLimpo)}</p>
            <h1 class="nome" style="margin:0;font-family:${FONTE_TITULO};font-size:36px;line-height:1.08;font-weight:800;letter-spacing:-0.02em;color:${COR.ink};">${esc(nomeLimpo)}</h1>
            ${
              telTela
                ? `<p class="tel" style="margin:12px 0 0;font-family:${FONTE};font-size:24px;font-weight:600;color:${COR.ink};letter-spacing:0.01em;"><a href="${esc(linkTel)}" style="color:${COR.ink};text-decoration:none;">${esc(telTela)}</a></p>`
                : ''
            }
            <p style="margin:8px 0 0;font-family:${FONTE};font-size:14px;color:${COR.ink2};">Recebido ${esc(quando)}</p>
          </td>
        </tr>
        ${
          tel
            ? `<tr>
          <td class="miolo" style="padding:20px 40px 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>${botao(linkWa, 'Responder no WhatsApp', COR.wa, '#ffffff', COR.wa)}${botao(linkTel, 'Ligar', COR.paper, COR.navy, COR.navy)}
              </tr>
            </table>
          </td>
        </tr>`
            : ''
        }

        <!-- Mensagem -->
        <tr>
          <td class="miolo" style="padding:20px 40px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:14px;">
              <tr>
                <td style="border-left:4px solid ${COR.blue};padding:20px 22px;border-radius:14px;">
                  <p style="margin:0 0 8px;font-family:${FONTE};font-size:13px;font-weight:700;color:${COR.ink2};">Mensagem</p>
                  <p style="margin:0;font-family:${FONTE};font-size:16px;line-height:1.6;color:${COR.ink};white-space:pre-wrap;">${
                    mensagemLimpa ? esc(mensagemLimpa) : `<span style="color:${COR.ink2};">A pessoa não escreveu mensagem. Vale chamar e perguntar como pode ajudar.</span>`
                  }</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Detalhes -->
        <tr>
          <td class="miolo" style="padding:20px 40px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${linha('Assunto', esc(assuntoLimpo))}
              ${linha('Veio da página', pagina ? `<a href="${esc(pagina)}" style="color:${COR.blue};">${esc(pagina.replace(/^https?:\/\//, ''))}</a>` : 'realcredmais.com.br')}
            </table>
          </td>
        </tr>

        <!-- Lembrete -->
        <tr>
          <td style="background:${COR.blueSoft};padding:18px 40px;">
            <p style="margin:0;font-family:${FONTE};font-size:14px;line-height:1.5;color:${COR.ink};"><strong>Dica:</strong> quem responde primeiro costuma fechar. Chame no WhatsApp ainda hoje e confirme o tipo de renda (INSS, servidor, militar ou carteira assinada).</p>
          </td>
        </tr>

        <!-- Rodapé -->
        <tr>
          <td style="background:${COR.navy};padding:22px 40px;">
            <p style="margin:0;font-family:${FONTE};font-size:12px;line-height:1.6;color:${COR.onNavy2};">
              RealCred+ · R. Dr. José Machado Coelho de Castro, 238, Centro, Lorena, SP<br>
              Mensagem enviada pelo formulário de <a href="${SITE}/#contato" style="color:${COR.onNavy};">realcredmais.com.br</a>. Os dados desta pessoa só devem ser usados para responder o contato, conforme a política de privacidade do site.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    `Novo contato pelo site da RealCred+`,
    ``,
    `Nome: ${nomeLimpo}`,
    `Telefone: ${telTela || 'não informado'}`,
    `Assunto: ${assuntoLimpo}`,
    `Recebido: ${quando}`,
    ``,
    `Mensagem:`,
    mensagemLimpa || '(sem mensagem)',
    ``,
    linkWa ? `Responder no WhatsApp: ${linkWa}` : '',
  ]
    .filter((l) => l !== null)
    .join('\n');

  return { subject, html, text };
}

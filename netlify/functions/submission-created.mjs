// O Netlify chama esta função sozinho a cada envio do formulário que passou pelo filtro
// de spam (o nome do arquivo é o nome do evento). Ela manda o e-mail com o visual do
// site para operacional@, com cópia para fabio@, usando a própria conta do Google Workspace da RealCred+.
//
// Precisa de uma variável no Netlify: GMAIL_APP_PASSWORD, a senha de app de
// operacional@realcredmais.com.br. Sem ela, a função só registra o aviso e o Netlify
// continua mandando o e-mail simples dele.
import nodemailer from 'nodemailer';
import { emailLead } from '../../emails/lead.mjs';

const CONTA = 'operacional@realcredmais.com.br';
const DESTINO = 'operacional@realcredmais.com.br';
const COPIA = 'fabio@realcredmais.com.br';

export const handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body || '{}').payload || {};
  } catch {
    return { statusCode: 400, body: 'corpo inválido' };
  }
  if (payload.form_name !== 'contato') return { statusCode: 200, body: 'ignorado' };

  // O Google mostra a senha de app em blocos com espaço; aceita das duas formas.
  const senha = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!senha) {
    console.warn('GMAIL_APP_PASSWORD não configurada; e-mail personalizado não enviado.');
    return { statusCode: 200, body: 'sem senha' };
  }

  const dados = payload.data || {};
  const { subject, html, text } = emailLead({
    nome: dados.nome,
    telefone: dados.telefone,
    assunto: dados.assunto,
    mensagem: dados.mensagem,
    recebidoEm: payload.created_at,
    pagina: dados.referrer,
  });

  const transporte = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: CONTA, pass: senha },
  });

  try {
    await transporte.sendMail({
      from: { name: 'Site RealCred+', address: CONTA },
      to: DESTINO,
      cc: COPIA,
      subject,
      html,
      text,
    });
    return { statusCode: 200, body: 'enviado' };
  } catch (erro) {
    console.error('Falha ao enviar o e-mail do contato:', erro.message);
    return { statusCode: 500, body: 'falha no envio' };
  }
};

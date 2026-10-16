import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emailLead, normalizarTelefone, formatarTelefone } from '../emails/lead.mjs';
import { handler } from '../netlify/functions/submission-created.mjs';

test('telefone vira número de WhatsApp com 55', () => {
  assert.equal(normalizarTelefone('(12) 98282-7447'), '5512982827447');
  assert.equal(normalizarTelefone('012 3301-2419'), '551233012419');
  assert.equal(normalizarTelefone('+55 12 98282-7447'), '5512982827447');
  assert.equal(formatarTelefone('12982827447'), '(12) 98282-7447');
  assert.equal(formatarTelefone('1233012419'), '(12) 3301-2419');
});

test('o que a pessoa digita não vira código no e-mail', () => {
  const { html, subject } = emailLead({
    nome: '<script>alert(1)</script> Ana',
    telefone: '12 99999-0000',
    assunto: 'Consignado INSS',
    mensagem: '<img src=x onerror=alert(1)>',
  });
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.match(subject, /^Novo contato: /);
});

test('sem telefone, o e-mail sai sem os botões', () => {
  const { html } = emailLead({ nome: 'Ana', telefone: '', assunto: 'Outro assunto' });
  assert.ok(!html.includes('wa.me'));
  assert.ok(html.includes('A pessoa não escreveu mensagem'));
});

test('a função não quebra sem a senha configurada', async () => {
  delete process.env.GMAIL_APP_PASSWORD;
  const body = JSON.stringify({ payload: { form_name: 'contato', data: { nome: 'Ana' } } });
  const r = await handler({ body });
  assert.equal(r.statusCode, 200);
  assert.equal(r.body, 'sem senha');
  const outro = await handler({ body: JSON.stringify({ payload: { form_name: 'outro' } }) });
  assert.equal(outro.body, 'ignorado');
});

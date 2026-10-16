import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parcela,
  valorPresente,
  prazos,
  saqueAnual,
  anosFgts,
  antecipacaoFgts,
  portabilidade,
  lerNumero,
  mascaraReais,
} from '../src/calc.js';

const perto = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);

test('parcela pela tabela Price', () => {
  // R$ 15.000 a 1,8208% em 84x dá R$ 350 (conferido em planilha)
  perto(parcela(15000, 1.8208240149, 84), 350, 0.01);
  perto(parcela(1200, 0, 12), 100);
  assert.equal(parcela(0, 1.85, 84), 0);
});

test('valor presente é o inverso da parcela', () => {
  const p = parcela(10000, 1.85, 96);
  perto(valorPresente(p, 1.85, 96), 10000);
});

test('prazos respeitam o máximo de cada produto', () => {
  assert.deepEqual(prazos('clt').at(-1), 84);
  assert.deepEqual(prazos('inss').at(-1), 108);
  assert.deepEqual(prazos('servidor').at(-1), 120);
  assert.deepEqual(prazos('pessoal').at(-1), 60);
});

test('saque-aniversário segue a tabela oficial', () => {
  assert.equal(saqueAnual(400), 200);
  assert.equal(saqueAnual(3000), 1050);
  assert.equal(saqueAnual(0), 0);
});

test('número de anos muda em 01/11/2026', () => {
  assert.equal(anosFgts(new Date('2026-10-31T12:00:00-03:00')), 5);
  assert.equal(anosFgts(new Date('2026-11-01T08:00:00-03:00')), 3);
});

test('antecipação limita cada saque a R$ 500 e desconta os juros', () => {
  const r = antecipacaoFgts(3000, new Date('2026-10-20T12:00:00-03:00'));
  assert.equal(r.saques.length, 5);
  assert.ok(r.saques.every((s) => s <= 500 && s >= 100));
  assert.ok(r.recebe < r.bloqueado);
  const pequeno = antecipacaoFgts(150, new Date('2026-12-01T12:00:00-03:00'));
  assert.equal(pequeno.saques.length, 0);
});

test('portabilidade reduz a parcela quando a taxa cai', () => {
  const r = portabilidade({ parcelaAtual: 350, restantes: 60, taxaAtual: 1.85, taxaNova: 1.6 });
  assert.ok(r.nova < 350);
  perto(r.economiaTotal, r.economiaMes * 60);
});

test('leitura de números no formato brasileiro', () => {
  assert.equal(lerNumero('5.000'), 5000);
  assert.equal(lerNumero('5.000,50'), 5000.5);
  assert.equal(lerNumero('1,85'), 1.85);
  assert.equal(lerNumero('350'), 350);
  assert.equal(lerNumero('R$ 12.345'), 12345);
  assert.equal(lerNumero(''), 0);
});

test('máscara de reais', () => {
  assert.equal(mascaraReais('5000'), '5.000');
  assert.equal(mascaraReais('005000'), '5.000');
  assert.equal(mascaraReais('abc'), '');
});

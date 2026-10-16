import { registrarEvento } from './site.js';
import {
  PRODUTOS,
  parcela,
  prazos,
  antecipacaoFgts,
  portabilidade,
  lerNumero,
  mascaraReais,
  brl,
  pct,
} from './calc.js';

const WHATSAPP = '5512982827447';
const linkWhatsApp = (texto) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
const $ = (id) => document.getElementById(id);

function mascararAoDigitar(input) {
  input.addEventListener('input', () => {
    const fim = input.value.length - input.selectionStart;
    input.value = mascaraReais(input.value);
    const pos = Math.max(0, input.value.length - fim);
    input.setSelectionRange(pos, pos);
  });
}

/* Simulador da primeira tela */
function iniciarSimulador() {
  const form = $('sim');
  if (!form) return;
  const campoValor = $('sim-valor');
  const campoPrazo = $('sim-prazo');
  const campoRenda = $('sim-renda');
  const campoSaldo = $('sim-saldo');
  const blocoParcela = form.querySelector('[data-mode="parcela"]');
  const blocoFgts = form.querySelector('[data-mode="fgts"]');
  const rotulo = $('sim-result-label');
  const valorTela = $('sim-result-value');
  const detalhe = $('sim-result-detail');
  const alerta = $('sim-alert');
  const botaoWa = $('sim-wa');
  let jaContou = false;

  [campoValor, campoRenda, campoSaldo].forEach(mascararAoDigitar);

  const tipoAtual = () => form.querySelector('input[name="tipo"]:checked')?.value || 'inss';

  function preencherPrazos(tipo) {
    const anterior = Number(campoPrazo.value) || 84;
    const lista = prazos(tipo);
    campoPrazo.innerHTML = lista.map((n) => `<option value="${n}">${n} parcelas</option>`).join('');
    const escolhido = lista.includes(anterior) ? anterior : lista.at(-1);
    campoPrazo.value = String(escolhido);
  }

  function mostrarAlerta(texto) {
    alerta.textContent = texto;
    alerta.hidden = !texto;
  }

  function calcular() {
    const tipo = tipoAtual();
    const produto = PRODUTOS[tipo];
    const fgts = tipo === 'fgts';
    blocoParcela.hidden = fgts;
    blocoFgts.hidden = !fgts;

    if (fgts) {
      const saldo = lerNumero(campoSaldo.value);
      const r = antecipacaoFgts(saldo);
      rotulo.textContent = 'Você recebe cerca de';
      valorTela.textContent = brl(r.recebe);
      if (!r.saques.length) {
        detalhe.textContent = '';
        mostrarAlerta('Com esse saldo, o saque anual fica abaixo de R$ 100 e não dá para antecipar.');
      } else {
        detalhe.textContent = `Antecipando ${r.saques.length} ${r.saques.length === 1 ? 'saque anual' : 'saques anuais'}, que somam ${brl(r.bloqueado)} do FGTS. ${pct(produto.taxa)} ao mês (${produto.taxaTexto}).`;
        mostrarAlerta(
          r.anos === 5
            ? 'Até 31/10/2026 dá para antecipar até 5 anos. A partir de 01/11/2026, o limite cai para 3.'
            : ''
        );
      }
      botaoWa.href = linkWhatsApp(
        `Olá! Simulei no site da RealCred+ a antecipação do saque-aniversário do FGTS com saldo de ${brl(saldo)}. Estimativa: receber ${brl(r.recebe)}. Pode me ajudar?`
      );
      contar(tipo);
      return;
    }

    const valor = lerNumero(campoValor.value);
    const meses = Number(campoPrazo.value);
    const p = parcela(valor, produto.taxa, meses);
    rotulo.textContent = 'Parcela estimada';
    valorTela.textContent = brl(p);
    detalhe.textContent = valor
      ? `${meses} parcelas para ${brl(valor)}, com ${pct(produto.taxa)} ao mês (${produto.taxaTexto}). Total aproximado: ${brl(p * meses)}.`
      : 'Informe o valor para ver a parcela.';

    const renda = lerNumero(campoRenda.value);
    if (renda > 0 && produto.margem) {
      const limite = renda * produto.margem;
      mostrarAlerta(
        p > limite
          ? `A parcela passa do limite de ${Math.round(produto.margem * 100)}% da renda (${brl(limite)}). Tente um valor menor ou mais parcelas.`
          : `A parcela usa ${Math.round((p / renda) * 100)}% da sua renda, dentro do limite de ${Math.round(produto.margem * 100)}%.`
      );
    } else {
      mostrarAlerta('');
    }

    botaoWa.href = linkWhatsApp(
      `Olá! Simulei no site da RealCred+: ${produto.nome}, ${brl(valor)} em ${meses} parcelas, parcela estimada de ${brl(p)}. Pode me ajudar?`
    );
    contar(tipo);
  }

  function contar(tipo) {
    if (jaContou) return;
    jaContou = true;
    registrarEvento('simulacao_calculada', { produto: tipo });
  }

  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('change', (e) => {
    if (e.target.name === 'tipo') {
      preencherPrazos(tipoAtual());
      jaContou = false;
    }
    calcular();
  });
  form.addEventListener('input', calcular);
  botaoWa.addEventListener('click', () => registrarEvento('simulacao_whatsapp', { produto: tipoAtual() }));

  // Botões "Simular" da lista de produtos
  document.querySelectorAll('[data-simular]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const radio = form.querySelector(`input[name="tipo"][value="${botao.dataset.simular}"]`);
      if (!radio) return;
      radio.checked = true;
      preencherPrazos(radio.value);
      calcular();
      document.getElementById('simular').scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => (radio.value === 'fgts' ? campoSaldo : campoValor).focus({ preventScroll: true }), 450);
    });
  });

  preencherPrazos(tipoAtual());
  calcular();
}

/* Calculadora de portabilidade */
function iniciarPortabilidade() {
  const form = $('port');
  if (!form) return;
  const alerta = $('port-alert');
  const botaoWa = $('port-wa');
  let jaContou = false;

  function calcular() {
    const parcelaAtual = lerNumero($('port-parcela').value);
    const restantes = Math.min(96, Math.max(0, Math.round(lerNumero($('port-restantes').value))));
    const taxaAtual = lerNumero($('port-taxa').value);
    const taxaNova = lerNumero($('port-nova').value);

    if (!(parcelaAtual > 0 && restantes > 0 && taxaAtual > 0 && taxaNova > 0)) {
      ['port-saldo', 'port-nova-parcela', 'port-economia', 'port-total'].forEach((id) => ($(id).textContent = '–'));
      alerta.textContent = 'Preencha a parcela, as parcelas que faltam e as duas taxas.';
      alerta.hidden = false;
      return;
    }

    const r = portabilidade({ parcelaAtual, restantes, taxaAtual, taxaNova });
    $('port-saldo').textContent = brl(r.saldo);
    $('port-nova-parcela').textContent = brl(r.nova);
    $('port-economia').textContent = brl(Math.max(0, r.economiaMes));
    $('port-total').textContent = brl(Math.max(0, r.economiaTotal));

    if (taxaNova >= taxaAtual) {
      alerta.textContent =
        'Com essa taxa não há economia na parcela. Em alguns casos, a portabilidade com refinanciamento libera um valor extra. Pergunte no WhatsApp.';
      alerta.hidden = false;
    } else {
      alerta.hidden = true;
    }

    botaoWa.href = linkWhatsApp(
      `Olá! Quero uma proposta de portabilidade. Pago ${brl(parcelaAtual)} por mês, faltam ${restantes} parcelas e a taxa atual é ${pct(taxaAtual)} ao mês.`
    );
    if (!jaContou) {
      jaContou = true;
      registrarEvento('portabilidade_calculada');
    }
  }

  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('input', calcular);
  calcular();
}

/* Busca nas dúvidas */
function iniciarBuscaDuvidas() {
  const busca = $('faq-busca');
  const itens = [...document.querySelectorAll('#faq details')];
  const vazio = $('faq-vazio');
  if (!busca) return;
  const normalizar = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  busca.addEventListener('input', () => {
    const termo = normalizar(busca.value.trim());
    let visiveis = 0;
    itens.forEach((item) => {
      const bate = !termo || normalizar(item.textContent).includes(termo);
      item.hidden = !bate;
      if (bate) visiveis++;
      if (termo && bate) item.open = true;
    });
    vazio.hidden = visiveis > 0;
  });
}

/* Formulário de contato (Netlify Forms) */
function iniciarContato() {
  const form = $('contato-form');
  if (!form) return;
  const status = $('contato-status');

  const mostrarStatus = (texto, tipo) => {
    status.innerHTML = texto;
    status.className = `form-status is-${tipo}`;
    status.hidden = false;
  };

  if (new URLSearchParams(location.search).has('enviado')) {
    mostrarStatus('Mensagem recebida. Respondemos em horário comercial pelo telefone que você informou.', 'ok');
  }

  const validar = () => {
    let ok = true;
    const nome = $('c-nome');
    const tel = $('c-telefone');
    const nomeOk = nome.value.trim().length >= 2;
    const telOk = tel.value.replace(/\D/g, '').length >= 10;
    nome.setAttribute('aria-invalid', String(!nomeOk));
    tel.setAttribute('aria-invalid', String(!telOk));
    $('c-nome-erro').hidden = nomeOk;
    $('c-telefone-erro').hidden = telOk;
    if (!nomeOk) nome.focus();
    else if (!telOk) tel.focus();
    ok = nomeOk && telOk;
    return ok;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validar()) return;
    const botao = form.querySelector('button[type="submit"]');
    botao.disabled = true;
    botao.textContent = 'Enviando…';
    try {
      const corpo = new URLSearchParams(new FormData(form)).toString();
      const resposta = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: corpo,
      });
      if (!resposta.ok) throw new Error(String(resposta.status));
      form.reset();
      mostrarStatus('Mensagem recebida. Respondemos em horário comercial pelo telefone que você informou.', 'ok');
      registrarEvento('contato_enviado');
    } catch {
      mostrarStatus(
        'Não conseguimos enviar agora. Tente de novo ou chame no WhatsApp: <a href="https://wa.me/5512982827447" target="_blank" rel="noopener">(12) 98282-7447</a>.',
        'error'
      );
    } finally {
      botao.disabled = false;
      botao.textContent = 'Enviar mensagem';
    }
  });
}

iniciarSimulador();
iniciarPortabilidade();
iniciarBuscaDuvidas();
iniciarContato();

import './site.css';

// O Google Analytics só existe quando a variável VITE_GA_MEASUREMENT_ID está configurada
// no Netlify, e só carrega depois que a pessoa permite. Sem a variável, não há cookies
// e o aviso nem aparece.
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
const CHAVE_CONSENTIMENTO = 'realcred-consentimento';

// Versões antigas do site registravam um service worker que guardava páginas em cache.
// Removemos para ninguém ficar preso numa versão velha.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registros) => registros.forEach((r) => r.unregister()));
}

function lerConsentimento() {
  try {
    return localStorage.getItem(CHAVE_CONSENTIMENTO);
  } catch {
    return null;
  }
}

function salvarConsentimento(valor) {
  try {
    localStorage.setItem(CHAVE_CONSENTIMENTO, valor);
  } catch {
    /* navegação privada: vale só para esta visita */
  }
}

let analyticsLigado = false;
function ligarAnalytics() {
  if (!GA_ID || analyticsLigado) return;
  analyticsLigado = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

export function registrarEvento(nome, dados = {}) {
  if (analyticsLigado && typeof window.gtag === 'function') window.gtag('event', nome, dados);
}

function iniciarConsentimento() {
  const aviso = document.getElementById('consent');
  const botaoPreferencias = document.querySelector('[data-cookie-settings]');
  if (!GA_ID || !aviso) return;
  if (botaoPreferencias) botaoPreferencias.hidden = false;

  const escolha = lerConsentimento();
  if (escolha === 'granted') ligarAnalytics();
  else if (!escolha) aviso.hidden = false;

  aviso.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-consent]');
    if (!botao) return;
    salvarConsentimento(botao.dataset.consent);
    aviso.hidden = true;
    if (botao.dataset.consent === 'granted') ligarAnalytics();
  });
  botaoPreferencias?.addEventListener('click', () => {
    aviso.hidden = false;
    aviso.querySelector('button')?.focus();
  });
}

function iniciarMenu() {
  const botao = document.querySelector('.menu-toggle');
  const menu = document.getElementById('site-nav');
  if (!botao || !menu) return;
  const fechar = () => {
    botao.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  };
  botao.addEventListener('click', () => {
    const aberto = botao.getAttribute('aria-expanded') === 'true';
    botao.setAttribute('aria-expanded', String(!aberto));
    menu.classList.toggle('is-open', !aberto);
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) fechar();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
      fechar();
      botao.focus();
    }
  });
}

function iniciarRastreioWhatsApp() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-wa]');
    if (link) registrarEvento('clique_whatsapp', { local: link.dataset.wa });
  });
}

iniciarMenu();
iniciarConsentimento();
iniciarRastreioWhatsApp();

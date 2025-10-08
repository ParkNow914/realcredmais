// Aplicar passive:true para eventos touchstart/touchmove por padrão para evitar warnings de performance
(function () {
  const add = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (
      (type === 'touchstart' || type === 'touchmove') &&
      (options === undefined || options === false)
    ) {
      options = { passive: true };
    } else if ((type === 'touchstart' || type === 'touchmove') && typeof options === 'object') {
      options = Object.assign({ passive: true }, options);
    }
    return add.call(this, type, listener, options);
  };
})();

// Configurações de crédito com tetos máximos permitidos - Julho/2025
const CREDIT_CONFIG = {
  inss: {
    nome: 'INSS',
    taxaMaxima: 1.85, // Teto máximo permitido pelo CNPS
    margemMaxima: 45, // 35% empréstimo + 10% cartão
    prazoMaximo: 96, // 8 anos (máximo permitido)
    valorMinimo: 300, // Valor mínimo padrão
    valorMaximo: 1000000, // Valor máximo padrão
    carencia: 0, // Sem carência
  },
  servidor: {
    nome: 'Servidor Público',
    taxaMaxima: 3.55, // Teto máximo para servidores
    margemMaxima: 40, // % máxima do salário
    prazoMaximo: 96, // 8 anos
    valorMinimo: 1000, // Valor mínimo padrão
    valorMaximo: 1000000, // Valor máximo padrão
    carencia: 1, // 1 mês de carência
  },
  militar: {
    nome: 'Militar',
    taxaMaxima: 3.45, // Teto máximo para militares
    margemMaxima: 40, // % máxima do salário
    prazoMaximo: 96, // 8 anos
    valorMinimo: 1000, // Valor mínimo padrão
    valorMaximo: 1000000, // Valor máximo padrão
    carencia: 1, // 1 mês de carência
  },
  clt: {
    nome: 'CLT',
    taxaMaxima: 4.0, // Teto máximo para CLT
    margemMaxima: 35, // % máxima do salário
    prazoMaximo: 84, // 7 anos
    valorMinimo: 1000, // Valor mínimo padrão
    valorMaximo: 500000, // Valor máximo padrão
    carencia: 1, // 1 mês de carência
  },
  'credito-pessoal': {
    nome: 'Crédito Pessoal',
    taxaMaxima: 8.0, // Teto do BC para crédito pessoal
    taxaMedia: 6.5, // Média de mercado (referência)
    margemMaxima: 30, // % máxima do salário
    valorMinimo: 500, // Valor mínimo padrão
    valorMaximo: 100000, // Valor máximo padrão
    prazoMaximo: 60, // 5 anos
    carencia: 1, // 1 mês de carência
  },
  fgts: {
    nome: 'Saque Aniversário FGTS',
    taxaMinima: 1.25, // Taxa mínima de antecipação
    taxaMaxima: 1.8, // Teto máximo para FGTS
    margemMaxima: 100, // Até 100% do saldo FGTS
    parcelasMaximas: 10, // Parcelas anuais
    prazoMaximo: 120, // 10 anos
    valorMinimo: 1000, // Valor mínimo padrão
    valorMaximo: 1000000, // Valor máximo padrão
    carencia: 0, // Sem carência
    aliquotas: [
      { faixa: [0, 500], percentual: 50, adicional: 0 },
      { faixa: [500.01, 1000], percentual: 40, adicional: 50 },
      { faixa: [1000.01, 5000], percentual: 30, adicional: 150 },
      { faixa: [5000.01, 10000], percentual: 20, adicional: 650 },
      { faixa: [10000.01, 15000], percentual: 15, adicional: 1150 },
      { faixa: [15000.01, 20000], percentual: 10, adicional: 1900 },
      { faixa: [20000.01, Infinity], percentual: 5, adicional: 2900 },
    ],
  },
};

// Utilitários de formatação
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatPercentage(value) {
  return value.toFixed(2) + '%';
}

function parseCurrency(value) {
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

// Validação de formulários
class FormValidator {
  constructor(form) {
    this.form = form;
    this.errors = {};
  }

  validateField(field) {
    const value = field.value.trim();
    const name = field.name;
    let isValid = true;
    let message = '';

    // Limpar erro anterior
    this.clearFieldError(field);

    switch (name) {
      case 'nome':
        if (!value) {
          message = 'Nome é obrigatório';
          isValid = false;
        } else if (value.length < 2) {
          message = 'Nome deve ter pelo menos 2 caracteres';
          isValid = false;
        }
        break;

      case 'categoria':
        if (!value) {
          message = 'Selecione uma categoria';
          isValid = false;
        }
        break;

      case 'salario':
        const salario = parseFloat(value);
        if (!value || salario <= 0) {
          message = 'Valor deve ser maior que zero';
          isValid = false;
        } else if (salario < 500) {
          message = 'Valor mínimo de R$ 500,00';
          isValid = false;
        }
        break;

      case 'valor':
        const valorDesejado = parseFloat(value);
        const categoria = document.getElementById('categoria')
          ? document.getElementById('categoria').value
          : '';
        if (!value || valorDesejado <= 0) {
          message = 'Valor deve ser maior que zero';
          isValid = false;
        } else if (categoria === 'credito-pessoal' && valorDesejado < 500) {
          message = 'Valor mínimo para Crédito Pessoal é R$ 500,00';
          isValid = false;
        } else if (valorDesejado < 100) {
          message = 'Valor mínimo de R$ 100,00';
          isValid = false;
        }
        break;

      case 'prazo':
        const prazo = parseInt(value);
        const categoriaPrazo = document.getElementById('categoria')
          ? document.getElementById('categoria').value
          : '';
        if (!value) {
          message = 'Selecione um prazo';
          isValid = false;
        } else if (categoriaPrazo === 'credito-pessoal' && prazo > 60) {
          message = 'Prazo máximo para Crédito Pessoal é 60 meses';
          isValid = false;
        } else if (['inss', 'servidor', 'militar', 'clt'].includes(categoriaPrazo) && prazo > 96) {
          message = 'Prazo máximo para esta categoria é 96 meses';
          isValid = false;
        } else if (categoriaPrazo === 'fgts' && prazo > 120) {
          message = 'Prazo máximo para FGTS é 10 anos (120 meses)';
          isValid = false;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          message = 'E-mail é obrigatório';
          isValid = false;
        } else if (!emailRegex.test(value)) {
          message = 'E-mail inválido';
          isValid = false;
        }
        break;

      case 'telefone':
        if (value && value.length < 10) {
          message = 'Telefone deve ter pelo menos 10 dígitos';
          isValid = false;
        }
        break;

      case 'assunto':
        if (!value) {
          message = 'Selecione um assunto';
          isValid = false;
        }
        break;

      case 'mensagem':
        if (!value) {
          message = 'Mensagem é obrigatória';
          isValid = false;
        } else if (value.length < 10) {
          message = 'Mensagem deve ter pelo menos 10 caracteres';
          isValid = false;
        }
        break;
    }

    if (!isValid) {
      this.showFieldError(field, message);
    } else {
      this.showFieldSuccess(field);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');
    const errorElement = document.getElementById(field.id + '-error');
    if (errorElement) {
      errorElement.textContent = message;
    }
    this.errors[field.name] = message;
  }

  showFieldSuccess(field) {
    field.classList.add('success');
    field.classList.remove('error');
    const errorElement = document.getElementById(field.id + '-error');
    if (errorElement) {
      errorElement.textContent = '';
    }
    delete this.errors[field.name];
  }

  clearFieldError(field) {
    field.classList.remove('error', 'success');
    const errorElement = document.getElementById(field.id + '-error');
    if (errorElement) {
      errorElement.textContent = '';
    }
    delete this.errors[field.name];
  }

  validateForm() {
    const fields = this.form.querySelectorAll(
      'input[required], select[required], textarea[required]'
    );
    let isValid = true;

    fields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid && Object.keys(this.errors).length === 0;
  }
}

// Simulador de crédito
class CreditSimulator {
  constructor() {
    this.form = document.getElementById('simulationForm');
    this.resultDiv = document.getElementById('simulationResult');
    this.validator = new FormValidator(this.form);
    this.init();
  }

  init() {
    if (!this.form) return;

    // Adicionar event listeners
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Validação em tempo real
    const fields = this.form.querySelectorAll('input, select');
    fields.forEach((field) => {
      field.addEventListener('blur', () => this.validator.validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          this.validator.validateField(field);
        }
      });
    });

    // Máscara para campos monetários
    const moneyFields = this.form.querySelectorAll('input[type="number"]');
    moneyFields.forEach((field) => {
      field.addEventListener('input', (e) => this.formatMoneyInput(e));
    });
  }

  formatMoneyInput(event) {
    const field = event.target;
    let value = field.value.replace(/\D/g, '');

    if (value) {
      value = (parseInt(value) / 100).toFixed(2);
      field.value = value;
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (!this.validator.validateForm()) {
      return;
    }

    const formData = new FormData(this.form);
    // Get and validate form data
    const data = {
      nome: formData.get('nome').trim(),
      cpf: formData.get('cpf').replace(/\D/g, ''), // Remove non-digit characters
      email: formData.get('email')?.trim() || null,
      telefone: formData.get('telefone')?.trim() || null,
      categoria: formData.get('categoria'),
      salario: parseFloat(formData.get('salario')),
      valor: parseFloat(formData.get('valor')),
      prazo: parseInt(formData.get('prazo')),
    };

    // Validate CPF format
    if (!/^\d{11}$/.test(data.cpf)) {
      this.validator.showFieldError(
        this.form.querySelector('#cpf'),
        'CPF inválido. Deve conter 11 dígitos.'
      );
      return;
    }

    // Validate email format if provided
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      this.validator.showFieldError(
        this.form.querySelector('#email'),
        'Formato de e-mail inválido.'
      );
      return;
    }

    // Validate phone format if provided
    if (data.telefone && !/^\(\d{2}\)\s*\d{4,5}-?\d{4}$/.test(data.telefone)) {
      this.validator.showFieldError(
        this.form.querySelector('#telefone'),
        'Formato de telefone inválido. Use (99) 99999-9999.'
      );
      return;
    }

    // Get submit button and store its original state
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : 'Simular Agora';

    try {
      // Show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
      }

      // Determine the API URL based on the current environment
      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiBaseUrl = isLocalhost ? 'http://localhost:3001' : window.location.origin;
      const apiUrl = `${apiBaseUrl}/api/lead`;

      console.log('Sending request to:', apiUrl);

      // Log the data being sent
      console.log('Sending data to server:', data);

      // Send data to server
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Log the response status
      console.log('Server response status:', response.status);

      // Check if response is OK
      if (!response.ok) {
        let errorMessage = 'Erro ao processar a solicitação';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Parse the successful response
      const result = await response.json();

      if (result.success) {
        // If server validation passes, proceed with local calculation
        this.calculateLoan(data);
      } else {
        throw new Error(result.message || 'Erro na validação dos dados');
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      this.showResult({
        erro:
          error.message ||
          'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
      });
    } finally {
      // Reset button state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  }

  calculateLoan(data) {
    // Validate category
    if (!CREDIT_CONFIG[data.categoria]) {
      console.error('Categoria inválida selecionada:', data.categoria);
      this.showResult({
        erro: 'Categoria de empréstimo inválida. Por favor, selecione uma categoria válida.',
      });
      return;
    }

    const config = CREDIT_CONFIG[data.categoria];
    const taxa = config.taxaMaxima; // Taxa padrão é a máxima da categoria

    // Validações específicas por categoria
    if (data.valor < config.valorMinimo || data.valor > config.valorMaximo) {
      this.showResult({
        erro: `Valor para ${config.nome} deve estar entre ${formatCurrency(config.valorMinimo)} e ${formatCurrency(config.valorMaximo)}`,
      });
      return;
    }

    if (data.prazo > config.prazoMaximo) {
      this.showResult({
        erro: `Prazo máximo para ${config.nome} é de ${config.prazoMaximo} meses`,
      });
      return;
    }

    // Cálculos específicos por categoria
    if (data.categoria === 'fgts') {
      // Cálculo especial para FGTS
      const taxaFGTS = config.taxaMaxima; // Taxa máxima para FGTS
      const taxaDecimal = taxaFGTS / 100;
      const valorMaximoFGTS = this.calcularValorMaximoFGTS(data.salario);

      if (data.valor > valorMaximoFGTS) {
        this.showResult({
          valorSolicitado: data.valor,
          valorMaximo: valorMaximoFGTS,
          parcela: 0,
          parcelaMaxima: 0,
          taxa: taxaFGTS,
          totalPagar: 0,
          prazo: data.prazo,
          excedeuMargem: true,
          mensagem: `Valor máximo disponível para saque é de ${formatCurrency(valorMaximoFGTS)}`,
        });
        return;
      }

      // Cálculo da parcela para FGTS
      const parcela =
        (data.valor * taxaDecimal * Math.pow(1 + taxaDecimal, data.prazo)) /
        (Math.pow(1 + taxaDecimal, data.prazo) - 1);

      this.showResult({
        valorSolicitado: data.valor,
        parcela: parcela,
        taxa: taxaFGTS,
        totalPagar: parcela * data.prazo,
        prazo: data.prazo,
        excedeuMargem: false,
        categoria: 'fgts',
      });
      return;
    } else {
      // Cálculo para as demais categorias
      const taxaDecimal = taxa / 100;
      const parcela =
        (data.valor * taxaDecimal * Math.pow(1 + taxaDecimal, data.prazo)) /
        (Math.pow(1 + taxaDecimal, data.prazo) - 1);

      // Verificar margem disponível (exceto para crédito pessoal)
      if (data.categoria !== 'credito-pessoal') {
        const margemDisponivel = (data.salario * config.margemMaxima) / 100;

        if (parcela > margemDisponivel) {
          // Recalcular valor máximo baseado na margem
          const valorMaximo =
            (margemDisponivel * (Math.pow(1 + taxaDecimal, data.prazo) - 1)) /
            (taxaDecimal * Math.pow(1 + taxaDecimal, data.prazo));

          this.showResult({
            valorSolicitado: data.valor,
            valorMaximo: valorMaximo,
            parcela: parcela,
            parcelaMaxima: margemDisponivel,
            taxa: taxa,
            totalPagar: parcela * data.prazo,
            prazo: data.prazo,
            excedeuMargem: true,
            mensagem: `Valor da parcela excede ${config.margemMaxima}% do seu salário`,
          });
          return;
        }
      }

      this.showResult({
        valorSolicitado: data.valor,
        parcela: parcela,
        taxa: taxa,
        totalPagar: parcela * data.prazo,
        prazo: data.prazo,
        excedeuMargem: false,
      });
    }
  }

  // Função auxiliar para calcular valor máximo do FGTS
  calcularValorMaximoFGTS(salario) {
    // Simulação simplificada - na prática, isso viria da API do FGTS
    // Aqui estamos usando uma lógica baseada em faixas de salário
    if (salario <= 2000) return salario * 10; // Até 10x o salário
    if (salario <= 5000) return salario * 15; // Até 15x o salário
    return salario * 20; // Até 20x o salário para salários maiores
  }

  showResult(result) {
    const resultTitle = this.resultDiv.querySelector('h3');
    const resultDetails = this.resultDiv.querySelector('.result-details');

    if (result.erro) {
      resultTitle.innerHTML = `<span style="color: var(--error);">⚠️ ${result.erro}</span>`;
      resultTitle.style.display = 'block';
      if (resultDetails) resultDetails.style.display = 'none';
      this.resultDiv.style.display = 'block';
      this.resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Atualizar valores na tabela
    document.getElementById('valorSolicitado').textContent = formatCurrency(result.valorSolicitado);
    document.getElementById('parcelaMensal').textContent = formatCurrency(result.parcela);
    document.getElementById('taxaJuros').textContent = formatPercentage(result.taxa) + ' a.m.';
    document.getElementById('totalPagar').textContent = formatCurrency(result.totalPagar);

    // Calcular valor total de juros
    const totalJuros = result.totalPagar - result.valorSolicitado;
    document.getElementById('totalJuros').textContent = formatCurrency(totalJuros);

    // Calcular Custo Efetivo Total (CET) - simplificado
    const cet = (Math.pow(1 + result.taxa / 100, 12) - 1) * 100;
    document.getElementById('cet').textContent = cet.toFixed(2) + '% a.a.';

    // Mensagem personalizada com base no resultado
    if (result.excedeuMargem) {
      resultTitle.innerHTML = `
                <span style="color: var(--warning);">⚠️ Atenção: ${result.mensagem || 'Valor excede margem disponível'}</span><br>
                <small>Valor máximo recomendado: ${formatCurrency(result.valorMaximo)}</small>
            `;

      // Adicionar botão para atualizar para o valor máximo
      const updateButton = document.createElement('button');
      updateButton.className = 'btn btn-primary btn-sm mt-2';
      updateButton.textContent = `Simular com valor de ${formatCurrency(result.valorMaximo)}`;
      updateButton.onclick = () => {
        document.getElementById('valor').value = result.valorMaximo.toFixed(2);
        document.getElementById('simulationForm').dispatchEvent(new Event('submit'));
      };

      // Limpar botões anteriores e adicionar o novo
      const oldButton = this.resultDiv.querySelector('.update-button');
      if (oldButton) oldButton.remove();

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'update-button mt-3';
      buttonContainer.appendChild(updateButton);
      resultTitle.appendChild(buttonContainer);
    } else {
      resultTitle.innerHTML = `
                <span style="color: var(--success);">✅ Simulação Aprovada</span>
                ${
                  result.categoria === 'fgts'
                    ? '<div class="mt-2 text-sm">Sujeito à disponibilidade de saldo no FGTS</div>'
                    : ''
                }
            `;

      // Adicionar botão de contato para aprovação
      const contactButton = document.createElement('a');
      contactButton.href =
        'https://wa.me/5512982827447?text=Gostaria+de+contratar+o+empréstimo+simulado';
      contactButton.className = 'btn btn-success btn-lg btn-block mt-3';
      contactButton.target = '_blank';
      contactButton.innerHTML = '<i class="fab fa-whatsapp mr-2"></i> Contratar Agora';

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'contact-button mt-4';
      buttonContainer.appendChild(contactButton);

      // Adicionar ao final do resultado
      if (resultDetails) {
        resultDetails.appendChild(buttonContainer);
      } else {
        this.resultDiv.appendChild(buttonContainer);
      }
    }

    // Mostrar a seção de resultados
    if (resultDetails) resultDetails.style.display = 'block';
    this.resultDiv.style.display = 'block';
    this.resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Rastrear evento de simulação concluída
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'simulation_complete', {
        event_category: 'engagement',
        event_label: 'Simulação concluída',
        value: result.valorSolicitado,
      });
    }
  }
}

// Formulário de contato
class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.validator = new FormValidator(this.form);
    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Validação em tempo real
    const fields = this.form.querySelectorAll('input, select, textarea');
    fields.forEach((field) => {
      field.addEventListener('blur', () => this.validator.validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          this.validator.validateField(field);
        }
      });
    });

    // Máscara para telefone
    const phoneField = this.form.querySelector('input[type="tel"]');
    if (phoneField) {
      phoneField.addEventListener('input', (e) => this.formatPhoneInput(e));
    }
  }

  formatPhoneInput(event) {
    const field = event.target;
    let value = field.value.replace(/\D/g, '');

    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      if (value.length < 14) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
    }

    field.value = value;
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.validator.validateForm()) {
      return;
    }

    const formData = new FormData(this.form);
    const data = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      telefone: formData.get('telefone'),
      assunto: formData.get('assunto'),
      mensagem: formData.get('mensagem'),
    };

    this.sendMessage(data);
  }

  sendMessage(data) {
    // Simular envio (em produção, conectar com backend)
    const button = this.form.querySelector('button[type="submit"]');
    const originalText = button.textContent;

    button.textContent = 'Enviando...';
    button.disabled = true;
    button.classList.add('loading');

    setTimeout(() => {
      alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      this.form.reset();

      button.textContent = originalText;
      button.disabled = false;
      button.classList.remove('loading');

      // Limpar estados de validação
      const fields = this.form.querySelectorAll('input, select, textarea');
      fields.forEach((field) => {
        this.validator.clearFieldError(field);
      });
    }, 2000);
  }
}

// Menu mobile
class MobileMenu {
  constructor() {
    this.toggle = document.querySelector('.mobile-menu-toggle');
    this.menu = document.querySelector('.nav-menu');
    this.init();
  }

  init() {
    if (!this.toggle || !this.menu) return;

    this.toggle.addEventListener('click', () => this.toggleMenu());

    // Fechar menu ao clicar em links
    const links = this.menu.querySelectorAll('a');
    links.forEach((link) => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
      if (!this.toggle.contains(e.target) && !this.menu.contains(e.target)) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    const isOpen = this.menu.classList.contains('active');

    if (isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.menu.classList.add('active');
    this.toggle.classList.add('active');
    this.toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  closeMenu() {
    this.menu.classList.remove('active');
    this.toggle.classList.remove('active');
    this.toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

// Navegação suave
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        if (href === '#') return;

        e.preventDefault();

        const target = document.querySelector(href);
        if (target) {
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = target.offsetTop - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
          });
        }
      });
    });
  }
}

// Lazy loading para imagens
class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[loading="lazy"]');
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      });

      this.images.forEach((img) => observer.observe(img));
    } else {
      // Fallback para navegadores sem suporte
      this.images.forEach((img) => img.classList.add('loaded'));
    }
  }
}

// Função para resetar simulação
function resetSimulation() {
  const form = document.getElementById('simulationForm');
  const result = document.getElementById('simulationResult');

  if (form) {
    form.reset();

    // Limpar estados de validação
    const fields = form.querySelectorAll('input, select');
    fields.forEach((field) => {
      field.classList.remove('error', 'success');
      const errorElement = document.getElementById(field.id + '-error');
      if (errorElement) {
        errorElement.textContent = '';
      }
    });
  }

  if (result) {
    result.style.display = 'none';
  }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar componentes
  new CreditSimulator();
  new ContactForm();
  new MobileMenu();
  new SmoothScroll();
  new LazyLoader();

  // Adicionar animações de entrada
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observar elementos para animação
  const animatedElements = document.querySelectorAll(
    '.service-card, .testimonial-card, .about-text, .hero-content'
  );
  animatedElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });

  // Melhorar performance removendo animações em dispositivos com movimento reduzido
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
    document.head.appendChild(style);
  }
});

// Adicionar estilos CSS para menu mobile via JavaScript
const mobileMenuStyles = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 100%;
            left: 0;
            right: 0;
            background-color: var(--white);
            flex-direction: column;
            padding: var(--spacing-8);
            box-shadow: var(--shadow-lg);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all var(--transition-normal);
            z-index: 999;
        }
        
        .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }
        
        .nav-menu li {
            margin-bottom: var(--spacing-4);
        }
        
        .nav-link {
            display: block;
            padding: var(--spacing-3);
            text-align: center;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;

// Adicionar estilos ao head
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileMenuStyles;
document.head.appendChild(styleSheet);

// Chatbot simples para perguntas frequentes sobre empréstimos
class FinancialChatbot {
  constructor() {
    this.createChatbotUI();
    this.initChatbot();
    this.faq = {
      'empréstimo consignado':
        'O empréstimo consignado é uma modalidade de crédito onde as parcelas são descontadas diretamente do salário ou benefício. É mais seguro para o banco, por isso tem taxas menores.',
      'taxa de juros':
        'Nossas taxas variam conforme o perfil: INSS até 1,85% a.m., servidores públicos e militares a partir de 3,55% a.m. (média do mercado).',
      'documentos necessários':
        'Para INSS: RG, CPF, comprovante de residência e extrato do INSS. Para servidores: RG, CPF, comprovante de residência e contracheque.',
      'prazo pagamento':
        'O prazo varia de 12 a 96 meses, dependendo da categoria e valor solicitado.',
      'margem consignável':
        'INSS: até 45% (35% empréstimo + 10% cartão). Servidores e militares: até 40% do salário líquido.',
      aprovação:
        'Para INSS, a aprovação pode ser em até 24 horas. Para servidores e militares, até 48 horas úteis.',
      portabilidade:
        'Sim, fazemos portabilidade de empréstimos de outros bancos. O processo leva de 1 a 8 dias úteis.',
      'open banking':
        'Utilizamos Open Banking para acelerar a análise. Você autoriza o compartilhamento seguro dos seus dados bancários.',
    };
  }

  createChatbotUI() {
    const chatbotHTML = `
            <div class="chatbot-container" id="chatbot-container">
                <div class="chatbot-header">
                    <h4>💬 Assistente RealCred +</h4>
                    <button class="chatbot-close" id="chatbot-close">×</button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="bot-message">
                        Olá! Sou o assistente virtual da RealCred +. Como posso ajudar com seu empréstimo consignado?
                    </div>
                    <div class="quick-questions">
                        <button class="quick-btn" data-question="taxa de juros">Taxas de Juros</button>
                        <button class="quick-btn" data-question="documentos necessários">Documentos</button>
                        <button class="quick-btn" data-question="prazo pagamento">Prazos</button>
                        <button class="quick-btn" data-question="portabilidade">Portabilidade</button>
                    </div>
                </div>
                <div class="chatbot-input">
                    <input type="text" id="chatbot-input" placeholder="Digite sua pergunta...">
                    <button id="chatbot-send">Enviar</button>
                </div>
            </div>
            <div class="chatbot-toggle" id="chatbot-toggle">
                💬
            </div>
        `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  }

  initChatbot() {
    const toggle = document.getElementById('chatbot-toggle');
    const container = document.getElementById('chatbot-container');
    const close = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input');
    const send = document.getElementById('chatbot-send');
    const quickBtns = document.querySelectorAll('.quick-btn');

    // Toggle chatbot
    toggle.addEventListener('click', () => {
      container.classList.toggle('active');
    });

    // Close chatbot
    close.addEventListener('click', () => {
      container.classList.remove('active');
    });

    // Send message
    send.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Quick questions
    quickBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const question = btn.dataset.question;
        this.addUserMessage(btn.textContent);
        this.respondToQuestion(question);
      });
    });
  }

  sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();

    if (!message) return;

    this.addUserMessage(message);
    input.value = '';

    // Simular delay de resposta
    setTimeout(() => {
      this.respondToQuestion(message.toLowerCase());
    }, 1000);
  }

  addUserMessage(message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addBotMessage(message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'bot-message';
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  respondToQuestion(question) {
    let response = 'Desculpe, não entendi sua pergunta. ';

    // Buscar resposta no FAQ
    for (const [key, value] of Object.entries(this.faq)) {
      if (question.includes(key)) {
        response = value;
        break;
      }
    }

    // Se não encontrou resposta específica, dar resposta genérica
    if (response.startsWith('Desculpe')) {
      response +=
        'Entre em contato conosco pelo WhatsApp (12) 98282-7447 ou preencha o formulário de contato para falar com um especialista.';
    }

    this.addBotMessage(response);
  }
}

// Inicializar novas funcionalidades quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar calculadora avançada
  // Remover a linha: new AdvancedLoanCalculator();

  // Inicializar chatbot
  new FinancialChatbot();
});

// Validação de Formulários no Servidor (Simulação)
class ServerValidation {
  constructor() {
    this.initServerValidation();
  }

  initServerValidation() {
    // Interceptar todos os formulários para validação adicional
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      form.addEventListener('submit', (e) => this.validateForm(e));
    });
  }

  async validateForm(event) {
    const form = event.target;
    const formData = new FormData(form);

    // Validações de segurança
    const validationResult = this.performSecurityValidation(formData);

    if (!validationResult.isValid) {
      event.preventDefault();
      this.showValidationError(validationResult.message);
      return false;
    }

    // Simular validação no servidor
    try {
      const serverValidation = await this.simulateServerValidation(formData);

      if (!serverValidation.isValid) {
        event.preventDefault();
        console.error('Erro de validação do servidor:', serverValidation.message);
        return false;
      }

      // Log para analytics
      this.trackFormSubmission(form.id, 'success');
    } catch {
      event.preventDefault();
      this.showValidationError('Erro interno. Tente novamente em alguns instantes.');
      this.trackFormSubmission(form.id, 'error');
    }
  }

  performSecurityValidation(formData) {
    // Validar campos obrigatórios
    const requiredFields = ['nome', 'categoria', 'salario', 'valor'];
    for (const field of requiredFields) {
      const value = formData.get(field);
      if (!value || value.trim() === '') {
        return {
          isValid: false,
          message: `O campo ${field} é obrigatório.`,
        };
      }
    }

    // Validar formato de email (se presente)
    const email = formData.get('email');
    if (email && !this.isValidEmail(email)) {
      return {
        isValid: false,
        message: 'Por favor, insira um email válido.',
      };
    }

    // Validar valores numéricos
    const salario = formData.get('salario');
    const valor = formData.get('valor');

    if (salario && (isNaN(salario) || parseFloat(salario) < 0)) {
      return {
        isValid: false,
        message: 'Salário deve ser um valor numérico válido.',
      };
    }

    if (valor && (isNaN(valor) || parseFloat(valor) < 1000)) {
      return {
        isValid: false,
        message: 'Valor mínimo para empréstimo é R$ 1.000,00.',
      };
    }

    // Validar limites de margem consignável
    if (salario && valor) {
      const salarioNum = parseFloat(salario);
      const valorNum = parseFloat(valor);
      const categoria = formData.get('categoria');

      let margemMaxima = 0.35; // INSS padrão
      if (categoria === 'servidor' || categoria === 'militar') {
        margemMaxima = 0.4;
      }

      const valorMaximo = salarioNum * margemMaxima * 96; // 96 meses máximo

      if (valorNum > valorMaximo) {
        return {
          isValid: false,
          message: `Valor solicitado excede a margem consignável disponível. Máximo: ${formatCurrency(valorMaximo)}`,
        };
      }
    }

    // Validar tentativas de injeção
    const textFields = ['nome', 'email', 'assunto', 'mensagem'];
    for (const field of textFields) {
      const value = formData.get(field);
      if (value && this.containsSuspiciousContent(value)) {
        return {
          isValid: false,
          message: 'Conteúdo inválido detectado. Por favor, revise os dados informados.',
        };
      }
    }

    return { isValid: true };
  }

  async simulateServerValidation(formData) {
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simular validações do servidor
    const nome = formData.get('nome');
    const categoria = formData.get('categoria');

    // Validar se categoria é válida
    const categoriasValidas = ['inss', 'servidor', 'militar', 'clt', 'credito-pessoal', 'fgts'];
    if (categoria && !categoriasValidas.includes(categoria)) {
      return {
        isValid: false,
        message: 'Categoria selecionada não é válida.',
      };
    }

    // Simular verificação de blacklist (em produção, consultar base real)
    if (nome && nome.toLowerCase().includes('teste')) {
      return {
        isValid: false,
        message: 'Dados de teste não são permitidos.',
      };
    }

    return { isValid: true };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  containsSuspiciousContent(text) {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\(/i,
      /document\./i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(text));
  }

  showValidationError(message) {
    // Apenas logar o erro no console
    console.error('Erro de validação:', message);
  }

  trackFormSubmission(formId, status) {
    // Integração com Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'form_submission', {
        form_id: formId,
        status: status,
        timestamp: new Date().toISOString(),
      });
    }

    // Log local para debugging
    console.log(`Form submission tracked: ${formId} - ${status}`);
  }
}

// Google Analytics 4 Integration
class GoogleAnalytics {
  constructor() {
    this.initGA4();
    this.trackPageView();
    this.setupEventTracking();
  }

  initGA4() {
    // Adicionar script do Google Analytics (substitua GA_MEASUREMENT_ID pelo ID real)
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(gaScript);

    // Configurar gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: 'RealCred + | Empréstimos Consignados',
      page_location: window.location.href,
    });
  }

  trackPageView() {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        content_group1: 'Landing Page',
        content_group2: 'Empréstimos Consignados',
      });
    }
  }

  setupEventTracking() {
    // Rastrear cliques em CTAs
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    ctaButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.trackEvent('cta_click', {
          button_text: btn.textContent.trim(),
          button_location: this.getElementLocation(btn),
        });
      });
    });

    // Rastrear interações com simulador
    const simulatorInputs = document.querySelectorAll(
      '#simulationForm input, #simulationForm select'
    );
    simulatorInputs.forEach((input) => {
      input.addEventListener('change', () => {
        this.trackEvent('simulator_interaction', {
          field_name: input.name || input.id,
          field_value: input.type === 'number' ? 'numeric_value' : input.value,
        });
      });
    });

    // Rastrear scroll depth
    this.trackScrollDepth();

    // Rastrear tempo na página
    this.trackTimeOnPage();
  }

  trackEvent(eventName, parameters = {}) {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventName, {
        ...parameters,
        timestamp: new Date().toISOString(),
      });
    }
    console.log(`Event tracked: ${eventName}`, parameters);
  }

  getElementLocation(element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (rect.top + scrollTop < window.innerHeight) return 'above_fold';
    if (rect.top + scrollTop < window.innerHeight * 2) return 'second_screen';
    return 'below_fold';
  }

  trackScrollDepth() {
    let maxScroll = 0;
    const trackingPoints = [25, 50, 75, 90, 100];
    const trackedPoints = new Set();

    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;

        trackingPoints.forEach((point) => {
          if (scrollPercent >= point && !trackedPoints.has(point)) {
            trackedPoints.add(point);
            this.trackEvent('scroll_depth', {
              percent: point,
              max_scroll: maxScroll,
            });
          }
        });
      }
    });
  }

  trackTimeOnPage() {
    const startTime = Date.now();
    const intervals = [30, 60, 120, 300]; // 30s, 1min, 2min, 5min
    const tracked = new Set();

    setInterval(() => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);

      intervals.forEach((interval) => {
        if (timeOnPage >= interval && !tracked.has(interval)) {
          tracked.add(interval);
          this.trackEvent('time_on_page', {
            duration_seconds: interval,
            total_time: timeOnPage,
          });
        }
      });
    }, 10000); // Verificar a cada 10 segundos
  }
}

// LGPD Compliance - Cookie Consent
class LGPDCompliance {
  constructor() {
    this.createCookieConsent();
    this.initLGPDCompliance();
  }

  createCookieConsent() {
    const consentHTML = `
            <div class="cookie-consent" id="cookie-consent">
                <div class="cookie-content">
                    <div class="cookie-text">
                        <h4>🍪 Política de Cookies</h4>
                        <p>
                            Utilizamos cookies para melhorar sua experiência, personalizar conteúdo e analisar nosso tráfego. 
                            Ao continuar navegando, você concorda com nossa 
                            <a href="#privacy-policy" class="cookie-link">Política de Privacidade</a> e 
                            <a href="#terms" class="cookie-link">Termos de Uso</a>.
                        </p>
                    </div>
                    <div class="cookie-actions">
                        <button class="btn btn-secondary" id="cookie-settings">Configurar</button>
                        <button class="btn btn-primary" id="cookie-accept">Aceitar Todos</button>
                    </div>
                </div>
            </div>
            
            <div class="cookie-settings-modal" id="cookie-settings-modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Configurações de Cookies</h3>
                        <button class="modal-close" id="settings-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="cookie-category">
                            <div class="category-header">
                                <h4>Cookies Essenciais</h4>
                                <label class="switch">
                                    <input type="checkbox" checked disabled>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <p>Necessários para o funcionamento básico do site. Não podem ser desabilitados.</p>
                        </div>
                        
                        <div class="cookie-category">
                            <div class="category-header">
                                <h4>Cookies de Análise</h4>
                                <label class="switch">
                                    <input type="checkbox" id="analytics-cookies" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <p>Nos ajudam a entender como você usa nosso site para melhorarmos a experiência.</p>
                        </div>
                        
                        <div class="cookie-category">
                            <div class="category-header">
                                <h4>Cookies de Marketing</h4>
                                <label class="switch">
                                    <input type="checkbox" id="marketing-cookies">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <p>Utilizados para personalizar anúncios e medir a eficácia de campanhas publicitárias.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="save-preferences">Salvar Preferências</button>
                        <button class="btn btn-primary" id="accept-selected">Aceitar Selecionados</button>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML('beforeend', consentHTML);
  }

  initLGPDCompliance() {
    // Verificar se já existe consentimento
    if (localStorage.getItem('cookie-consent')) {
      document.getElementById('cookie-consent').style.display = 'none';
      this.loadConsentedCookies();
      return;
    }

    // Event listeners
    document.getElementById('cookie-accept').addEventListener('click', () => {
      this.acceptAllCookies();
    });

    document.getElementById('cookie-settings').addEventListener('click', () => {
      document.getElementById('cookie-settings-modal').style.display = 'flex';
    });

    document.getElementById('settings-close').addEventListener('click', () => {
      document.getElementById('cookie-settings-modal').style.display = 'none';
    });

    document.getElementById('save-preferences').addEventListener('click', () => {
      this.savePreferences();
    });

    document.getElementById('accept-selected').addEventListener('click', () => {
      this.savePreferences();
    });
  }

  acceptAllCookies() {
    const consent = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    document.getElementById('cookie-consent').style.display = 'none';
    this.loadConsentedCookies();
  }

  savePreferences() {
    const consent = {
      essential: true, // Sempre true
      analytics: document.getElementById('analytics-cookies').checked,
      marketing: document.getElementById('marketing-cookies').checked,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    document.getElementById('cookie-consent').style.display = 'none';
    document.getElementById('cookie-settings-modal').style.display = 'none';
    this.loadConsentedCookies();
  }

  loadConsentedCookies() {
    const consent = JSON.parse(localStorage.getItem('cookie-consent'));

    if (consent.analytics) {
      // Carregar Google Analytics
      new GoogleAnalytics();
    }

    if (consent.marketing) {
      // Carregar pixels de marketing (Facebook, LinkedIn, etc.)
      this.loadMarketingPixels();
    }
  }

  loadMarketingPixels() {
    // Facebook Pixel (exemplo)
    // !function(f,b,e,v,n,t,s)
    // {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    // n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    // if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    // n.queue=[];t=b.createElement(e);t.async=!0;
    // t.src=v;s=b.getElementsByTagName(e)[0];
    // s.parentNode.insertBefore(t,s)}(window, document,'script',
    // 'https://connect.facebook.net/en_US/fbevents.js');
    // fbq('init', 'YOUR_PIXEL_ID');
    // fbq('track', 'PageView');

    console.log('Marketing pixels loaded');
  }
}

// Inicializar melhorias de segurança e análise
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar validação de servidor
  new ServerValidation();

  // Inicializar compliance LGPD
  new LGPDCompliance();

  // Google Analytics será carregado apenas com consentimento
});

// Simulador de Crédito Pessoal
class CreditoPessoalSimulator {
  static calcular(valor, prazo, score = 'medio') {
    const config = CREDIT_CONFIG.creditoPessoal;

    // Validações
    if (valor < config.valorMinimo || valor > config.valorMaximo) {
      throw new Error(
        `Valor deve estar entre ${formatCurrency(config.valorMinimo)} e ${formatCurrency(config.valorMaximo)}`
      );
    }

    if (prazo > config.prazoMaximo) {
      throw new Error(`Prazo máximo de ${config.prazoMaximo} meses`);
    }

    // Taxa baseada no score
    let taxa;
    switch (score) {
      case 'alto':
        taxa = config.taxaMedia * 0.8; // 20% desconto
        break;
      case 'medio':
        taxa = config.taxaMedia;
        break;
      case 'baixo':
        taxa = config.taxaMedia * 1.2; // 20% acréscimo
        break;
      default:
        taxa = config.taxaMedia;
    }

    // Não pode exceder o teto do BC
    taxa = Math.min(taxa, config.taxaMaxima);

    // Cálculo da parcela (Price)
    const taxaDecimal = taxa / 100;
    const parcela =
      (valor * (taxaDecimal * Math.pow(1 + taxaDecimal, prazo))) /
      (Math.pow(1 + taxaDecimal, prazo) - 1);

    const valorTotal = parcela * prazo;
    const jurosTotal = valorTotal - valor;

    return {
      valorSolicitado: valor,
      prazo: prazo,
      taxa: taxa,
      parcela: parcela,
      valorTotal: valorTotal,
      jurosTotal: jurosTotal,
      cet: taxa * 12, // CET anual aproximado
    };
  }
}

// Simulador de Saque Aniversário FGTS
class FGTSSimulator {
  static calcularSaqueAniversario(saldoFGTS) {
    const config = CREDIT_CONFIG.fgts;

    // Encontrar a faixa correta
    const faixa = config.aliquotas.find((f) => saldoFGTS >= f.faixa[0] && saldoFGTS <= f.faixa[1]);

    if (!faixa) {
      throw new Error('Saldo FGTS inválido');
    }

    const valorSaque = (saldoFGTS * faixa.percentual) / 100 + faixa.adicional;

    return {
      saldoFGTS: saldoFGTS,
      percentual: faixa.percentual,
      adicional: faixa.adicional,
      valorSaque: valorSaque,
      saldoRestante: saldoFGTS - valorSaque,
    };
  }

  static calcularAntecipacao(saldoFGTS, parcelas = 1, taxa = null) {
    const config = CREDIT_CONFIG.fgts;

    if (parcelas > config.parcelasMaximas) {
      throw new Error(`Máximo de ${config.parcelasMaximas} parcelas`);
    }

    // Taxa padrão se não informada
    if (!taxa) {
      taxa = config.taxaMinima;
    }

    // Calcular valor do saque anual
    const saqueAnual = this.calcularSaqueAniversario(saldoFGTS);

    // Valor total a ser antecipado
    const valorBruto = saqueAnual.valorSaque * parcelas;

    // Desconto dos juros (juros simples para simplificar)
    const jurosTotal = valorBruto * (taxa / 100) * parcelas;
    const valorLiquido = valorBruto - jurosTotal;

    return {
      saldoFGTS: saldoFGTS,
      saqueAnual: saqueAnual.valorSaque,
      parcelas: parcelas,
      taxa: taxa,
      valorBruto: valorBruto,
      jurosTotal: jurosTotal,
      valorLiquido: valorLiquido,
      economia: `Sem parcelas mensais - desconto direto do FGTS`,
    };
  }
}

// Atualizar simulador principal para incluir novas modalidades
function simularEmprestimo() {
  try {
    const form = document.getElementById('simulacao-form');
    const formData = new FormData(form);

    const categoria = formData.get('categoria');
    const salario = parseCurrency(formData.get('salario') || '0'); // eslint-disable-line no-unused-vars
    const valor = parseCurrency(formData.get('valor') || '0');
    const prazo = parseInt(formData.get('prazo') || '12');

    let resultado;

    // Determinar tipo de simulação baseado na categoria
    if (categoria === 'credito-pessoal') {
      resultado = CreditoPessoalSimulator.calcular(valor, prazo);
      exibirResultadoCreditoPessoal(resultado);
    } else if (categoria === 'fgts') {
      // Para FGTS, usar o valor como saldo FGTS
      resultado = FGTSSimulator.calcularAntecipacao(valor, prazo);
      exibirResultadoFGTS(resultado);
    } else {
      // Simulação tradicional de consignado
      // TODO: Implement calcularConsignado and exibirResultadoConsignado functions
      // resultado = calcularConsignado(categoria, salario, valor, prazo);
      // exibirResultadoConsignado(resultado);
      throw new Error(
        'Simulação de consignado tradicional não implementada. Use o formulário principal.'
      );
    }

    // Mostrar seção de resultados
    document.getElementById('resultado-simulacao').style.display = 'block';
    document.getElementById('resultado-simulacao').scrollIntoView({
      behavior: 'smooth',
    });
  } catch (error) {
    alert('Erro na simulação: ' + error.message);
  }
}

// Funções para exibir resultados específicos
function exibirResultadoCreditoPessoal(resultado) {
  const container = document.getElementById('resultado-detalhes');
  container.innerHTML = `
        <div class="resultado-card">
            <h4>💰 Crédito Pessoal</h4>
            <div class="resultado-item">
                <span>Valor Solicitado:</span>
                <strong>${formatCurrency(resultado.valorSolicitado)}</strong>
            </div>
            <div class="resultado-item">
                <span>Taxa de Juros:</span>
                <strong>${formatPercentage(resultado.taxa)} a.m.</strong>
            </div>
            <div class="resultado-item">
                <span>Parcela Mensal:</span>
                <strong>${formatCurrency(resultado.parcela)}</strong>
            </div>
            <div class="resultado-item">
                <span>Prazo:</span>
                <strong>${resultado.prazo} meses</strong>
            </div>
            <div class="resultado-item">
                <span>Valor Total:</span>
                <strong>${formatCurrency(resultado.valorTotal)}</strong>
            </div>
            <div class="resultado-item">
                <span>Total de Juros:</span>
                <strong>${formatCurrency(resultado.jurosTotal)}</strong>
            </div>
            <div class="resultado-observacao">
                <p><strong>Observação:</strong> Aprovação sujeita à análise de crédito. Taxa pode variar conforme seu score.</p>
            </div>
        </div>
    `;
}

function exibirResultadoFGTS(resultado) {
  const container = document.getElementById('resultado-detalhes');
  container.innerHTML = `
        <div class="resultado-card">
            <h4>🏦 Antecipação Saque Aniversário FGTS</h4>
            <div class="resultado-item">
                <span>Saldo FGTS:</span>
                <strong>${formatCurrency(resultado.saldoFGTS)}</strong>
            </div>
            <div class="resultado-item">
                <span>Saque Anual:</span>
                <strong>${formatCurrency(resultado.saqueAnual)}</strong>
            </div>
            <div class="resultado-item">
                <span>Parcelas Antecipadas:</span>
                <strong>${resultado.parcelas} anos</strong>
            </div>
            <div class="resultado-item">
                <span>Taxa de Juros:</span>
                <strong>${formatPercentage(resultado.taxa)} a.m.</strong>
            </div>
            <div class="resultado-item">
                <span>Valor Bruto:</span>
                <strong>${formatCurrency(resultado.valorBruto)}</strong>
            </div>
            <div class="resultado-item">
                <span>Juros Totais:</span>
                <strong>${formatCurrency(resultado.jurosTotal)}</strong>
            </div>
            <div class="resultado-item destaque">
                <span>Valor Líquido na Conta:</span>
                <strong>${formatCurrency(resultado.valorLiquido)}</strong>
            </div>
            <div class="resultado-observacao">
                <p><strong>Vantagem:</strong> ${resultado.economia}</p>
                <p><strong>Importante:</strong> Ao optar pelo saque aniversário, você não poderá sacar o valor total do FGTS em caso de demissão.</p>
            </div>
        </div>
    `;
}

// FAQ Dinâmica
class FAQManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupSearch();
    this.setupAccordion();
  }

  setupSearch() {
    const searchInput = document.getElementById('faq-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      this.filterFAQ(e.target.value);
    });
  }

  filterFAQ(searchTerm) {
    const faqItems = document.querySelectorAll('.faq-item');
    const term = searchTerm.toLowerCase();

    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question span').textContent.toLowerCase();
      const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();

      if (question.includes(term) || answer.includes(term)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  setupAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach((question) => {
      question.addEventListener('click', () => {
        this.toggleFAQ(question);
      });
    });
  }

  toggleFAQ(question) {
    const isExpanded = question.getAttribute('aria-expanded') === 'true';
    const answer = question.nextElementSibling;

    // Fechar todas as outras FAQs
    document.querySelectorAll('.faq-question').forEach((q) => {
      if (q !== question) {
        q.setAttribute('aria-expanded', 'false');
        q.nextElementSibling.classList.remove('active');
      }
    });

    // Toggle da FAQ atual
    question.setAttribute('aria-expanded', !isExpanded);
    answer.classList.toggle('active', !isExpanded);
  }
}

// Notificações Push
class PushNotificationManager {
  constructor() {
    this.permission = null;
    this.init();
  }

  async init() {
    if ('Notification' in window) {
      this.permission = await this.requestPermission();
      this.setupReengagement();
    }
  }

  async requestPermission() {
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }

  setupReengagement() {
    // Mostrar notificação após 30 segundos de inatividade
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        this.showReengagementNotification();
      }, 30000);
    };

    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keypress', resetTimer);
    document.addEventListener('scroll', resetTimer);

    resetTimer();
  }

  showReengagementNotification() {
    if (this.permission === 'granted') {
      const notification = new Notification('RealCred + | Não perca esta oportunidade!', {
        body: 'Complete sua simulação e descubra as melhores condições de empréstimo para você.',
        icon: '/assets/images/realcred_logo.png',
        badge: '/assets/images/realcred_logo.png',
      });

      notification.onclick = () => {
        window.focus();
        document.getElementById('simulacao').scrollIntoView({ behavior: 'smooth' });
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    } else {
      this.showInPageNotification();
    }
  }

  showInPageNotification() {
    const notification = document.createElement('div');
    notification.className = 'push-notification';
    notification.innerHTML = `
            <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
            <strong>💰 Oferta Especial!</strong><br>
            Complete sua simulação agora e garanta as melhores taxas do mercado.
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 8000);
  }
}

// WhatsApp Integration
class WhatsAppIntegration {
  constructor() {
    this.phoneNumber = '5512982827447';
    this.init();
  }

  init() {
    this.createWidget();
    this.setupEventListeners();
  }

  createWidget() {
    const widget = document.createElement('div');
    widget.className = 'whatsapp-widget';
    widget.innerHTML = `
            <button class="whatsapp-btn" onclick="whatsAppManager.openChat()" aria-label="Falar no WhatsApp">
                💬
                <div class="whatsapp-tooltip">Fale conosco no WhatsApp</div>
            </button>
        `;

    document.body.appendChild(widget);
  }

  setupEventListeners() {
    // Detectar quando usuário completa simulação
    document.addEventListener('simulationCompleted', (e) => {
      this.sendSimulationData(e.detail);
    });
  }

  openChat(message = null) {
    const defaultMessage =
      message || 'Olá! Gostaria de saber mais sobre os empréstimos da RealCred +.';
    const encodedMessage = encodeURIComponent(defaultMessage);
    const url = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;

    window.open(url, '_blank');
  }

  sendSimulationData(simulationData) {
    const message = `Olá! Fiz uma simulação no site da RealCred + e gostaria de mais informações:
        
📊 *Dados da Simulação:*
• Modalidade: ${simulationData.categoria}
• Valor: ${formatCurrency(simulationData.valor)}
• Prazo: ${simulationData.prazo} meses
• Parcela: ${formatCurrency(simulationData.parcela)}

Gostaria de prosseguir com a contratação.`;

    this.openChat(message);
  }
}

// Calculadora de Portabilidade
class PortabilityCalculator {
  static calcular(valorAtual, parcelaAtual, prazoRestante, taxaAtual) {
    const config = CREDIT_CONFIG.inss; // Usar INSS como referência

    // Calcular saldo devedor
    const taxaAtualDecimal = taxaAtual / 100;
    const saldoDevedor =
      parcelaAtual *
      ((Math.pow(1 + taxaAtualDecimal, prazoRestante) - 1) /
        (taxaAtualDecimal * Math.pow(1 + taxaAtualDecimal, prazoRestante)));

    // Nova parcela com taxa da RealCred+
    const novaTaxaDecimal = config.taxaMaxima / 100;
    const novaParcela =
      (saldoDevedor * (novaTaxaDecimal * Math.pow(1 + novaTaxaDecimal, prazoRestante))) /
      (Math.pow(1 + novaTaxaDecimal, prazoRestante) - 1);

    const economiaMensal = parcelaAtual - novaParcela;
    const economiaTotal = economiaMensal * prazoRestante;

    return {
      saldoDevedor: saldoDevedor,
      parcelaAtual: parcelaAtual,
      novaParcela: novaParcela,
      economiaMensal: economiaMensal,
      economiaTotal: economiaTotal,
      taxaAtual: taxaAtual,
      novaTaxa: config.taxaMaxima,
      prazoRestante: prazoRestante,
    };
  }
}

// Blog/Artigos Educacionais (Simulação de conteúdo)
class EducationalContent {
  static articles = [
    {
      id: 1,
      title: 'Como Sair das Dívidas em 2025: Guia Completo',
      excerpt: 'Estratégias práticas para quitar suas dívidas e recuperar o controle financeiro.',
      category: 'Educação Financeira',
      readTime: '5 min',
      image: '/assets/images/sairdasdividas.png',
    },
    {
      id: 2,
      title: 'Empréstimo Consignado vs Crédito Pessoal: Qual Escolher?',
      excerpt: 'Entenda as diferenças e escolha a melhor opção para o seu perfil.',
      category: 'Crédito',
      readTime: '4 min',
      image: '/assets/images/creditopessoalvsconsignado.png',
    },
    {
      id: 3,
      title: 'Saque Aniversário FGTS: Vale a Pena em 2025?',
      excerpt: 'Tudo o que você precisa saber sobre o Saque Aniversário do FGTS.',
      category: 'FGTS',
      readTime: '3 min',
      image: '/assets/images/fgtsvaleapena.png',
    },
  ];

  static renderBlogSection() {
    console.log('Iniciando renderização da seção de blog...');

    // Cria o container principal
    const container = document.createElement('div');
    container.className = 'container';

    // Cria o header da seção
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.innerHTML = `
            <h2 class="section-title">Educação Financeira</h2>
            <p class="section-subtitle">Aprenda a tomar melhores decisões financeiras</p>
        `;

    // Cria o grid de cards
    const blogGrid = document.createElement('div');
    blogGrid.className = 'blog-grid';

    // Adiciona os artigos ao grid
    this.articles.forEach((article) => {
      const articleCard = document.createElement('article');
      articleCard.className = 'blog-card';

      // Cria a imagem do artigo
      const blogImage = document.createElement('div');
      blogImage.className = 'blog-image';

      const img = document.createElement('img');
      img.src = article.image;
      img.alt = article.title;
      img.loading = 'lazy';

      // Adiciona manipuladores de evento para a imagem
      img.onload = function () {
        console.log('Imagem carregada com sucesso:', this.src);
        this.style.opacity = '1';
      };

      img.onerror = function () {
        console.error('Erro ao carregar a imagem:', this.src);
        this.src = '/assets/images/happy_people1.jpg';
        this.style.opacity = '1';
      };

      // Cria a categoria
      const categorySpan = document.createElement('span');
      categorySpan.className = 'blog-category';
      categorySpan.textContent = article.category;

      // Adiciona a imagem e a categoria ao container de imagem
      blogImage.appendChild(img);
      blogImage.appendChild(categorySpan);

      // Cria o conteúdo do card
      const blogContent = document.createElement('div');
      blogContent.className = 'blog-content';

      const title = document.createElement('h3');
      title.textContent = article.title;

      const excerpt = document.createElement('p');
      excerpt.textContent = article.excerpt;

      // Cria o rodapé do card
      const blogMeta = document.createElement('div');
      blogMeta.className = 'blog-meta';

      const readTime = document.createElement('span');
      readTime.className = 'read-time';
      readTime.innerHTML = `📖 ${article.readTime}`;

      const readMoreBtn = document.createElement('button');
      readMoreBtn.className = 'read-more-btn';
      readMoreBtn.textContent = 'Ler mais';
      readMoreBtn.onclick = () => this.openArticle(article.id);

      // Monta a estrutura do card
      blogMeta.appendChild(readTime);
      blogMeta.appendChild(readMoreBtn);

      blogContent.appendChild(title);
      blogContent.appendChild(excerpt);
      blogContent.appendChild(blogMeta);

      articleCard.appendChild(blogImage);
      articleCard.appendChild(blogContent);

      // Adiciona o card ao grid
      blogGrid.appendChild(articleCard);
    });

    // Monta a estrutura final
    container.appendChild(sectionHeader);
    container.appendChild(blogGrid);

    console.log('Seção de blog renderizada com sucesso!');
    return container;
  }

  static openArticle(articleId) {
    const article = this.articles.find((a) => a.id === articleId);
    if (article) {
      // Mapear IDs de artigo para URLs de páginas
      const articleUrls = {
        1: 'artigos/como-sair-das-dividas-2025.html',
        2: 'artigos/emprestimo-consignado-vs-credito-pessoal.html',
        3: 'artigos/saque-aniversario-fgts-2025.html',
      };

      const articleUrl = articleUrls[articleId];
      if (articleUrl) {
        window.location.href = articleUrl;
      } else {
        console.error('URL do artigo não encontrada para o ID:', articleId);
      }
    }
  }
}

// Core Web Vitals Optimization
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.optimizeLCP();
    this.optimizeFID();
    this.optimizeCLS();
    this.setupLazyLoading();
  }

  optimizeLCP() {
    // Preload critical resources
    const criticalImages = document.querySelectorAll('img[loading="eager"]');
    criticalImages.forEach((img) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    });
  }

  optimizeFID() {
    // Defer non-critical JavaScript
    const deferredScripts = [
      'https://www.googletagmanager.com/gtag/js',
      // Adicionar outros scripts não críticos
    ];

    deferredScripts.forEach((src) => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      document.head.appendChild(script);
    });
  }

  optimizeCLS() {
    // Reserve space for dynamic content
    const dynamicElements = document.querySelectorAll('.dynamic-content');
    dynamicElements.forEach((element) => {
      element.style.minHeight = '200px'; // Reserve minimum space
    });
  }

  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }
}

// Inicialização dos novos recursos
// Função para inicializar a seção de educação financeira
function initEducationFinanceira() {
  // Iniciando seção de educação financeira

  // Inicializar Educational Content
  window.educationalContent = EducationalContent;

  // Renderizar a seção de blog
  const blogSection = document.getElementById('educacao-financeira');
  if (!blogSection) {
    // Seção de educação financeira não encontrada
    return; // Sair da função se o elemento não existir
  }

  // Verificar se o elemento está visível
  if (blogSection.offsetParent === null) {
    // Seção de educação financeira não visível
    return;
  }

  // Preparando para renderizar conteúdo

  // Limpa o conteúdo existente e adiciona um indicador de carregamento
  blogSection.innerHTML =
    '<div class="container"><p>Carregando conteúdo de educação financeira...</p></div>';
  blogSection.className = 'blog-section';
  blogSection.style.opacity = '1';
  blogSection.style.visibility = 'visible';

  // Pequeno atraso para garantir que o DOM foi atualizado
  setTimeout(() => {
    try {
      // Renderizando conteúdo...

      // Renderiza o conteúdo
      const content = EducationalContent.renderBlogSection();
      blogSection.innerHTML = '';
      blogSection.appendChild(content);

      // Verificando imagens...
      const images = blogSection.querySelectorAll('img');

      if (images.length === 0) {
        // Nenhuma imagem encontrada
      }

      images.forEach((img, index) => {
        // Força o redesenho das imagens
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';

        if (img.complete) {
          if (img.naturalWidth === 0) {
            console.error(`Erro: A imagem não foi carregada corretamente: ${img.src}`);
            img.src = '/assets/images/happy_people1.jpg';
          } else {
            // Imagem já carregada
            img.style.opacity = '1';
          }
        } else {
          img.onload = function () {
            // Imagem carregada
            this.style.opacity = '1';
          };
          img.onerror = function () {
            // Erro ao carregar imagem
            this.src = '/assets/images/happy_people1.jpg';
            this.style.opacity = '1';
          };
        }

        // Força o carregamento da imagem
        const src = img.src;
        img.src = '';
        img.src = src;
      });

      // Seção de educação financeira pronta
    } catch (error) {
      console.error('Erro ao renderizar a seção de educação financeira:', error);
      blogSection.innerHTML = `
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">Educação Financeira</h2>
                        <p class="section-subtitle">Ocorreu um erro ao carregar o conteúdo. Por favor, atualize a página.</p>
                        <p>${error.message}</p>
                    </div>
                </div>
            `;
    }
  }, 100);
}

// Função para verificar se um elemento existe e está visível
function isElementVisible(selector) {
  const el = document.querySelector(selector);
  return el && (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
  // Inicialização silenciosa dos componentes

  // Inicializar FAQ Manager
  window.faqManager = new FAQManager();

  // Inicializar Push Notifications
  window.pushNotificationManager = new PushNotificationManager();

  // Inicializar WhatsApp Integration
  window.whatsAppManager = new WhatsAppIntegration();

  // Inicializar Performance Optimizer
  window.performanceOptimizer = new PerformanceOptimizer();

  // Função para inicializar a seção de educação financeira quando disponível
  function initEducationSection() {
    const blogSection = document.getElementById('educacao-financeira');
    if (blogSection) {
      // Inicializando seção de educação financeira
      initEducationFinanceira();
    } else {
      // Seção ainda não disponível, tentando novamente...
      // Tenta novamente após um curto atraso
      setTimeout(initEducationSection, 500);
    }
  }

  // Inicia a verificação da seção de educação financeira
  initEducationSection();
});

// Hotjar Integration (simulação)
class UserBehaviorAnalytics {
  static init() {
    // Simulação de integração com Hotjar
    // User Behavior Analytics inicializado

    // Track form interactions
    document.querySelectorAll('form').forEach((form) => {
      form.addEventListener('submit', (e) => {
        this.trackEvent('form_submission', {
          form_id: form.id,
          timestamp: new Date().toISOString(),
        });
      });
    });

    // Track button clicks
    document.querySelectorAll('button, .btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        this.trackEvent('button_click', {
          button_text: button.textContent.trim(),
          button_class: button.className,
          timestamp: new Date().toISOString(),
        });
      });
    });
  }

  static trackEvent(eventName, data) {
    // Em implementação real, enviaria dados para Hotjar ou Google Analytics
    console.log(`Event tracked: ${eventName}`, data);
  }
}

// Inicializar analytics
document.addEventListener('DOMContentLoaded', function () {
  UserBehaviorAnalytics.init();
});

// Calculadora de Portabilidade - Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  const portabilityForm = document.getElementById('portabilityForm');
  if (portabilityForm) {
    portabilityForm.addEventListener('submit', function (e) {
      e.preventDefault();
      calculatePortability();
    });
  }
});

function calculatePortability() {
  const formData = new FormData(document.getElementById('portabilityForm'));

  const valorAtual = parseFloat(formData.get('valorAtual'));
  const parcelaAtual = parseFloat(formData.get('parcelaAtual'));
  const prazoRestante = parseInt(formData.get('prazoRestante'));
  const taxaAtual = parseFloat(formData.get('taxaAtual'));

  try {
    const resultado = PortabilityCalculator.calcular(
      valorAtual,
      parcelaAtual,
      prazoRestante,
      taxaAtual
    );

    // Exibir resultados
    document.getElementById('saldo-devedor').textContent = formatCurrency(resultado.saldoDevedor);
    document.getElementById('parcela-atual-result').textContent = formatCurrency(
      resultado.parcelaAtual
    );
    document.getElementById('nova-parcela').textContent = formatCurrency(resultado.novaParcela);
    document.getElementById('economia-mensal').textContent = formatCurrency(
      resultado.economiaMensal
    );
    document.getElementById('economia-total').textContent = formatCurrency(resultado.economiaTotal);

    document.getElementById('portabilityResult').style.display = 'block';

    // Track event
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'portability_calculation', {
        event_category: 'engagement',
        event_label: 'calculator_used',
        value: resultado.economiaTotal,
      });
    }
  } catch (error) {
    alert('Erro no cálculo: ' + error.message);
  }
}

// Video Player Functions
function playVideo(videoId) {
  // Simulação de reprodução de vídeo
  const videoMessages = {
    video1:
      'Depoimento da Maria Santos: "A RealCred + me ajudou a quitar todas as minhas dívidas com uma taxa muito melhor que meu banco anterior. O atendimento foi excelente e o processo muito rápido!"',
    video2:
      'Depoimento do João Silva: "Como servidor público, consegui uma taxa excelente e o dinheiro caiu na minha conta no mesmo dia. Recomendo a RealCred + para todos os meus colegas!"',
    video3:
      'Depoimento da Ana Costa: "Com a antecipação do FGTS, consegui dar a entrada da minha casa própria. Sem parcelas mensais, foi perfeito para minha situação financeira!"',
  };

  alert(videoMessages[videoId] || 'Vídeo não encontrado');

  // Track video play
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'video_play', {
      event_category: 'engagement',
      event_label: videoId,
      value: 1,
    });
  }
}

// Preloader Management
window.addEventListener('load', function () {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hidden');
      setTimeout(() => {
        preloader.remove();
      }, 500);
    }, 1000);
  }
});

// Enhanced Form Validation with Real-time Feedback
class EnhancedFormValidator extends FormValidator {
  constructor(form) {
    super(form);
    this.setupRealTimeValidation();
  }

  setupRealTimeValidation() {
    const fields = this.form.querySelectorAll('input, select');

    fields.forEach((field) => {
      field.addEventListener('blur', () => {
        this.validateField(field);
      });

      field.addEventListener('input', () => {
        this.clearFieldError(field);
      });
    });
  }

  validateField(field) {
    const isValid = super.validateField(field);

    if (!isValid) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.classList.remove('error');
      field.setAttribute('aria-invalid', 'false');
    }

    return isValid;
  }

  clearFieldError(field) {
    const errorElement = document.getElementById(field.name + '-error');
    if (errorElement) {
      errorElement.textContent = '';
    }
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
  }
}

// A/B Testing Framework (Simulação)
class ABTestManager {
  constructor() {
    this.variants = this.loadVariants();
  }
  getVariant(name) {
    const variant = this.variants ? this.variants[name] : undefined;
    if (variant && variant.hero_cta_color) {
      return variant.hero_cta_color;
    }
    return variant && variant.current ? variant.current : undefined;
  }
  loadVariants() {
    return {
      hero_cta_color: {
        variants: ['blue', 'green', 'orange'],
        current: 'blue',
      },
      form_layout: {
        variants: ['single_column', 'two_column'],
        current: 'single_column',
      },
    };
  }
  applyTests() {
    // Apply hero CTA color test
    const heroCTA = document.querySelector('.hero .btn-primary');
    if (heroCTA) {
      const colorVariant = this.getVariant('hero_cta_color');
      heroCTA.classList.add(`variant-${colorVariant}`);
    }

    // Apply form layout test
    const simulationForm = document.querySelector('.simulation-form');
    if (simulationForm) {
      const layoutVariant = this.getVariant('form_layout');
      simulationForm.classList.add(`layout-${layoutVariant}`);
    }
  }

  trackConversion(testName, eventName) {
    const variant = this.variants[testName]?.current;
    if (variant && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'ab_test_conversion', {
        event_category: 'ab_testing',
        event_label: `${testName}_${variant}`,
        custom_parameter_1: eventName,
        value: 1,
      });
    }
  }
}

// Lead Scoring System
class LeadScoringSystem {
  static calculateScore(leadData) {
    let score = 0;

    // Category scoring
    const categoryScores = {
      inss: 90,
      servidor: 85,
      militar: 85,
      clt: 70,
      'credito-pessoal': 60,
      fgts: 80,
    };

    score += categoryScores[leadData.categoria] || 50;

    // Salary scoring
    const salario = parseFloat(leadData.salario) || 0;
    if (salario >= 5000) score += 20;
    else if (salario >= 3000) score += 15;
    else if (salario >= 1500) score += 10;
    else if (salario >= 1000) score += 5;

    // Loan amount scoring
    const valor = parseFloat(leadData.valor) || 0;
    if (valor >= 50000) score += 15;
    else if (valor >= 20000) score += 10;
    else if (valor >= 10000) score += 5;

    // Engagement scoring
    const timeOnPage = (Date.now() - window.pageLoadTime) / 1000;
    if (timeOnPage > 300)
      score += 10; // 5+ minutes
    else if (timeOnPage > 120) score += 5; // 2+ minutes

    return Math.min(score, 100); // Cap at 100
  }

  static getLeadQuality(score) {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    if (score >= 40) return 'cold';
    return 'very_cold';
  }
}

// Initialize page load time for lead scoring
window.pageLoadTime = Date.now();

// Initialize all enhanced features
document.addEventListener('DOMContentLoaded', function () {
  // Initialize A/B Testing
  window.abTestManager = new ABTestManager();

  // Enhanced form validation for all forms
  document.querySelectorAll('form').forEach((form) => {
    new EnhancedFormValidator(form);
  });

  // Initialize lead scoring
  window.leadScoringSystem = LeadScoringSystem;
});

// Enhanced simulation function with lead scoring
function simularEmprestimoEnhanced() {
  try {
    const form = document.getElementById('simulacao-form');
    const formData = new FormData(form);

    const leadData = {
      nome: formData.get('nome'),
      categoria: formData.get('categoria'),
      salario: formData.get('salario'),
      valor: formData.get('valor'),
      prazo: formData.get('prazo'),
    };

    // Calculate lead score
    const leadScore = LeadScoringSystem.calculateScore(leadData);
    const leadQuality = LeadScoringSystem.getLeadQuality(leadScore);

    // Perform simulation
    simularEmprestimo();

    // Send to CRM with lead score
    // TODO: Implement CRMIntegration class
    if (typeof window.CRMIntegration !== 'undefined') {
      window.CRMIntegration.sendLead({
        ...leadData,
        leadScore: leadScore,
        leadQuality: leadQuality,
        timestamp: new Date().toISOString(),
      });
    }

    // Track conversion for A/B tests
    window.abTestManager.trackConversion('hero_cta_color', 'simulation_completed');
    window.abTestManager.trackConversion('form_layout', 'simulation_completed');

    // Dispatch custom event for WhatsApp integration
    document.dispatchEvent(
      new CustomEvent('simulationCompleted', {
        detail: leadData,
      })
    );
  } catch (error) {
    console.error('Erro na simulação:', error);
    alert('Erro na simulação: ' + error.message);
  }
}

// Integração com backend próprio para envio de leads por e-mail
const simulationForm = document.getElementById('simulationForm');
let leadFeedback = document.getElementById('lead-feedback');

// Create feedback element if it doesn't exist
if (!leadFeedback && simulationForm) {
  leadFeedback = document.createElement('div');
  leadFeedback.id = 'lead-feedback';
  leadFeedback.style.marginTop = '16px';
  simulationForm.parentNode.insertBefore(leadFeedback, simulationForm.nextSibling);
}

if (simulationForm) {
  simulationForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopPropagation();

    const nome = document.getElementById('nome')?.value.trim();
    const categoria = document.getElementById('categoria')?.value;
    const salario = document.getElementById('salario')?.value;
    const valor = document.getElementById('valor')?.value;
    const prazo = document.getElementById('prazo')?.value;

    // Validação básica
    if (!nome) {
      showFeedback(leadFeedback, 'O campo nome é obrigatório.', 'error');
      return;
    }

    if (!categoria || !salario || !valor || !prazo) {
      showFeedback(leadFeedback, 'Por favor, preencha todos os campos.', 'error');
      return;
    }

    showFeedback(leadFeedback, 'Enviando simulação...', 'info');

    // Simular envio bem-sucedido
    setTimeout(() => {
      showFeedback(
        leadFeedback,
        'Simulação enviada com sucesso! Em breve entraremos em contato.',
        'success'
      );
      simulationForm.reset();

      // Opcional: Rolar para o topo do formulário
      simulationForm.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Opcional: Focar no primeiro campo
      const firstInput = simulationForm.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }, 1500);

    /* Código original comentado para referência futura
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, categoria, salario, valor, prazo })
      });
      
      if (response.ok) {
        showFeedback(leadFeedback, 'Simulação enviada com sucesso! Em breve entraremos em contato.', 'success');
        simulationForm.reset();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao enviar. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      showFeedback(leadFeedback, 'Não foi possível enviar sua simulação. Por favor, tente novamente mais tarde.', 'error');
    }
    */
  });
}

// Função auxiliar para exibir feedback
function showFeedback(element, message, type = 'info') {
  if (!element) return;

  element.style.display = 'block';
  element.textContent = message;

  // Reset styles
  element.style.padding = '12px';
  element.style.borderRadius = '4px';
  element.style.margin = '10px 0';

  // Apply styles based on type
  switch (type) {
    case 'error':
      element.style.color = '#721c24';
      element.style.backgroundColor = '#f8d7da';
      element.style.border = '1px solid #f5c6cb';
      break;
    case 'success':
      element.style.color = '#155724';
      element.style.backgroundColor = '#d4edda';
      element.style.border = '1px solid #c3e6cb';
      break;
    case 'info':
    default:
      element.style.color = '#0c5460';
      element.style.backgroundColor = '#d1ecf1';
      element.style.border = '1px solid #bee5eb';
  }
}

// Integração do formulário de contato com backend SMTP
const contactForm = document.getElementById('contactForm');
const contactFeedback = document.createElement('div');
contactFeedback.id = 'contact-feedback';
contactFeedback.style.marginTop = '16px';
if (contactForm) {
  contactForm.parentNode.insertBefore(contactFeedback, contactForm.nextSibling);
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const nome = document.getElementById('contactNome').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const telefone = document.getElementById('contactTelefone').value.trim();
    const assunto = document.getElementById('contactAssunto').value;
    const mensagem = document.getElementById('contactMensagem')
      ? document.getElementById('contactMensagem').value.trim()
      : '';
    // Validação apenas dos campos obrigatórios do contato
    if (!nome || !email || !assunto || !mensagem) {
      contactFeedback.style.display = 'block';
      contactFeedback.style.color = 'red';
      contactFeedback.textContent = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }
    contactFeedback.style.display = 'block';
    contactFeedback.style.color = '#333';
    contactFeedback.textContent = 'Enviando...';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone, assunto, mensagem }),
      });
      if (response.ok) {
        contactFeedback.style.color = 'green';
        contactFeedback.textContent =
          'Mensagem enviada com sucesso! Em breve entraremos em contato.';
        contactForm.reset();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao enviar. Tente novamente.');
      }
    } catch (error) {
      contactFeedback.style.color = 'red';
      contactFeedback.textContent = error.message;
    }
  });
}

// Corrigir closeModal para evitar erro de removeChild
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal && modal.parentNode) {
    modal.style.display = 'none';
  }
}

function safeBlogImage(src, fallback = '/assets/images/realcred_logo.png') {
  const img = new Image();
  img.src = src;
  img.onerror = function () {
    this.src = fallback;
  };
  return img;
}

// Header scroll effect moderno
document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('.header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
});

// Animações de entrada modernas
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Aplicar animações aos elementos
document.addEventListener('DOMContentLoaded', function () {
  const animatedElements = document.querySelectorAll(
    '.service-card, .testimonial-card, .stat-item, .about-text, .about-img'
  );

  animatedElements.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
});

// Micro-interações nos botões
document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach((button) => {
    button.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px) scale(1.02)';
    });

    button.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
});

// Loading states melhorados
function showLoading(element) {
  element.classList.add('loading');
  element.disabled = true;
}

function hideLoading(element) {
  element.classList.remove('loading');
  element.disabled = false;
}

// Feedback visual melhorado para formulários
document.addEventListener('DOMContentLoaded', function () {
  const formInputs = document.querySelectorAll('input, select, textarea');

  formInputs.forEach((input) => {
    input.addEventListener('focus', function () {
      this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function () {
      this.parentElement.classList.remove('focused');
    });

    input.addEventListener('input', function () {
      if (this.value.length > 0) {
        this.classList.add('has-value');
      } else {
        this.classList.remove('has-value');
      }
    });
  });
});

// Smooth scroll melhorado
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});

// Carrossel de depoimentos
function initTestimonialsCarousel() {
  const carousel = document.getElementById('testimonialsCarousel');
  const grid = carousel ? carousel.querySelector('.testimonials-grid') : null;
  const dotsContainer = document.getElementById('carouselDots');
  if (!carousel || !grid || !dotsContainer) return;
  const cards = grid.querySelectorAll('.testimonial-card');
  let current = 0;
  let interval;

  function showSlide(idx) {
    grid.scrollTo({ left: cards[idx].offsetLeft, behavior: 'smooth' });
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
    current = idx;
  }

  // Criar dots
  dotsContainer.innerHTML = '';
  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => {
      showSlide(i);
      resetInterval();
    });
    dotsContainer.appendChild(dot);
  });

  function nextSlide() {
    const next = (current + 1) % cards.length;
    showSlide(next);
  }
  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(nextSlide, 5000);
  }
  resetInterval();
  carousel.addEventListener('mouseenter', () => clearInterval(interval));
  carousel.addEventListener('mouseleave', resetInterval);
  showSlide(0);
}
document.addEventListener('DOMContentLoaded', initTestimonialsCarousel);

// Barra de progresso da simulação
function updateSimulationProgress() {
  const form = document.getElementById('simulationForm');
  const bar = document.getElementById('simulationProgressBar');
  if (!form || !bar) return;
  const fields = form.querySelectorAll('input, select');
  let filled = 0;
  fields.forEach((f) => {
    if (f.value) filled++;
  });
  const percent = Math.round((filled / fields.length) * 100);
  bar.style.width = percent + '%';
}
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('simulationForm');
  if (form) {
    form.addEventListener('input', updateSimulationProgress);
    updateSimulationProgress();
  }
});

// Tilt effect em imagens e ícones
function initTilt() {
  const tilts = document.querySelectorAll('.tilt');
  tilts.forEach((el) => {
    el.addEventListener('mousemove', function (e) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 6;
      const rotateY = ((x - centerX) / centerX) * -6;
      el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });
    el.addEventListener('mouseleave', function () {
      el.style.transform = '';
    });
  });
}
document.addEventListener('DOMContentLoaded', initTilt);

// Tooltips
function initTooltips() {
  document.querySelectorAll('[data-tooltip]').forEach((el) => {
    el.addEventListener('mouseenter', function () {
      // Tooltip já é CSS puro
    });
  });
}
document.addEventListener('DOMContentLoaded', initTooltips);

// Ripple effect nos botões
function initRipple() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = e.offsetX + 'px';
      ripple.style.top = e.offsetY + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}
document.addEventListener('DOMContentLoaded', initRipple);

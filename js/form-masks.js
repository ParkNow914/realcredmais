// Máscaras para campos de formulário
document.addEventListener('DOMContentLoaded', function () {
  console.log('Form masks loaded and initializing...');
  // Máscara para CPF
  const cpfInput = document.getElementById('cpf');
  console.log('CPF input found:', !!cpfInput);
  if (cpfInput) {
    cpfInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/\D/g, '');

      // Limita a 11 dígitos
      if (value.length > 11) {
        value = value.substring(0, 11);
      }

      // Aplica a formatação enquanto o usuário digita
      let formattedValue = '';
      for (let i = 0; i < value.length; i++) {
        if (i === 3 || i === 6) {
          formattedValue += '.';
        } else if (i === 9) {
          formattedValue += '-';
        }
        formattedValue += value[i];
      }

      // Atualiza o valor do campo
      e.target.value = formattedValue;

      // Validação em tempo real
      validateCPF(e.target);
    });

    // Validação ao sair do campo
    cpfInput.addEventListener('blur', function (e) {
      validateCPF(e.target);
    });

    // Validação ao colar
    cpfInput.addEventListener('paste', function (e) {
      setTimeout(() => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) {
          value = value.substring(0, 11);
        }

        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
          if (i === 3 || i === 6) {
            formattedValue += '.';
          } else if (i === 9) {
            formattedValue += '-';
          }
          formattedValue += value[i];
        }

        e.target.value = formattedValue;
        validateCPF(e.target);
      }, 10);
    });
  }

  // Máscara para telefone
  const telefoneInput = document.getElementById('telefone');
  console.log('Telefone input found:', !!telefoneInput);
  if (telefoneInput) {
    telefoneInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/\D/g, '');

      // Limitar a 11 dígitos (com DDD)
      if (value.length > 11) {
        value = value.substring(0, 11);
      }

      // Formatar telefone: (00) 00000-0000
      if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
      } else if (value.length > 5) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, '($1');
      }

      e.target.value = value;

      // Validação em tempo real
      validatePhone(e.target);
    });

    // Validação ao sair do campo
    telefoneInput.addEventListener('blur', function (e) {
      validatePhone(e.target);
    });

    // Validação ao colar
    telefoneInput.addEventListener('paste', function (e) {
      setTimeout(() => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 11) {
          value = value.substring(0, 11);
        }

        if (value.length > 10) {
          value = value.replace(/(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
        } else if (value.length > 5) {
          value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
          value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
          value = value.replace(/^(\d*)/, '($1');
        }

        e.target.value = value;
        validatePhone(e.target);
      }, 10);
    });
  }

  // Máscara para valor monetário (melhorada)
  const valorInput = document.getElementById('valor');
  console.log('Valor input found:', !!valorInput);
  if (valorInput) {
    valorInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/[^\d]/g, '');

      // Se não há valor, não faz nada
      if (value === '') {
        e.target.value = '';
        return;
      }

      // Converte para número
      const number = parseInt(value);

      // Formata como moeda brasileira
      const formatted = (number / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      e.target.value = formatted;

      // Validação em tempo real
      validateMoney(e.target);
    });

    // Validação ao sair do campo
    valorInput.addEventListener('blur', function (e) {
      validateMoney(e.target);
    });

    // Validação ao colar
    valorInput.addEventListener('paste', function (e) {
      setTimeout(() => {
        let value = e.target.value.replace(/[^\d]/g, '');
        if (value === '') {
          e.target.value = '';
          return;
        }

        const number = parseInt(value);
        const formatted = (number / 100).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        e.target.value = formatted;
        validateMoney(e.target);
      }, 10);
    });
  }

  // Máscara para salário (melhorada)
  const salarioInput = document.getElementById('salario');
  console.log('Salario input found:', !!salarioInput);
  if (salarioInput) {
    salarioInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/[^\d]/g, '');

      // Se não há valor, não faz nada
      if (value === '') {
        e.target.value = '';
        return;
      }

      // Converte para número
      const number = parseInt(value);

      // Formata como moeda brasileira
      const formatted = (number / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      e.target.value = formatted;

      // Validação em tempo real
      validateMoney(e.target);
    });

    // Validação ao sair do campo
    salarioInput.addEventListener('blur', function (e) {
      validateMoney(e.target);
    });

    // Validação ao colar
    salarioInput.addEventListener('paste', function (e) {
      setTimeout(() => {
        let value = e.target.value.replace(/[^\d]/g, '');
        if (value === '') {
          e.target.value = '';
          return;
        }

        const number = parseInt(value);
        const formatted = (number / 100).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        e.target.value = formatted;
        validateMoney(e.target);
      }, 10);
    });
  }

  // Validação para nome completo
  const nomeInput = document.getElementById('nome');
  if (nomeInput) {
    nomeInput.addEventListener('blur', function (e) {
      const value = e.target.value.trim();
      const errorElement = document.getElementById('nome-error');

      if (!value) {
        if (errorElement) {
          errorElement.textContent = 'Nome completo é obrigatório';
          errorElement.style.display = 'block';
        }
      } else if (value.split(' ').length < 2) {
        if (errorElement) {
          errorElement.textContent = 'Digite seu nome completo';
          errorElement.style.display = 'block';
        }
      } else {
        if (errorElement) {
          errorElement.textContent = '';
          errorElement.style.display = 'none';
        }
      }
    });
  }

  // Validação para email
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('blur', function (e) {
      const value = e.target.value.trim();
      const errorElement = document.getElementById('email-error');

      if (value && !isValidEmail(value)) {
        if (errorElement) {
          errorElement.textContent = 'Digite um email válido';
          errorElement.style.display = 'block';
        }
      } else {
        if (errorElement) {
          errorElement.textContent = '';
          errorElement.style.display = 'none';
        }
      }
    });
  }

  // Função para validar email
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Função para validar CPF
  function validateCPF(input) {
    const value = input.value.replace(/\D/g, '');
    const errorElement = document.getElementById(input.id + '-error');

    if (!value) {
      showFieldError(input, 'CPF é obrigatório');
    } else if (value.length < 11) {
      showFieldError(input, 'CPF deve ter 11 dígitos');
    } else if (!isValidCPF(value)) {
      showFieldError(input, 'CPF inválido');
    } else {
      clearFieldError(input);
    }
  }

  // Função para validar telefone
  function validatePhone(input) {
    const value = input.value.replace(/\D/g, '');
    const errorElement = document.getElementById(input.id + '-error');

    if (!value) {
      showFieldError(input, 'Telefone é obrigatório');
    } else if (value.length < 10) {
      showFieldError(input, 'Telefone deve ter pelo menos 10 dígitos');
    } else if (value.length > 11) {
      showFieldError(input, 'Telefone deve ter no máximo 11 dígitos');
    } else {
      clearFieldError(input);
    }
  }

  // Função para validar valores monetários
  function validateMoney(input) {
    const value = input.value.replace(/[^\d,]/g, '').replace(',', '.');
    const number = parseFloat(value);

    if (!value) {
      showFieldError(input, 'Valor é obrigatório');
    } else if (isNaN(number) || number <= 0) {
      showFieldError(input, 'Digite um valor válido');
    } else if (number < 100) {
      showFieldError(input, 'Valor mínimo é R$ 100,00');
    } else {
      clearFieldError(input);
    }
  }

  // Função para validar CPF (algoritmo)
  function isValidCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  // Função para testar CPF válido (para debug)
  function testCPF() {
    const testCPFs = [
      '111.444.777-35', // Válido
      '123.456.789-09', // Inválido
      '489.770.858-37', // Válido (exemplo do usuário)
    ];

    testCPFs.forEach((cpf) => {
      console.log(`CPF ${cpf}: ${isValidCPF(cpf) ? 'VÁLIDO' : 'INVÁLIDO'}`);
    });
  }

  // Executar teste se estiver em modo debug
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(testCPF, 1000);
  }

  // Função para mostrar erro no campo
  function showFieldError(input, message) {
    const errorId = input.id + '-error';
    let errorElement = document.getElementById(errorId);

    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.style.cssText =
        'color: #ef4444; font-size: 12px; margin-top: 4px; display: block;';
      input.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';
    input.classList.add('error');
    input.classList.remove('success');
  }

  // Função para limpar erro do campo
  function clearFieldError(input) {
    const errorId = input.id + '-error';
    const errorElement = document.getElementById(errorId);

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }

    input.classList.remove('error');
    input.classList.add('success');
  }

  console.log('Form masks initialization completed!');
});

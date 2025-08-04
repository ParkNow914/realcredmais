// Máscaras para campos de formulário
document.addEventListener('DOMContentLoaded', function() {
    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
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
        });
    }

    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
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
        });
    }

    // Máscara para valor monetário (melhorada)
    const valorInput = document.getElementById('valor');
    if (valorInput) {
        valorInput.addEventListener('input', function(e) {
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
                maximumFractionDigits: 2
            });
            
            e.target.value = formatted;
        });
    }

    // Máscara para salário (melhorada)
    const salarioInput = document.getElementById('salario');
    if (salarioInput) {
        salarioInput.addEventListener('input', function(e) {
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
                maximumFractionDigits: 2
            });
            
            e.target.value = formatted;
        });
    }

    // Validação para nome completo
    const nomeInput = document.getElementById('nome');
    if (nomeInput) {
        nomeInput.addEventListener('blur', function(e) {
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
        emailInput.addEventListener('blur', function(e) {
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
});

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
            
            // Dispara o evento de validação
            const event = new Event('blur');
            e.target.dispatchEvent(event);
        });
        
        // Validação ao sair do campo
        cpfInput.addEventListener('blur', function(e) {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length === 11) {
                const formHandler = new FormHandler();
                if (!formHandler.isValidCPF(e.target.value)) {
                    const errorElement = document.getElementById('cpf-error') || e.target.nextElementSibling;
                    if (errorElement && errorElement.classList.contains('error-message')) {
                        errorElement.textContent = 'CPF inválido';
                        errorElement.style.display = 'block';
                    }
                } else {
                    const errorElement = document.getElementById('cpf-error') || e.target.nextElementSibling;
                    if (errorElement && errorElement.classList.contains('error-message')) {
                        errorElement.textContent = '';
                        errorElement.style.display = 'none';
                    }
                }
            }
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
            if (value.length > 6) {
                value = value.replace(/(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            } else if (value.length > 0) {
                value = value.replace(/^(\d*)/, '($1');
            }
            
            e.target.value = value;
        });
    }

    // Máscara para valor monetário
    const valorInput = document.getElementById('valor');
    if (valorInput) {
        valorInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d,]/g, '');
            
            // Garantir que há apenas uma vírgula
            const parts = value.split(',');
            if (parts.length > 2) {
                value = parts[0] + ',' + parts.slice(1).join('');
            }
            
            // Limitar a 2 casas decimais
            if (parts[1] && parts[1].length > 2) {
                value = parts[0] + ',' + parts[1].substring(0, 2);
            }
            
            e.target.value = value;
        });
    }

    // Máscara para salário
    const salarioInput = document.getElementById('salario');
    if (salarioInput) {
        salarioInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d,]/g, '');
            
            // Garantir que há apenas uma vírgula
            const parts = value.split(',');
            if (parts.length > 2) {
                value = parts[0] + ',' + parts.slice(1).join('');
            }
            
            // Limitar a 2 casas decimais
            if (parts[1] && parts[1].length > 2) {
                value = parts[0] + ',' + parts[1].substring(0, 2);
            }
            
            e.target.value = value;
        });
    }
});

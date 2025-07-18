// Form Handler
class FormHandler {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.initForms();
        this.setupFormMasks();
    }

    initForms() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            
            // Adicionar validação em tempo real
            this.setupRealTimeValidation(form);
        });
    }

    setupFormMasks() {
        // Máscara para CPF
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                
                // Formatar CPF: 000.000.000-00
                if (value.length > 9) {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
                } else if (value.length > 6) {
                    value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
                } else if (value.length > 3) {
                    value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
                }
                
                e.target.value = value;
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
    }

    setupRealTimeValidation(form) {
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        fields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            
            // Para campos de texto, validar também durante a digitação
            if (field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.tagName === 'TEXTAREA') {
                field.addEventListener('input', () => {
                    if (field.value.trim() !== '') {
                        this.clearError(field);
                    }
                });
            }
        });
    }

    validateField(field) {
        if (!field.required) return true;
        
        const value = field.value.trim();
        const errorId = `${field.id}-error`;
        let isValid = true;
        let errorMessage = '';
        
        // Validar campo vazio
        if (!value) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório.';
        } 
        // Validação específica para email
        else if (field.type === 'email' && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Por favor, insira um email válido.';
        }
        // Validação específica para CPF
        else if (field.id === 'cpf' && !this.isValidCPF(value)) {
            isValid = false;
            errorMessage = 'Por favor, insira um CPF válido.';
        }
        // Validação específica para telefone
        else if (field.id === 'telefone' && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Por favor, insira um telefone válido com DDD.';
        }
        // Validação para valores monetários
        else if ((field.id === 'valor' || field.id === 'salario') && !this.isValidMoney(value)) {
            isValid = false;
            errorMessage = 'Por favor, insira um valor válido.';
        }
        
        if (!isValid) {
            this.showError(field, errorMessage);
        } else {
            this.clearError(field);
        }
        
        return isValid;
    }
    
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    isValidCPF(cpf) {
        cpf = cpf.replace(/[\D]/g, '');
        if (cpf.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        // Validação do primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = 11 - (sum % 11);
        const digit1 = remainder >= 10 ? 0 : remainder;
        
        if (digit1 !== parseInt(cpf.charAt(9))) return false;
        
        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = 11 - (sum % 11);
        const digit2 = remainder >= 10 ? 0 : remainder;
        
        return digit2 === parseInt(cpf.charAt(10));
    }
    
    isValidPhone(phone) {
        const digits = phone.replace(/[\D]/g, '');
        return digits.length >= 10 && digits.length <= 11;
    }
    
    isValidMoney(value) {
        return /^\d{1,3}(\.\d{3})*,\d{2}$/.test(value) || /^\d+,\d{2}$/.test(value) || /^\d+$/.test(value);
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Validar todos os campos antes de enviar
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isFormValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.showFeedback(form, 'Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
            return;
        }
        
        // Desabilitar botão para evitar múltiplos envios
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = 'Enviando...';

        try {
            // Se for o formulário de simulação, mostrar resultado
            if (form.id === 'simulationForm') {
                this.showSimulationResult(form, formData);
            } else {
                // Para outros formulários, simular envio
                await this.sendFormData(form, formData);
                // Mostrar mensagem de sucesso
                this.showFeedback(form, 'Mensagem enviada com sucesso! Em breve entraremos em contato.', 'success');
                form.reset();
            }
            
        } catch (error) {
            console.error('Erro ao processar formulário:', error);
            this.showFeedback(form, 'Erro ao processar sua solicitação. Por favor, tente novamente mais tarde.', 'error');
        } finally {
            // Reativar botão
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }
    
    async sendFormData(form, formData) {
        // Simular atraso de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Se você quiser implementar o envio real para um backend no futuro,
        // descomente e ajuste o código abaixo:
        /*
        try {
            const response = await fetch('/api/lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (!response.ok) {
                throw new Error('Erro ao enviar formulário');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao enviar dados:', error);
            throw error;
        }
        */
        
        // Por enquanto, apenas simulamos um envio bem-sucedido
        return { success: true };
    }
    
    showSimulationResult(form, formData) {
        // Calcular valores da simulação
        const valor = parseFloat(formData.get('valor').replace(/\./g, '').replace(',', '.'));
        const prazo = parseInt(formData.get('prazo'));
        const categoria = formData.get('categoria');
        
        // Taxas por categoria (exemplo)
        const taxas = {
            'inss': 1.85,
            'servidor': 1.99,
            'militar': 1.75,
            'clt': 2.5,
            'credito-pessoal': 3.5,
            'fgts': 2.2
        };
        
        const taxaMensal = taxhas[categoria] || 2.5; // Taxa padrão se a categoria não for encontrada
        const taxaMensalDecimal = taxaMensal / 100;
        
        // Cálculo da parcela (PMT)
        const parcela = this.calcularParcela(valor, taxaMensalDecimal, prazo);
        
        // Mostrar resultado
        const resultHtml = `
            <div class="simulation-result">
                <h3>Resultado da Simulação</h3>
                <div class="result-item">
                    <span class="label">Valor Solicitado:</span>
                    <span class="value">${this.formatCurrency(valor)}</span>
                </div>
                <div class="result-item">
                    <span class="label">Prazo:</span>
                    <span class="value">${prazo} meses</span>
                </div>
                <div class="result-item">
                    <span class="label">Taxa de Juros:</span>
                    <span class="value">${taxaMensal}% a.m.</span>
                </div>
                <div class="result-item total">
                    <span class="label">Valor da Parcela:</span>
                    <span class="value">${this.formatCurrency(parcela)}</span>
                </div>
                <div class="result-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.simulation-result').remove();">Nova Simulação</button>
                    <a href="#contato" class="btn btn-primary">Falar com Consultor</a>
                </div>
            </div>
        `;
        
        // Esconder formulário e mostrar resultado
        form.style.display = 'none';
        form.insertAdjacentHTML('afterend', resultHtml);
    }
    
    calcularParcela(valor, taxaMensal, prazo) {
        // Fórmula PMT: PMT = PV * (i * (1 + i)^n) / ((1 + i)^n - 1)
        const numerador = taxaMensal * Math.pow(1 + taxaMensal, prazo);
        const denominador = Math.pow(1 + taxaMensal, prazo) - 1;
        return valor * (numerador / denominador);
    }
    
    formatCurrency(value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    showError(field, message) {
        const errorId = `${field.id}-error`;
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            errorElement.id = errorId;
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        errorElement.textContent = message;
        field.classList.add('error');
    }
    
    clearError(field) {
        const errorId = `${field.id}-error`;
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        field.classList.remove('error');
    }

    showFeedback(form, message, type) {
        // Remover mensagens anteriores
        const existingFeedback = form.querySelector('.form-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        // Criar elemento de feedback
        const feedback = document.createElement('div');
        feedback.className = `form-feedback ${type}`;
        feedback.textContent = message;
        
        // Inserir no início do formulário
        const firstElement = form.firstElementChild;
        form.insertBefore(feedback, firstElement);
        
        // Rolar até o feedback
        feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remover após 5 segundos
        setTimeout(() => {
            feedback.remove();
        }, 10000);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new FormHandler();
});

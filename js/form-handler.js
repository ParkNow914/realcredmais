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
        // As máscaras agora são gerenciadas pelo form-masks.js
        // Este método agora apenas configura validações em tempo real
        console.log('Form masks setup completed by form-masks.js');
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
        // Remove caracteres não numéricos
        cpf = cpf.replace(/[\D]/g, '');
        
        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) {
            return false;
        }
        
        // Verifica se todos os dígitos são iguais (CPF inválido)
        if (/^(\d)\1{10}$/.test(cpf)) {
            return false;
        }
        
        // Validação do primeiro dígito verificador
        let sum = 0;
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        let remainder = (sum * 10) % 11;
        
        if ((remainder === 10) || (remainder === 11)) {
            remainder = 0;
        }
        
        if (remainder !== parseInt(cpf.substring(9, 10))) {
            return false;
        }
        
        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        
        remainder = (sum * 10) % 11;
        
        if ((remainder === 10) || (remainder === 11)) {
            remainder = 0;
        }
        
        if (remainder !== parseInt(cpf.substring(10, 11))) {
            return false;
        }
        
        return true;
    }
    
    isValidPhone(phone) {
        const digits = phone.replace(/[\D]/g, '');
        return digits.length >= 10 && digits.length <= 11;
    }
    
    isValidMoney(value) {
        // Remove formatação de moeda brasileira (R$ 1.234,56 -> 1234.56)
        const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
        const number = parseFloat(cleanValue);
        return !isNaN(number) && number > 0;
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const form = event.target;
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Validar CPF primeiro se existir no formulário
        const cpfField = form.querySelector('input[name="cpf"]');
        if (cpfField) {
            const cpfValue = cpfField.value.replace(/[\D]/g, '');
            if (cpfValue.length > 0 && !this.isValidCPF(cpfField.value)) {
                this.showError(cpfField, 'Por favor, insira um CPF válido.');
                this.showFeedback(form, 'Por favor, verifique os campos destacados.', 'error');
                cpfField.focus();
                return;
            }
        }
        
        // Validar todos os campos obrigatórios
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isFormValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                if (isFormValid) {
                    field.focus();
                }
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
                // Para outros formulários, enviar dados para o servidor
                const result = await this.sendFormData(form, formData);
                // Mostrar mensagem de sucesso do servidor
                this.showFeedback(form, result.message || 'Mensagem enviada com sucesso! Em breve entraremos em contato.', 'success');
                form.reset();
            }
        } catch (error) {
            console.error('Erro ao processar formulário:', error);
            this.showFeedback(form, error.message || 'Erro ao processar sua solicitação. Por favor, tente novamente mais tarde.', 'error');
        } finally {
            // Reativar botão
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        }
    }
    
    async sendFormData(form, formData) {
        const formDataObj = Object.fromEntries(formData);
        console.log('Form data being sent:', formDataObj);
        
        // Se for formulário de simulação, não envia dados, apenas mostra resultado
        if (form.id === 'simulationForm') {
            return { success: true, message: 'Simulação realizada com sucesso!' };
        }
        
        // Determinar endpoint baseado no tipo de formulário
        let endpoint = '/api/lead';
        if (form.id === 'contactForm') {
            endpoint = '/api/contact';
        }
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formDataObj)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Erro ao enviar formulário');
            }
            
            return result;
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            throw error;
        }
    }
    
    showSimulationResult(form, formData) {
        // Extrair e converter valores monetários
        const valorStr = formData.get('valor').replace(/[^\d,]/g, '').replace(',', '.');
        const salarioStr = formData.get('salario').replace(/[^\d,]/g, '').replace(',', '.');
        
        const valor = parseFloat(valorStr);
        const salario = parseFloat(salarioStr);
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
        
        const taxaMensal = taxas[categoria] || 2.5; // Taxa padrão se a categoria não for encontrada
        const taxaMensalDecimal = taxaMensal / 100;
        
        // Cálculo da parcela (PMT)
        const parcela = this.calcularParcela(valor, taxaMensalDecimal, prazo);
        const totalPagar = parcela * prazo;
        
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
                <div class="result-item">
                    <span class="label">Total a Pagar:</span>
                    <span class="value">${this.formatCurrency(totalPagar)}</span>
                </div>
                <div class="result-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.simulation-result').remove(); form.style.display = 'block';">Nova Simulação</button>
                    <a href="https://wa.me/5512982827447" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Falar com Consultor</a>
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
        // Encontra o elemento de erro
        let errorElement = field.nextElementSibling;
        
        // Se não encontrar como próximo irmão, tenta pelo ID
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            const errorId = `${field.id}-error`;
            errorElement = document.getElementById(errorId);
            
            // Se ainda não encontrou, cria um novo elemento
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.id = errorId;
                errorElement.className = 'error-message';
                
                // Insere após o campo
                field.parentNode.insertBefore(errorElement, field.nextSibling);
            }
        }
        
        // Atualiza a mensagem de erro
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Adiciona classe de erro ao campo e ao grupo do formulário
        field.classList.add('error');
        field.parentNode.classList.add('error');
        
        // Configura acessibilidade
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', errorElement.id);
        
        // Rola até o campo com erro
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    clearError(field) {
        // Encontra o elemento de erro
        let errorElement = field.nextElementSibling;
        
        // Se não encontrar como próximo irmão, tenta pelo ID
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            const errorId = `${field.id}-error`;
            errorElement = document.getElementById(errorId);
        }
        
        // Limpa a mensagem de erro se existir
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        // Remove as classes de erro
        field.classList.remove('error');
        if (field.parentNode) {
            field.parentNode.classList.remove('error');
        }
        
        // Remove atributos de acessibilidade
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
    }

    showFeedback(form, message, type = 'info') {
        // Encontra ou cria o elemento de feedback
        let feedbackElement = form.querySelector('.feedback-message');
        
        if (!feedbackElement) {
            feedbackElement = document.createElement('div');
            feedbackElement.className = 'feedback-message';
            
            // Insere o feedback logo após o formulário
            if (form.nextElementSibling) {
                form.parentNode.insertBefore(feedbackElement, form.nextSibling);
            } else {
                form.parentNode.appendChild(feedbackElement);
            }
        }
        
        // Define o conteúdo e as classes
        feedbackElement.textContent = message;
        feedbackElement.className = `feedback-message ${type}`;
        feedbackElement.style.display = 'block';
        feedbackElement.setAttribute('role', 'alert');
        feedbackElement.setAttribute('aria-live', 'assertive');
        
        // Rola até o feedback
        feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Remove a mensagem após 5 segundos (exceto para erros)
        if (type !== 'error') {
            setTimeout(() => {
                if (feedbackElement) {
                    feedbackElement.style.opacity = '0';
                    setTimeout(() => {
                        if (feedbackElement) {
                            feedbackElement.style.display = 'none';
                            feedbackElement.style.opacity = '1';
                        }
                    }, 300);
                }
            }, 5000);
        }
        
        return feedbackElement;
    }
} // Close the FormHandler class

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new FormHandler();
});

// Função global para resetar simulação
function resetSimulation() {
    const simulationResult = document.querySelector('.simulation-result');
    const simulationForm = document.getElementById('simulationForm');
    
    if (simulationResult) {
        simulationResult.remove();
    }
    
    if (simulationForm) {
        simulationForm.style.display = 'block';
        simulationForm.reset();
        
        // Limpar mensagens de erro
        const errorMessages = simulationForm.querySelectorAll('.error-message');
        errorMessages.forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
        
        // Remover classes de erro dos campos
        const errorFields = simulationForm.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });
    }
}

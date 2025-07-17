// Validação do Formulário de Contato
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar campos obrigatórios
            const nome = document.getElementById('nome');
            const email = document.getElementById('email');
            const assunto = document.getElementById('assunto');
            const mensagem = document.getElementById('mensagem');
            
            let isValid = true;
            
            // Limpar mensagens de erro anteriores
            clearErrors();
            
            // Validar nome
            if (!nome.value.trim()) {
                showError(nome, 'Por favor, insira seu nome.');
                isValid = false;
            }
            
            // Validar email
            if (email.value && !isValidEmail(email.value)) {
                showError(email, 'Por favor, insira um email válido.');
                isValid = false;
            }
            
            // Validar assunto
            if (!assunto.value.trim()) {
                showError(assunto, 'Por favor, insira o assunto.');
                isValid = false;
            }
            
            // Validar mensagem
            if (!mensagem.value.trim()) {
                showError(mensagem, 'Por favor, insira sua mensagem.');
                isValid = false;
            }
            
            // Se o formulário for válido, enviar
            if (isValid) {
                // Aqui você pode adicionar o código para enviar o formulário
                // Por enquanto, vamos apenas mostrar uma mensagem de sucesso
                showSuccess('Mensagem enviada com sucesso! Em breve entraremos em contato.');
                contactForm.reset();
            }
        });
    }
    
    // Função para validar email
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Função para mostrar mensagem de erro
    function showError(input, message) {
        const formGroup = input.closest('.form-group') || input.closest('div');
        if (!formGroup) return;
        
        let errorElement = formGroup.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        input.classList.add('error');
    }
    
    // Função para limpar mensagens de erro
    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        const errorInputs = document.querySelectorAll('.error');
        
        errorMessages.forEach(error => error.remove());
        errorInputs.forEach(input => input.classList.remove('error'));
    }
    
    // Função para mostrar mensagem de sucesso
    function showSuccess(message) {
        // Remover mensagens de sucesso anteriores
        const existingSuccess = document.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        // Criar elemento de sucesso
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = message;
        
        // Inserir antes do formulário
        const form = document.querySelector('form');
        form.parentNode.insertBefore(successElement, form);
        
        // Remover após 5 segundos
        setTimeout(() => {
            successElement.remove();
        }, 5000);
    }
});

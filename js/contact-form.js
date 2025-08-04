// Validação do Formulário de Contato
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Configurar máscara para telefone
        const contactTelefone = document.getElementById('contactTelefone');
        if (contactTelefone) {
            contactTelefone.addEventListener('input', function(e) {
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

        // Validação para nome completo
        const contactNome = document.getElementById('contactNome');
        if (contactNome) {
            contactNome.addEventListener('blur', function(e) {
                const value = e.target.value.trim();
                const errorElement = document.getElementById('contactNome-error');
                
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
        const contactEmail = document.getElementById('contactEmail');
        if (contactEmail) {
            contactEmail.addEventListener('blur', function(e) {
                const value = e.target.value.trim();
                const errorElement = document.getElementById('contactEmail-error');
                
                if (!value) {
                    if (errorElement) {
                        errorElement.textContent = 'Email é obrigatório';
                        errorElement.style.display = 'block';
                    }
                } else if (!isValidEmail(value)) {
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

        // Validação para telefone
        if (contactTelefone) {
            contactTelefone.addEventListener('blur', function(e) {
                const value = e.target.value.trim();
                const errorElement = document.getElementById('contactTelefone-error');
                
                if (value && !isValidPhone(value)) {
                    if (errorElement) {
                        errorElement.textContent = 'Digite um telefone válido com DDD';
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

        // Validação para assunto
        const contactAssunto = document.getElementById('contactAssunto');
        if (contactAssunto) {
            contactAssunto.addEventListener('change', function(e) {
                const value = e.target.value;
                const errorElement = document.getElementById('contactAssunto-error');
                
                if (!value) {
                    if (errorElement) {
                        errorElement.textContent = 'Selecione um assunto';
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

        // Validação para mensagem
        const contactMensagem = document.getElementById('contactMensagem');
        if (contactMensagem) {
            contactMensagem.addEventListener('blur', function(e) {
                const value = e.target.value.trim();
                const errorElement = document.getElementById('contactMensagem-error');
                
                if (!value) {
                    if (errorElement) {
                        errorElement.textContent = 'Mensagem é obrigatória';
                        errorElement.style.display = 'block';
                    }
                } else if (value.length < 10) {
                    if (errorElement) {
                        errorElement.textContent = 'Mensagem deve ter pelo menos 10 caracteres';
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

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar campos obrigatórios
            const nome = document.getElementById('contactNome');
            const email = document.getElementById('contactEmail');
            const telefone = document.getElementById('contactTelefone');
            const assunto = document.getElementById('contactAssunto');
            const mensagem = document.getElementById('contactMensagem');
            
            let isValid = true;
            
            // Limpar mensagens de erro anteriores
            clearErrors();
            
            // Validar nome
            if (!nome.value.trim()) {
                showError(nome, 'Por favor, insira seu nome completo.');
                isValid = false;
            } else if (nome.value.trim().split(' ').length < 2) {
                showError(nome, 'Por favor, insira seu nome completo.');
                isValid = false;
            }
            
            // Validar email
            if (!email.value.trim()) {
                showError(email, 'Por favor, insira seu email.');
                isValid = false;
            } else if (!isValidEmail(email.value)) {
                showError(email, 'Por favor, insira um email válido.');
                isValid = false;
            }
            
            // Validar telefone (opcional, mas se preenchido deve ser válido)
            if (telefone.value.trim() && !isValidPhone(telefone.value)) {
                showError(telefone, 'Por favor, insira um telefone válido com DDD.');
                isValid = false;
            }
            
            // Validar assunto
            if (!assunto.value.trim()) {
                showError(assunto, 'Por favor, selecione um assunto.');
                isValid = false;
            }
            
            // Validar mensagem
            if (!mensagem.value.trim()) {
                showError(mensagem, 'Por favor, insira sua mensagem.');
                isValid = false;
            } else if (mensagem.value.trim().length < 10) {
                showError(mensagem, 'Mensagem deve ter pelo menos 10 caracteres.');
                isValid = false;
            }
            
            // Se o formulário for válido, enviar
            if (isValid) {
                // Simular envio
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = 'Enviando...';
                
                // Simular atraso de envio
                setTimeout(() => {
                    showSuccess('Mensagem enviada com sucesso! Em breve entraremos em contato.');
                    contactForm.reset();
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                }, 1000);
            }
        });
    }
    
    // Função para validar email
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Função para validar telefone
    function isValidPhone(phone) {
        const digits = phone.replace(/[\D]/g, '');
        return digits.length >= 10 && digits.length <= 11;
    }
    
    // Função para mostrar mensagem de erro
    function showError(input, message) {
        const errorId = input.id + '-error';
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.id = errorId;
            errorElement.className = 'error-message';
            input.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        input.classList.add('error');
    }
    
    // Função para limpar mensagens de erro
    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        const errorInputs = document.querySelectorAll('.error');
        
        errorMessages.forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
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
        successElement.style.cssText = `
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-weight: 500;
        `;
        
        // Inserir antes do formulário
        const form = document.querySelector('#contactForm');
        form.parentNode.insertBefore(successElement, form);
        
        // Remover após 5 segundos
        setTimeout(() => {
            successElement.remove();
        }, 5000);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const form = document.getElementById('contactForm');
    const nomeInput = document.getElementById('contactNome');
    const emailInput = document.getElementById('contactEmail');
    const telefoneInput = document.getElementById('contactTelefone');
    const assuntoSelect = document.getElementById('contactAssunto');
    const mensagemTextarea = document.getElementById('contactMensagem');

    // Phone Mask and Validation
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            // Apply phone mask: (00) 00000-0000 or (00) 0000-0000
            if (value.length > 10) {
                // 11 digits with 9th digit (mobile)
                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
            } else if (value.length > 5) {
                // 10 digits (landline)
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
            } else if (value.length > 0) {
                value = value.replace(/^(\d*)/, '($1');
            }
            
            e.target.value = value;
            
            // Validate phone
            validatePhone(e.target);
        });
        
        // Validate on blur as well
        telefoneInput.addEventListener('blur', function() {
            validatePhone(this);
        });
    }

    // Name Validation
    if (nomeInput) {
        nomeInput.addEventListener('blur', function() {
            validateName(this);
        });
    }

    // Email Validation
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmail(this);
        });
    }

    // Subject Validation
    if (assuntoSelect) {
        assuntoSelect.addEventListener('change', function() {
            validateSelect(this);
        });
    }

    // Message Validation
    if (mensagemTextarea) {
        mensagemTextarea.addEventListener('blur', function() {
            validateMessage(this);
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields
            let isValid = true;
            if (nomeInput) isValid = validateName(nomeInput) && isValid;
            if (emailInput) isValid = validateEmail(emailInput) && isValid;
            if (telefoneInput) isValid = validatePhone(telefoneInput) && isValid;
            if (assuntoSelect) isValid = validateSelect(assuntoSelect) && isValid;
            if (mensagemTextarea) isValid = validateMessage(mensagemTextarea) && isValid;
            
            if (isValid) {
                // Format phone before submission
                if (telefoneInput) {
                    telefoneInput.value = telefoneInput.value.replace(/\D/g, '');
                }
                
                // Form is valid, submit it
                console.log('Contact form is valid, submitting...');
                
                // Prepare form data
                const formData = new FormData(form);
                const formDataObj = {};
                formData.forEach((value, key) => {
                    formDataObj[key] = value;
                });

                // Get the selected option text for the subject
                const assuntoSelect = document.getElementById('contactAssunto');
                const selectedOption = assuntoSelect.options[assuntoSelect.selectedIndex];
                const assuntoText = selectedOption ? selectedOption.text : 'Outros';

                // Format data for contact form
                const formattedData = {
                    nome: formDataObj.nome || '',
                    email: formDataObj.email || '',
                    telefone: formDataObj.telefone || '',
                    assunto: assuntoText,
                    mensagem: formDataObj.mensagem || ''
                };

                console.log('Sending data to server:', formattedData);

                // Send data to server using the contact endpoint
                fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formattedData),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showSuccessMessage(data.message || 'Mensagem enviada com sucesso! Entraremos em contato em breve.');
                        form.reset();
                    } else {
                        showSuccessMessage(data.message || 'Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showSuccessMessage('Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente mais tarde.');
                });
            } else {
                // Scroll to first error
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });
    }

    // Validation Functions
    function validateName(input) {
        const name = input.value.trim();
        const errorElement = document.getElementById('contactNome-error');
        
        if (name.length < 3) {
            setError(input, errorElement, 'Nome deve ter pelo menos 3 caracteres');
            return false;
        }
        
        if (!/^[a-zA-ZÀ-ÿ\s']+$/.test(name)) {
            setError(input, errorElement, 'Nome contém caracteres inválidos');
            return false;
        }
        
        clearError(input, errorElement);
        return true;
    }
    
    function validateEmail(input) {
        const email = input.value.trim();
        const errorElement = document.getElementById('contactEmail-error');
        
        if (email.length === 0) {
            setError(input, errorElement, 'E-mail é obrigatório');
            return false;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(input, errorElement, 'E-mail inválido');
            return false;
        }
        
        clearError(input, errorElement);
        return true;
    }
    
    function validatePhone(input) {
        const phone = input.value.replace(/\D/g, '');
        const errorElement = document.getElementById('contactTelefone-error');
        
        // Phone is optional, so if empty, it's valid
        if (phone.length === 0) {
            clearError(input, errorElement);
            return true;
        }
        
        // Validate phone number (10 digits for landline, 11 for mobile with 9th digit)
        if (!/^\d{10,11}$/.test(phone)) {
            setError(input, errorElement, 'Telefone inválido. Use (DDD) + número com 8 ou 9 dígitos');
            return false;
        }
        
        // Check if it's a valid area code (DDD)
        const ddd = parseInt(phone.substring(0, 2));
        const validDDDs = [
            11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38,
            41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68,
            69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95,
            96, 97, 98, 99
        ];
        
        if (!validDDDs.includes(ddd)) {
            setError(input, errorElement, 'DDD inválido');
            return false;
        }
        
        clearError(input, errorElement);
        return true;
    }
    
    function validateSelect(select) {
        const value = select.value;
        const errorElement = document.getElementById('contactAssunto-error');
        
        if (!value) {
            setError(select, errorElement, 'Por favor, selecione um assunto');
            return false;
        }
        
        clearError(select, errorElement);
        return true;
    }
    
    function validateMessage(textarea) {
        const message = textarea.value.trim();
        const errorElement = document.getElementById('contactMensagem-error');
        
        if (message.length < 10) {
            setError(textarea, errorElement, 'A mensagem deve ter pelo menos 10 caracteres');
            return false;
        }
        
        if (message.length > 1000) {
            setError(textarea, errorElement, 'A mensagem não pode ter mais de 1000 caracteres');
            return false;
        }
        
        clearError(textarea, errorElement);
        return true;
    }
    
    // Helper functions
    function setError(input, errorElement, message) {
        input.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    function clearError(input, errorElement) {
        input.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
    
    function showSuccessMessage(message) {
        // Create or get success message element
        let successElement = document.getElementById('contact-success-message');
        
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.id = 'contact-success-message';
            successElement.style.cssText = 'background-color: #d4edda; color: #155724; padding: 12px; border-radius: 4px; margin-top: 16px;';
            form.parentNode.insertBefore(successElement, form.nextSibling);
        }
        
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }
});

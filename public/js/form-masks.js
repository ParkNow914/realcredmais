document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const form = document.getElementById('simulationForm');
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const salarioInput = document.getElementById('salario');
    const valorInput = document.getElementById('valor');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const categoriaSelect = document.getElementById('categoria');
    const prazoSelect = document.getElementById('prazo');

    // CPF Validation
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            // Remove any non-digit characters
            e.target.value = e.target.value.replace(/\D/g, '');
            validateCPF(e.target);
        });
        
        cpfInput.addEventListener('blur', function() {
            validateCPF(this);
        });
    }

    // Phone Validation
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            // Remove any non-digit characters
            e.target.value = e.target.value.replace(/\D/g, '');
            validatePhone(e.target);
        });
        
        telefoneInput.addEventListener('blur', function() {
            validatePhone(this);
        });
    }

    // Salary and Loan Amount Inputs
    [salarioInput, valorInput].forEach(input => {
        if (input) {
            input.addEventListener('input', function(e) {
                // Get the cursor position before any changes
                const cursorPosition = e.target.selectionStart;
                
                // Get the current value and remove any non-digit characters except comma
                let value = e.target.value.replace(/[^\d,]/g, '');
                
                // Ensure only one comma is present
                const commaCount = (value.match(/,/g) || []).length;
                if (commaCount > 1) {
                    // If more than one comma, keep only the first one
                    const parts = value.split(',');
                    value = parts[0] + ',' + parts.slice(1).join('');
                }
                
                // Update the input value
                e.target.value = value;
                
                // Restore cursor position (adjusting for any removed characters)
                const diff = e.target.value.length - value.length;
                e.target.setSelectionRange(cursorPosition - diff, cursorPosition - diff);
                
                // Validate the input
                validateCurrency(e.target);
            });
            
            // Format on blur
            input.addEventListener('blur', function() {
                let value = this.value.replace(/[^\d,]/g, '');
                
                // If empty, set to 0
                if (!value) {
                    this.value = '0,00';
                    this.dataset.rawValue = '0.00';
                    return;
                }
                
                // Handle values with comma as decimal separator
                if (value.includes(',')) {
                    const [integer, decimal] = value.split(',');
                    // Ensure exactly 2 decimal places
                    const formattedDecimal = (decimal || '').padEnd(2, '0').substring(0, 2);
                    this.value = `${integer || '0'},${formattedDecimal}`;
                } else {
                    // No comma, treat as integer
                    this.value = `${value},00`;
                }
                
                // Store raw numeric value (with dot as decimal separator)
                this.dataset.rawValue = this.value.replace(',', '.');
            });
        }
    });

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

    // Category and Term Validation
    [categoriaSelect, prazoSelect].forEach(select => {
        if (select) {
            select.addEventListener('change', function() {
                validateSelect(this);
            });
        }
    });

    // Form validation functions are still available for use by form-handler.js

    // Validation Functions
    function validateCPF(input) {
        const cpf = input.value.replace(/\D/g, '');
        const errorElement = document.getElementById('cpf-error');
        
        // Clear previous error
        clearError(input, errorElement);
        
        // Check if CPF is empty
        if (!cpf) {
            setError(input, errorElement, 'Por favor, insira seu CPF');
            return false;
        }
        
        // Check CPF length
        if (cpf.length !== 11) {
            setError(input, errorElement, 'CPF deve conter 11 dígitos');
            return false;
        }
        
        // Check if all digits are the same
        if (/^(\d)\1+$/.test(cpf)) {
            setError(input, errorElement, 'CPF inválido');
            return false;
        }
        
        // Validate CPF digits
        if (!isValidCPF(cpf)) {
            setError(input, errorElement, 'CPF inválido');
            return false;
        }
        
        return true;
    }
    
    function isValidCPF(cpf) {
        // Remove non-numeric characters
        cpf = cpf.replace(/[\D]/g, '');
        
        // Check if it has 11 digits
        if (cpf.length !== 11) return false;
        
        // Check if all digits are the same
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validate first digit
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = 11 - (sum % 11);
        const digit1 = remainder >= 10 ? 0 : remainder;
        
        if (digit1 !== parseInt(cpf.charAt(9))) return false;
        
        // Validate second digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = 11 - (sum % 11);
        const digit2 = remainder >= 10 ? 0 : remainder;
        
        return digit2 === parseInt(cpf.charAt(10));
    }
    
    function validatePhone(input) {
        const phone = input.value.replace(/\D/g, '');
        const errorElement = document.getElementById('telefone-error');
        
        if (phone.length === 0) {
            setError(input, errorElement, 'Telefone é obrigatório');
            return false;
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
    

    
    function validateCurrency(input) {
        let rawValue = input.value.replace(/[^\d,]/g, '');
        const errorElement = document.getElementById(`${input.id}-error`);
        
        // If empty, don't show error yet (let blur handle the formatting)
        if (!rawValue) {
            clearError(input, errorElement);
            return true;
        }
        
        // Check if the value is a valid number
        const numericValue = parseFloat(rawValue.replace(',', '.'));
        if (isNaN(numericValue) || numericValue <= 0) {
            setError(input, errorElement, 'Valor inválido');
            return false;
        }
        
        // Store the raw numeric value for form submission
        input.dataset.rawValue = numericValue.toFixed(2);
        
        clearError(input, errorElement);
        return true;
    }
    
    function validateName(input) {
        const name = input.value.trim();
        const errorElement = document.getElementById('nome-error');
        
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
        const errorElement = document.getElementById('email-error');
        
        // Skip validation if empty (since email is not required)
        if (email.length === 0) {
            clearError(input, errorElement);
            return true;
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
    
    function validateSelect(select) {
        const value = select.value;
        const errorElement = document.getElementById(`${select.id}-error`);
        
        if (!value) {
            setError(select, errorElement, 'Campo obrigatório');
            return false;
        }
        
        clearError(select, errorElement);
        return true;
    }
    
    function validateForm() {
        let isValid = true;
        
        // Validate all fields
        if (nomeInput) isValid = validateName(nomeInput) && isValid;
        if (cpfInput) isValid = validateCPF(cpfInput) && isValid;
        if (telefoneInput) isValid = validatePhone(telefoneInput) && isValid;
        if (emailInput) isValid = validateEmail(emailInput) && isValid;
        if (categoriaSelect) isValid = validateSelect(categoriaSelect) && isValid;
        if (salarioInput) isValid = validateCurrency(salarioInput) && isValid;
        if (valorInput) isValid = validateCurrency(valorInput) && isValid;
        if (prazoSelect) isValid = validateSelect(prazoSelect) && isValid;
        
        return isValid;
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
});

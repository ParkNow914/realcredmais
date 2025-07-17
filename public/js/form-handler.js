// This file handles form submission and server communication
// Form validation and masks are handled in form-masks.js

// Track if form is being submitted to prevent multiple submissions
let isSubmitting = false;

// Function to initialize form handler
function initializeFormHandler() {
    const form = document.getElementById('simulationForm');
    if (!form) return;

    // Remove any existing submit event listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Add single submit handler
    newForm.addEventListener('submit', handleFormSubmit);
    
    console.log('Form handler initialized');
}

// Function to validate form fields
function validateForm(formData) {
    const errors = [];
    
    // Check required fields
    const requiredFields = ['categoria', 'salario', 'nome'];
    requiredFields.forEach(field => {
        if (!formData.get(field)) {
            errors.push(`O campo ${field} é obrigatório`);
        }
    });
    
    // Validate email format if provided
    const email = formData.get('email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Por favor, insira um e-mail válido');
    }
    
    return errors;
}

// Function to handle form submission
async function handleFormSubmit(e) {
    // Prevent default form submission
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    isSubmitting = true;
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        
        // Get form data
        const formData = new FormData(form);
        
        // Format form data
        const formDataObj = {};
        formData.forEach((value, key) => {
            // Remove mask characters from CPF and phone
            if (key === 'cpf' || key === 'telefone') {
                value = value.replace(/[^\d]/g, '');
            } else if (key === 'salario' || key === 'valor') {
                // Get the raw value from data attribute
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    // Get the raw value from data-raw-value attribute or parse the displayed value
                    value = input.dataset.rawValue || 
                           input.value.replace(/\./g, '').replace(',', '.');
                    
                    // If still not a valid number, default to 0
                    if (isNaN(parseFloat(value))) {
                        value = '0';
                    }
                } else {
                    value = '0';
                }
            }
            formDataObj[key] = value;
        });
        
        console.log('Form data being sent:', formDataObj);
        
        // Ensure category is valid
        const validCategories = ['inss', 'servidor', 'militar', 'clt', 'credito-pessoal', 'fgts'];
        if (!validCategories.includes(formDataObj.categoria)) {
            throw new Error('Por favor, selecione uma categoria válida');
        }

        // Send data to server
        const response = await fetch('/api/lead', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(formDataObj),
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Erro ao enviar o formulário');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showFeedback(result.message || 'Solicitação enviada com sucesso! Entraremos em contato em breve.', 'success');
            
            // Show simulation result if available
            if (result.simulation) {
                displaySimulationResult(result.simulation);
            }
            
            // Reset form after a short delay
            setTimeout(() => {
                form.reset();
                isSubmitting = false;
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                
                // Re-initialize form handler to ensure it still works after reset
                initializeFormHandler();
            }, 2000);
        } else {
            // Show error message
            const errorMessage = result.message || 'Ocorreu um erro ao enviar o formulário. Tente novamente.';
            showFeedback(errorMessage, 'error');
            
            // Re-enable form
            isSubmitting = false;
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            
            // Re-initialize form handler
            initializeFormHandler();
            
            // Log the error for debugging
            console.error('Form submission error:', result);
        }
    } catch (error) {
        console.error('Error:', error);
        showFeedback('Erro ao enviar o formulário. Tente novamente.', 'error');
    } finally {
        // Reset button state and submission flag
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        isSubmitting = false;
    }
}

// Function to display simulation results
function displaySimulationResult(data) {
    const simulationResult = document.getElementById('simulationResult');
    if (!simulationResult) return;
    
    // Update result fields
    const valorSolicitado = document.getElementById('valorSolicitado');
    const parcelaMensal = document.getElementById('parcelaMensal');
    const taxaJuros = document.getElementById('taxaJuros');
    const totalPagar = document.getElementById('totalPagar');
    
    if (valorSolicitado) valorSolicitado.textContent = formatCurrency(data.valorSolicitado);
    if (parcelaMensal) parcelaMensal.textContent = formatCurrency(data.parcelaMensal);
    if (taxaJuros) taxaJuros.textContent = `${data.taxaJuros}% a.m.`;
    if (totalPagar) totalPagar.textContent = formatCurrency(data.totalPagar);
    
    // Show result section
    simulationResult.style.display = 'block';
    simulationResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Helper function to format currency
function formatCurrency(value) {
    // If value is already formatted, return as is
    if (typeof value === 'string' && value.includes('R$')) {
        return value;
    }
    
    // Remove any non-numeric characters except decimal point
    const numericValue = String(value).replace(/[^0-9.,]/g, '').replace(',', '.');
    
    // Convert to number and format as currency
    const number = parseFloat(numericValue);
    if (isNaN(number)) return 'R$ 0,00';
    
    return number.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    });
}

// Show feedback message
function showFeedback(message, type) {
    const feedbackDiv = document.getElementById('lead-feedback');
    if (feedbackDiv) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback ${type}`;
        feedbackDiv.style.display = 'block';
        
        // Scroll to feedback
        feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide after 5 seconds
        setTimeout(() => {
            feedbackDiv.style.display = 'none';
        }, 5000);
    }
}

// Reset simulation form
function resetSimulation() {
    const form = document.getElementById('simulationForm');
    const simulationResult = document.getElementById('simulationResult');
    
    if (form) form.reset();
    if (simulationResult) simulationResult.style.display = 'none';
    
    // Scroll to form
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Play video function
function playVideo(videoId) {
    const video = document.getElementById(videoId);
    if (video) {
        video.play().catch(error => {
            console.error('Error playing video:', error);
        });
    }
}

// Track if form handler has been initialized
let isFormHandlerInitialized = false;

// Initialize form handler when DOM is loaded
function initializeFormHandler() {
    // Only initialize once
    if (isFormHandlerInitialized) return;
    
    const form = document.getElementById('simulationForm');
    if (form) {
        // Remove any existing event listeners to prevent duplicates
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Add new event listener
        newForm.addEventListener('submit', handleFormSubmit);
        isFormHandlerInitialized = true;
    }
}

// Initialize form handler when DOM is loaded
if (document.readyState === 'loading') {
    // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', function() {
        // Small delay to ensure all other scripts have run
        setTimeout(initializeFormHandler, 100);
    });
} else {
    // `DOMContentLoaded` has already fired
    setTimeout(initializeFormHandler, 100);
}

// Re-initialize form handler if the page is loaded via turbolinks or similar
document.addEventListener('turbolinks:load', initializeFormHandler);
window.addEventListener('load', initializeFormHandler);

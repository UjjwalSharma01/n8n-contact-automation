class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.loader = document.getElementById('loader');
        this.responseMessage = document.getElementById('responseMessage');
        
        this.fields = {
            username: document.getElementById('username'),
            password: document.getElementById('password'),
            message: document.getElementById('message')
        };
        
        this.errors = {
            username: document.getElementById('usernameError'),
            password: document.getElementById('passwordError'),
            message: document.getElementById('messageError')
        };
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Add real-time validation
        Object.keys(this.fields).forEach(fieldName => {
            this.fields[fieldName].addEventListener('blur', () => {
                this.validateField(fieldName);
            });
            
            this.fields[fieldName].addEventListener('input', () => {
                this.clearError(fieldName);
            });
        });
    }
    
    validateField(fieldName) {
        const field = this.fields[fieldName];
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'username':
                if (!value) {
                    errorMessage = 'Username is required';
                    isValid = false;
                } else if (value.length < 3) {
                    errorMessage = 'Username must be at least 3 characters';
                    isValid = false;
                } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                    errorMessage = 'Username can only contain letters, numbers, hyphens, and underscores';
                    isValid = false;
                }
                break;
                
            case 'password':
                if (!value) {
                    errorMessage = 'Password is required';
                    isValid = false;
                } else if (value.length < 6) {
                    errorMessage = 'Password must be at least 6 characters';
                    isValid = false;
                }
                break;
                
            case 'message':
                if (!value) {
                    errorMessage = 'Message is required';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters';
                    isValid = false;
                } else if (value.length > 1000) {
                    errorMessage = 'Message must be less than 1000 characters';
                    isValid = false;
                }
                break;
        }
        
        if (!isValid) {
            this.showError(fieldName, errorMessage);
        } else {
            this.clearError(fieldName);
        }
        
        return isValid;
    }
    
    validateAllFields() {
        let isValid = true;
        
        Object.keys(this.fields).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    showError(fieldName, message) {
        this.errors[fieldName].textContent = message;
        this.fields[fieldName].style.borderColor = '#e74c3c';
    }
    
    clearError(fieldName) {
        this.errors[fieldName].textContent = '';
        this.fields[fieldName].style.borderColor = '#e1e5e9';
    }
    
    clearAllErrors() {
        Object.keys(this.errors).forEach(fieldName => {
            this.clearError(fieldName);
        });
    }
    
    showMessage(message, type) {
        this.responseMessage.textContent = message;
        this.responseMessage.className = `message ${type} show`;
        
        setTimeout(() => {
            this.responseMessage.classList.remove('show');
        }, 5000);
    }
    
    setLoading(isLoading) {
        if (isLoading) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }
    
    createBasicAuthHeader(username, password) {
        const credentials = btoa(`${username}:${password}`);
        return `Basic ${credentials}`;
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        // Clear previous messages
        this.responseMessage.classList.remove('show');
        this.clearAllErrors();
        
        // Validate all fields
        if (!this.validateAllFields()) {
            this.showMessage('Please correct the errors above', 'error');
            return;
        }
        
        // Get form data
        const formData = {
            username: this.fields.username.value.trim(),
            password: this.fields.password.value,
            message: this.fields.message.value.trim()
        };
        
        try {
            this.setLoading(true);
            
            const response = await fetch('https://n8n.ujjwalsharma.tech/webhook/addPerson', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.createBasicAuthHeader(formData.username, formData.password)
                },
                body: JSON.stringify({
                    body: formData.message
                })
            });
            
            if (response.ok) {
                this.showMessage('Message sent successfully!', 'success');
                this.form.reset();
                this.clearAllErrors();
            } else {
                let errorMessage = 'Failed to send message';
                
                if (response.status === 401) {
                    errorMessage = 'Authentication failed. Please check your username and password.';
                } else if (response.status === 400) {
                    errorMessage = 'Invalid request. Please check your message format.';
                } else if (response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else {
                    errorMessage = `Error: ${response.status} - ${response.statusText}`;
                }
                
                this.showMessage(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Network error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                this.showMessage('Network error. Please check your internet connection and try again.', 'error');
            } else {
                this.showMessage('An unexpected error occurred. Please try again.', 'error');
            }
        } finally {
            this.setLoading(false);
        }
    }
}

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
});

// Add some visual feedback for network status
window.addEventListener('online', () => {
    console.log('Network connection restored');
});

window.addEventListener('offline', () => {
    console.log('Network connection lost');
});
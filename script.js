// DOM Elements
const ruleInput = document.getElementById('ruleInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultSection = document.getElementById('resultSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const codeContent = document.getElementById('codeContent');
const copyBtn = document.getElementById('copyBtn');
const copyTooltip = document.getElementById('copyTooltip');
// showExamplesBtn removed - examples are now always visible
const examplesGrid = document.getElementById('examplesGrid');

// State management
let isLoading = false;
let currentRule = '';

// API Configuration
const API_ENDPOINT = 'https://api.example.com/generate-rule';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    hideAllStates();
    generateRandomStars();
});

// Event Listeners
function initializeEventListeners() {
    // Analyze button click
    analyzeBtn.addEventListener('click', handleAnalyzeClick);
    
    // Enter key in textarea
    ruleInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleAnalyzeClick();
        }
    });
    
    // Copy button click
    copyBtn.addEventListener('click', handleCopyClick);
    
    // Examples are now always visible - no button needed
    
    // Input validation
    ruleInput.addEventListener('input', handleInputChange);
}

// Handle analyze button click
async function handleAnalyzeClick() {
    const inputValue = ruleInput.value.trim();
    
    if (!inputValue) {
        showError('Please enter a rule description');
        return;
    }
    
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoading();
        
        // Start the rule generation and minimum loading time in parallel
        const [rule] = await Promise.all([
            generateRule(inputValue),
            new Promise(resolve => setTimeout(resolve, 3000)) // Always show loading for 3 seconds
        ]);
        
        showSuccess(rule);
        
    } catch (error) {
        console.error('Error generating rule:', error);
        // Even on error, wait for the minimum loading time
        await new Promise(resolve => setTimeout(resolve, 3000));
        showError(error.message || 'Failed to generate rule. Please try again.');
    } finally {
        isLoading = false;
    }
}

// Generate rule via API
async function generateRule(description) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.rule) {
            throw new Error('Invalid response format');
        }
        
        return data.rule;
        
    } catch (error) {
        // For demo purposes, return a mock rule if API fails
        if (error.message.includes('fetch')) {
            return generateMockRule(description);
        }
        throw error;
    }
}

// Generate mock rule for demonstration
function generateMockRule(description) {
    const mockRules = {
        'pr title': `name: PR Title Format
description: ${description}
on:
  pull_request:
    types: [opened, edited, synchronize]
rules:
  - name: Check PR title format
    condition: |
      pull_request.title matches /^[A-Z]+-\\d+: .+$/
    message: "PR title must follow the pattern PROJ-123: Description"
    severity: error`,
        
        'commit': `name: Commit Message Format
description: ${description}
on:
  push:
    branches: [main, develop]
rules:
  - name: Check commit message format
    condition: |
      commit.message matches /^(feat|fix|docs|style|refactor|test|chore): .+$/
    message: "Commit messages must follow conventional commits format"
    severity: error`,
        
        'approval': `name: Approval Requirements
description: ${description}
on:
  pull_request:
    types: [opened, review_requested]
rules:
  - name: Check approval requirements
    condition: |
      pull_request.author not in pull_request.reviewers
    message: "Pull requests cannot be approved by the author"
    severity: error`,
        
        'default': `name: Custom Rule
description: ${description}
on:
  pull_request:
    types: [opened, edited, synchronize]
rules:
  - name: Custom validation
    condition: |
      # Add your custom validation logic here
      true
    message: "Custom validation message"
    severity: warning`
    };
    
    const lowerDescription = description.toLowerCase();
    
    if (lowerDescription.includes('title') || lowerDescription.includes('pr')) {
        return mockRules['pr title'];
    } else if (lowerDescription.includes('commit')) {
        return mockRules['commit'];
    } else if (lowerDescription.includes('approval') || lowerDescription.includes('review')) {
        return mockRules['approval'];
    } else {
        return mockRules['default'];
    }
}

// Handle copy button click
async function handleCopyClick() {
    if (!currentRule) return;
    
    try {
        await navigator.clipboard.writeText(currentRule);
        showCopyTooltip();
    } catch (error) {
        // Fallback for older browsers
        fallbackCopyToClipboard(currentRule);
        showCopyTooltip();
    }
}

// Fallback copy method
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
}

// Show copy tooltip
function showCopyTooltip() {
    const rect = copyBtn.getBoundingClientRect();
    copyTooltip.style.left = rect.left + rect.width / 2 + 'px';
    copyTooltip.style.top = rect.top + 'px';
    copyTooltip.classList.remove('hidden');
    
    setTimeout(() => {
        copyTooltip.classList.add('hidden');
    }, 1500);
}

// handleShowExamplesClick removed - examples are now always visible

// Handle input change
function handleInputChange() {
    const inputValue = ruleInput.value.trim();
    analyzeBtn.disabled = !inputValue;
    
    if (!inputValue) {
        hideAllStates();
    }
}

// Show loading state
function showLoading() {
    hideAllStates();
    loadingIndicator.classList.remove('hidden');
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
}

// Show success state
function showSuccess(rule) {
    hideAllStates();
    currentRule = rule;
    codeContent.textContent = rule;
    resultSection.classList.remove('hidden');
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze';
}

// Show error state
function showError(message) {
    hideAllStates();
    errorMessage.textContent = message;
    errorAlert.classList.remove('hidden');
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze';
}

// Hide all states
function hideAllStates() {
    resultSection.classList.add('hidden');
    loadingIndicator.classList.add('hidden');
    errorAlert.classList.add('hidden');
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add some interactive enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to example cards
    const exampleCards = document.querySelectorAll('.example-card');
    exampleCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.example-title').textContent;
            const description = this.querySelector('.example-description').textContent;
            
            // Populate the input with the example description
            ruleInput.value = description;
            ruleInput.focus();
            
            // Scroll to the input
            ruleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add sparkle animation trigger
    const sparkles = document.querySelectorAll('.sparkle');
    setInterval(() => {
        sparkles.forEach((sparkle, index) => {
            setTimeout(() => {
                sparkle.style.transform = `scale(${1 + Math.random() * 0.2}) rotate(${Math.random() * 360}deg)`;
                setTimeout(() => {
                    sparkle.style.transform = '';
                }, 300);
            }, index * 200);
        });
    }, 5000);
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


// DOM Elements
const ruleInput = document.getElementById('ruleInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultSection = document.getElementById('resultSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const codeContent = document.getElementById('codeContent');
const downloadBtn = document.getElementById('downloadBtn');
const copyIconBtn = document.getElementById('copyIconBtn');
// showExamplesBtn removed - examples are now always visible
const examplesGrid = document.getElementById('examplesGrid');

// State management
let isLoading = false;
let currentRule = '';

// API Configuration
const API_ENDPOINT = 'https://api.watchflow.dev/api/v1/rules/evaluate';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    hideAllStates();
    
    // Only generate stars on non-mobile devices
    if (window.innerWidth > 768) {
        generateRandomStars();
    }
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
    
    // Download button click
    downloadBtn.addEventListener('click', handleDownloadClick);
    
    // Copy icon button click
    copyIconBtn.addEventListener('click', handleCopyClick);
    
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
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ 
            rule_text: description,
            event_data: null
        }),
    });
    
    if (!response.ok) {
        // Handle validation errors or other API errors
        if (response.status === 422) {
            const errorData = await response.json();
            throw new Error(`Validation error: ${errorData.detail || 'Invalid rule description format'}`);
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data) {
        throw new Error('Empty response from API');
    }
    
    // Check if the rule is supported
    if (!data.supported) {
        const reason = data.feedback || 'This type of rule is not supported by Watchflow';
        throw new Error(reason);
    }
    
    // Extract the YAML snippet from the response
    if (data.snippet) {
        // Remove the markdown code block wrapper if present
        let yaml = data.snippet;
        if (yaml.startsWith('```yaml\n')) {
            yaml = yaml.replace(/^```yaml\n/, '').replace(/\n```$/, '');
        }
        return yaml;
    }
    
    throw new Error('No rule snippet found in API response');
}


// Handle download button click
function handleDownloadClick() {
    if (!currentRule) return;
    
    // Create blob with YAML content
    const blob = new Blob([currentRule], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules.yaml';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show feedback
    showDownloadFeedback();
}

// Handle copy icon button click
async function handleCopyClick() {
    if (!currentRule) return;
    
    try {
        await navigator.clipboard.writeText(currentRule);
        showCopyFeedback();
    } catch (error) {
        // Fallback for older browsers
        fallbackCopyToClipboard(currentRule);
        showCopyFeedback();
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
        // Note: document.execCommand is deprecated but kept for compatibility
        const success = document.execCommand('copy');
        if (!success) {
            throw new Error('Copy command failed');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
}

// Show download feedback
function showDownloadFeedback() {
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = 'Downloaded!';
    downloadBtn.style.background = '#4CAF50';
    
    setTimeout(() => {
        downloadBtn.textContent = originalText;
        downloadBtn.style.background = '';
    }, 1500);
}

// Show copy feedback
function showCopyFeedback() {
    copyIconBtn.style.background = '#4CAF50';
    copyIconBtn.style.color = '#FFFFFF';
    
    setTimeout(() => {
        copyIconBtn.style.background = '';
        copyIconBtn.style.color = '';
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
    requestAnimationFrame(() => {
        loadingIndicator.classList.add('fade-in');
    });
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
}

// Show success state
function showSuccess(rule) {
    hideAllStates();
    currentRule = rule;
    codeContent.textContent = rule;
    
    // Show the success alert first
    const codeBlock = resultSection.querySelector('.code-block');
    
    // Ensure code block starts hidden
    codeBlock.classList.remove('code-block-visible');
    
    resultSection.classList.remove('hidden');
    requestAnimationFrame(() => {
        resultSection.classList.add('fade-in');
        
        // Show code block after success alert is visible
        setTimeout(() => {
            codeBlock.classList.add('code-block-visible');
        }, 600);
    });
    
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze';
}

// Show error state
function showError(message) {
    hideAllStates();
    errorMessage.textContent = message;
    errorAlert.classList.remove('hidden');
    requestAnimationFrame(() => {
        errorAlert.classList.add('fade-in');
    });
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze';
}

// Hide all states instantly without transition
function hideAllStates() {
    resultSection.classList.remove('fade-in');
    loadingIndicator.classList.remove('fade-in');
    errorAlert.classList.remove('fade-in');
    resultSection.classList.add('hidden');
    loadingIndicator.classList.add('hidden');
    errorAlert.classList.add('hidden');
    
    // Reset code block visibility
    const codeBlock = resultSection.querySelector('.code-block');
    if (codeBlock) {
        codeBlock.classList.remove('code-block-visible');
    }
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
            const description = this.querySelector('.example-description').textContent;
            
            // Populate the input with the example description
            ruleInput.value = description;
            ruleInput.focus();
            
            // Scroll to the input
            ruleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
    
    // Add ripple effect to buttons (only on non-touch devices)
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Only add ripple on devices that support hover (desktop)
            if (window.matchMedia('(hover: hover)').matches) {
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
            }
        });
    });
    
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


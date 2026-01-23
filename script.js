// DOM Elements - Rule Generation
const ruleInput = document.getElementById('ruleInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultSection = document.getElementById('resultSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const codeContent = document.getElementById('codeContent');
const downloadBtn = document.getElementById('downloadBtn');
const copyIconBtn = document.getElementById('copyIconBtn');

// DOM Elements - Repository Analysis
const repoUrlInput = document.getElementById('repoUrlInput');
const analyzeRepoBtn = document.getElementById('analyzeRepoBtn');
const repoAnalysisResult = document.getElementById('repoAnalysisResult');
const repoLoadingIndicator = document.getElementById('repoLoadingIndicator');
const repoErrorAlert = document.getElementById('repoErrorAlert');
const repoErrorMessage = document.getElementById('repoErrorMessage');
const repoCodeContent = document.getElementById('repoCodeContent');
const copyRepoCodeBtn = document.getElementById('copyRepoCodeBtn');
const proceedWithPrBtn = document.getElementById('proceedWithPrBtn');
const downloadRulesBtn = document.getElementById('downloadRulesBtn');
const recommendationsList = document.getElementById('recommendationsList');
const prPlanDetails = document.getElementById('prPlanDetails');

// showExamplesBtn removed - examples are now always visible
const examplesGrid = document.getElementById('examplesGrid');

// State management
let isLoading = false;
let currentRule = '';
let isRepoLoading = false;
let currentRepoAnalysis = null;

// API Configuration
const API_ENDPOINT = 'https://api.watchflow.dev/api/v1/rules/evaluate';
// For demo purposes, using mock data instead of real API
const REPO_ANALYZE_ENDPOINT = 'https://httpbin.org/post'; // Mock endpoint
const PROCEED_WITH_PR_ENDPOINT = 'https://httpbin.org/post'; // Mock endpoint
const USE_MOCK_DATA = true; // Set to false when backend is available

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
    // Rule Generation Events
    analyzeBtn.addEventListener('click', handleAnalyzeClick);
    ruleInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleAnalyzeClick();
        }
    });
    downloadBtn.addEventListener('click', handleDownloadClick);
    copyIconBtn.addEventListener('click', handleCopyClick);
    ruleInput.addEventListener('input', handleInputChange);

    // Repository Analysis Events
    analyzeRepoBtn.addEventListener('click', handleRepoAnalyzeClick);
    repoUrlInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleRepoAnalyzeClick();
        }
    });
    copyRepoCodeBtn.addEventListener('click', handleRepoCopyClick);
    proceedWithPrBtn.addEventListener('click', handleProceedWithPrClick);
    downloadRulesBtn.addEventListener('click', handleRepoDownloadClick);
    repoUrlInput.addEventListener('input', handleRepoInputChange);

    // Examples are now always visible - no button needed
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

// Analyze repository via API (with mock data for demo)
async function analyzeRepository(repoUrl) {
    if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract repo info from URL
        const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        const repoName = urlMatch ? `${urlMatch[1]}/${urlMatch[2]}` : 'unknown/repo';

        // Return mock analysis data
        return {
            repository_full_name: repoName,
            rules_yaml: `rules:
  - description: "Require tests when code changes"
    enabled: true
    severity: medium
    event_types:
      - pull_request
    validators:
      - type: diff_pattern
        parameters:
          file_patterns:
            - "**/*.py"
            - "**/*.ts"
            - "**/*.tsx"
            - "**/*.js"
      - type: related_tests
        parameters:
          search_paths:
            - "**/tests/**"
            - "**/*_test.py"
    actions:
      - type: warn
        parameters:
          message: "Please include or update tests for code changes."

  - description: "Ensure PRs include context"
    enabled: true
    severity: low
    event_types:
      - pull_request
    validators:
      - type: required_field_in_diff
        parameters:
          field: "body"
          pattern: "(?i)(summary|context|issue)"
    actions:
      - type: warn
        parameters:
          message: "Add a short summary and linked issue in the PR body."`,
            recommendations: [
                {
                    yaml_rule: `description: "Require tests when code changes"
enabled: true
severity: medium
event_types:
  - pull_request
validators:
  - type: diff_pattern
    parameters:
      file_patterns:
        - "**/*.py"
        - "**/*.ts"
        - "**/*.tsx"
        - "**/*.js"
  - type: related_tests
    parameters:
      search_paths:
        - "**/tests/**"
        - "**/*_test.py"
actions:
  - type: warn
    parameters:
      message: "Please include or update tests for code changes."`,
                    confidence: 0.74,
                    reasoning: "Default guardrail for code changes without tests.",
                    strategy_used: "static"
                },
                {
                    yaml_rule: `description: "Ensure PRs include context"
enabled: true
severity: low
event_types:
  - pull_request
validators:
  - type: required_field_in_diff
    parameters:
      field: "body"
      pattern: "(?i)(summary|context|issue)"
actions:
  - type: warn
    parameters:
      message: "Add a short summary and linked issue in the PR body."`,
                    confidence: 0.68,
                    reasoning: "Encourages context for reviewers; lightweight default.",
                    strategy_used: "static"
                }
            ],
            pr_plan: {
                branch_name: "watchflow/rules",
                base_branch: "main",
                commit_message: "chore: add Watchflow rules",
                title: "Add Watchflow rules",
                body: "This PR adds Watchflow rule recommendations generated by Watchflow.",
                file_path: ".watchflow/rules.yaml"
            },
            analysis_summary: {
                repository_features: {
                    has_contributing: true,
                    has_codeowners: false,
                    has_workflows: true,
                    workflow_count: 3,
                    language: "Python",
                    contributor_count: 12,
                    pr_count: 25
                },
                contributing: {
                    has_pr_template: true,
                    has_issue_template: true,
                    requires_tests: true,
                    requires_docs: false,
                    code_style_requirements: ["black", "flake8"],
                    review_requirements: ["review", "approval"]
                }
            }
        };
    }

    // Real API call (when backend is available)
    const response = await fetch(REPO_ANALYZE_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            repository_url: repoUrl,
            max_prs: 10
        }),
    });

    if (!response.ok) {
        if (response.status === 422) {
            const errorData = await response.json();
            throw new Error(`Validation error: ${errorData.detail || 'Invalid repository URL'}`);
        } else if (response.status === 404) {
            throw new Error('Repository not found. Please check the URL and ensure it\'s a public repository.');
        } else if (response.status === 403) {
            throw new Error('Access denied. This repository may be private or require authentication.');
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data) {
        throw new Error('Empty response from API');
    }

    return data;
}

// Create PR with generated rules (with mock data for demo)
async function createPullRequest(analysisData) {
    if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock successful PR creation
        return {
            repository_full_name: analysisData.repository_full_name,
            branch_name: analysisData.pr_plan?.branch_name || 'watchflow/rules',
            base_branch: analysisData.pr_plan?.base_branch || 'main',
            file_path: analysisData.pr_plan?.file_path || '.watchflow/rules.yaml',
            pull_request_url: `https://github.com/${analysisData.repository_full_name}/pull/123`,
            pull_request_number: 123,
            commit_sha: 'abc123def456'
        };
    }

    // Real API call (when backend is available)
    const response = await fetch(PROCEED_WITH_PR_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            repository_full_name: analysisData.repository_full_name,
            rules_yaml: analysisData.rules_yaml,
            base_branch: analysisData.pr_plan?.base_branch || 'main',
            branch_name: analysisData.pr_plan?.branch_name || 'watchflow/rules',
            pr_title: analysisData.pr_plan?.title || 'Add Watchflow rules',
            pr_body: analysisData.pr_plan?.body || 'Adds Watchflow rule recommendations.',
            commit_message: analysisData.pr_plan?.commit_message || 'chore: add .watchflow/rules.yaml',
            file_path: analysisData.pr_plan?.file_path || '.watchflow/rules.yaml'
        }),
    });

    if (!response.ok) {
        if (response.status === 422) {
            const errorData = await response.json();
            throw new Error(`Validation error: ${errorData.detail || 'Invalid PR creation request'}`);
        } else if (response.status === 403) {
            throw new Error('Authentication required. Please install the Watchflow GitHub App first.');
        } else if (response.status === 404) {
            throw new Error('Repository not found or access denied.');
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data) {
        throw new Error('Empty response from API');
    }

    return data;
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

// Repository Analysis Event Handlers
async function handleRepoAnalyzeClick() {
    const repoUrl = repoUrlInput.value.trim();

    if (!repoUrl) {
        showRepoError('Please enter a GitHub repository URL');
        return;
    }

    // Basic URL validation
    if (!repoUrl.match(/^https:\/\/github\.com\/[^\/]+\/[^\/]+/)) {
        showRepoError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
        return;
    }

    if (isRepoLoading) return;

    try {
        isRepoLoading = true;
        showRepoLoading();

        const analysisResult = await analyzeRepository(repoUrl);
        showRepoSuccess(analysisResult);

    } catch (error) {
        console.error('Error analyzing repository:', error);
        showRepoError(error.message || 'Failed to analyze repository. Please try again.');
    } finally {
        isRepoLoading = false;
    }
}

async function handleProceedWithPrClick() {
    if (!currentRepoAnalysis) return;

    try {
        const prResult = await createPullRequest(currentRepoAnalysis);

        // Show success message with PR link
        showPrSuccess(prResult);

    } catch (error) {
        console.error('Error creating PR:', error);
        showPrError(error.message || 'Failed to create pull request. Please try again.');
    }
}

function handleRepoDownloadClick() {
    if (!currentRepoAnalysis?.rules_yaml) return;

    const blob = new Blob([currentRepoAnalysis.rules_yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showRepoDownloadFeedback();
}

async function handleRepoCopyClick() {
    if (!currentRepoAnalysis?.rules_yaml) return;

    try {
        await navigator.clipboard.writeText(currentRepoAnalysis.rules_yaml);
        showRepoCopyFeedback();
    } catch (error) {
        fallbackCopyToClipboard(currentRepoAnalysis.rules_yaml);
        showRepoCopyFeedback();
    }
}

function handleRepoInputChange() {
    const inputValue = repoUrlInput.value.trim();
    analyzeRepoBtn.disabled = !inputValue;

    if (!inputValue) {
        hideRepoAllStates();
    }
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

// Repository Analysis UI Functions
function showRepoLoading() {
    hideRepoAllStates();
    repoLoadingIndicator.classList.remove('hidden');
    requestAnimationFrame(() => {
        repoLoadingIndicator.classList.add('fade-in');
    });
    analyzeRepoBtn.disabled = true;
    analyzeRepoBtn.textContent = 'Analyzing...';
}

function showRepoSuccess(analysisResult) {
    hideRepoAllStates();
    currentRepoAnalysis = analysisResult;

    // Populate recommendations
    populateRecommendations(analysisResult.recommendations || []);

    // Populate PR plan
    populatePrPlan(analysisResult.pr_plan);

    // Show code content
    repoCodeContent.textContent = analysisResult.rules_yaml;

    repoAnalysisResult.classList.remove('hidden');
    requestAnimationFrame(() => {
        repoAnalysisResult.classList.add('fade-in');
    });

    analyzeRepoBtn.disabled = false;
    analyzeRepoBtn.textContent = 'Analyze Repository';
}

function showRepoError(message) {
    hideRepoAllStates();
    repoErrorMessage.textContent = message;
    repoErrorAlert.classList.remove('hidden');
    requestAnimationFrame(() => {
        repoErrorAlert.classList.add('fade-in');
    });
    analyzeRepoBtn.disabled = false;
    analyzeRepoBtn.textContent = 'Analyze Repository';
}

function showPrSuccess(prResult) {
    // Update the proceed button to show success
    const originalText = proceedWithPrBtn.textContent;
    proceedWithPrBtn.textContent = 'PR Created!';
    proceedWithPrBtn.style.background = '#4CAF50';
    proceedWithPrBtn.disabled = true;

    // Add link to PR if available
    if (prResult.pull_request_url) {
        setTimeout(() => {
            window.open(prResult.pull_request_url, '_blank');
        }, 1000);
    }

    setTimeout(() => {
        proceedWithPrBtn.textContent = originalText;
        proceedWithPrBtn.style.background = '';
        proceedWithPrBtn.disabled = false;
    }, 3000);
}

function showPrError(message) {
    // Show error in a temporary alert
    const errorDiv = document.createElement('div');
    errorDiv.className = 'pr-error-alert';
    errorDiv.innerHTML = `
        <div class="error-header">
            <svg class="error-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#F44336"/>
            </svg>
            <span class="error-title">PR Creation Failed</span>
        </div>
        <div class="error-content">
            <p>${message}</p>
        </div>
    `;

    const prActions = document.querySelector('.pr-actions');
    prActions.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showRepoDownloadFeedback() {
    const originalText = downloadRulesBtn.textContent;
    downloadRulesBtn.textContent = 'Downloaded!';
    downloadRulesBtn.style.background = '#4CAF50';

    setTimeout(() => {
        downloadRulesBtn.textContent = originalText;
        downloadRulesBtn.style.background = '';
    }, 1500);
}

function showRepoCopyFeedback() {
    copyRepoCodeBtn.style.background = '#4CAF50';
    copyRepoCodeBtn.style.color = '#FFFFFF';

    setTimeout(() => {
        copyRepoCodeBtn.style.background = '';
        copyRepoCodeBtn.style.color = '';
    }, 1500);
}

function populateRecommendations(recommendations) {
    const container = recommendationsList;
    container.innerHTML = '';

    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = '<p class="no-recommendations">No recommendations found for this repository.</p>';
        return;
    }

    recommendations.forEach((rec, index) => {
        const recElement = document.createElement('div');
        recElement.className = 'recommendation-item';

        const confidencePercent = Math.round(rec.confidence * 100);
        const confidenceColor = confidencePercent >= 80 ? '#4CAF50' : confidencePercent >= 60 ? '#FF9800' : '#F44336';

        recElement.innerHTML = `
            <div class="recommendation-header">
                <div class="recommendation-confidence" style="background: ${confidenceColor}">
                    ${confidencePercent}%
                </div>
                <div class="recommendation-strategy">${rec.strategy_used || 'static'}</div>
            </div>
            <div class="recommendation-content">
                <p class="recommendation-reasoning">${rec.reasoning}</p>
                <details class="recommendation-details">
                    <summary>View YAML Rule</summary>
                    <pre class="recommendation-yaml">${rec.yaml_rule}</pre>
                </details>
            </div>
        `;

        container.appendChild(recElement);
    });
}

function populatePrPlan(prPlan) {
    const container = prPlanDetails;
    container.innerHTML = '';

    if (!prPlan) {
        container.innerHTML = '<p class="no-pr-plan">No PR plan available.</p>';
        return;
    }

    container.innerHTML = `
        <div class="pr-plan-item">
            <strong>Branch:</strong> ${prPlan.branch_name}
        </div>
        <div class="pr-plan-item">
            <strong>Base:</strong> ${prPlan.base_branch}
        </div>
        <div class="pr-plan-item">
            <strong>File:</strong> ${prPlan.file_path}
        </div>
        <div class="pr-plan-item">
            <strong>Title:</strong> ${prPlan.title}
        </div>
    `;
}

function hideRepoAllStates() {
    repoAnalysisResult.classList.remove('fade-in');
    repoLoadingIndicator.classList.remove('fade-in');
    repoErrorAlert.classList.remove('fade-in');
    repoAnalysisResult.classList.add('hidden');
    repoLoadingIndicator.classList.add('hidden');
    repoErrorAlert.classList.add('hidden');
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


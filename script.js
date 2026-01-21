/**
 * Watchflow Landing - Repository Analysis Logic
 * "The Plumbing" - Phase 1 Connection
 */

// --- CONFIGURATION ---
// Ensure this matches your backend host/port
const API_BASE_URL = "http://localhost:8000"; 
// Matches the prefix in main.py + router prefix in recommendations.py
const ENDPOINT_RECOMMEND = "/v1/rules/recommend"; 

// --- DOM ELEMENTS ---
const analyzeBtn = document.getElementById("analyzeRepoBtn");
const repoInput = document.getElementById("repoUrlInput");
const resultsContainer = document.getElementById("recommendationsList");
const resultsSection = document.getElementById("repoAnalysisResult");
const loadingSpinner = document.getElementById("repoLoadingIndicator");
const errorAlert = document.getElementById("repoErrorAlert");
const errorMessage = document.getElementById("repoErrorMessage");

/**
 * Main Entry Point: Analyze Repository
 * Triggered by button click.
 */
async function analyzeRepo() {
    const url = repoInput.value.trim();
    
    // 1. Validation
    if (!url) {
        showError("Please enter a valid GitHub repository URL.");
        return;
    }

    // 2. Reset UI State
    clearResults();
    hideError();
    showLoading(true);

    try {
        console.log(`Analyzing: ${url} via ${API_BASE_URL}${ENDPOINT_RECOMMEND}`);

        // 3. The Real API Call (No Mocks)
        const response = await fetch(`${API_BASE_URL}${ENDPOINT_RECOMMEND}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                repo_url: url,
                force_refresh: false 
            })
        });

        // 4. Handle HTTP Errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorDetail = errorData.detail || response.statusText;
            handleApiError(response.status, errorDetail);
            return;
        }

        // 5. Success: Render Real Data
        const data = await response.json();
        
        // Data integrity check
        if (!data.recommendations) {
            console.warn("API returned no recommendations array:", data);
            renderRecommendations([]);
        } else {
            renderRecommendations(data.recommendations);
        }
        
        showResults(true);

    } catch (error) {
        console.error("Network/System Error:", error);
        showError("Could not connect to Watchflow server. Is the backend running on port 8000?");
    } finally {
        showLoading(false);
    }
}

/**
 * Maps HTTP Status Codes to user-friendly messages.
 */
function handleApiError(statusCode, message) {
    let userMessage = "";
    switch (statusCode) {
        case 401:
            userMessage = "🔒 Private Repository. Authentication is required (Not yet implemented in UI).";
            break;
        case 404:
            userMessage = "❌ Repository not found. Please check the URL.";
            break;
        case 422:
            userMessage = "⚠️ Invalid URL format. Use: https://github.com/owner/repo";
            break;
        case 429:
            userMessage = "⏳ Analysis limit reached. Please wait a moment.";
            break;
        case 500:
            userMessage = "🔥 Internal Server Error. The AI agent encountered an issue.";
            break;
        default:
            userMessage = `Server Error (${statusCode}): ${message}`;
    }
    showError(userMessage);
}

/**
 * Renders the Rule Cards dynamically based on Agent output.
 */
function renderRecommendations(rules) {
    if (!rules || rules.length === 0) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>No specific governance rules found for this repository.</p>
            </div>`;
        return;
    }

    // Map Pydantic Model (name, description, severity, reasoning) to HTML
    const html = rules.map(rule => {
        // Safe access to properties
        const title = escapeHtml(rule.name || "Unnamed Rule");
        const desc = escapeHtml(rule.description || "");
        const reasoning = escapeHtml(rule.reasoning || "");
        const severity = (rule.severity || "medium").toLowerCase();

        return `
        <div class="rule-card severity-${severity}" style="
            background: white;
            border-left: 4px solid ${getSeverityColor(severity)};
            padding: 1.5rem;
            margin-bottom: 1rem;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        ">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <h3 style="margin: 0; font-size: 1.1rem; color: #333;">${title}</h3>
                <span class="badge" style="
                    background: ${getSeverityColor(severity)};
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    font-weight: bold;
                ">${severity}</span>
            </div>
            <p style="margin: 0.5rem 0; color: #444; font-size: 0.95rem;">${desc}</p>
            <div style="margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px dashed #eee;">
                <small style="color: #666; font-style: italic;">🤖 <strong>Why?</strong> ${reasoning}</small>
            </div>
        </div>
        `;
    }).join('');

    resultsContainer.innerHTML = html;
}

// --- UTILITIES ---

function getSeverityColor(severity) {
    switch (severity) {
        case 'critical': return '#d32f2f'; // Red
        case 'high': return '#f57c00';     // Orange
        case 'medium': return '#fbc02d';   // Yellow
        case 'low': return '#388e3c';      // Green
        default: return '#9e9e9e';         // Grey
    }
}

function showLoading(isLoading) {
    if (isLoading) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span class="spinner"></span> Analyzing...';
        loadingSpinner.classList.remove("hidden");
        resultsSection.classList.add("hidden");
    } else {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Repository";
        loadingSpinner.classList.add("hidden");
    }
}

function showResults(isVisible) {
    if (isVisible) {
        resultsSection.classList.remove("hidden");
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        resultsSection.classList.add("hidden");
    }
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorAlert.classList.remove("hidden");
}

function hideError() {
    errorAlert.classList.add("hidden");
}

function clearResults() {
    resultsContainer.innerHTML = "";
    resultsSection.classList.add("hidden");
}

function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", analyzeRepo);
    }
    // Allow "Enter" key in input
    if (repoInput) {
        repoInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") analyzeRepo();
        });
    }
});
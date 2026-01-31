import { useState, useCallback } from "react";
import { useToken } from "./use-token";

// API base URL configuration
// Use localhost for dev, production URL otherwise
// For testing with ngrok, set VITE_API_BASE environment variable
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/v1"
    : "https://api.watchflow.dev/api/v1");
const RECOMMEND_ENDPOINT = `${API_BASE}/rules/recommend`;
const PROCEED_WITH_PR_ENDPOINT = `${API_BASE}/rules/recommend/proceed-with-pr`;

export interface AnalysisSummary {
  codeowner_bypass_rate?: number;
  unlinked_issue_rate?: number;
  ci_skip_rate?: number;
  ai_generated_rate?: number;
  new_code_test_coverage?: number;
  average_pr_size?: number;
  first_time_contributor_count?: number;
  issue_diff_mismatch_rate?: number;
  ghost_contributor_rate?: number;
}

export interface RuleRecommendation {
  description: string;
  enabled: boolean;
  severity: string;
  event_types: string[];
  parameters?: Record<string, any>;
}

export interface AnalysisResponse {
  rules_yaml: string;
  pr_plan: {
    title: string;
    body: string;
    branch_name: string;
    base_branch: string;
    file_path: string;
    commit_message: string;
    markdown: string;
  };
  analysis_summary: AnalysisSummary;
  analysis_report: string | null;
  rule_reasonings: Record<string, string>;
}

export function useRepoAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const { token } = useToken();
  
  // Helper to get current token (in case it changes)
  const getToken = useCallback(() => {
    const stored = localStorage.getItem("watchflow_github_token");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return stored;
      }
    }
    return token;
  }, [token]);

  const analyze = useCallback(
    async (repoUrl: string, installationId?: number) => {
      if (!repoUrl) {
        setError("Please enter a repository URL");
        return;
      }

      if (!repoUrl.match(/^https:\/\/github\.com\/[^\/]+\/[^\/]+/)) {
        setError("Please enter a valid GitHub repository URL");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const payload: any = {
          repo_url: repoUrl,
        };

        if (installationId) {
          payload.installation_id = installationId;
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        };

        // Add token to Authorization header if available
        const currentToken = getToken();
        if (currentToken && !installationId) {
          headers["Authorization"] = `Bearer ${currentToken}`;
        } else if (currentToken && installationId) {
          payload.github_token = currentToken;
        }

        const response = await fetch(RECOMMEND_ENDPOINT, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Analysis failed: ${response.statusText}`);
        }

        const responseData = await response.json();
        setData(responseData);
      } catch (err: any) {
        setError(err.message || "Failed to analyze repository");
        setData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [getToken]
  );

  const createPR = useCallback(
    async (
      repositoryFullName: string,
      rulesYaml: string,
      prPlan: AnalysisResponse["pr_plan"],
      installationId?: number
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload: any = {
          repository_full_name: repositoryFullName,
          rules_yaml: rulesYaml,
        };

        if (installationId) {
          payload.installation_id = installationId;
        }

        if (prPlan) {
          payload.pr_title = prPlan.title;
          payload.pr_body = prPlan.body;
          payload.branch_name = prPlan.branch_name;
          payload.base_branch = prPlan.base_branch;
          payload.file_path = prPlan.file_path;
          payload.commit_message = prPlan.commit_message;
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        // Add ngrok header only if using ngrok URL
        if (API_BASE.includes("ngrok")) {
          headers["ngrok-skip-browser-warning"] = "true";
        }

        // Add token to Authorization header (preferred) or request body
        const currentToken = getToken();
        if (currentToken && !installationId) {
          headers["Authorization"] = `Bearer ${currentToken}`;
        } else if (currentToken && installationId) {
          payload.github_token = currentToken;
        }

        const response = await fetch(PROCEED_WITH_PR_ENDPOINT, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `PR creation failed: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (err: any) {
        setError(err.message || "Failed to create pull request");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getToken]
  );

  return {
    isLoading,
    error,
    data,
    analyze,
    createPR,
  };
}

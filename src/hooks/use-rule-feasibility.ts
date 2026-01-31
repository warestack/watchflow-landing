import { useState, useCallback } from "react";

// API base URL configuration
// Use localhost for dev, production URL otherwise
// For testing with ngrok, set VITE_API_BASE environment variable
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/v1"
    : "https://api.watchflow.dev/api/v1");
const EVALUATE_ENDPOINT = `${API_BASE}/rules/evaluate`;

export function useRuleFeasibility() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const checkFeasibility = useCallback(async (ruleText: string) => {
    if (!ruleText.trim()) {
      setError("Please enter a rule description");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setFeedback(null);

    try {
      const response = await fetch(EVALUATE_ENDPOINT, {
        method: "POST",
        headers: (() => {
          const h: Record<string, string> = {
            "Content-Type": "application/json",
          };
          // Add ngrok header only if using ngrok URL
          if (API_BASE.includes("ngrok")) {
            h["ngrok-skip-browser-warning"] = "true";
          }
          return h;
        })(),
        body: JSON.stringify({
          rule_text: ruleText.trim(),
          event_data: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Rule evaluation failed: ${response.statusText}`);
      }

      const data = await response.json();
      // Backend returns AgentResult: { success, message, data: { supported, rule_yaml, snippet } }
      const supported = data.success ?? data.data?.supported ?? false;
      const payload = data.data ?? {};
      if (!supported) {
        throw new Error(data.message || payload.feedback || "This rule is not currently supported.");
      }
      setResult(payload.snippet || payload.rule_yaml || payload.config || "");
      setFeedback(data.message || payload.feedback || null);
    } catch (err: any) {
      setError(err.message || "Failed to check rule feasibility");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
    setFeedback(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    feedback,
    checkFeasibility,
    reset,
  };
}

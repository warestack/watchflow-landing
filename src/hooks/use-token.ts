import { useState, useEffect, useCallback } from "react";

const TOKEN_STORAGE_KEY = "watchflow_github_token";

export function useToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load token from localStorage on mount
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setToken(parsed);
      } catch {
        setToken(stored);
      }
    }
  }, []);

  const saveToken = useCallback((newToken: string | null) => {
    if (newToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newToken));
      setToken(newToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
    }
  }, []);

  const manageToken = useCallback(() => {
    const hasToken = !!token;
    const action = hasToken
      ? prompt(
          "GitHub Token Management\n\n" +
          `Current token: ${token.substring(0, 8)}...\n\n` +
          "Options:\n" +
          "1. Enter new token to replace current\n" +
          "2. Click Cancel to keep current\n" +
          "3. Enter empty string to remove token\n\n" +
          "Create token at: https://github.com/settings/tokens",
          ""
        )
      : prompt(
          "Add GitHub Personal Access Token\n\n" +
          "Required for creating pull requests.\n\n" +
          "Create one at: https://github.com/settings/tokens\n" +
          "Required scopes: repo (for private repos) or public_repo (for public repos)\n\n" +
          "Token will be stored locally in your browser.",
          ""
        );

    if (action === null) {
      // User cancelled
      return;
    }

    if (action.trim() === "" && hasToken) {
      // Remove token
      saveToken(null);
      alert("GitHub token removed.");
    } else if (action.trim()) {
      // Store new token
      saveToken(action.trim());
      alert("GitHub token saved successfully!");
    }
  }, [token, saveToken]);

  return {
    token,
    hasToken: !!token,
    saveToken,
    manageToken,
  };
}

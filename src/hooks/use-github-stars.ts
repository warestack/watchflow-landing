import { useState, useEffect } from "react";

const GITHUB_REPO = "warestack/watchflow";
const CACHE_KEY = "github_stars_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedStars {
  count: number;
  timestamp: number;
}

export function useGitHubStars() {
  const [starCount, setStarCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed: CachedStars = JSON.parse(cached);
        const now = Date.now();
        if (now - parsed.timestamp < CACHE_DURATION) {
          setStarCount(parsed.count);
          setIsLoading(false);
          return;
        }
      } catch {
        // Invalid cache, continue to fetch
      }
    }

    // Fetch from GitHub API
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        const count = data.stargazers_count || 0;
        setStarCount(count);
        // Cache the result
        const cache: CachedStars = {
          count,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      })
      .catch((err) => {
        console.error("Failed to fetch GitHub stars:", err);
        // Try to use cached value even if expired
        if (cached) {
          try {
            const parsed: CachedStars = JSON.parse(cached);
            setStarCount(parsed.count);
          } catch {
            // Ignore
          }
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { starCount, isLoading };
}

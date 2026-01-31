import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { AnalysisResponse } from "@/hooks/use-repo-analysis";
import { useRepoAnalysis } from "@/hooks/use-repo-analysis";
import { useToken } from "@/hooks/use-token";
import { extractRecommendationsFromYAML, ParsedRule } from "@/utils/yaml-parser";
import { RecommendedRulesList } from "./guardrails/RecommendedRulesList";
import { YamlCodeBlock } from "./guardrails/YamlCodeBlock";
import { AuthenticationNotice } from "./guardrails/AuthenticationNotice";
import { PRActionButtons } from "./guardrails/PRActionButtons";

interface GuardrailRecommendationsProps {
  analysisData?: AnalysisResponse | null;
  repoUrl?: string;
  installationId?: number;
}

export function GuardrailRecommendations({ analysisData, repoUrl, installationId }: GuardrailRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ParsedRule[]>([]);
  const { createPR, isLoading: isCreatingPR, error: prError } = useRepoAnalysis();
  const { hasToken, manageToken } = useToken();

  useEffect(() => {
    if (analysisData?.rules_yaml) {
      const parsed = extractRecommendationsFromYAML(analysisData.rules_yaml);
      setRecommendations(parsed);
    }
  }, [analysisData]);

  if (!analysisData) {
    return null;
  }

  const handleDownload = () => {
    if (analysisData.rules_yaml) {
      const blob = new Blob([analysisData.rules_yaml], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rules.yaml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCreatePR = async () => {
    if (!analysisData) return;

    const hasInstallation = installationId ?? (() => {
      const stored = localStorage.getItem("watchflow_installation_id");
      if (stored) {
        const n = parseInt(stored, 10);
        return !Number.isNaN(n);
      }
      return false;
    })();
    if (!hasToken && !hasInstallation) {
      alert(
        "GitHub Personal Access Token required to create PR.\n\n" +
        "Please click the 'Token' button to add your GitHub Personal Access Token.\n\n" +
        "Create one at: https://github.com/settings/tokens\n" +
        "Required scopes: repo (for private repos) or public_repo (for public repos)"
      );
      return;
    }

    let repoName: string | null = null;
    
    if (repoUrl) {
      const match = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
      if (match) {
        repoName = match[1].replace(/\.git$/, "");
      }
    }
    
    if (!repoName && analysisData.pr_plan?.body) {
      const bodyMatch = analysisData.pr_plan.body.match(/for\s+([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)\s+based/);
      if (bodyMatch) {
        repoName = bodyMatch[1];
      }
    }

    if (!repoName) {
      const input = prompt("Enter repository (owner/repo):");
      if (!input || !input.trim()) {
        return;
      }
      repoName = input.trim();
    }

    const effectiveInstallationId =
      installationId ??
      (() => {
        const stored = localStorage.getItem("watchflow_installation_id");
        if (stored) {
          const n = parseInt(stored, 10);
          return Number.isNaN(n) ? undefined : n;
        }
        return undefined;
      })();

    try {
      const result = await createPR(
        repoName,
        analysisData.rules_yaml,
        analysisData.pr_plan,
        effectiveInstallationId
      );

      if (result?.pull_request_url) {
        window.open(result.pull_request_url, "_blank");
      }
    } catch (error) {
      console.error("Failed to create PR:", error);
    }
  };

  const reasonings = analysisData.rule_reasonings || {};
  const analysisSummary = analysisData.analysis_summary || {};

  return (
    <section id="guardrails" className="py-16 md:py-24 border-b border-border bg-background">
      <div className="container max-w-5xl">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Step 3 → Recommendations
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Agentic Guardrail Recommendations
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Based on your repository signals, Watchflow suggests targeted guardrails. These are{" "}
              <strong>suggestions</strong>, not hard enforcement — you decide what to adopt.
            </p>
          </div>

          {/* Recommended Rules */}
          <RecommendedRulesList
            recommendations={recommendations}
            reasonings={reasonings}
            analysisSummary={analysisSummary}
          />

          {/* PR Creation Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Step 4 → One-Click PR
              </div>
            </div>

            <YamlCodeBlock yaml={analysisData.rules_yaml} />

            {!hasToken && <AuthenticationNotice />}

            <PRActionButtons
              hasToken={hasToken}
              isCreatingPR={isCreatingPR}
              onCreatePR={handleCreatePR}
              onDownload={handleDownload}
              onManageToken={manageToken}
            />

            {prError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-none">
                {prError}
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-info/5 border border-info/20 text-sm rounded-none">
              <Info className="h-4 w-4 mt-0.5 text-info flex-shrink-0" />
              <div className="text-muted-foreground">
                The PR will include a summary of the analysis, explanation for each rule, and what
                each guardrail prevents. Review and merge when ready.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

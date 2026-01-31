import { useState, useEffect, useRef } from "react";
import { GitBranch, CheckCircle, ArrowRight, Loader2, Copy, Check, Download, Key, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useRuleFeasibility } from "@/hooks/use-rule-feasibility";
import { useRepoAnalysis, AnalysisResponse } from "@/hooks/use-repo-analysis";
import { AnalysisLoader } from "@/components/AnalysisLoader";
import { useAnalysis } from "@/hooks/use-analysis";
import { useToken } from "@/hooks/use-token";
import { generateMockAnalysisData } from "@/utils/mock-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeroProps {
  activeTab?: "analysis" | "feasibility";
  onTabChange?: (tab: "analysis" | "feasibility") => void;
  onAnalysisComplete?: (data: AnalysisResponse) => void;
  onRepoUrlChange?: (url: string) => void;
  selectedRule?: string;
  onRuleChange?: (rule: string) => void;
  installationId?: number;
  initialRepoUrl?: string;
}

export function Hero({
  activeTab: controlledTab,
  onTabChange,
  onAnalysisComplete,
  onRepoUrlChange,
  selectedRule,
  onRuleChange,
  installationId,
  initialRepoUrl = "",
}: HeroProps) {
  const [internalTab, setInternalTab] = useState<"analysis" | "feasibility">("analysis");
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl);
  const [ruleText, setRuleText] = useState(selectedRule || "");
  const [copied, setCopied] = useState(false);
  const [showTokenHint, setShowTokenHint] = useState(false);
  const isDemoModeRef = useRef(false);

  // Pre-fill repo when initialRepoUrl is set (e.g. from ?repo=owner/name)
  useEffect(() => {
    if (initialRepoUrl) {
      setRepoUrl(initialRepoUrl);
    }
  }, [initialRepoUrl]);
  
  // Token hook for GitHub authentication
  const { hasToken, manageToken } = useToken();
  
  // Analysis hooks
  const { analyze, isLoading: isApiLoading, error: analysisError, data: analysisData } = useRepoAnalysis();
  const { step: analysisStep, progress: analysisProgress, isAnalyzing: isAnimating, isComplete: animationComplete, waitingForApi, startAnalysis, markComplete, resetAnalysis } = useAnalysis();
  
  // Feasibility hooks  
  const { checkFeasibility, isLoading: isChecking, error: feasibilityError, result, reset: resetFeasibility } = useRuleFeasibility();

  const activeTab = controlledTab ?? internalTab;

  useEffect(() => {
    if (selectedRule) {
      setRuleText(selectedRule);
    }
  }, [selectedRule]);

  // Notify parent when real API analysis is complete and mark animation complete
  useEffect(() => {
    if (analysisData && !isDemoModeRef.current) {
      // API response arrived - mark the loader as complete
      markComplete();
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisData);
      }
    }
  }, [analysisData, onAnalysisComplete, markComplete]);

  const handleTabChange = (tab: "analysis" | "feasibility") => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const handleAnalyze = async (useDemo = false) => {
    const url = repoUrl || "https://github.com/facebook/react";
    if (!repoUrl) setRepoUrl(url);
    
    // Notify parent of the repo URL being analyzed
    if (onRepoUrlChange) {
      onRepoUrlChange(url);
    }
    
    isDemoModeRef.current = useDemo;
    
    // Start visual animation (pass isDemo to handle completion differently)
    startAnalysis(url, useDemo);
    
    if (useDemo) {
      // Demo mode: only animation, mock data will be injected when animation completes
      return;
    }
    
    // Call real API for user-provided repos (pass installation_id when from App install flow)
    const effectiveInstallationId = installationId ?? (() => {
      const stored = localStorage.getItem("watchflow_installation_id");
      if (stored) {
        const n = parseInt(stored, 10);
        return Number.isNaN(n) ? undefined : n;
      }
      return undefined;
    })();
    await analyze(url, effectiveInstallationId);
  };

  // When animation completes in demo mode, inject mock data
  useEffect(() => {
    if (animationComplete && isDemoModeRef.current && onAnalysisComplete) {
      const mockData = generateMockAnalysisData();
      onAnalysisComplete(mockData);
      isDemoModeRef.current = false;
    }
  }, [animationComplete, onAnalysisComplete]);

  const handleResetAnalysis = () => {
    resetAnalysis();
    setRepoUrl("");
    isDemoModeRef.current = false;
  };

  const handleCheckFeasibility = async () => {
    if (!ruleText.trim()) return;
    
    if (onRuleChange) {
      onRuleChange(ruleText);
    }
    
    await checkFeasibility(ruleText);
  };

  const handleResetFeasibility = () => {
    resetFeasibility();
    setRuleText("");
    if (onRuleChange) {
      onRuleChange("");
    }
  };

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadResult = () => {
    if (result) {
      const blob = new Blob([result], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rule.yaml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <section className="py-16 md:py-24 border-b border-border bg-background">
      <div className="container max-w-5xl">
        <div className="space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-mono text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Open Source GitHub App
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
            Advanced GitHub Governance<br/>
            <span className="text-muted-foreground">with custom review policies and contribution standards</span>
          </h1>

          {/* Positioning Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border bg-muted/30 text-xs font-mono text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-info rounded-full" />
              Context-Aware Rules
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border bg-muted/30 text-xs font-mono text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-warning rounded-full" />
              No Static Config
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border bg-muted/30 text-xs font-mono text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-success rounded-full" />
              Built for the AI Flood
            </span>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Analyze repository patterns and PR history to generate review rules that filter 
            low-value PRs and focus reviewer attention on meaningful contributions.
          </p>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            <button
              onClick={() => handleTabChange("analysis")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] rounded-none ${
                activeTab === "analysis"
                  ? "text-foreground border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <GitBranch className="h-4 w-4" />
              <span>Repository Analysis</span>
            </button>
            <button
              onClick={() => handleTabChange("feasibility")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] rounded-none ${
                activeTab === "feasibility"
                  ? "text-foreground border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span>Rule Feasibility</span>
            </button>
          </div>

          {/* Tab Content: Repository Analysis */}
          {activeTab === "analysis" && (
            <div className="space-y-4">
              {/* Installation notice: only when installation_id is in the URL (from welcome/install flow) */}
              {installationId != null && (
                <div className="flex items-start gap-3 p-4 bg-primary/10 border-2 border-primary/30 text-base text-foreground font-medium rounded-lg shadow-sm">
                  <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span>
                    Using GitHub App installation. Enter a repository where Watchflow is installed to analyze it.
                  </span>
                </div>
              )}
              {/* Input State */}
              {!isAnimating && !animationComplete && (
                <>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Input
                        type="url"
                        placeholder="https://github.com/owner/repository"
                        value={repoUrl}
                        onChange={(e) => {
                          setRepoUrl(e.target.value);
                          // Show token hint only when no token and no installation (PAT not required when installation_id in URL)
                          const hasInstallation = installationId ?? localStorage.getItem("watchflow_installation_id");
                          if (e.target.value.includes("github.com") && !hasToken && !hasInstallation) {
                            setShowTokenHint(true);
                          }
                        }}
                        onBlur={() => {
                          // Hide hint after a short delay to allow clicking
                          setTimeout(() => setShowTokenHint(false), 200);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAnalyze();
                          }
                        }}
                        className="h-12 font-mono text-sm rounded-none w-full"
                      />
                      {/* Token Reminder Tooltip (skip when installation_id in URL — PAT not required) */}
                      {showTokenHint && !hasToken && !(installationId ?? localStorage.getItem("watchflow_installation_id")) && (
                        <div className="absolute left-0 right-0 top-full mt-2 z-50 animate-fade-in">
                          <div className="bg-popover border border-border shadow-lg p-3 text-sm">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div className="space-y-1.5">
                                <p className="font-medium text-foreground">Add a GitHub Token for better results</p>
                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                  <li>• Access private repositories</li>
                                  <li>• Avoid rate limits (60 → 5,000 req/hr)</li>
                                  <li>• Create PRs directly</li>
                                </ul>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-2 gap-1.5 h-7 text-xs rounded-none"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setShowTokenHint(false);
                                    manageToken();
                                  }}
                                >
                                  <Key className="h-3 w-3" />
                                  Add Token
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      size="lg"
                      className="gap-2 rounded-none"
                      onClick={() => handleAnalyze(false)}
                      disabled={isApiLoading || isAnimating}
                    >
                      {isApiLoading || isAnimating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <GitBranch className="h-4 w-4" />
                      )}
                      Analyze Repository
                    </Button>
                  </div>

                  {/* Secondary Links */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <button
                      onClick={() => handleAnalyze(true)}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      View example analysis
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={manageToken}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Key className="h-3.5 w-3.5" />
                      {hasToken ? "Manage Token" : "Add Token"}
                    </button>
                    <a
                      href="https://github.com/apps/watchflow"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      Install GitHub App
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </>
              )}

              {/* Loading State */}
              {(isAnimating || animationComplete || waitingForApi) && (
                <div className="space-y-4">
                  <AnalysisLoader
                    step={analysisStep}
                    progress={analysisProgress}
                    repoUrl={repoUrl || "https://github.com/facebook/react"}
                    waitingForApi={waitingForApi}
                  />

                  {animationComplete && (
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={handleResetAnalysis} className="gap-2 rounded-none">
                        Analyze Another
                      </Button>
                      <button
                        onClick={() => {
                          const section = document.getElementById("analysis");
                          if (section) {
                            section.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        View full results below
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {analysisError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-none">
                  {analysisError}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Rule Feasibility */}
          {activeTab === "feasibility" && (
            <div className="space-y-4">
              {/* Input State */}
              {!result && (
                <>
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <Textarea
                      placeholder="Describe a rule in natural language, e.g.: PRs must reference a linked issue in the description"
                      value={ruleText}
                      onChange={(e) => {
                        setRuleText(e.target.value);
                        if (onRuleChange) {
                          onRuleChange(e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleCheckFeasibility();
                        }
                      }}
                      className="flex-1 min-h-[100px] font-mono text-sm rounded-none"
                      rows={3}
                    />
                    <Button
                      onClick={handleCheckFeasibility}
                      disabled={isChecking || !ruleText.trim()}
                      className="rounded-none self-start"
                    >
                      {isChecking ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Check Feasibility
                    </Button>
                  </div>

                  {/* Secondary Links */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <a
                      href="#example-rules"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      Try example rules below
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href="https://github.com/apps/watchflow"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      Install GitHub App
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </>
              )}

              {/* Error Display */}
              {feasibilityError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-none">
                  {feasibilityError}
                </div>
              )}

              {/* Result Display */}
              {result && (
                <div className="space-y-4">
                  <div className="panel overflow-hidden rounded-none">
                    <div className="panel-header flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="font-medium text-sm">Rule Validated — Configuration Generated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyResult}
                          className="rounded-none"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDownloadResult}
                          className="rounded-none"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <pre className="code-block p-4 overflow-x-auto text-xs leading-relaxed rounded-none">
                      <code>{result}</code>
                    </pre>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleResetFeasibility} className="gap-2 rounded-none">
                      Check Another Rule
                    </Button>
                    <a
                      href="https://github.com/apps/watchflow"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Install Watchflow to use this rule
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import { FileCode, GitBranch, TestTube, Users, Loader2, Check, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AnalysisStep } from "@/hooks/use-analysis";

interface AnalysisLoaderProps {
  step: AnalysisStep;
  progress: number;
  repoUrl: string;
  waitingForApi?: boolean;
}

const steps = [
  { id: "codeowners", icon: FileCode, label: "CODEOWNERS", description: "Parsing ownership rules" },
  { id: "contributing", icon: Users, label: "CONTRIBUTING.md", description: "Extracting guidelines" },
  { id: "workflows", icon: GitBranch, label: "CI Workflows", description: "Analyzing pipelines" },
  { id: "pr-history", icon: TestTube, label: "PR History", description: "Sampling patterns" },
  { id: "generating-signals", icon: Sparkles, label: "Signals", description: "Generating insights" },
];

function getStepIndex(step: AnalysisStep): number {
  const idx = steps.findIndex(s => s.id === step);
  return idx === -1 ? (step === "complete" ? steps.length : -1) : idx;
}

export function AnalysisLoader({ step, progress, repoUrl, waitingForApi = false }: AnalysisLoaderProps) {
  const currentStepIndex = getStepIndex(step);
  const isComplete = step === "complete" && !waitingForApi;
  const isWaitingAtLastStep = step === "generating-signals" || (step === "complete" && waitingForApi);

  // Extract repo name for display
  const repoName = repoUrl.replace("https://github.com/", "").replace(/\/$/, "");

  return (
    <div className="panel overflow-hidden animate-fade-in">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="terminal-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="font-mono text-sm">Analyzing repository</span>
        </div>
        {repoName && (
          <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
            {repoName}
          </span>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {isComplete ? "Analysis complete" : waitingForApi ? "Waiting for response..." : "Analyzing..."}
            </span>
            <span className="font-mono text-muted-foreground">
              {waitingForApi ? "..." : `${Math.round(progress)}%`}
            </span>
          </div>
          <Progress value={waitingForApi ? 95 : progress} className="h-1.5" />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {steps.map((s, index) => {
            const isActive = s.id === step || (isWaitingAtLastStep && s.id === "generating-signals");
            const isPast = (currentStepIndex > index || isComplete) && !isActive;
            const isFuture = currentStepIndex < index && !isComplete && !isWaitingAtLastStep;

            return (
              <div
                key={s.id}
                className={cn(
                  "p-3 rounded-md border transition-all duration-300",
                  isActive && "border-primary bg-primary/5",
                  isPast && "border-success/30 bg-success/5",
                  isFuture && "border-border bg-muted/30 opacity-50"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isPast && !isActive ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : isActive ? (
                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                  ) : (
                    <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={cn(
                    "font-mono text-xs font-medium truncate",
                    isActive && "text-primary",
                    isPast && "text-success",
                    isFuture && "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {isWaitingAtLastStep && s.id === "generating-signals" ? "Waiting for backend..." : s.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Terminal Output */}
        <div className="code-block p-3 text-xs font-mono space-y-1 max-h-32 overflow-y-auto">
          {currentStepIndex >= 0 && (
            <div className="text-muted-foreground">
              <span className="text-success">→</span> Fetching {repoName || "repository"}...
            </div>
          )}
          {currentStepIndex >= 0 && (
            <div className="text-muted-foreground">
              <span className="text-success">✓</span> Connected to GitHub API
            </div>
          )}
          {currentStepIndex >= 1 && (
            <div className="text-muted-foreground">
              <span className="text-success">✓</span> Found CODEOWNERS
            </div>
          )}
          {currentStepIndex >= 2 && (
            <div className="text-muted-foreground">
              <span className="text-success">✓</span> Parsed CONTRIBUTING.md (2.4kb)
            </div>
          )}
          {currentStepIndex >= 3 && (
            <div className="text-muted-foreground">
              <span className="text-success">✓</span> Analyzed workflow files
            </div>
          )}
          {currentStepIndex >= 4 && (
            <div className="text-muted-foreground">
              <span className="text-success">✓</span> Sampled recent PRs
            </div>
          )}
          {waitingForApi && (
            <div className="text-primary font-medium animate-pulse">
              ⏳ Waiting for analysis results...
            </div>
          )}
          {isComplete && (
            <div className="text-success font-medium">
              ✓ Analysis complete — signals detected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

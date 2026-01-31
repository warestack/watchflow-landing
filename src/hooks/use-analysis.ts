import { useState, useCallback } from "react";

export type AnalysisStep = 
  | "idle"
  | "codeowners"
  | "contributing"
  | "workflows"
  | "pr-history"
  | "generating-signals"
  | "complete";

export type RuleFeasibilityStep =
  | "idle"
  | "parsing-rule"
  | "scanning-repo"
  | "checking-conflicts"
  | "validating"
  | "complete";

export interface AnalysisState {
  step: AnalysisStep;
  progress: number;
  repoUrl: string;
  error: string | null;
}

export interface RuleFeasibilityState {
  step: RuleFeasibilityStep;
  progress: number;
  ruleId: string | null;
  error: string | null;
}

const ANALYSIS_STEPS: { step: AnalysisStep; label: string; duration: number }[] = [
  { step: "codeowners", label: "Parsing CODEOWNERS", duration: 800 },
  { step: "contributing", label: "Reading CONTRIBUTING.md", duration: 600 },
  { step: "workflows", label: "Analyzing CI workflows", duration: 1200 },
  { step: "pr-history", label: "Sampling PR history", duration: 1500 },
  { step: "generating-signals", label: "Generating signals", duration: 1000 },
];

const RULE_STEPS: { step: RuleFeasibilityStep; label: string; duration: number }[] = [
  { step: "parsing-rule", label: "Parsing rule definition", duration: 500 },
  { step: "scanning-repo", label: "Scanning repository structure", duration: 800 },
  { step: "checking-conflicts", label: "Checking for conflicts", duration: 700 },
  { step: "validating", label: "Validating feasibility", duration: 600 },
];

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    step: "idle",
    progress: 0,
    repoUrl: "",
    error: null,
  });
  const [waitingForApi, setWaitingForApi] = useState(false);

  const startAnalysis = useCallback(async (repoUrl: string, isDemo = false) => {
    if (!repoUrl) {
      setState(prev => ({ ...prev, error: "Repository URL is required" }));
      return;
    }

    setState({ step: "codeowners", progress: 0, repoUrl, error: null });
    
    // Only set waiting for real API calls, not demo mode
    if (!isDemo) {
      setWaitingForApi(true);
    }

    let currentProgress = 0;
    const totalDuration = ANALYSIS_STEPS.reduce((acc, s) => acc + s.duration, 0);

    for (const { step, duration } of ANALYSIS_STEPS) {
      setState(prev => ({ ...prev, step, progress: currentProgress }));
      
      // Animate progress during this step
      const stepProgress = (duration / totalDuration) * 100;
      const startProgress = currentProgress;
      const startTime = Date.now();
      
      await new Promise<void>((resolve) => {
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const newProgress = startProgress + (stepProgress * progress);
          
          setState(prev => ({ ...prev, progress: newProgress }));
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(animate);
      });
      
      currentProgress += stepProgress;
    }

    // Only complete if demo mode, otherwise wait for markComplete call
    if (isDemo) {
      setState(prev => ({ ...prev, step: "complete", progress: 100 }));
    }
  }, []);

  // Called when API response arrives
  const markComplete = useCallback(() => {
    setWaitingForApi(false);
    setState(prev => ({ ...prev, step: "complete", progress: 100 }));
  }, []);

  const resetAnalysis = useCallback(() => {
    setState({ step: "idle", progress: 0, repoUrl: "", error: null });
    setWaitingForApi(false);
  }, []);

  // isAnalyzing includes waiting for API
  const isStillProcessing = state.step !== "idle" && state.step !== "complete";
  
  return {
    ...state,
    isAnalyzing: isStillProcessing || waitingForApi,
    isComplete: state.step === "complete" && !waitingForApi,
    waitingForApi,
    startAnalysis,
    markComplete,
    resetAnalysis,
    steps: ANALYSIS_STEPS,
  };
}

export function useRuleFeasibility() {
  const [state, setState] = useState<RuleFeasibilityState>({
    step: "idle",
    progress: 0,
    ruleId: null,
    error: null,
  });

  const checkFeasibility = useCallback(async (ruleId: string) => {
    setState({ step: "parsing-rule", progress: 0, ruleId, error: null });

    let currentProgress = 0;
    const totalDuration = RULE_STEPS.reduce((acc, s) => acc + s.duration, 0);

    for (const { step, duration } of RULE_STEPS) {
      setState(prev => ({ ...prev, step, progress: currentProgress }));
      
      const stepProgress = (duration / totalDuration) * 100;
      const startProgress = currentProgress;
      const startTime = Date.now();
      
      await new Promise<void>((resolve) => {
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const newProgress = startProgress + (stepProgress * progress);
          
          setState(prev => ({ ...prev, progress: newProgress }));
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(animate);
      });
      
      currentProgress += stepProgress;
    }

    setState(prev => ({ ...prev, step: "complete", progress: 100 }));
  }, []);

  const resetFeasibility = useCallback(() => {
    setState({ step: "idle", progress: 0, ruleId: null, error: null });
  }, []);

  return {
    ...state,
    isChecking: state.step !== "idle" && state.step !== "complete",
    isComplete: state.step === "complete",
    checkFeasibility,
    resetFeasibility,
    steps: RULE_STEPS,
  };
}

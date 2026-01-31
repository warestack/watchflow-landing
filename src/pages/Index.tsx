import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AnalysisFunnel } from "@/components/AnalysisFunnel";
import { ExampleRules } from "@/components/ExampleRules";
import { GuardrailRecommendations } from "@/components/GuardrailRecommendations";
import { RuleFeasibilitySection } from "@/components/RuleFeasibilitySection";
import { AINoiseSection } from "@/components/AINoiseSection";
import { TechnicalCredibility } from "@/components/TechnicalCredibility";
import { Footer } from "@/components/Footer";
import { AnalysisResponse } from "@/hooks/use-repo-analysis";

const Index = () => {
  const [activeHeroTab, setActiveHeroTab] = useState<"analysis" | "feasibility">("analysis");
  const [selectedRule, setSelectedRule] = useState<string>("");
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [analyzedRepoUrl, setAnalyzedRepoUrl] = useState<string>("");
  const [installationId, setInstallationId] = useState<number | undefined>(undefined);
  const [initialRepoUrl, setInitialRepoUrl] = useState<string>("");
  const lastAnalysisSignatureRef = useRef<string | null>(null);

  // Handle URL parameters for installation_id and repo (check for installation on specific repo)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const installationIdParam = urlParams.get("installation_id");
    const repo = urlParams.get("repo");

    if (installationIdParam) {
      const id = parseInt(installationIdParam, 10);
      if (!Number.isNaN(id)) {
        setInstallationId(id);
        localStorage.setItem("watchflow_installation_id", installationIdParam);
      }
    }

    if (repo) {
      const decoded = decodeURIComponent(repo);
      const url = decoded.startsWith("http") ? decoded : `https://github.com/${decoded.replace(/^\/*/, "")}`;
      setInitialRepoUrl(url);
    }
  }, []);

  const handleAnalysisComplete = (data: AnalysisResponse) => {
    // Prevent repeated auto-scroll loops when the same analysis payload is emitted multiple times
    // (e.g. demo/mock fallback emitting on every render while local hook state remains empty).
    const signature = JSON.stringify({
      rules_yaml: data.rules_yaml,
      analysis_report: data.analysis_report,
      analysis_summary: data.analysis_summary,
      pr_plan: data.pr_plan,
    });

    if (lastAnalysisSignatureRef.current === signature) {
      return;
    }
    lastAnalysisSignatureRef.current = signature;

    setAnalysisData(data);
    // Scroll to analysis section after state updates
    requestAnimationFrame(() => {
      setTimeout(() => {
        const section = document.getElementById("analysis");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    });
  };

  const handleRuleSelect = (rule: string) => {
    setSelectedRule(rule);
    setActiveHeroTab("feasibility");
    // Scroll back to hero for the feasibility input
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero
          activeTab={activeHeroTab}
          onTabChange={setActiveHeroTab}
          onAnalysisComplete={handleAnalysisComplete}
          onRepoUrlChange={setAnalyzedRepoUrl}
          selectedRule={selectedRule}
          onRuleChange={setSelectedRule}
          installationId={installationId}
          initialRepoUrl={initialRepoUrl}
        />
        
        {/* Show AnalysisFunnel when analysis tab is active and we have data */}
        {activeHeroTab === "analysis" && (
          <AnalysisFunnel analysisData={analysisData} />
        )}

        {/* Show ExampleRules when feasibility tab is active */}
        {activeHeroTab === "feasibility" && (
          <ExampleRules onRuleSelect={handleRuleSelect} />
        )}

        {/* Show GuardrailRecommendations only when we have analysis data */}
        {analysisData && (
          <GuardrailRecommendations
            analysisData={analysisData}
            repoUrl={analyzedRepoUrl}
            installationId={installationId}
          />
        )}
        
        {/* Show RuleFeasibilitySection only when feasibility tab is active */}
        {activeHeroTab === "feasibility" && (
          <RuleFeasibilitySection initialRule={selectedRule} />
        )}
        
        <AINoiseSection />
        <TechnicalCredibility />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

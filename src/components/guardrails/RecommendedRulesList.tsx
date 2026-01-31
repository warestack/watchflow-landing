import { Badge } from "@/components/ui/badge";
import { ParsedRule } from "@/utils/yaml-parser";
import { AnalysisSummary } from "@/hooks/use-repo-analysis";
import { RecommendedRuleCard } from "./RecommendedRuleCard";

interface RecommendedRulesListProps {
  recommendations: ParsedRule[];
  reasonings: Record<string, string>;
  analysisSummary: AnalysisSummary;
}

function buildTriggers(rule: ParsedRule, analysisSummary: AnalysisSummary): string[] {
  const triggers: string[] = [];

  if (rule.description.toLowerCase().includes("codeowner")) {
    if (analysisSummary.codeowner_bypass_rate !== undefined) {
      const rate = (analysisSummary.codeowner_bypass_rate * 100).toFixed(0);
      triggers.push(`${rate}% of files lack code owner assignments`);
    }
  }
  if (rule.description.toLowerCase().includes("issue")) {
    if (analysisSummary.unlinked_issue_rate !== undefined) {
      const rate = (analysisSummary.unlinked_issue_rate * 100).toFixed(0);
      triggers.push(`PRs without linked issues: ${rate}%`);
    }
  }
  if (rule.description.toLowerCase().includes("test") || rule.description.toLowerCase().includes("coverage")) {
    if (analysisSummary.new_code_test_coverage !== undefined) {
      const coverage = (analysisSummary.new_code_test_coverage * 100).toFixed(0);
      triggers.push(`New code test coverage: ${coverage}%`);
    }
  }
  if (rule.description.toLowerCase().includes("ci") || rule.description.toLowerCase().includes("skip")) {
    if (analysisSummary.ci_skip_rate !== undefined) {
      const rate = (analysisSummary.ci_skip_rate * 100).toFixed(0);
      triggers.push(`CI skip rate: ${rate}%`);
    }
  }

  return triggers;
}

export function RecommendedRulesList({ recommendations, reasonings, analysisSummary }: RecommendedRulesListProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="panel rounded-none">
        <div className="panel-header flex items-center justify-between">
          <h3 className="font-medium text-sm">Recommended Rules</h3>
          <Badge variant="muted" className="rounded-none">
            {recommendations.length} rules
          </Badge>
        </div>
        <div className="panel-body space-y-4">
          {recommendations.map((rule, index) => (
            <RecommendedRuleCard
              key={index}
              rule={rule}
              reasoning={reasonings[rule.description] || ""}
              triggers={buildTriggers(rule, analysisSummary)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

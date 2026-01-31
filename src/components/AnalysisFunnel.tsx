import { FileCode, GitBranch, TestTube, Users, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnalysisSummary } from "@/hooks/use-repo-analysis";

const analysisSteps = [
  {
    icon: FileCode,
    label: "CODEOWNERS",
    description: "Parse ownership rules and bypass patterns",
  },
  {
    icon: Users,
    label: "CONTRIBUTING.md",
    description: "Extract contribution guidelines and conventions",
  },
  {
    icon: GitBranch,
    label: "CI Workflows",
    description: "Analyze workflow triggers, skip patterns, failures",
  },
  {
    icon: TestTube,
    label: "PR History",
    description: "Sample recent PRs for patterns and diffs",
  },
];

interface AnalysisFunnelProps {
  analysisData?: {
    analysis_summary?: AnalysisSummary;
    analysis_report?: string | null;
  } | null;
}

function formatSignalValue(key: string, value: number | undefined): string {
  if (value === undefined || value === null) return "N/A";
  
  if (key.includes("rate") || key.includes("coverage")) {
    return `${(value * 100).toFixed(0)}%`;
  }
  return value.toString();
}

function getSignalStatus(key: string, value: number | undefined): "success" | "warning" | "destructive" {
  if (value === undefined || value === null) return "success";
  
  if (key === "codeowner_bypass_rate") {
    return value > 0.3 ? "destructive" : value > 0.15 ? "warning" : "success";
  }
  if (key === "unlinked_issue_rate") {
    return value > 0.5 ? "destructive" : value > 0.2 ? "warning" : "success";
  }
  if (key === "ci_skip_rate") {
    return value > 0.1 ? "destructive" : value > 0.05 ? "warning" : "success";
  }
  if (key === "ai_generated_rate") {
    return value > 0.2 ? "destructive" : value > 0.1 ? "warning" : "success";
  }
  if (key === "new_code_test_coverage") {
    return value < 0.5 ? "destructive" : value < 0.8 ? "warning" : "success";
  }
  if (key === "average_pr_size") {
    return value > 50 ? "warning" : "success";
  }
  
  return "success";
}

function getSignalTrend(key: string, value: number | undefined): string {
  if (value === undefined || value === null) return "N/A";
  
  if (key.includes("rate") || key.includes("bypass")) {
    if (value > 0.5) return "High";
    if (value > 0.3) return "Moderate";
    return "Low";
  }
  if (key.includes("coverage")) {
    if (value < 0.5) return "Low coverage";
    if (value < 0.8) return "Moderate coverage";
    return "Good coverage";
  }
  if (key.includes("size")) {
    return value > 50 ? "Large PRs" : "Within range";
  }
  if (key.includes("skip")) {
    if (value > 0.1) return "High skip rate";
    if (value > 0.05) return "Some skips";
    return "Well enforced";
  }
  
  return "Within range";
}

export function AnalysisFunnel({ analysisData }: AnalysisFunnelProps) {
  const signals = analysisData?.analysis_summary
    ? [
        ...(analysisData.analysis_summary.codeowner_bypass_rate !== undefined
          ? [
              {
                signal: "CODEOWNER bypass rate",
                value: formatSignalValue("codeowner_bypass_rate", analysisData.analysis_summary.codeowner_bypass_rate),
                level: getSignalStatus("codeowner_bypass_rate", analysisData.analysis_summary.codeowner_bypass_rate),
                trend: getSignalTrend("codeowner_bypass_rate", analysisData.analysis_summary.codeowner_bypass_rate),
              },
            ]
          : []),
        ...(analysisData.analysis_summary.unlinked_issue_rate !== undefined
          ? [
              {
                signal: "PRs without linked issues",
                value: formatSignalValue("unlinked_issue_rate", analysisData.analysis_summary.unlinked_issue_rate),
                level: getSignalStatus("unlinked_issue_rate", analysisData.analysis_summary.unlinked_issue_rate),
                trend: getSignalTrend("unlinked_issue_rate", analysisData.analysis_summary.unlinked_issue_rate),
              },
            ]
          : []),
        ...(analysisData.analysis_summary.average_pr_size !== undefined
          ? [
              {
                signal: "Average PR size",
                value: formatSignalValue("average_pr_size", analysisData.analysis_summary.average_pr_size),
                level: getSignalStatus("average_pr_size", analysisData.analysis_summary.average_pr_size),
                trend: getSignalTrend("average_pr_size", analysisData.analysis_summary.average_pr_size),
              },
            ]
          : []),
        ...(analysisData.analysis_summary.ai_generated_rate !== undefined
          ? [
              {
                signal: "AI-generated PR indicators",
                value: formatSignalValue("ai_generated_rate", analysisData.analysis_summary.ai_generated_rate),
                level: getSignalStatus("ai_generated_rate", analysisData.analysis_summary.ai_generated_rate),
                trend: getSignalTrend("ai_generated_rate", analysisData.analysis_summary.ai_generated_rate),
              },
            ]
          : []),
        ...(analysisData.analysis_summary.new_code_test_coverage !== undefined
          ? [
              {
                signal: "New code test coverage",
                value: formatSignalValue("new_code_test_coverage", analysisData.analysis_summary.new_code_test_coverage),
                level: getSignalStatus("new_code_test_coverage", analysisData.analysis_summary.new_code_test_coverage),
                trend: getSignalTrend("new_code_test_coverage", analysisData.analysis_summary.new_code_test_coverage),
              },
            ]
          : []),
        ...(analysisData.analysis_summary.ci_skip_rate !== undefined
          ? [
              {
                signal: "CI skip rate",
                value: formatSignalValue("ci_skip_rate", analysisData.analysis_summary.ci_skip_rate),
                level: getSignalStatus("ci_skip_rate", analysisData.analysis_summary.ci_skip_rate),
                trend: getSignalTrend("ci_skip_rate", analysisData.analysis_summary.ci_skip_rate),
              },
            ]
          : []),
      ]
    : [];

  return (
    <section id="analysis" className="py-16 md:py-24 border-b border-border">
      <div className="container max-w-5xl">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Step 1 → Analyze
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Deep repository analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Watchflow reads your repository structure, history, and patterns to understand 
              your team's workflow — no configuration required.
            </p>
          </div>

          {/* What we analyze */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysisSteps.map((step) => (
              <div
                key={step.label}
                className="panel p-4 space-y-3 rounded-none"
              >
                <div className="flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm font-medium">{step.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Signals Table - Only show if we have data */}
          {signals.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  Step 2 → Signals & Findings
                </div>
              </div>

              <div className="panel overflow-hidden rounded-none">
                <div className="panel-header flex items-center justify-between">
                  <span>Repository Signals</span>
                  <Badge variant="muted" className="text-xs rounded-none">
                    <Clock className="h-3 w-3 mr-1" />
                    Last analyzed: just now
                  </Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="signal-table">
                    <thead>
                      <tr>
                        <th>Signal</th>
                        <th>Value</th>
                        <th>Risk</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {signals.map((signal, idx) => (
                        <tr key={idx}>
                          <td className="font-medium">{signal.signal}</td>
                          <td className="font-mono">{signal.value}</td>
                          <td>
                            <Badge
                              variant={signal.level === "destructive" ? "destructive" : signal.level}
                              className="rounded-none"
                            >
                              {signal.level === "success" && <CheckCircle className="h-3 w-3" />}
                              {signal.level === "warning" && <AlertCircle className="h-3 w-3" />}
                              {signal.level === "destructive" && <AlertCircle className="h-3 w-3" />}
                              {signal.level}
                            </Badge>
                          </td>
                          <td className="text-muted-foreground text-sm">{signal.trend}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Report - Only show if we have data */}
          {analysisData?.analysis_report && (
            <div className="space-y-4">
              <div className="panel rounded-none">
                <div className="panel-header">
                  <h3 className="font-medium text-sm">Analysis Report</h3>
                </div>
                <div className="panel-body">
                  <AnalysisReportMarkdown markdown={analysisData.analysis_report} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Component to render markdown analysis report
function AnalysisReportMarkdown({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const elements: JSX.Element[] = [];
  let currentParagraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = (key: string) => {
    if (currentParagraph.length > 0) {
      // Process the paragraph - handle pipe-separated content as structured data
      const text = currentParagraph.join(" ");
      
      // Check if it's a pipe-separated data line (metric report format)
      if (text.includes("|") && !text.startsWith("|")) {
        const parts = text.split("|").map(p => p.trim()).filter(p => p);
        if (parts.length >= 3) {
          elements.push(
            <div key={key} className="py-3 border-l-2 border-primary/30 pl-4 my-3 bg-muted/30">
              <div className="font-medium text-sm">{parts[0]}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {parts.slice(1).map((part, idx) => (
                  <span key={idx}>
                    {idx > 0 && <span className="mx-2 text-border">•</span>}
                    {part}
                  </span>
                ))}
              </div>
            </div>
          );
          currentParagraph = [];
          return;
        }
      }
      
      // Regular paragraph with bold text support
      const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      elements.push(
        <p 
          key={key} 
          className="my-3 text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedText }}
        />
      );
      currentParagraph = [];
    }
  };

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="my-4 space-y-2">
          {listItems.map((item, idx) => {
            const processedItem = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return (
              <li 
                key={idx} 
                className="text-muted-foreground text-sm pl-4 border-l-2 border-primary/20"
                dangerouslySetInnerHTML={{ __html: processedItem }}
              />
            );
          })}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip table separator lines
    if (line.match(/^\|[-:\s|]+\|$/)) {
      continue;
    }

    // Handle proper markdown tables
    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph(`p-before-table-${i}`);
      flushList(`list-before-table-${i}`);
      
      // Collect all table rows
      const tableRows: string[][] = [];
      let j = i;
      while (j < lines.length) {
        const tableLine = lines[j].trim();
        if (!tableLine.startsWith("|") || !tableLine.endsWith("|")) break;
        if (!tableLine.match(/^\|[-:\s|]+\|$/)) {
          const cells = tableLine.split("|").slice(1, -1).map(c => c.trim());
          tableRows.push(cells);
        }
        j++;
      }
      
      if (tableRows.length > 1) {
        const headers = tableRows[0];
        const dataRows = tableRows.slice(1);
        
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {headers.map((h, idx) => (
                    <th
                      key={idx}
                      className="text-left font-medium text-muted-foreground text-xs uppercase tracking-wider py-2 px-3 border-b border-border bg-muted/50"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className={`py-2.5 px-3 border-b border-border/50 ${cellIdx === 0 ? "font-medium" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        i = j - 1;
        continue;
      }
    }

    // Handle headings
    if (line.startsWith("#")) {
      flushParagraph(`p-${i}`);
      flushList(`list-${i}`);
      
      const match = line.match(/^(#+)\s*(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const className = level === 1 
          ? "text-2xl font-semibold mt-6 mb-3" 
          : level === 2 
          ? "text-xl font-semibold mt-5 mb-2" 
          : "text-lg font-medium mt-4 mb-2";
        
        elements.push(
          <div key={`h-${i}`} className={className}>{text}</div>
        );
      }
    }
    // Handle list items
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph(`p-${i}`);
      listItems.push(line.substring(2));
    }
    // Regular content
    else if (line) {
      flushList(`list-${i}`);
      currentParagraph.push(line);
    }
    // Empty line
    else {
      flushParagraph(`p-${i}`);
      flushList(`list-${i}`);
    }
  }

  flushParagraph("p-final");
  flushList("list-final");

  return <div className="prose-sm max-w-none">{elements}</div>;
}

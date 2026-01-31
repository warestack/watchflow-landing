import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRuleFeasibility } from "@/hooks/use-rule-feasibility";
import { Copy, Check, Download, Loader2, CheckCircle, Info } from "lucide-react";

interface RuleFeasibilitySectionProps {
  initialRule?: string;
}

export function RuleFeasibilitySection({ initialRule }: RuleFeasibilitySectionProps) {
  const [ruleText, setRuleText] = useState(initialRule || "");
  const { checkFeasibility, isLoading, error, result, feedback, reset } = useRuleFeasibility();
  const [copied, setCopied] = useState(false);

  // Sync with parent's initialRule
  useEffect(() => {
    if (initialRule) {
      setRuleText(initialRule);
    }
  }, [initialRule]);

  const handleCheck = async () => {
    if (!ruleText.trim()) {
      return;
    }
    await checkFeasibility(ruleText);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
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

  const handleReset = () => {
    reset();
    setRuleText("");
  };

  return (
    <section id="feasibility" className="py-16 md:py-24 border-b border-border">
      <div className="container max-w-5xl">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Rule Validation
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Rule feasibility check
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Validate if a natural language rule can be implemented. Test rules before adopting them.
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label htmlFor="ruleInput" className="block text-sm font-medium mb-2">
                Rule Description
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Textarea
                  id="ruleInput"
                  placeholder="Describe a rule in natural language, e.g.: PRs must reference a linked issue in the description"
                  value={ruleText}
                  onChange={(e) => setRuleText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleCheck();
                    }
                  }}
                  className="flex-1 min-h-[80px] font-mono text-sm rounded-none"
                  rows={3}
                />
                <Button
                  onClick={handleCheck}
                  disabled={isLoading || !ruleText.trim()}
                  className="rounded-none self-start"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Check Feasibility
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Press Ctrl+Enter to check
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-none">
                <div className="font-semibold mb-1">Rule not supported</div>
                <div className="text-sm">{error}</div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {/* Feedback/Context Section */}
                {feedback && (
                  <div className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-none">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Implementation Context</span>
                      <p className="text-sm text-foreground/80 leading-relaxed">{feedback}</p>
                    </div>
                  </div>
                )}

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
                        onClick={handleCopy}
                        className="rounded-none"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="ml-1">{copied ? "Copied" : "Copy"}</span>
                      </Button>
                    </div>
                  </div>
                  <pre className="code-block p-4 overflow-x-auto text-xs leading-relaxed rounded-none">
                    <code>{result}</code>
                  </pre>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={handleDownload} className="rounded-none">
                    <Download className="h-4 w-4 mr-2" />
                    Download YAML
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="rounded-none">
                    Check Another Rule
                  </Button>
                  <a
                    href="https://github.com/apps/watchflow"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="rounded-none">
                      Install Watchflow
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

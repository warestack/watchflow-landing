import * as React from "react";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const exampleRules = [
  {
    rule: "PRs must reference a linked issue in the description or title (e.g. Fixes #123).",
    title: "Require Linked Issue",
    severity: "high" as const,
    description: "PRs must reference a linked issue in the description or title (e.g. Fixes #123).",
    insight: "PRs without issue context are harder to review and track.",
    metrics: ["Unlinked issue rate", "require_linked_issue"],
  },
  {
    rule: "When a PR modifies paths with CODEOWNERS, those owners must be added as reviewers.",
    title: "Require Code Owner Reviewers",
    severity: "high" as const,
    description: "When a PR modifies paths with CODEOWNERS, those owners must be added as reviewers.",
    insight: "Ensures designated code owners are requested as reviewers for the files they own.",
    metrics: ["CODEOWNERS", "require_code_owner_reviewers"],
  },
  {
    rule: "PR total lines changed must not exceed a maximum (e.g. 500 lines).",
    title: "Max PR Size (LOC)",
    severity: "medium" as const,
    description: "PR total lines changed must not exceed a maximum (e.g. 500 lines).",
    insight: "Large PRs are harder to review; cap size to keep reviews focused.",
    metrics: ["Average PR size", "max_pr_loc"],
  },
  {
    rule: "PR titles must follow a pattern (e.g. feat:, fix:, docs:) and descriptions must align diff.",
    title: "Title Pattern & Align Diff",
    severity: "medium" as const,
    description: "PR titles must follow a pattern (e.g. feat:, fix:, docs:) and descriptions must align diff.",
    insight: "Conventional titles and descriptions that match the change improve traceability.",
    metrics: ["title_pattern", "min_description_length"],
  },
];

interface ExampleRulesProps {
  onRuleSelect: (rule: string) => void;
}

const ExampleRules = React.forwardRef<HTMLElement, ExampleRulesProps>(
  ({ onRuleSelect }, ref) => {
    return (
      <section ref={ref} id="example-rules" className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-5xl">
          <div className="space-y-12">
            {/* Section Header */}
            <div className="space-y-4">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Example Rules
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Try these example rules
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Click on any rule below to test its feasibility. These are common patterns used in
                high-volume repositories.
              </p>
            </div>

            {/* Rules Grid — same effect as Manage token tooltip: bg-popover, border, shadow-lg, no rounded corners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleRules.map((example, index) => (
                <button
                  key={index}
                  onClick={() => onRuleSelect(example.rule)}
                  className="group relative overflow-hidden rounded-none border border-border bg-popover p-6 text-left transition-all duration-200 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {/* Accent bar on hover */}
                  <span className="absolute left-0 top-0 h-full w-1 bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden />
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-base font-semibold tracking-tight text-foreground flex-1">
                        {example.title}
                      </h3>
                      <Badge
                        variant={example.severity === "high" ? "destructive" : "warning"}
                        className="text-xs font-medium uppercase tracking-wide rounded-none border shrink-0"
                      >
                        {example.severity}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {example.description}
                    </p>

                    <div className="flex items-start gap-2 rounded-none border border-border bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground transition-colors group-hover:bg-primary/5 group-hover:border-primary/20">
                      <Zap className="h-3.5 w-3.5 mt-0.5 text-warning flex-shrink-0" />
                      <span>{example.insight}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {example.metrics.map((metric, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs font-mono rounded-none border border-border/80 bg-background/80"
                        >
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
);
ExampleRules.displayName = "ExampleRules";

export { ExampleRules };

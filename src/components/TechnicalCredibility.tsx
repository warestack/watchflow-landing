import { Code, Cpu, FileSearch, GitCompare, MessageSquare, TestTube } from "lucide-react";

const capabilities = [
  {
    icon: GitCompare,
    title: "Diff-Aware Validation",
    description: "Understands the actual code changes, not just PR metadata. Detects risky modifications in context.",
  },
  {
    icon: TestTube,
    title: "Test Coverage Intelligence",
    description: "Tracks coverage trends over time. Flags PRs that decrease coverage without justification.",
  },
  {
    icon: FileSearch,
    title: "Semantic Issue-Diff Alignment",
    description: "Validates that PR changes actually address the linked issue. Catches mismatched or unrelated diffs.",
  },
  {
    icon: Cpu,
    title: "Agentic Reasoning",
    description: "Uses repository context — not generic rules — to generate targeted, explainable recommendations.",
  },
  {
    icon: MessageSquare,
    title: "Explainable Feedback",
    description: "Every check includes clear reasoning. No black-box AI decisions. Maintainers know exactly why.",
  },
  {
    icon: Code,
    title: "Config-as-Code",
    description: "All rules stored in .watchflow/rules.yaml. Version controlled, reviewable, auditable.",
  },
];

export function TechnicalCredibility() {
  return (
    <section id="technical" className="py-16 md:py-24 border-b border-border">
      <div className="container max-w-5xl">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Technical Details
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              How Watchflow works
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Built for engineers who care about the details. Every feature is designed 
              for transparency, control, and minimal overhead.
            </p>
          </div>

          {/* Capabilities Grid - 3 items per row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((capability) => (
              <div key={capability.title} className="space-y-3">
                <div className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center">
                  <capability.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">{capability.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

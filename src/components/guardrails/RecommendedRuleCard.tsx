import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ParsedRule } from "@/utils/yaml-parser";

interface RecommendedRuleCardProps {
  rule: ParsedRule;
  reasoning?: string;
  triggers: string[];
}

export function RecommendedRuleCard({ rule, reasoning, triggers }: RecommendedRuleCardProps) {
  return (
    <div className="p-4 border border-border rounded-none border-l-4 border-l-primary">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="font-medium text-sm flex-1">{rule.description}</div>
        <Badge
          variant={rule.severity === "high" || rule.severity === "critical" ? "destructive" : "warning"}
          className="text-xs uppercase rounded-none"
        >
          {rule.severity}
        </Badge>
      </div>
      {reasoning && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
          <Zap className="h-3.5 w-3.5 mt-0.5 text-warning flex-shrink-0" />
          <span>{reasoning}</span>
        </div>
      )}
      {triggers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {triggers.map((trigger, idx) => (
            <Badge key={idx} variant="muted" className="text-xs rounded-none">
              {trigger}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

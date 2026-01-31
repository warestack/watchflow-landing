export interface ParsedRule {
  description: string;
  enabled: boolean;
  severity: string;
  event_types: string[];
  parameters?: Record<string, any>;
}

export function extractRecommendationsFromYAML(yamlText: string): ParsedRule[] {
  try {
    if (!yamlText || typeof yamlText !== "string") {
      return [];
    }

    const lines = yamlText.split("\n");
    const recommendations: ParsedRule[] = [];
    let currentRule: Partial<ParsedRule> | null = null;
    let inRulesBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if we're in the rules block
      if (line.startsWith("rules:")) {
        inRulesBlock = true;
        continue;
      }

      if (!inRulesBlock) continue;

      if (line.startsWith("- description:") || line.match(/^-\s+description:/)) {
        if (currentRule && currentRule.description) {
          recommendations.push({
            description: currentRule.description,
            enabled: currentRule.enabled ?? true,
            severity: currentRule.severity || "medium",
            event_types: currentRule.event_types || [],
            parameters: currentRule.parameters || {},
          });
        }
        const descMatch = line.match(/description:\s*(.+)/);
        const description = descMatch
          ? descMatch[1].trim().replace(/^["']|["']$/g, "")
          : "";
        currentRule = {
          description: description,
          severity: "medium",
          event_types: [],
          parameters: {},
        };
      } else if (currentRule) {
        if (line.startsWith("severity:")) {
          const severityMatch = line.match(/severity:\s*(.+)/);
          if (severityMatch) {
            currentRule.severity = severityMatch[1]
              .trim()
              .replace(/^["']|["']$/g, "")
              .toLowerCase();
          }
        } else if (line.startsWith("enabled:")) {
          const enabledMatch = line.match(/enabled:\s*(.+)/);
          if (enabledMatch) {
            currentRule.enabled = enabledMatch[1].trim().toLowerCase() === "true";
          }
        } else if (line.startsWith("event_types:")) {
          // Parse event types
          let j = i + 1;
          const eventTypes: string[] = [];
          while (
            j < lines.length &&
            (lines[j].trim().startsWith("-") || lines[j].trim() === "")
          ) {
            const etLine = lines[j].trim();
            if (etLine.startsWith("-")) {
              const et = etLine.replace(/^-|["']/g, "").trim();
              if (et) {
                eventTypes.push(et);
              }
            }
            j++;
          }
          currentRule.event_types = eventTypes;
        }
      }
    }

    // Add the last rule
    if (currentRule && currentRule.description) {
      recommendations.push({
        description: currentRule.description,
        enabled: currentRule.enabled ?? true,
        severity: currentRule.severity || "medium",
        event_types: currentRule.event_types || [],
        parameters: currentRule.parameters || {},
      });
    }

    return recommendations;
  } catch (error) {
    console.error("Error parsing YAML:", error);
    return [];
  }
}

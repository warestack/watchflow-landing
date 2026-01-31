import { Bot, AlertTriangle, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const challenges = [
  {
    icon: Bot,
    title: "AI increases PR volume, not signal",
    description: "Tools like Copilot, Claude, and Cursor generate PRs faster than ever — but context and intent don't scale with volume.",
  },
  {
    icon: AlertTriangle,
    title: "Maintainers drown in low-context changes",
    description: "Generic commit messages, missing issue links, and unreviewable diffs slow down merge velocity.",
  },
  {
    icon: Shield,
    title: "Watchflow acts as an immune system",
    description: "Surface low-signal PRs, flag missing intent, detect mismatched issues, and identify unreviewable changes automatically.",
  },
];

const signals = [
  "Low-signal PRs",
  "Missing intent/context",
  "Mismatched issue links",
  "Unreviewable diff size",
  "AI-generated patterns",
  "Bypassed reviews",
];

export function AINoiseSection() {
  return (
    <section id="ai-flood" className="py-16 md:py-24 border-b border-border bg-background">
      <div className="container max-w-5xl">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="space-y-4">
            <Badge variant="warning" className="gap-1.5 rounded-none">
              <Zap className="h-3 w-3" />
              For OSS Maintainers
            </Badge>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Built for the AI Flood
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              As AI coding assistants proliferate, maintainers face unprecedented PR volume. 
              Watchflow helps you separate signal from noise.
            </p>
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <div key={challenge.title} className="space-y-3">
                <div className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center">
                  <challenge.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">{challenge.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {challenge.description}
                </p>
              </div>
            ))}
          </div>

          {/* Signals Detected */}
          <div className="panel p-6 rounded-none">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-base">Watchflow detects:</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically surface these patterns in incoming PRs
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {signals.map((signal) => (
                  <Badge key={signal} variant="muted" className="text-xs rounded-none gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                    {signal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

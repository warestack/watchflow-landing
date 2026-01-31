import { AnalysisResponse } from "@/hooks/use-repo-analysis";

export function generateMockAnalysisData(): AnalysisResponse {
  return {
    rules_yaml: `rules:
  - description: "Changes to critical files require review from code owners"
    enabled: true
    severity: "high"
    event_types: ["pull_request"]
    parameters:
      critical_owners: []
  
  - description: "PRs must reference a linked issue (e.g. Fixes #123)"
    enabled: true
    severity: "high"
    event_types: ["pull_request"]
    parameters:
      require_linked_issue: true
  
  - description: "PR total lines changed must not exceed a maximum"
    enabled: true
    severity: "medium"
    event_types: ["pull_request"]
    parameters:
      max_lines: 1000`,
    pr_plan: {
      title: "Add Watchflow Governance Rules",
      body: "## Add Watchflow Governance Rules\n\nThis PR adds automated governance rules based on repository analysis.",
      branch_name: "watchflow/rules",
      base_branch: "main",
      file_path: ".watchflow/rules.yaml",
      commit_message: "chore: add Watchflow governance rules (3 rules)",
      markdown: "### Watchflow: Automated Governance Plan\n\n- **Rule:** Changes to critical files require review from code owners\n- **Rule:** PRs must reference a linked issue (e.g. Fixes #123)\n- **Rule:** PR total lines changed must not exceed a maximum",
    },
    analysis_summary: {
      codeowner_bypass_rate: 0.15,
      unlinked_issue_rate: 0.28,
      ci_skip_rate: 0.05,
      ai_generated_rate: 0.12,
      new_code_test_coverage: 0.65,
      average_pr_size: 35,
      first_time_contributor_count: 3,
      issue_diff_mismatch_rate: 0.08,
      ghost_contributor_rate: 0.10,
    },
    analysis_report: `## Repository Analysis

Analysis of repository health, risks, and trends based on recent PR history:

| Metric | Value | Severity | Category | Explanation |
|--------|-------|----------|----------|-------------|
| Unlinked PR Rate | 28% | Medium | Quality | Some PRs lack issue references. Consider enforcing issue links for better traceability. |
| Average PR Size | 35 | Low | Efficiency | Large PRs (35 files changed) may benefit from splitting. |
| First-Time Contributor Count | 3 | Low | Community | 3 new contributors observed. Consider outreach to grow the community. |
| CI Skip Rate | 5% | Low | Quality | CI checks are consistently enforced. Good practice. |
| CODEOWNERS Bypass Rate | 15% | Low | Compliance | CODEOWNERS requirements are well-enforced. |
| New Code Test Coverage | 65% | Medium | Quality | Moderate test coverage (65%). Consider increasing test coverage. |
| Issue Diff Mismatch Rate | 8% | Low | Quality | Good alignment between issues and code changes. |
| Ghost Contributor Rate | 10% | Low | Community | Good contributor engagement with review processes. |
| AI Generated Rate | 12% | Medium | Quality | Some AI-generated content detected (12%). Consider review processes.`,
    rule_reasonings: {
      "Changes to critical files require review from code owners": "15% of PRs bypass CODEOWNER review, indicating need for stricter enforcement on critical paths.",
      "PRs must reference a linked issue (e.g. Fixes #123)": "28% of PRs lack issue context, making them harder to review and track.",
      "PR total lines changed must not exceed a maximum": "Average PR size is 35 files. Capping LOC helps keep reviews focused and quality high.",
    },
  };
}

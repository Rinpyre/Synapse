# Issue and Task Standards

Use this format when creating or refining GitHub issues.

## Workflow

1. Check available labels before creating or updating an issue.
2. Create the issue with clear scope and acceptance criteria.
3. Apply only labels that currently exist in the repository.
4. Do not manually add the issue to the GitHub Projects board by default; new issues are auto-added.
5. Set project item fields (`Sprint`, `Estimates (h)`, `Priority`) from the board item, not from issue body content.

## Label Discovery

Always check labels first:

```bash
gh label list --repo Rinpyre/Synapse --limit 200
```

Current commonly used labels include:

- area labels: `Backend`, `Front-end`, `UI / UX`, `AI / ML`, `config`
- type labels: `bug`, `enhancement`, `documentation`, `question`

## Title Guidelines

- Use an imperative, action-first title.
- Keep it concise and outcome-oriented.
- Prefer specific scope in the title.

Examples:

- `Build AI Analysis Page UI`
- `Design Log Filtering and Search Strategy`
- `Add SQL Server database connection to Laravel`

## Body Template

Use this structure by default (aligned with issues #13 to #16):

```md
## Summary

[What needs to be delivered and why]

## [Task-Focused Details]

[Use a concrete section title that matches the task focus, for example:
Model Structure and Database Integration,
Query Interface and Results Layout,
Conversation Interface Design,
Filter Requirements and User Experience]

## Acceptance Criteria

- [Observable outcome 1]
- [Observable outcome 2]

## Notes

- [Optional constraints, dependencies, technical caveats]
```

## Section Usage Rules

- `Summary` is required.
- One task-focused detail section is required and should be explicitly named.
- `Acceptance Criteria` is required for implementation work.
- `Notes` is optional but recommended for dependencies, assumptions, or constraints.

## Acceptance Criteria Quality

- Write criteria that can be verified without interpretation.
- Prefer behavior/outcome statements over implementation details.
- Include validation expectations when relevant (for example, command output or UI states).

## Project Fields and CLI Fallback

- `Sprint`, `Estimates (h)`, and `Priority` are project-board item fields.
- If `gh project` commands fail, use `gh api graphql` as fallback to update project item fields.

## Consistency Reference

Recent issues in this repository typically follow:

- concise action-oriented title
- `## Summary`
- one named task-focused details section
- `## Acceptance Criteria`
- optional `## Notes`

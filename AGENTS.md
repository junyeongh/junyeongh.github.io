# Instructions AI agents

## Commit Convention

When an AI agent materially assists with a commit, add an attribution footer after the commit body.

Use this exact format:

```text
Assisted-by: <agent-name> <model>:<effort> (thinking)
```

- Replace `<agent-name>` with the assisting agent's own name.
- Replace `<model>` with the model identifier and `<effort>` with the reasoning effort used for the work.
- Include `(thinking)` when thinking mode was used; otherwise omit it.
- Resolve `<model>` and `<effort>` from the assisting agent's own session state, never from inference or memory. Read the session transcript, not persisted configuration.
  - Codex: the active transcript in `$CODEX_HOME/sessions` (`model`, `reasoning_effort`).
  - Claude Code: the active transcript in `~/.claude/projects/<sanitized-cwd>/<session-id>.jsonl` (`model`, `effort`).
- If the agent cannot read a value from that source, ask rather than guessing.

Examples:

- `Assisted-by: claude-code claude-opus-5:high (thinking)`
- `Assisted-by: claude-code claude-opus-5:medium`
- `Assisted-by: codex gpt-5.6-terra:high (thinking)`
- `Assisted-by: codex gpt-5.6-terra:medium`

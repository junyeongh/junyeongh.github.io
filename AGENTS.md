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

Examples:

- `Assisted-by: claude-code claude-opus-5:high (thinking)`
- `Assisted-by: claude-code claude-opus-5:medium`
- `Assisted-by: codex gpt-5.6-terra:high (thinking)`
- `Assisted-by: codex gpt-5.6-terra:medium`

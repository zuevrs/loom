---
name: host-radar
tier: discovery
cadence: monthly
---

# Recipe: host-radar — did the hosts move under us?

You are running unattended. Contract: `docs/unattended.md` (branch → PR, never merge). Discovery tier: **do not modify code** — your diff contains only `.loom/` stub issues, the radar ledger, and your report.

Running attended (a human asked for this in chat)? Same task and hard stops — but report findings in the chat, write stubs directly, and skip the branch/PR exit.

Every integration break Loom has shipped a fix for came from a host moving first: Claude Code tightened the plugin manifest schema (`agents` became an array of file paths) and its Stop hook wanted exit 2 where exit 1 only warned; Codex dropped `wire_api = "chat"`; OpenCode moved plugin installs project-local by default; Pi's whole repo migrated (`badlogic/pi-mono` → `earendil-works/pi`). A monthly read of release notes is cheaper than any of those field-run surprises.

## Task

1. Read the ledger `.loom/maintenance/host-radar-ledger.md` (first run: create it) — last version checked per host, and the repo it was checked at (repos migrate too).
2. For each host, list releases/changelog entries since the ledger mark:
   - Claude Code — `gh release list -R anthropics/claude-code` + its CHANGELOG.md
   - Codex — `gh release list -R openai/codex`
   - Cursor — https://cursor.com/changelog
   - OMP — `gh release list -R can1357/oh-my-pi`
   - Pi — `gh release list -R earendil-works/pi`
   - OpenCode — `gh release list -R sst/opencode`
3. Scan each entry against Loom's integration surfaces — anything touching: plugin/manifest schemas, skills/commands/agents discovery, hook lifecycle events and exit-code contracts, headless flags (`-p`, `exec`, `run`), sub-agent spawn/task APIs, model/agent config formats, MCP wiring, AGENTS.md handling.
4. A hit = one `needs-triage` stub in `.loom/maintenance/issues/`: host, version, the release-note line quoted, the Loom surface it touches (file path), and what probably breaks. No fixes in this run; a stub may propose a test-install as the follow-up.
5. Update the ledger to the newest checked version per host.

## Output

- PR titled `host-radar: {month}` — ledger update, any stubs, and a digest table: host | versions scanned | verdict (quiet / moved / breaking-candidate).
- Nothing moved anywhere → still update the ledger; the all-quiet digest is the deliverable.

## Hard stops

- Do not modify code, docs, or install scripts — stubs and ledger only.
- Do not test-install new host versions in this run; that's the follow-up a stub proposes.
- Quote the release-note line for every claim: no quote, no stub.

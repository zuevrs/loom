# Loop Safety Policy

## Denylist paths

<!-- Files/dirs the loop must NEVER modify unattended -->
- `.env*`
- `**/credentials*`
- `**/secrets*`

## Human-gate required actions

- Deleting files
- Changing CI/CD configuration
- Modifying security-sensitive code

## Auto-merge policy

`disabled`

## Connector permissions

| Connector | Read | Write | Notes |
|-----------|------|-------|-------|
| git       | yes  | branch only | Never push to main |

## Escalation triggers

- Any finding with severity `high` or above
- Verification failure after retry
- Ambiguous intent (stop-and-ask)

## Kill switch

To stop all loops: remove `.loom/loops/` or set `enabled: false` in each config.

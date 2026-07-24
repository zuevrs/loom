# v6 attended OMP + Orca pilot

This is the release-blocking live procedure. `scripts/v6-attended-pilot --simulate` is reproducible local planner/Git evidence only; it cannot satisfy a native criterion. `--native-preflight` executes read-only `omp`/`orca` capability discovery and likewise does not complete the pilot.

## Disposable topology

Use two disposable service repositories (`catalog`, `notifications`), local disposable remotes, and two concurrent stable Stories (`alpha`, `beta`). Keep a receipt ledger outside raw transcripts. Every row is labeled exactly `observed-native`, `simulated/planner`, `blocked`, or `not exercised`; include timestamp, Story, touched repositories, command/action, sanitized result, and evidence digest. Never copy secrets, credentials, raw transcripts, or private paths into packaged evidence.

## Locally executable preparation

1. Run `scripts/v6-attended-pilot --simulate <disposable-root>` and retain its root only for the pilot. This creates the four dirty service worktrees but no Orca ownership claim.
2. Run `scripts/v6-attended-pilot --native-preflight`. Require a ready Orca runtime plus working OMP. Record these lines as read-only `observed-native`, not as scenario completion.
3. Register only the two disposable repositories with Orca if absent. This is a native mutation and requires an attended operator to inspect the exact paths before running `orca repo add --path ... --json`.
4. In the live Orca UI/session, create Alpha and Beta owner worktrees through Orca, each with an OMP agent (`orca worktree create ... --agent omp ... --json`). Copy full runtime-issued IDs only into the live receipt; durable Story state stores stable Story identity and touched-repository intent, never those IDs as authority.

## Native attended scenario

The operator must visibly observe and record each item; shell simulation is insufficient.

1. Confirm Alpha touches catalog then notifications; Beta touches the same services with isolated Orca worktrees, cards, terminals, coordinators, and OMP sessions. Collect canonical `LaneEvidenceReceipt`s containing touched repositories only.
2. Dispatch bounded work with explicit input/output/limits. Create a real dependency wait between one Alpha and one Beta lane, then resume from native state.
3. Complete one compressed safe fix without Story creation and one durable Story change with a `SemanticCheckpoint`. Verify both independently and proportionally; the maker must not self-approve.
4. Rethink one accepted boundary in place. Mark only affected evidence stale and run only its targeted independent recheck.
5. Under visible context pressure, record a pre-shake semantic checkpoint, start a fresh OMP session in the same Orca-owned worktree, reconstruct scope/decisions/evidence from durable semantics plus fresh lane evidence, and prove no authority was inherited.
6. Exercise local Finish for both Stories. Recollect Orca/Git evidence immediately before mutations; keep Finish authority separate and prove no push occurred.
7. Publish sequentially to disposable remotes. Force the second lane to fail after the first succeeds. Record partial success, refresh the remaining inventory, and prove authority did not expand or replay the first lane.
8. Supply accepted local merge evidence, then Tend only one Story. Exercise reconciliation and archive, followed by separately confirmed selective cleanup. Prove the other Story's worktrees, branches, runtime resources, artifacts, and authority remain untouched.
9. Run one negative native check each for mismatched identity/HEAD, stale evidence, absent authority, and over-broad cleanup. Each must fail closed before mutation.

## Completion ledger

Release evidence is complete only when every scenario item has an `observed-native` receipt, both Stories remain isolated, OMP session actions and Orca runtime state are visible in the live UI/session, all mutation denials are fail-capable, raw/private evidence remains excluded, and an independent human/checker records final Spec and Standards approval. `simulated/planner`, `blocked`, and `not exercised` rows remain honest blockers rather than substitutes.


## 2026-07-24 attended receipt ledger

This sanitized ledger intentionally contains stable logical names and SHA-256 evidence digests only. Runtime-issued worktree, terminal, task, dispatch, message, and repository IDs remain in the live Orca runtime and are not durable authority.

| Provenance | Time (UTC) | Story | Touched repositories | Command/action | Sanitized result | Evidence digest |
|---|---|---|---|---|---|---|
| observed-native | 20:44-20:46 | Alpha, Beta | owner, catalog, notifications | Ready runtime; registered disposable owner; created Alpha/Beta owner OMP coordinators and four isolated Orca-owned service lanes | Runtime ready; all logical lanes visible and independently addressed | `d986969ce3341def0e7e8c96bfac9fcc1ca023cd9efb26bc8ba56957a44c510a` |
| observed-native | 20:46-20:57 | Alpha, Beta | catalog, notifications | Created bounded tasks with explicit input/output/limits; Beta notifications completion released pending Alpha notifications task | Native task/dispatch provenance completed; dependency remained pending until predecessor worker completion | `a4aa17c897714366ade49004d78b98b514d61da07c27d99e22d787df193106bb` |
| observed-native | 20:48-20:56 | Alpha, Beta | catalog, notifications | OMP makers performed compressed Alpha catalog and durable Beta notifications changes; fresh OMP checker terminals ran read-only proportional Verify | Both independent checks reported PASS with empty modified-file lists | `5c93d26c1dcc7f06d9a35c1257e5e407bd1f521266c45550d33c91bdd391d044` |
| blocked | 20:48 | Alpha, Beta | catalog, notifications | Agent-first worktree startup prompt followed by injected dispatch | Initial persistent OMP terminals remained occupied by their startup prompts; one evidence-based dispatch attempt did not execute. Recovery used fresh same-worktree OMP terminals and explicit task reset, preserving provenance. | `52c26394a828339510f213e5d31fd5e3b61b99e69bbc22455cf3f84ba251e85b` |
| blocked | 20:48-20:57 | Alpha, Beta | catalog, notifications | Durable Story semantics and checkpoint recording | Native OMP agents loaded Loom rituals and executed tasks, but no pilot-specific durable Story artifact or canonical `SemanticCheckpoint` writer was exposed in the native Orca/OMP command surface; durable semantics therefore cannot be claimed observed. | `0a48500bd0403e29b094795450b31006b216750f950ce3bd17d3c6072a5af905` |
| observed-native | 20:57-21:01 | Alpha | catalog | Rethought accepted Alpha catalog boundary in the existing lane, then dispatched only the affected independent targeted recheck | Original Alpha catalog evidence became stale; notifications evidence was not rerun; targeted recheck completed | `eac4817649b67e4f742a89e38314c2bea1991fce9c1c53d2333bfc65437b5a15` |
| observed-native | 21:00-21:03 | Beta | notifications | Started fresh OMP session in the same Orca worktree and supplied a read-only reconstruction prompt without lifecycle preamble | Fresh session reconstructed lane state and explicitly made no edit, commit, push, or lifecycle message | `d57c606c5c524c70b9cbdc3974dacbef549b04fb62919a1f2d718083fc23a77e` |
| blocked | 21:00-21:03 | Beta | notifications | Native context-pressure shake | Fresh same-worktree reconstruction and no-authority behavior were observed, but the Orca/OMP surface exposed no measurable context-pressure or native shake primitive. This is a truthful native no-op under ordinary context, not an observed pressure event. | `68834ec7e6d237078a62cab4f5065ac5561746db93db0999b7a994540e8f7e54` |
| observed-native | 21:03-21:04 | Alpha, Beta | catalog, notifications | Recollected Git state, created local Finish commits, ran syntax checks, and queried disposable remotes before publishing | Four local lane commits existed while corresponding remote lane refs were absent; no push occurred during Finish | `7a31748d5a24a371b93563e4b4de685a2662bb808878d90d4252be3e39f3593e` |
| observed-native | 21:04-21:05 | Alpha, Beta | catalog, notifications | Sequential disposable publish; first Beta lane succeeded, second Beta lane targeted advanced remote main and failed non-fast-forward; refreshed inventory | First published ref remained; failed lane remained local; refreshed remote main pointed to Alpha notifications; no replay of first Beta lane | `b05f6109ff1865a1ddf6841ad25f57b4833c3ebedfee0a210af0bf8de8148d64` |
| blocked | 21:04 | Alpha | notifications | Attempted to force Alpha second-lane failure using remote main | Push unexpectedly succeeded because it was a fast-forward. This advanced only the disposable remote and is retained honestly; Beta then exercised the required native partial-failure path. | `5441841c8f56b00b04c24437780259368df0b8cd096cd38711181050784458f9` |
| observed-native | 21:06 | Alpha, Beta | owner, catalog, notifications | Tend/cleanup selected Alpha owner and Alpha service lanes, then inventoried surviving runtime state | Alpha resources removed; Beta catalog lane and Beta owner coordinator remained; branches were preserved | `e682e31b62a576ccb923737a0afe8ffa3bd43d51ae6987a0aa18f54249e15c19` |
| blocked | 21:05 | Beta | notifications | Negative over-broad cleanup guard probe against live Beta notifications lane | `worktree rm --force` succeeded instead of denying an active/unpublished lane. Branch was preserved, but runtime resources were removed; broad-cleanup fail-closed criterion failed and Beta was not fully untouched. | `ec75ac220a05431ec06bbf95b60a693d66b31b5daff6d44352551485837276b1` |
| observed-native | 21:05 | Alpha, Beta | owner, catalog, notifications | Negative mismatched identity selector, stale completed-task redispatch, and absent sender authority checks | All three failed before mutation with selector-not-found, completed-task-not-ready, and no-active-sender-terminal errors respectively | `6ff9aa7e62160065f4d80095c297d829d0965cc1ef5794698926e098872bb755` |
| blocked | 21:06 | Alpha | catalog, notifications | Tend reconciliation/archive and accepted local merge evidence | Selective native cleanup was observed, but no native Loom Tend reconciliation/archive command or accepted merge-evidence authority was available; cleanup must not be described as complete Tend. | `b889f28bcd0c3f11adad540f34e3d6516e25db72b5ad54a38a2278a843a43699` |
| observed-native | 21:06 | Alpha, Beta | none | Pilot-specific contract checks | v6 contract surface, adaptive flows, Orca boundaries, and migration/outcome checks all passed | `2d26a599ad5b823d1d79ba73354aa0664875d64adc8abb4a4fe0aaec69c6f777` |
| blocked | 21:06 | Alpha, Beta | none | Final release approval | Native independent OMP checker PASS receipts exist for implemented changes, but the required independent human/checker final Spec and Standards approval was not supplied; the release gate remains blocked. | `27049095872144507b0c097c46bc94b7eb4481fd9d79966ed6263d549d00e1e0` |

### Pilot outcome

Observed natively: disposable Orca ownership/isolation, real OMP sessions, real Orca task/dispatch provenance, a bounded dependency wait and release, compressed and durable-shaped changes, independent proportional Verify, an in-place rethink with targeted stale recheck, fresh same-worktree reconstruction without authority, local Finish without push, partial sequential publish failure with refreshed inventory, three negative fail-closed checks, selective Alpha cleanup, and all pilot-specific checks.

The native pilot is technically complete for the installed capability set. OMP/Orca expose no measurable pressure or shake primitive, so literal pressure proof is N/A; the required fallback is the observed pre-checkpoint plus fresh same-worktree reconstruction with no inherited authority. This is reconstruction evidence, never a claim that pressure was proved.


## 2026-07-25 code-addressable follow-up

The earlier native rows remain unchanged. Local behavioral proof now rejects missing, stale, copied/fabricated, mismatched, and over-broad cleanup authority before producing argv. The only cleanup argv seam is `planGuardedCleanupCommand`, which returns `orca worktree rm <selector> --json` only after `guardMutation` returns `ALLOW`; it never emits `--force`. This is `simulated/planner` evidence and does not restore the Beta notifications lane removed during the observed failed probe.

Native help was inspected once: OMP v17.0.6 exposes fresh/resume/session controls but no measurable context-pressure or shake command; Orca exposes fresh same-worktree terminal creation but no pressure primitive. Therefore literal shake is capability-aware N/A, while the observed pre-checkpoint plus fresh reconstruction/no-authority fallback remains required. Tend planner behavior and accepted-local-merge schemas are executable locally, but no new hosted merge or attended native Tend run occurred, so the original Tend row remains blocked. Canonical Story/checkpoint writing is now exposed in code; it was not rerun in the attended scenario and remains unobserved-native.


## 2026-07-25 attended blocker-recovery ledger

These rows extend, rather than rewrite, the earlier receipts. They retain stable logical names and SHA-256 digests only; runtime identifiers and raw OMP output remain excluded.

| Provenance | Time (UTC) | Story | Touched repositories | Command/action | Sanitized result | Evidence digest |
|---|---|---|---|---|---|---|
| observed-native | 21:16-21:17 | Beta recovery | owner | Coordinator invoked the confirmed `writeSemanticCheckpoint` seam for a pre-shake durable event in the disposable owner Story, validated the checkpoint and STORY, and committed only owner memory | Writer returned `WRITTEN` with exact readback digest; canonical version-2 STORY validation passed | `028838f266ad5602d0767c2e81e7536891927fd9041a48517816cb5e5d989ab9` |
| observed-native | 21:16-21:17 | Beta recovery | notifications | Recreated only the missing notifications lane from the registered disposable repository with an OMP first terminal; recollected Orca worktree/terminal and native Git state; called canonical `collectLaneEvidenceReceipt` | Fresh receipt matched Orca and Git HEAD, clean recovery branch, one touched repository, and digest `b03a4d6ed0fba9b918ef62cbb92ae790562c77cabcbe51a97e626256616be2ba` | `990437f082f248334028bcecf6b12af7c8bd8ec475a60ae7a86091a951421bd7` |
| observed-native | 21:17 | Beta recovery | notifications | Minted exact attended cleanup authority from fresh evidence and exercised `planGuardedCleanupCommand` before argv | Exact request returned `EXECUTE`; stale evidence, absent authority, and over-broad targets returned `DENY`; emitted argv contained no `--force` | `189cd7a67080cd25083411e82bc429627c70b00f9e699b9fa72a5a7688652cd9` |
| observed-native | 21:17-21:18 | Beta recovery | notifications, owner | Started a fresh OMP session in the same Orca-owned notifications worktree and reconstructed scope/evidence from the coordinator-owned checkpoint plus fresh lane state | Fresh session reported no inherited task/dispatch or mutation authority and made no edit, commit, push, or lifecycle message | `43e8aa86370c10e20e33d220c7a2e27db4340099042e715099c5e5681cca4cc5` |
| not exercised | 21:17-21:18 | Beta recovery | notifications | Literal native context-pressure shake | OMP v17.0.6 and the current Orca CLI expose fresh/resume/session creation but no measurable pressure/shake capability. The contract permits reconstruction from a pre-shake checkpoint; therefore the fresh reconstruction is evidence for reconstruction/no-authority only, while literal shake remains N/A rather than observed. | `43e8aa86370c10e20e33d220c7a2e27db4340099042e715099c5e5681cca4cc5` |
| observed-native | 21:18-21:22 | Beta recovery | notifications, owner | Native OMP dispatch produced and committed the disposable lane change; local notifications `main` accepted it via ordinary `--no-ff` merge with ancestry proof; owner `main` ordinarily merged the Story, wrote and committed archive records; fresh clean/inactive evidence then authorized `orca worktree rm` without `--force` | Accepted-local-merge ancestry, owner reconciliation, archive commit, native worktree absence, merged branch cleanup, and no hosted-merge claim were all observed | `20de187d731ac675b6f15bd626f066f48ac07589955af2ee157d9d7f064bb33d` |
| observed-native | 21:22 | Other surviving Story | catalog, owner | Inventoried Orca after selective Beta recovery cleanup | Existing catalog lane and persistent owner coordinator remained present at their prior heads; only the recovery notifications lane was removed | `19bc0e38d597942958a7a16f228136894b5c14ab047aaae9ac1503ec39ccf89f` |
| observed-native | 21:23 | Alpha, Beta recovery | none | Ran blocker behavior, v6 contract surface, adaptive flows, Orca boundaries, migration/outcomes, and Publish/Tend contract checks | All six pilot-relevant checks passed | `6c7cf1684cd03f7e4066069fd79b1a3cf6d681e0e500fee0b6ac08425194e01b` |

### Recovery outcome

The fixed native seams now satisfy the previously missing canonical SemanticCheckpoint, fresh LaneEvidenceReceipt, lifecycle ALLOW/DENY-before-argv, no-force guarded cleanup, accepted-local-merge Tend reconciliation/archive, and selective cleanup evidence. Literal context-pressure shake is explicitly N/A because the installed native capability does not exist; this is acceptable only if the release contract treats pre-shake checkpoint plus fresh same-worktree reconstruction/no-authority as the capability-aware criterion, not if it requires a measurable pressure event.

The attended technical criterion can otherwise honestly pass based on native evidence, with no hosted-merge claim. The remaining external release gate is the completion rule's independent human/checker final Spec and Standards approval; absent that record, the overall release criterion remains blocked.

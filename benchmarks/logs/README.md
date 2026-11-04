# Native vs Muse Code benchmark logs

Supporting run records for the [benchmark results](../../BENCHMARKS.md): **178 tasks**, **431 completed attempts**, and **5,754 artifact files**.

| Readout | Tasks | Native attempts | Muse Code attempts |
| --- | ---: | ---: | ---: |
| [Terminal-Bench 2.0](tb2/README.md) | 78 | 95 | 88 |
| [Terminal-Bench Pro · A](pro-a/README.md) | 39 | 55 | 57 |
| [Terminal-Bench Pro · B](pro-b/README.md) | 30 | 36 | 32 |
| [Terminal-Bench Pro · C](pro-c/README.md) | 31 | 33 | 35 |

Completed retries, graded failures and agent timeouts are retained. Interrupted or incomplete attempts and attempts without a completed reward record are excluded: five marked interrupted and nine without a completed reward. An attempt's presence here does not change the audited score-selection rules or make it a successful task.

## Browse the evidence

Each readout's task index links to its attempts. Run folders use stable identifiers; [manifest.json](manifest.json) maps them to the task, harness, original job name, trial folder and metadata records.

- `job.log`, `trial.log` and `result.json`: execution, exceptions and trial results.
- `agent/trebell-native-events.jsonl`, `trebell-native-tool-calls.jsonl`, `trebell-native-metrics.json`, `trebell-native.txt` and available final diffs: Native traces, tool calls and usage.
- `agent/muse-code.jsonl`, `muse-export.json` and `muse-usage.json`: Muse Code traces, exported sessions and usage.
- `verifier/test-stdout.txt`, `ctrf.json` and `reward.txt`: grader output, test results and rewards. Artifact availability varies by attempt; a timed-out agent may not have written its final metrics file.
- `records/`: launcher metadata, model settings, usage accounting and infrastructure status.

## Credential redactions

Credential-shaped values, including planted credentials in secret-recovery tasks, were replaced with stable `REDACTED…` markers in the publication copies. Encoded payloads were decoded, redacted and re-encoded where necessary. Numeric score and usage fields were preserved; redacted JSON may have been reserialized. Every changed artifact is identified in the manifest with redaction rules and counts.

The manifest records both the original artifact's SHA-256 and the published copy's SHA-256. Artifacts with no redactions retain their original bytes.

## Verify the files

[SHA256SUMS](SHA256SUMS) covers every artifact, index and manifest in this directory. From this directory, run:

```bash
sha256sum --check SHA256SUMS
```

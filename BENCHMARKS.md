# Trebell Native vs Muse Code

Recorded comparisons of **Trebell Native** and **Muse Code**, using the same Meta model, `muse-spark-1.3-contributor`, at **high** reasoning effort.

These four readouts were sealed on October 31 and November 2. Native changed between readouts, so each row reflects the Native configuration measured during that run.

## Results

**Across 178 recorded tasks, Native resolved 134 and Muse Code resolved 136.** Native's recorded cost was lower on equal-score tasks in every readout. Muse Code resolved two more tasks overall.

| Readout | Tasks | Native resolved | Muse Code resolved | Equal-score tasks | Native / Muse Code cost, with 95% bootstrap interval |
| --- | ---: | ---: | ---: | ---: | --- |
| Terminal-Bench 2.0 | 78 | 66 | 66 | 75 | **0.368×** · 0.306–0.428 |
| Terminal-Bench Pro · A | 39 | 26 | 27 | 37† | **0.266×** · 0.217–0.312 |
| Terminal-Bench Pro · B | 30 | 18 | 19 | 28 | **0.327×** · 0.225–0.433 |
| Terminal-Bench Pro · C | 31 | 24 | 24 | 31 | **0.291×** · 0.205–0.387 |

Cost ratios use only each readout's recorded equal-score cohort. A ratio of 0.368× means **63.2% lower cost**. The corresponding reductions in Pro A, B and C are **73.4%, 67.3% and 70.9%**.

† Pro A's recorded cost cohort includes `optimize-triton-rope-kernel`, on which neither lane ran the tests. Its zero outcomes and cost classification are preserved in the data; it provides no verified quality evidence.

The most recent readout, **Pro C**, had equal verifier results on all 31 tasks and 24 resolved by each harness. Native was cheaper on 30 tasks; Muse Code was cheaper on `optimize-urdf-robot-for-pybullet`.

The three Pro readouts cover **100 fresh tasks**, with **68 resolved by Native and 70 by Muse Code**. The 78 Terminal-Bench 2.0 tasks had previously been used to tune Native on another model. They are a regression comparison, so the 178-task collection is not an entirely unseen-task evaluation. Native also differed between the four readouts; the collection is not a single frozen-harness run.

## Quality differences

Resolution counts and granular verifier scores answer different questions. Two harnesses can both leave a task unresolved while passing different numbers of tests.

| Readout | Native better | Muse Code better |
| --- | --- | --- |
| Terminal-Bench 2.0 | `dna-insert`; `adaptive-rejection-sampler` | `polyglot-rust-c` |
| Pro A | `implement-depgraph-dependency-resolver` | `parse-bitcoin-tx-to-json` |
| Pro B | — | `fix-xor-neural-network-instability`; `minesweeper-safe-move-selector` |
| Pro C | — | — |

For example, Pro A's dependency-resolver task remained unresolved by both lanes, but Native passed 11/13 tests against Muse Code's 10/13. On the Bitcoin parser, Native's best was 14/15 while Muse Code reached 15/15. These differences are kept out of the equal-score cost comparison.

## Method

- **Same model and effort:** both lanes used `muse-spark-1.3-contributor` with high reasoning effort and the same Meta account/key. Credentials are not included in the evidence.
- **Harnesses:** Native used the application's shared Native configuration on the Meta provider. Muse Code used Meta's unmodified launcher, with web tools disabled and contributor mode enabled.
- **Quality first:** the task verifier's reward decides first, followed by the available test counts. A better quality result takes priority over cost. Lower cost decides only between equal recorded scores.
- **Retries:** a lane that was behind could receive up to three counted attempts in total, under the same rule for both harnesses. Reported quality is the best counted outcome; per-task cost is the mean across counted attempts. These are not single-attempt success rates.
- **Infrastructure:** power interruptions, environment failures and graders unable to install dependencies were reviewed and rerun without counting those launches as attempts. Agent timeouts and Native harness crashes counted as failed attempts. The ungraded Pro A row is disclosed above.
- **Accounting:** costs came from each lane's usage records, including Muse Code's background helpers. Independent verdict checks and cost recounts were recorded when each readout was sealed.

Muse Code's recorded launch settings were:

```bash
muse exec --json --yolo --disable-web-tools \
  --model muse-spark-1.3-contributor \
  --reasoning-effort high --contributor-mode on
```

## Cost accounting

The recorded contributor-mode prices per million tokens were **$0.10 uncached input**, **$0.002 cached input**, and **$0.20 output**. These are the historical calculator rates used for these readouts, not a claim about current billing.

```text
cost = ((input - cached_input) × 0.10
        + cached_input × 0.002
        + output × 0.20) / 1,000,000
```

Input totals include cached input. Some Muse Code helper requests were cancelled when a run ended, leaving their billing unknown. Those recorded costs are **lower bounds**, marked explicitly in the task data. No provider dashboard reconciliation is claimed. Ratios and bootstrap intervals above are the sealed readout figures; rounded task costs are unsuitable for reconstructing the exact intervals.

## Evidence and limits

[Task-level results](benchmarks/results/muse-code.json) include all **178 task rows**: each lane's best reward and test count, attempt scores, reported tokens, mean cost, lower-bound flags, retry waits and recorded verdict. Model settings, pricing assumptions and sealing dates are included in the same file.

| Readout | Sealed at, UTC |
| --- | --- |
| Terminal-Bench 2.0 | 2026-10-31 09:30 |
| Pro A | 2026-10-31 19:10 |
| Pro B | 2026-11-02 12:00 |
| Pro C | 2026-11-02 12:25 |

The included data records task outcomes and usage totals; original trial logs are not included. Pro C's `recover-prod-db-password-from-git-history` grader accepted an empty file because its planted password failed its own format; both lanes passed, so that task does not distinguish their quality. Interpret the savings alongside these limitations and the reported quality losses.

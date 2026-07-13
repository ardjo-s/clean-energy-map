# Repository instructions

## Product contract

- Read `docs/README.md`, `docs/product-constitution.md`, and
  `docs/verification-and-provenance-contract.md` before changing product,
  coverage, source, or uncertainty behavior.
- Preserve explicit `withheld` and `not_assessed` states. Do not replace
  evidence gaps with inferred coverage.

## Verification

- `npm run verify` is the canonical deterministic repository check.
- For data-pipeline changes, also run `npm run ingest:data` and confirm
  `git diff --exit-code -- public/data`.
- For browser-flow changes, run `npm run test:e2e`.

## Git delivery

Read `.github/AGENT_PR_WORKFLOW.md` immediately before commit, push, or
pull-request work. Do not load it for ordinary repository work.

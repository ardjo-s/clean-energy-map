# Contributing

Thank you for helping make the atlas more accurate, reproducible, and accessible.

## Before starting

1. Search existing issues and pull requests.
2. Open an issue before a large change, new source, schema change, or methodology change.
3. Never commit credentials, private data, licensed data without redistribution rights, or generated data without provenance.
4. Read the contracts in [`docs/README.md`](docs/README.md) before changing data, classification, coverage, source, or uncertainty behaviour.

## Development

Use Node.js 22, npm, and Python 3.

```bash
npm ci
npm run dev
```

Keep changes focused. Reuse existing contracts and dependencies. Do not infer missing values, locations, generation, ownership, financing, or project delivery.

## Data contributions

Every public value must be traceable to a source observation. A data change must preserve:

- the authoritative URL, publisher, release, publication and retrieval dates;
- source identifiers, units, periods, licences, restrictions, and checksums;
- distinctions between final, preliminary, estimated, conflicted, and missing values;
- prior history when an upstream record disappears or changes; and
- explicit uncertainty and location evidence.

Never fuzzy-merge facilities automatically. Never turn a national aggregate into facility data. Never publish restricted rows.

Use the data-correction issue form for a specific record and include its atlas URL or stable identifier.

## Verification

Run the narrowest relevant checks, then the canonical suite:

```bash
npm run verify
```

Browser changes also require:

```bash
npm run test:e2e
```

Data-pipeline changes also require:

```bash
npm run ingest:data
git diff --exit-code -- public/data
```

If a check cannot run, say so in the pull request. Do not claim unrun validation.

## Pull requests

- Use English for commits, issues, and pull requests.
- Explain why the change is needed, what changed, proof run, and remaining risk.
- Keep unrelated changes out of the pull request.
- Link the relevant issue when one exists.
- Update documentation and change history when public behaviour or data changes.
- Accept review and automated checks before merge.

By contributing, you agree that your contribution is licensed under Apache-2.0 for original code and documentation. Third-party data remains under its original terms.

# Data and third-party licences

The Apache-2.0 licence covers original repository code and documentation. It does **not** relicense upstream datasets, archived source pages, third-party notices, trademarks, or database rights.

The machine-readable `sources` collection in each public atlas release is the authoritative per-snapshot manifest. It records the publisher, title, URL, publication and access dates, checksum, coverage, licence statement, and redistribution status.

## Included source families

| Source | Repository use | Terms and attribution |
| --- | --- | --- |
| U.S. Energy Information Administration (EIA) | EIA-860, EIA-860M, EIA-861M, EIA-923, Electric Power Monthly, and Electric Power Annual observations | U.S. federal government public-domain data; acknowledge EIA and the named release. |
| U.S. Geological Survey and named partners | USPVDB and USWTDB exact-ID spatial enrichment | Government data with dataset-specific citation and possible third-party notices. Preserve the release, partner credits, and official citation. Do not imply endorsement. |
| National Renewable Energy Laboratory / National Laboratory of the Rockies | Lifecycle-emissions distributions | The full required notice is retained in [`data/raw/nlr/LICENSE.txt`](data/raw/nlr/LICENSE.txt). Credit DOE, NREL/NLR, and Alliance as required; retain the DOI and version; do not imply endorsement. |
| U.S. Nuclear Regulatory Commission | Reactor-type evidence | U.S. federal publication; preserve page-specific third-party notices and attribution. |
| Ember | Offline reconciliation fixture and optional API connector | The included sourced fixture is described as CC BY 4.0 in the connector documentation. Live API use also remains subject to Ember's current API terms. |
| Global Energy Monitor | Schema-only fixture and optional manually acquired official export | No production GEM export is redistributed in this repository. Any future row is blocked unless its licence and redistribution status permit publication. |

## Reuse rules

- Check the exact release manifest before reusing a dataset or export.
- Preserve source identifiers, attribution, notices, licences, restrictions, checksums, and limitations.
- Treat `data/raw/nlr/LICENSE.txt` as part of every copy containing the NLR-derived data.
- Do not assume that a generated or combined output has one uniform data licence.
- Do not use publisher or partner names, marks, or logos to imply endorsement.
- Recheck the official source terms before commercial redistribution or a new publication format.

This file is a provenance and licence notice, not legal advice. If a source term conflicts with this summary, the source-specific term controls and the affected row or artifact must not be published until reviewed.

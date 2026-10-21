# Ingestion Service Agent Guide

Scope: source fetch, HTML parsing, chunking, refresh transactions, and knowledge status.

- Fetch only exact entries from `src/config/sources.ts`; do not crawl links or accept arbitrary URLs.
- Preserve HTTPS/hostname checks, redirect rejection, descriptive User-Agent, timeout, and approximately one-second delay.
- Keep parser output readable and free of script/style/navigation/form noise.
- Keep chunks bounded, normalized, hashable, and safe for retrieval.
- Replace a source's chunks transactionally only after successful parsing; preserve the previous snapshot on failure.
- Maintain ingestion-run counts and partial failure reporting.

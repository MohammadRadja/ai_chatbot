# Retrieval Service Agent Guide

Scope: `retrieve.ts` and future retrieval adapters.

- Search active MySQL chunks only and return typed source metadata with every passage.
- Preserve deterministic scoring and intent boosts for prices, inclusions, duration, and comparison evidence.
- Do not return content outside the seven-source knowledge boundary.
- Keep retrieval inspectable; any embedding/vector change requires architecture and operational documentation first.

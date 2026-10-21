# Quote Route Agent Guide

`route.ts` persists explicit quote requests.

- Preserve Zod validation for name, email, message, and optional conversation ID.
- Keep rate limiting and safe error messages.
- Store leads through Prisma only; do not claim email delivery or appointment booking.

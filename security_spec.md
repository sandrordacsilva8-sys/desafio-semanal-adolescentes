# Security Specification

## 1. Data Invariants
- `users`: Every teen profile must have a valid identifier, display name, and username. A user can only modify their own challenges and progress.
- `challenges`: Spiritual missions managed by ministry leaders. Read-only for participants; writable only by admins.
- `devotionals`: Daily spiritual content readable by all teens, editable only by leaders.
- `books`: Curated library content readable by all participants, manageable by admins.
- `settings`: Global configuration (e.g. verse of the day), editable by leaders.

## 2. Dirty Dozen Payloads
1. User profile creation with spoofed admin role: `role: "admin"`
2. Unauthorized modification of another user's `totalXP` or `completedChallenges`
3. Non-admin attempting to delete challenge documents
4. Non-admin attempting to inject malicious URLs into book links
5. Modification of user ID path variable with oversized junk strings (>128 chars)
6. Participant attempting to tamper with global `settings/config`
7. Unauthenticated user trying to overwrite devotional reflections
8. Escalating user privileges to bypass challenge timers
9. Arbitrary ghost fields injected into user document during progress update
10. Attempting to delete the entire challenges collection
11. Setting negative XP or absurd XP values (>1,000,000)
12. Attempt to list or query private credentials of other participants

## 3. Threat Mitigation
- Enforce `isValidId()` for path variables.
- Match authenticated user `request.auth.uid == userId` for personal progress mutations.
- Admin bootstrap: `request.auth.token.email == 'sandrordacsilva8@gmail.com'` or admin document check.
- Whitelist allowable update keys for participant state changes.

# Firebase Security Specification (ACC Setup Share)

## 1. Data Invariants
- **Setups**:
  - Anyone can view (read/list) setups without authentication, allowing easy sharing among team members.
  - Setups can only be created by authenticated users, with the creator UID set to their actual `request.auth.uid`.
  - Setups can only be modified (updated) or deleted by the original uploader (owner) using relationship-based rules (`uploadedBy == request.auth.uid`).
  - Strict types and size validation must prevent injecting arbitrary or bloated payloads.
- **Guides**:
  - The troubleshooting setup guide can be read by anyone.
  - Only authenticated uploaders can create or update the troubleshooting setup guide.

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads represent different attack vectors (Spoofing, Bloat, Privilege Escalation, etc.) and should all be successfully blocked (`PERMISSION_DENIED`) by the Firestore security rules:

1. **Spoofed Uploader ID**: Creating a setup file but setting `uploadedBy` to another user's UID to frame them or gain unauthorized editing rights.
2. **Missing Author ID**: Creating a setup that contains no `uploadedBy` field, rendering it an orphan or bypassing owner validation.
3. **Bloat Attack (Name)**: Injecting a 1MB string into the setup `name` field to exhaust resources or generate visual layout failures (DoS).
4. **Bloat Attack (Car/Track)**: Injecting extremely long strings in `car` or `track` parameters to trigger styling issues or query breaks.
5. **Bloat Attack (Notes)**: Uploading a excessively massive description in `notes` with thousands of characters.
6. **Altered Creation Timestamp**: Submitting a pre-configured `createdAt` instead of enforcing `request.time`.
7. **Modified Creator Fields (Update)**: Attempting to update a setup and changing the `uploadedBy` field to a different owner.
8. **Altered Creation Time on Update**: Trying to edit the `createdAt` timestamp (immutability check failure).
9. **Malicious Override of Sibling Setup**: Trying to update metadata on a setup owned by a different user.
10. **Unauthorized Delete**: Attempting to delete a setup owned by another user.
11. **Guide Override by Anonymous User**: Attempting to update the master troubleshooting guide without being a signed-in user.
12. **Guide Bloat Attack**: Uploading a extremely massive text in the guide (> 100,000 characters).

## 3. Security Rules Validation Outline

The rules will be compiled into `/firestore.rules` and enforce:
- Catch-all default deny.
- Relational ownership for writes and deletes on `/setups/{setupId}`.
- Immutable properties (`uploadedBy`, `createdAt`).
- Data structure checks (types, size limits on titles and descriptions).
- Auth verification.

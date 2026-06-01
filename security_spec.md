# Security Specification for Buzzi Messenger (Classic Retro Chat)

## 1. Data Invariants
*   Each **User** is identified by their authenticated Firestore UID (`request.auth.uid`). Users can only update their own profile document (`/users/{userId}`).
*   A User's profile fields (e.g., `email`) are locked or strictly verified.
*   User email MUST match the auth email or is verified if checked.
*   **Messages** must have `senderId` matching the authenticated user's UID (`request.auth.uid`). No identity spoofing is allowed.
*   The `createdAt` field of a Message must be set to the server timestamp (`request.time`).
*   Messages cannot be modified once written (or can only be modified/deleted by the sender if desired, but for standard logs, they are immutable once written). Our design enforces the immutability of written chat history.

---

## 2. The "Dirty Dozen" Payloads (Identity, Integrity and State Attacks)

### Attack 1: User Profile Spoofing
An attacker tries to edit another user's profile to change their display name.
*   **Path**: `/users/victim_user_b234`
*   **Operation**: `update` (authenticated as `attacker_user_a123`)
*   **Payload**: `{ "name": "Gehackt door xX_Hacker_Xx (H)" }`
*   **Expected Result**: `PERMISSION_DENIED` (UID mismatch)

### Attack 2: Self-Promotion / Self-Assigned Role
An attacker tries to make themselves an administrator.
*   **Path**: `/users/attacker_user_a123`
*   **Operation**: `create` (authenticated as `attacker_user_a123`)
*   **Payload**: `{ "name": "Attacker", "role": "admin" }`
*   **Expected Result**: `PERMISSION_DENIED` (strict schema prevents shadow role fields)

### Attack 3: Spoof Message Sender ID
An attacker attempts to write a message claiming to be the victim.
*   **Path**: `/messages/msg_999`
*   **Operation**: `create` (authenticated as `attacker_user_a123`)
*   **Payload**: `{ "id": "msg_999", "senderId": "victim_user_b234", "senderName": "★ ~ victim ~ ★", "text": "Ik ben stom :P", "receiverId": "mensen-van-toen", "timestamp": "12:00" }`
*   **Expected Result**: `PERMISSION_DENIED` (`senderId` mismatch against `request.auth.uid`)

### Attack 4: Shadow Fields in User Creation
An attacker tries to create their user profile containing additional custom properties not in the schema (such as `isVerified: true`).
*   **Path**: `/users/attacker_user_a123`
*   **Operation**: `create` (authenticated as `attacker_user_a123`)
*   **Payload**: `{ "name": "attacker", "email": "attacker@gmail.com", "avatar": "🧑‍🚀", "status": "online", "personalMessage": "", "isVerified": true }`
*   **Expected Result**: `PERMISSION_DENIED` (failure of size & shadow key check)

### Attack 5: Spoofed User Email
An attacker tries to sign up with a profile email that does not match their verified login email.
*   **Path**: `/users/attacker_user_a123`
*   **Operation**: `create` (authenticated as `attacker_user_a123`, google auth email: `attacker@gmail.com`)
*   **Payload**: `{ "name": "Fake Admin", "email": "admin@buzzi.nl", "avatar": "🧑‍🚀", "status": "online", "personalMessage": "" }`
*   **Expected Result**: `PERMISSION_DENIED` (email equality gate)

### Attack 6: Resource Poisoning via Super-Long Display Name
An attacker tries to send a profile update containing a 100KB display name to crash rendering for everyone.
*   **Path**: `/users/attacker_user_a123`
*   **Operation**: `update` (authenticated as `attacker_user_a123`)
*   **Payload**: `{ "name": "<100KB STRING...>" }`
*   **Expected Result**: `PERMISSION_DENIED` (string size boundaries)

### Attack 7: Fake Server Timestamp Manipulation
An attacker attempts to backdate or hardcode a custom timestamp on a Message to bypass chronology.
*   **Path**: `/messages/msg_100`
*   **Operation**: `create` (authenticated as `attacker_user_a123`)
*   **Payload**: `{ "id": "msg_100", "senderId": "attacker_user_a123", "senderName": "Attacker", "text": "Yo", "receiverId": "mensen-van-toen", "createdAt": "2004-06-01T12:00:00Z" }`
*   **Expected Result**: `PERMISSION_DENIED` (`createdAt` must equal `request.time`)

### Attack 8: Mutating Message History
An attacker attempts to edit or delete a message posted in a group chat to Gaslight other users.
*   **Path**: `/messages/msg_old`
*   **Operation**: `update` (authenticated as `attacker_user_a123`)
*   **Payload**: `{ "text": "Modified message text!" }`
*   **Expected Result**: `PERMISSION_DENIED` (written messages are immutable)

### Attack 9: Rogue Message with Massive Text Payload
An attacker attempts to send a message containing an astronomical amount of characters (e.g. 500KB text) to trigger billing drain.
*   **Path**: `/messages/msg_toxic`
*   **Operation**: `create` (authenticated as `attacker_user_a123`)
*   **Payload**: `{ "id": "msg_toxic", "senderId": "attacker_user_a123", "senderName": "Attacker", "text": "<500KB...>", "receiverId": "mensen-van-toen" }`
*   **Expected Result**: `PERMISSION_DENIED` (text size bounds)

### Attack 10: Anonymous Read Harvesting
An unauthenticated or outsider client attempts to fetch Buzzi user profiles or emails without credentials.
*   **Path**: `/users/attacker_user_a123`
*   **Operation**: `get` (unauthenticated)
*   **Expected Result**: `PERMISSION_DENIED` (authentication required)

### Attack 11: Invalid ID Poisoning
An attacker attempts to write a user profile with special characters in the ID like `/` or extremely long toxic characters to trigger filesystem paths traversal.
*   **Path**: `/users/invalid%20id%2Fpoisoning`
*   **Operation**: `create` (authenticated)
*   **Expected Result**: `PERMISSION_DENIED` (isValidId regex constraint)

### Attack 12: Bypass Query Filter (Unrestricted List Read)
An attacker requests list of all user private details without registering.
*   **Path**: `/users`
*   **Operation**: `list` (unauthenticated)
*   **Expected Result**: `PERMISSION_DENIED` (list queries are gated to registered, authenticated entities)

---

## 3. Test runner mock script outline
A mock simulation or `firestore.rules.test.ts` file acts as a testing mechanism. In a production build, these assertions are enforced.

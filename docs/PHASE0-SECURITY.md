# Phase 0: Security & Infrastructure Implementation Guide

## Overview
Phase 0 establishes the security foundation for Togetherly v2. This includes fixing RLS policies, moving secrets to environment variables, and adding security headers.

---

## 1. RLS (Row Level Security) Policies

### Status: ⚠️ REQUIRES MANUAL APPLICATION

The SQL migration file `supabase-phase0-rls.sql` contains critical security policies that must be applied manually in your Supabase dashboard:

**Steps:**
1. Go to [supabase.com](https://app.supabase.com/project/_/sql) → SQL Editor
2. Create a new query
3. Copy the entire content from `supabase-phase0-rls.sql`
4. Click "Run"

### What the RLS Policies Fix:

| Table | Issue | Fix |
|-------|-------|-----|
| `users` | Public access to sensitive fields | Only authenticated users can read public profile data (name, photo). Email/phone hidden. |
| `follows` | Anyone could follow anyone | Only authenticated users can create/delete follows. Users can only unfollow themselves. |
| `messages` | No access control | Only room members can read/write. Only message author can edit/delete. |
| `calls` | No call history privacy | Only call participants can read their call records. |
| `push_subscriptions` | Exposed notification preferences | Only users can manage their own subscriptions. |

---

## 2. Environment Variables (SECURITY CRITICAL)

### Required for Phase 0:
All these variables are **REQUIRED** to disable public API access:

```bash
# Core Supabase (from your project)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-key

# WebRTC TURN Server (for NAT traversal)
# - Without this, calls will fail when behind strict NAT
# Options: Twilio, AWS, self-hosted TURN
VITE_TURN_URL=turn:your-turn-server.com:3478
VITE_TURN_USERNAME=username
VITE_TURN_PASSWORD=password

# Push Notifications
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

### How to Generate VAPID Keys:
```bash
npm install -g web-push
web-push generate-vapid-keys
# Copy output to .env
```

### How to Get TURN Server:

**Option 1: Twilio TURN Server (Easiest)**
- Sign up: https://www.twilio.com/
- Account SID: Available in console
- Auth Token: Available in console
- Use Twilio's endpoint: `turn:numb.twilio.com:443?transport=tcp`

**Option 2: Self-hosted with coturn**
```bash
# Deploy coturn on any server
# See: https://github.com/coturn/coturn
```

**Option 3: AWS TURN**
- Use AWS Global Accelerator + EC2 TURN server

---

## 3. Security Headers

### Implemented in `vite.config.ts`:

- **X-Content-Type-Options: nosniff** - Prevents MIME type sniffing
- **X-Frame-Options: DENY** - Disables iframe embedding
- **X-XSS-Protection** - Legacy XSS filter
- **Content-Security-Policy** - Restricts script sources, prevents XSS
- **Permissions-Policy** - Disables unused APIs (camera, microphone, geolocation)

### CSP Policy Breakdown:
```
default-src 'self'                          # Only load from this domain
script-src 'self' 'unsafe-inline' https://cdn.peerjs.com
  └─ Allows: inline styles (for React), PeerJS library
style-src 'self' 'unsafe-inline'
  └─ Allows: inline styles (necessary for CSS-in-JS)
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://0.peerjs.com https://*.google.com
  └─ Allows: API calls to Supabase, WebSocket, PeerJS, Google
frame-src 'none'                            # No iframes allowed
object-src 'none'                           # No plugins
```

---

## 4. Guest Mode Removal (Product Change)

### What's Removed:
- Direct Peer ID entry (guests could enter random IDs)
- Peer ID Wizard for establishing initial connection

### What's New:
- **Google One Tap Authentication** - Only authenticated users can create/join spaces
- **Deep linking** - Share `/s/[spaceSlug]` to invite others

### Migration Path:
Existing Peer ID connections will no longer work. This is intentional - we're moving to a space-based model with proper authentication.

---

## 5. Product Description Update

### Old:
"Co-presence platform for watch parties and casual hangouts"

### New:
"Co-presence collaboration platform for synchronized work sessions"

### Why:
- We're positioning for study/interview rooms (B2B/student market)
- Not just social, but productivity-focused
- Justifies monetization via subscription

---

## 6. Security Checklist for Phase 0 ✅

Before moving to Phase 1, verify:

- [ ] RLS policies applied to all tables in Supabase
- [ ] All environment variables configured in `.env`
- [ ] VAPID keys generated and stored
- [ ] TURN server credentials configured
- [ ] No console errors about missing env vars
- [ ] Supabase realtime is enabled (for presence)
- [ ] Public access to profiles/messages is blocked

---

## 7. Testing Phase 0

### Test RLS:
```javascript
// In browser console on a test page
const { data, error } = await supabase
  .from('users')
  .select('*')

// Should work (same user)
const { data: myData } = await supabase
  .from('users')
  .select('*')
  .eq('id', currentUserId)

// Should fail (different user's sensitive data)
const { data: otherData } = await supabase
  .from('users')
  .select('email')
  .eq('id', otherUserId)
```

### Test Environment Variables:
```javascript
console.log('[Phase 0] TURN Configured:', !!import.meta.env.VITE_TURN_URL)
console.log('[Phase 0] VAPID Configured:', !!import.meta.env.VITE_VAPID_PUBLIC_KEY)
console.log('[Phase 0] Supabase Configured:', !!import.meta.env.VITE_SUPABASE_URL)
```

---

## 8. Known Issues & Workarounds

### Issue: VAPID key validation fails
**Cause:** Incorrect key format  
**Fix:** Run `web-push generate-vapid-keys` again, ensure full key is copied

### Issue: Calls fail when behind NAT
**Cause:** No TURN server configured  
**Fix:** Add TURN credentials to `.env`

### Issue: CSP blocks your custom domain
**Cause:** New domain not in CSP allowlist  
**Fix:** Update `connect-src` in `vite.config.ts`

---

## 9. Next Steps

✅ **Phase 0 Complete** → Proceed to **Phase 1: Navigation & Space Primitive**

Phase 1 will:
- Add spaces database schema
- Build SpacesPage with Google One Tap auth
- Implement `/s/[slug]` deep linking
- Create space-based room structure

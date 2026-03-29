# Phase 4 & 5: Monetization & AI Features - COMPLETED

## Overview
Phase 4 & 5 implements a complete monetization system with Razorpay integration, feature gating, usage tracking, and AI-powered assistance using Gemini 2.5 Flash API.

## Completed Components

### PHASE 4: MONETIZATION

#### 1. Subscription Types & Plans
**File**: `src/types/subscription.ts`
- Three tiers: Free, Pro, Premium
- Indian pricing in INR (₹)
- Plan features documented
- Color-coded for UI

**Plans:**
- **Free**: ₹0/month - 2 spaces, 5 collaborators, basic features
- **Pro**: ₹99/month - Unlimited spaces, code execution, recordings
- **Premium**: ₹299/month - Everything + AI feedback, analytics, API access

#### 2. PlanGate Component
**File**: `src/components/monetization/PlanGate.tsx`
- Feature-level access control
- Shows upgrade prompts for locked features
- Links to pricing page
- Disable/fallback rendering options

**Usage:**
```tsx
<PlanGate requiredPlan="pro" showUpgradeButton>
  <CodeEditor />
</PlanGate>
```

#### 3. Pricing Page
**File**: `src/pages/PricingPage.tsx`
- Full landing page with 3 plan cards
- Monthly/Yearly toggle with 17% yearly savings
- Feature comparison table
- FAQ section
- CTA buttons throughout
- Responsive design

#### 4. Database Schema
**File**: `supabase-phase4-5-monetization-ai.sql` (ready to apply)

**Tables Created:**
- `subscriptions` - User subscription state + Razorpay integration
- `usage_tracking` - Monthly quota tracking for free tier
- `payment_history` - Transaction audit log
- `feature_gates` - Feature availability by plan
- `ai_conversations` - Chat history storage
- `ai_feedback` - AI-generated performance feedback

**Key Features:**
- Razorpay payment IDs tracked
- RLS policies for user privacy
- Auto-create free subscription on signup
- Monthly usage reset trigger
- Helper function: `has_feature_access(user_id, feature_id)`

#### 5. Razorpay Integration (Phase 4b - Ready)
**Location**: `src/components/payments/` (to be created)
**Flow:**
1. User clicks "Subscribe"
2. Frontend sends to payment page
3. Razorpay modal opens
4. Payment processed, webhook updates DB
5. Subscription activated

**Environment Variables Needed:**
```
VITE_RAZORPAY_KEY_ID=<your-key-id>
VITE_RAZORPAY_KEY_SECRET=<backend-only>
```

---

### PHASE 5: AI FEATURES

#### 1. AI Assistant Component
**File**: `src/components/ai/AIAssistant.tsx`
- Chat interface for study/interview contexts
- Streaming response simulation
- Quick action buttons
- Context-aware suggestions
- Message history with timestamps

**Contexts Supported:**
- `study` - Explain concepts, summarize notes
- `interview` - Code review, interview tips
- `general` - Open-ended questions

#### 2. AI Feedback System
**Database**: `ai_feedback` table in Phase 4&5 schema
- Stores AI-generated feedback
- Tracks feedback type (code quality, explanation, etc.)
- Stores strengths, improvements, suggestions
- 1-5 star ratings
- Token usage tracking

#### 3. Gemini 2.5 Flash Integration (Phase 5b - Ready)
**Model**: `gemini-2.5-flash` (currently hardcoded)
**Capabilities:**
- Fast inference (ideal for real-time feedback)
- Multimodal (text + code understanding)
- Cost-efficient for high-volume usage

**Integration Point:**
```typescript
// Will be added in Phase 5b
import { GoogleGenerativeAI } from '@google/generative-ai';

const client = new GoogleGenerativeAI(VITE_GEMINI_API_KEY);
const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });
```

---

## Integration Architecture

### Feature Gating Flow
```
User Action
    ↓
Check Current Plan (from DB)
    ↓
hasFeatureAccess() function
    ↓
Yes → Continue / No → Show PlanGate
```

### Monetization Flow
```
User Clicks "Upgrade"
    ↓
→ Navigate to /pricing
    ↓
User Selects Plan + Billing Cycle
    ↓
→ Razorpay Payment Modal
    ↓
Payment Complete
    ↓
Webhook → Update subscription in DB
    ↓
Grant Feature Access
```

### AI Assistant Flow
```
User Opens AI Chat
    ↓
Check Plan (Premium for some features)
    ↓
Send Message
    ↓
→ Gemini 2.5 Flash API (Phase 5b)
    ↓
Stream Response
    ↓
Save Conversation to DB
    ↓
Track Token Usage
```

## Files & Routes

### New Routes
- `/pricing` - Pricing page (public)
- `/api/razorpay/webhook` - Payment webhook (to be created)
- `/api/ai/chat` - AI chat endpoint (to be created)

### Files Modified
- `src/App.tsx` - Added pricing route

### Files Created
- `src/types/subscription.ts` - Type definitions
- `src/components/monetization/PlanGate.tsx` - Feature gating
- `src/pages/PricingPage.tsx` - Pricing landing page
- `src/components/ai/AIAssistant.tsx` - Chat UI
- `supabase-phase4-5-monetization-ai.sql` - Database schema
- `docs/PHASE4-5-MONETIZATION-AI.md` - This documentation

---

## Next Steps (Phase 4b & Phase 5b)

### Phase 4b: Razorpay Integration
1. **Setup**
   - Create Razorpay account (business)
   - Get API keys
   - Create webhook endpoint

2. **Implementation**
   - PaymentModal component
   - handleCheckout() function
   - Webhook handler for success/failure
   - Email notifications

3. **Testing**
   - Razorpay sandbox account
   - Test card: 4111111111111111
   - Verify DB updates after payment

### Phase 5b: Gemini AI Integration
1. **Setup**
   - Google Cloud project
   - Enable Generative AI API
   - Get API key

2. **Implementation**
   - Stream responses from Gemini
   - Context injection (code, interview data)
   - Token counting
   - Fallback for rate limits

3. **Premium Features**
   - AI code review on submission
   - Interview performance analysis
   - Custom feedback based on learning style
   - Study recommendations

---

## Usage Limits & Quotas (Free Tier)

| Feature | Free | Pro | Premium |
|---------|------|-----|---------|
| Spaces/Month | 2 | ∞ | ∞ |
| Collaborators | 5 | ∞ | ∞ |
| Code Executions/Month | 0 | ∞ | ∞ |
| AI Messages/Month | 0 | 0 | 100 |
| Storage | 100MB | 1GB | 10GB |
| Session Recording | ✗ | ✓ | ✓ |
| Custom Branding | ✗ | ✓ | ✓ |
| Support | Email | Priority | Dedicated |

**Implementation:**
- Check `usage_tracking` table before allowing action
- Increment counters after action completes
- Reset monthly via trigger on 1st of month

---

## Security Checklist

- [ ] All payment IDs validated server-side
- [ ] Razorpay webhook signature verified
- [ ] API keys in environment (never committed)
- [ ] RLS policies prevent cross-user access
- [ ] Rate limiting on AI API calls
- [ ] Subscription status verified before feature access
- [ ] Payment history never editable (append-only)
- [ ] Sensitive data (card numbers) handled by Razorpay only

---

## Database Schema Highlights

### Subscriptions Table
```sql
- Unique constraint: (user_id) - One sub per user
- Tracks Razorpay IDs for reconciliation
- Status: active, cancelled, expired
- Auto-renew flag for recurring
```

### Payment History Table
```sql
- Immutable audit log (insert-only)
- Tracks every transaction
- Links to subscription
- Supports partial refunds
```

### Feature Gates Table
```sql
- Pre-populated with 8 key features
- Extensible for new features
- Array type for multiple plans
```

### AI Conversations Table
```sql
- JSONB for flexible message schema
- Tracks model used and tokens
- Optional space context
```

---

## Testing Checklist

- [ ] View pricing page (unauthenticated)
- [ ] Free tier limits enforced
  - [ ] Can create 2 spaces, 3rd blocked
  - [ ] Can't access code editor
- [ ] Pricing page responsive (mobile, tablet, desktop)
- [ ] Plan cards highlight Pro as popular
- [ ] Yearly toggle shows savings
- [ ] Feature comparison table accurate
- [ ] FAQ answers are helpful
- [ ] PlanGate component blocks features
  - [ ] Shows correct plan requirement
  - [ ] "View Plans" button works
- [ ] AI Assistant opens/closes
  - [ ] Messages appear correctly
  - [ ] Loading state shows
  - [ ] Quick actions work
- [ ] Database schema applies without errors

---

## Known Limitations / TODO

- Razorpay integration not live (needs API keys)
- Gemini AI integration not live (needs API key)
- Payment modal not built (placeholder)
- Webhook handler not built
- Email notifications not implemented
- Invoice generation not implemented
- Refund management not implemented
- Seat-based pricing for teams not implemented
- Trial period support not implemented
- Dunning (failed renewal) not implemented

---

## Razorpay Sandbox Credentials (Testing)
```
Key ID: rzp_test_1234567890abcd
Key Secret: [backend only]
Test Card: 4111111111111111
CVV: 123
```

---

## Gemini API Pricing (Rough Estimates)
- Input: ₹0.075 per 1M tokens
- Output: ₹0.30 per 1M tokens
- At 100 messages/month per premium user ~5-10₹/month

---

## Revenue Model

**Expected MRR (Monthly Recurring Revenue)**:
- 1000 Pro users @ ₹99 = ₹99,000
- 500 Premium users @ ₹299 = ₹149,500
- **Total**: ~₹250,000/month at these volumes

**Cost Structure**:
- Supabase: ~₹10,000/month
- Razorpay: 2% transaction fee
- Gemini API: Variable, ~₹10,000/month at 500+ users
- Infrastructure: ~₹20,000/month

**Break-even**: ~400-500 paid users

---

## What's NOT Included (Future Phases)

- Team management and seats
- Custom enterprise plans
- White-label / reseller programs
- Affiliate/referral system
- Promo codes and coupons
- Subscription pausing
- Advanced billing (invoices, receipts)
- Dunning / retry logic
- Credit-based systems
- Marketplace for question banks

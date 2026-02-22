

# Professional UI/UX Overhaul for Watch, Browser, and Chat Pages

## Overview
A comprehensive redesign of the three main pages with a polished, mobile-first aesthetic inspired by modern apps like Telegram, Discord, and Apple TV. The goal is cleaner spacing, better visual hierarchy, smoother animations, and a more cohesive design language across all pages.

---

## 1. Bottom Navigation Bar Upgrade

**Current:** Basic icon + label tabs with minimal styling.

**Improvements:**
- Add a subtle floating pill shape with rounded corners and shadow
- Active tab gets a filled icon with smooth spring animation
- Add haptic-style scale animation on tap
- Reduce visual noise with cleaner spacing

---

## 2. Watch Page Redesign

**Current:** Connection wizard + video player + search stacked vertically with basic cards.

**Improvements:**
- **Compact Connection Status Bar**: Replace the full ConnectionWizard section with a slim, dismissible status bar at the top showing connection state (green dot + peer name) or a "Connect" button. The full wizard opens as a bottom sheet when tapped.
- **Hero Video Area**: When no video is selected, show a visually appealing empty state with gradient background and a centered search prompt instead of a plain gray box.
- **YouTube Search Redesign**: 
  - Cleaner search bar with rounded-full shape and subtle glow on focus
  - Video result cards with larger thumbnails, better typography, and duration badges
  - Horizontal scroll for suggested videos instead of grid
- **Smooth page transitions** when navigating to theater

---

## 3. Browser (Screen Share) Page Redesign

**Current:** Large header, oversized idle state card, generic styling.

**Improvements:**
- **Minimal Header**: Reduce to a single-line compact header with connection dot, title, and action button inline
- **Idle State**: Replace the bulky card with a clean, centered illustration-style layout:
  - Subtle animated gradient orb behind the icon
  - Clearer call-to-action with better button sizing
  - Remove redundant "Connect in Watch Tab" disabled button; replace with a direct link/navigation action
- **Live View**: Add picture-in-picture style controls overlay that fades on inactivity
- **Sharing State**: Cleaner pulsing indicator with less visual clutter

---

## 4. Chat Page Redesign

**Current:** WhatsApp-style dark theme chat, functional but basic.

**Improvements:**
- **Header**: Add avatar/initials circle for the connected peer, subtle online pulse animation, and a more refined layout
- **Message Bubbles**: 
  - Softer border radius with slight shadow for depth
  - Better spacing between messages from same sender (grouped messages)
  - Swipe-to-reply gesture hint styling
  - Typing indicator area at bottom
- **Input Bar**: 
  - Rounded pill input with smoother transitions
  - Animated mic-to-send button transition
  - Attachment button with a nicer popover for file types
- **Empty State**: More inviting empty chat illustration with connection status and quick-action buttons
- **Voice Message**: Better waveform visualization styling

---

## 5. App Header Cleanup

**Current:** Glass-style header with nav links and hamburger menu.

**Improvements:**
- Hide on mobile (bottom nav is primary), show only on desktop
- Cleaner desktop nav with pill-shaped active indicator
- Simpler user greeting area

---

## Technical Details

### Files to modify:
1. **`src/components/BottomNav.tsx`** - Floating pill design, spring animations, filled active icons
2. **`src/pages/WatchPage.tsx`** - Compact connection bar, hero empty state, horizontal suggested videos
3. **`src/pages/BrowserPage.tsx`** - Minimal header, cleaner idle/sharing/viewing states
4. **`src/pages/ChatPage.tsx`** - Add peer avatar header, better empty state
5. **`src/components/Chat.tsx`** - Refined bubbles, grouped messages, better input bar, improved empty state
6. **`src/components/YouTubeSearch.tsx`** - Rounded search, horizontal scroll suggestions, card redesign
7. **`src/components/ConnectionWizard.tsx`** - Bottom sheet trigger mode, compact connected state
8. **`src/components/AppHeader.tsx`** - Hide on mobile, cleaner desktop design
9. **`src/index.css`** - Add new utility classes for the refined glass effects and animations

### No new dependencies required
All improvements use existing libraries: framer-motion, tailwind, radix-ui, lucide-react.

### Design Principles Applied:
- **Consistency**: Unified color palette, spacing scale (4px base), and border-radius across all pages
- **Hierarchy**: Clear visual hierarchy with size, weight, and opacity variations
- **Whitespace**: More generous padding and margins for a premium feel
- **Motion**: Purposeful micro-animations (not decorative) for state transitions
- **Mobile-first**: Every component designed for touch targets (min 44px), thumb-friendly zones, and small screens first


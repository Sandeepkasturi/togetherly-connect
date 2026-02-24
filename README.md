# Togetherly Connect

Togetherly Connect is a modern, real-time social platform designed for shared experiences, instant communication, and community building. From synchronized YouTube watch parties to high-quality draggable video calls, Togetherly brings people together seamlessly.

## 🚀 Key Features

- **Draggable PiP Calls**: High-quality audio and video calls that float in a Picture-in-Picture window, allowing you to multitask and chat while talking.
- **Synchronized Watch Parties**: Watch YouTube videos in perfect sync with friends in the Theater.
- **Optimistic Chat**: Snappy, real-time messaging with instantaneous UI updates and Supabase-backed persistence.
- **PWA Support**: Fully installable Progressive Web App with native push notifications and an "Add to Home Screen" experience.
- **Auto-Connect**: Intelligent background peer discovery for seamless synchronization in shared spaces.
- **Google Authentication**: Quick and secure sign-in with Google or guest access for immediate exploration.

## 🛠️ Technology Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Real-time, Auth, Storage)
- **Communication**: [PeerJS](https://peerjs.com/) (WebRTC for Voice/Video/Data sync)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📱 How to Use

### Visiting the Site
You can visit the live application at [togetherly-share.vercel.app](https://togetherly-share.vercel.app).

### Getting Started
1. **Sign In**: Use your Google account for the best experience, or continue as a guest.
2. **Install the App**: Navigate to your **Profile** and tap the **"Get the App"** banner to install Togetherly on your Home Screen for a native app feel.
3. **Connect with Friends**: Use the **Community** tab to discover other users, send friend requests, and grow your circle.

### Communication
- **Chat**: Tap on any friend in your list to start a real-time conversation.
- **Call**: Tap the **Phone** or **Video** icon in a chat to initiate a call. You can drag the call window anywhere while you continue to browse the app.
- **Watch Together**: Visit the **Theater** page to host or join a synchronized YouTube session. Use the **Discover** tab to find videos and share them with your connected peer.

## 💻 Local Development

1. **Clone the repo**:
   ```sh
   git clone <YOUR_GIT_URL>
   cd togetherly-connect
   ```
2. **Install dependencies**:
   ```sh
   npm install
   ```
3. **Setup Environment**:
   Ensure you have your Supabase credentials configured if you are using your own instance.
4. **Start the dev server**:
   ```sh
   npm run dev
   ```

## 📄 License

MIT © [Togetherly Team]

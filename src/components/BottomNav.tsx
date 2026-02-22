import { Home, Monitor, Globe2, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TABS = [
  { key: "home", label: "Home", icon: Home, to: "/app" },
  { key: "watch", label: "Watch", icon: Monitor, to: "/watch" },
  { key: "browser", label: "Share", icon: Globe2, to: "/browser" },
  { key: "chat", label: "Chat", icon: MessageCircle, to: "/chat" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-6 pb-safe">
      <div className="floating-nav flex items-center justify-around w-full max-w-sm py-2 px-3">
        {TABS.map((tab) => {
          const isActive =
            tab.to === "/app"
              ? location.pathname === "/app"
              : location.pathname.startsWith(tab.to);
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.to)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-2xl text-[11px] font-medium transition-all duration-300 tap-effect min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 relative z-10 transition-all duration-300",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

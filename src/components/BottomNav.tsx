import { Home, Monitor, Globe2, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "home", label: "Home", icon: Home, to: "/app" },
  { key: "watch", label: "Watch", icon: Monitor, to: "/watch" },
  { key: "browser", label: "Browser", icon: Globe2, to: "/browser" },
  { key: "chat", label: "Chat", icon: MessageCircle, to: "/chat" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="sticky bottom-0 inset-x-0 z-30 border-t border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-xl flex items-center justify-around py-2 px-2">
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
                "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-2xl text-xs font-medium transition-all", 
                "text-muted-foreground hover:text-foreground",
                isActive &&
                  "bg-primary/10 text-primary shadow-sm shadow-primary/30 scale-[1.02]"
              )}
              aria-label={tab.label}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;


import { cn } from "@/lib/utils";
// Logo component using the custom image asset

interface LogoProps {
    className?: string;
    animate?: boolean;
}

const Logo = ({ className, animate = false }: LogoProps) => {
    return (
        <img
            src="/logo.png"
            alt="Togetherly Logo"
            className={cn("object-contain", className, animate && "animate-pulse")}
        />
    );
};

export default Logo;
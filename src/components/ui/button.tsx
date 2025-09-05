import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:scale-[1.02] hover:shadow-primary/25",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:scale-[1.02]",
        outline:
          "border border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 hover:shadow-lg",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70 hover:shadow-lg hover:scale-[1.02]",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground hover:backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-accent",
        premium: "bg-gradient-to-r from-accent via-primary to-accent bg-size-200 text-primary-foreground hover:bg-pos-right hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.02]",
        glass: "bg-white/5 backdrop-blur-xl border border-white/10 text-foreground hover:bg-white/10 hover:border-white/20",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium select-none transition-[transform,background-color,color,border-color] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/90",
        destructive:
          "glass border-destructive/25 text-destructive hover:bg-destructive/10",
        outline:
          "border border-border/45 bg-background/60 backdrop-blur-md hover:bg-accent/70 hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/35 hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        glass:
          "glass border-border/30 text-foreground hover:bg-transparent",
        link:
          "text-primary underline-offset-4 hover:underline rounded-md",
      },
      // Sizes meet the 44px minimum on mobile (sm) and step down on sm+ breakpoints.
      size: {
        default: "h-11 px-5 py-2 sm:h-10",
        sm: "h-10 px-3.5 text-sm sm:h-8 sm:text-xs",
        lg: "h-12 px-7 text-[15px]",
        icon: "size-11 rounded-full sm:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

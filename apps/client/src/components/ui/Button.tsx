import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "destructive"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none",
                    {
                        "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50": variant === "default",
                        "border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10": variant === "outline",
                        "hover:bg-gray-800 text-gray-300 hover:text-white": variant === "ghost",
                        "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/50": variant === "destructive",
                    },
                    {
                        "h-11 px-6 py-2": size === "default",
                        "h-9 px-4 text-sm": size === "sm",
                        "h-12 px-8 text-lg": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

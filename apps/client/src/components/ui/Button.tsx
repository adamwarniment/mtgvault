import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "destructive" | "success"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none",
                    {
                        "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20": variant === "default",
                        "border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10": variant === "outline",
                        "hover:bg-gray-800 text-gray-300 hover:text-white": variant === "ghost",
                        "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/50": variant === "destructive",
                        "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/50": variant === "success",
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

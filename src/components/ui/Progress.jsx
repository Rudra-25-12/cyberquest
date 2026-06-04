import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

const Progress = React.forwardRef(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={`relative w-full overflow-hidden rounded-full bg-[#0F1115] border border-[#1F242F] ${className || ''}`}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={`h-full bg-[#3B82F6] transition-all duration-500 ease-in-out ${indicatorClassName || ''}`}
      style={{ width: `${value || 0}%` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

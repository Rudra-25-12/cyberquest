import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-[#1F242F] bg-[#0F1115] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171A21] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-transparent ${className || ''}`}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-1"
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }

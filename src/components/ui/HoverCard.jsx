import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Portal>
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={`z-50 w-72 rounded-lg border border-[#1F242F] bg-[#171A21] p-4 text-[#F3F4F6] shadow-xl outline-none data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut ${className || ''}`}
      {...props}
    />
  </HoverCardPrimitive.Portal>
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/src/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-green-600 focus-visible:ring-green-500/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
  {
      variants: {
        variant: {
          default:
            "border-transparent bg-green-600 text-white hover:bg-green-700",

          secondary:
            "border-transparent bg-gray-200 text-gray-900 hover:bg-gray-300",

          destructive:
            "border-transparent bg-red-600 text-white hover:bg-red-700",

          outline:
            "border border-gray-300 bg-white text-gray-900 hover:bg-gray-100",
        },
      },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

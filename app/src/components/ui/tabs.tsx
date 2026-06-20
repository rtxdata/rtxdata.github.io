import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

// A clean horizontal tab bar. (The shadcn default keyed off data-horizontal
// variants that this @base-ui version doesn't emit — it uses data-orientation —
// which left the root as a flex row and floated the list beside the content.)

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex items-center gap-1 border-b border-border", className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative -mb-px inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
        "px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors outline-none",
        "hover:text-foreground focus-visible:text-foreground",
        "data-active:text-foreground",
        // active underline
        "after:pointer-events-none after:absolute after:inset-x-3 after:-bottom-px after:h-0.5",
        "after:rounded-full after:bg-brand after:opacity-0 after:transition-opacity",
        "data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

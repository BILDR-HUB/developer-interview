// Shared geometry and selected state for tabs, quick filters and segmented
// switches.

// Underlined text tabs: page tabs and in-card list views. The list carries
// the baseline; the active tab draws an orange underline on top of it.
// Narrow containers wrap the tabs instead of scrolling sideways.
export const selectionGroupClassName =
  "flex min-w-0 flex-wrap items-end gap-x-5 border-b border-border";

export const selectionControlClassName =
  "relative -mb-px inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 border-b-2 border-transparent px-0.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors md:min-h-9 hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 disabled:pointer-events-none disabled:opacity-55 aria-pressed:border-b-primary aria-pressed:text-foreground data-[state=active]:text-foreground";

export const selectionCountClassName =
  "text-sm font-normal tabular-nums text-muted-foreground";

// Quick-filter chips: light one-pixel outline, pale orange when pressed.
export const filterChipClassName =
  "relative inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors md:h-8 md:min-h-0 hover:border-foreground/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/70 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-55 aria-pressed:border-primary/50 aria-pressed:bg-accent-light aria-pressed:text-accent-hover";

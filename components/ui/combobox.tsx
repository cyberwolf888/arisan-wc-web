"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, XIcon } from "lucide-react"

export type ComboboxItem = { value: string; label: string }

export interface ComboboxProps {
  items: ComboboxItem[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  renderItem?: (item: ComboboxItem) => React.ReactNode
}

export function Combobox({
  items,
  value,
  onValueChange,
  placeholder = "Search...",
  disabled = false,
  className,
  renderItem,
}: ComboboxProps) {
  const filter = ComboboxPrimitive.useFilter()

  const selectedItem = React.useMemo(
    () => items.find((item) => item.value === value) ?? null,
    [items, value],
  )

  return (
    <ComboboxPrimitive.Root
      items={items}
      value={selectedItem}
      filter={filter.contains}
      itemToStringLabel={(item) => item.label}
      onValueChange={(nextValue) => {
        onValueChange(nextValue?.value ?? "")
      }}
    >
      <ComboboxPrimitive.InputGroup
        className={cn(
          "relative flex w-full items-center rounded-lg border border-input bg-transparent transition-colors",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          "has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          className,
        )}
      >
        <ComboboxPrimitive.Input
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex flex-1 items-center gap-1.5 py-2 pl-2.5 pr-2 text-sm",
            "bg-transparent outline-hidden placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        <div className="flex items-center gap-0.5 pr-2">
          {value ? (
            <ComboboxPrimitive.Clear
              className="flex size-4 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
              aria-label="Clear selection"
            >
              <XIcon className="size-3.5" />
            </ComboboxPrimitive.Clear>
          ) : null}
          <ComboboxPrimitive.Trigger
            className="flex size-4 items-center justify-center text-muted-foreground"
            aria-label="Open options"
          >
            <ChevronDownIcon className="size-4" />
          </ComboboxPrimitive.Trigger>
        </div>
      </ComboboxPrimitive.InputGroup>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          side="bottom"
          sideOffset={4}
          align="center"
          className="z-50"
        >
          <ComboboxPrimitive.Popup
            className={cn(
              "max-h-(--available-height) w-(--anchor-width) min-w-36",
              "overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground",
              "shadow-md ring-1 ring-foreground/10",
              "origin-(--transform-origin)",
              "data-[side=bottom]:slide-in-from-top-2",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            )}
          >
            <ComboboxPrimitive.List className="p-1">
              <ComboboxPrimitive.Collection>
                {(item: ComboboxItem) => (
                  <ComboboxPrimitive.Item
                    key={item.value}
                    value={item}
                    className="relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1.5 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                  >
                    {renderItem ? renderItem(item) : item.label}
                  </ComboboxPrimitive.Item>
                )}
              </ComboboxPrimitive.Collection>
              <ComboboxPrimitive.Empty className="px-3 py-2 text-sm text-muted-foreground">
                No results found.
              </ComboboxPrimitive.Empty>
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}

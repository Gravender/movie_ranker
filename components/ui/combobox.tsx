"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ComboBoxProps = {
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  value: string;
};
export const ComboBox = ({
  placeholder,
  options,
  value,
  onChange,
}: ComboBoxProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : `Select ${placeholder}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder}...`} />
          <CommandEmpty>{`No ${placeholder} found.`}</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0",
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export type MultiComboBoxProps = {
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
  value: string[];
};
export const MultiComboBox = React.forwardRef<
  HTMLButtonElement,
  MultiComboBoxProps
>(({ placeholder, options, value: values, onChange }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {values.length > 0
            ? values
                .map((value) =>
                  options.find((option) => option.value === value)
                    ? options.find((option) => option.value === value)?.label
                    : value,
                )
                .join(", ")
            : `Select ${placeholder}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder}...`}
            value={search}
            maxLength={25}
            onValueChange={setSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const option = options.find(
                  (option) => search === option.value,
                );
                if (option) {
                  onChange([...values, option.value]);
                } else {
                  onChange([...values, search]);
                }
                setOpen(false);
                setSearch("");
              }
            }}
          />
          <CommandEmpty>
            <Button
              variant="secondary"
              onClick={() => {
                onChange([...values, search]);
                setOpen(false);
                setSearch("");
              }}
            >
              {`Add ${search}`}
              <PlusIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </CommandEmpty>
          <CommandGroup>
            {[
              ...options,
              ...values
                .filter(
                  (value) => !options.find((option) => value === option.value),
                )
                .map((value) => {
                  return { value, label: value };
                }),
            ].map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue) => {
                  const index = values.findIndex(
                    (value) =>
                      value.toLowerCase() === currentValue.toLowerCase(),
                  );
                  if (index !== -1) {
                    const temp = values;
                    temp.splice(index, 1);
                    onChange(temp);
                  } else {
                    onChange([...values, currentValue]);
                  }
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    values.find((value) => value === option.value)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

MultiComboBox.displayName = "MultiComboBox";

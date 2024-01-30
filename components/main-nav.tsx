import * as React from "react";
import Link from "next/link";

import { type NavItem } from "@/types/nav";
import { siteConfig } from "@/config/site";
import { cn } from "lib/utils";
import { Icons } from "./icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Menu, MenuSquare } from "lucide-react";

interface MainNavProps {
  items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex flex-grow justify-between gap-6 sm:grow-0 sm:justify-start md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      {items?.length ? (
        <>
          <nav className="hidden gap-6 sm:flex">
            {items?.map(
              (item, index) =>
                item.href && (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center text-sm font-medium text-muted-foreground",
                      item.disabled && "cursor-not-allowed opacity-80",
                    )}
                  >
                    {item.title}
                  </Link>
                ),
            )}
          </nav>
          <nav className="flex items-center justify-center sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center">
                <Menu />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {items?.map(
                  (item, index) =>
                    item.href && (
                      <DropdownMenuItem key={index}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center text-sm font-medium text-muted-foreground",
                            item.disabled && "cursor-not-allowed opacity-80",
                          )}
                        >
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </>
      ) : null}
    </div>
  );
}

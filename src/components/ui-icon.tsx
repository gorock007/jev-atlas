"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowSquareOutIcon,
  ArticleIcon,
  BooksIcon,
  WarningIcon,
} from "@phosphor-icons/react";

const ICONS = {
  "arrow-left": ArrowLeftIcon,
  "arrow-right": ArrowRightIcon,
  "arrow-out": ArrowSquareOutIcon,
  article: ArticleIcon,
  books: BooksIcon,
  warning: WarningIcon,
} as const;

export function UiIcon({ name, size = 16, className }: { name: keyof typeof ICONS; size?: number; className?: string }) {
  const Icon = ICONS[name];
  return <Icon size={size} className={className} aria-hidden="true" />;
}

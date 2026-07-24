"use client";

import { useLayoutEffect } from "react";
import { useBreadcrumb } from "./breadcrumb-provider";

export function BreadcrumbSetter({ items }) {
  const { setItems } = useBreadcrumb();

  useLayoutEffect(() => {
    setItems(items ?? []);

    return () => {
      setItems([]);
    };
  }, [items, setItems]);

  return null;
}

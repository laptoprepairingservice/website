
"use client";

import { usePortal } from "@/hooks/usePortal";
import { HERA_FERI } from "@/utils";
import { createPortal } from "react-dom";

export default function Portal({ id = HERA_FERI, className = "", children }) {
    const el = usePortal(id);
    if (!el) return null;

    return createPortal(<div className={className}>{children}</div>, el);
}

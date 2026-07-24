import React from "react";
import { ShimmerEffect } from "../shimmer";

const ListLoader = ({ columns, rows, showHeader }) => {
  return (
    <div className="w-full">
      {/* Table Header Skeleton */}
      {showHeader && (
        <div
          className="grid gap-4 border-b p-4"
          style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
        >
          {columns.map((_, index) => (
            <ShimmerEffect key={index} className="h-4 w-3/4" />
          ))}
        </div>
      )}

      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 border-b p-2.5"
          style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
        >
          {columns.map((_, colIndex) => (
            <ShimmerEffect key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
      <div className="mt-2 flex items-center justify-between">
        <ShimmerEffect className="h-4 w-16" /> {/* Count skeleton */}
        <div className="flex gap-2">
          <ShimmerEffect className="h-8 w-8" />
          <ShimmerEffect className="h-8 w-8" />
          <ShimmerEffect className="h-8 w-8" />
          <ShimmerEffect className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

export default ListLoader;

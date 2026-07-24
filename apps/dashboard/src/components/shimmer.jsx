import { cn } from "@/lib/utils";

export const ShimmerEffect = ({ className }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded-lg", className)} />
);

export const Shimmer = ({ className }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded-lg", className)} />
);

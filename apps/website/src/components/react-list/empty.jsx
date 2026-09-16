import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

export default function ListEmpty({
  title = "No Data Found",
  icon = "lucide:inbox",
  description = "We couldn’t find any matching records.",
  className,
}) {
  return (
    <div
      className={cn(
        "border-primary-900 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center",
        className
      )}
    >
      <div className="border-primary-800 bg-primary-950 flex h-14 w-14 items-center justify-center rounded-full border">
        <Icon icon={icon} className="text-primary-400 h-6 w-6" />
      </div>
      <h3 className="text-primary-50 mt-6 text-base font-semibold">{title}</h3>
      <p className="text-primary-300 mt-2 max-w-sm text-sm">{description}</p>
    </div>
  );
}

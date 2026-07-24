import { getAsset } from "@/utils";

export function TenantLogo({ tenant = null }) {
  const logo = tenant?.favicon || tenant?.logo || null;
  const displayName = tenant?.display_name || tenant?.name || null;

  return (
    <>
      {logo?.storage_path ? (
        <div className="bg-muted aspect-square size-full overflow-hidden rounded-lg">
          <img
            src={getAsset(logo?.storage_path)}
            alt={displayName || "Image"}
            className="size-full object-contain"
          />
        </div>
      ) : (
        <div className="flex size-full items-center justify-center overflow-hidden text-2xl font-bold text-black">
          {displayName
            ?.trim()
            .split(/\s+/)
            .map((word) => word[0].toUpperCase())
            .join("")}
        </div>
      )}
    </>
  );
}

import { Home, MapPin, Star } from "lucide-react";
import { SectionTitle } from "./section-title";
import { EmptySection } from "./empty-section";

function AddressCard({ addr }) {
  return (
    <div className="border-border bg-card relative rounded-xl border p-4">
      {addr.is_default && (
        <span className="bg-primary/10 text-primary absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
          <Star className="fill-primary size-2.5" />
          Default
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="bg-muted mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg">
          <Home className="text-muted-foreground size-3.5" />
        </div>
        <div className="min-w-0 text-sm">
          {addr.full_name && (
            <p className="text-foreground font-medium">{addr.full_name}</p>
          )}
          <p className="text-muted-foreground mt-0.5 leading-relaxed">
            {[addr.address_line1, addr.address_line2].filter(Boolean).join(", ")}
          </p>
          <p className="text-muted-foreground">
            {[addr.city, addr.state].filter(Boolean).join(", ")}
            {addr.postal_code ? ` — ${addr.postal_code}` : ""}
          </p>
          {addr.phone && (
            <p className="text-muted-foreground mt-1 font-mono text-xs">{addr.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserAddressesList({ addresses }) {
  return (
    <div>
      <SectionTitle icon={MapPin} title="Saved Addresses" count={addresses.length} />

      {addresses.length === 0 ? (
        <EmptySection icon={MapPin} message="No saved addresses." />
      ) : (
        <div className="space-y-2">
          {addresses.map((addr) => (
            <AddressCard key={addr.id} addr={addr} />
          ))}
        </div>
      )}
    </div>
  );
}

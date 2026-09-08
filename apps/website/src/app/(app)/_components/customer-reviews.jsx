import { StarRating } from "@/components/store/star-rating";
import { SectionHeader } from "./section-header";

const REVIEWS = [
  {
    id: "1",
    author: "Rahul Shah",
    location: "Satellite, Ahmedabad",
    rating: 5,
    product: "NVIDIA RTX 4090 Founders Edition",
    text: "Ordered my RTX 4090 and received same-day delivery in Ahmedabad with original manufacturer seal and GST invoice for our AI startup.",
  },
  {
    id: "2",
    author: "Priya Mehta",
    location: "Infocity, Gandhinagar",
    rating: 5,
    product: "Custom Ryzen 9 Workstation",
    text: "The technicians helped select compatible parts for my 3D rendering setup. Cable management was immaculate and performance is outstanding.",
  },
  {
    id: "3",
    author: "Vikram Patel",
    location: "Vesu, Surat",
    rating: 5,
    product: "Samsung 990 PRO 2TB NVMe",
    text: "Fast shipping to Surat. Packaging was ultra-secure with multiple layers. Speeds verified at 7,450 MB/s on CrystalDiskMark.",
  },
];

export function CustomerReviews() {
  return (
    <section className="border-b border-border py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Customer Feedback"
          description="Verified experiences from PC builders, developers, and studios across Gujarat."
          align="center"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="space-y-3">
                <StarRating rating={review.rating} showCount={false} />
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border">
                <p className="text-xs font-semibold text-foreground">{review.author}</p>
                <p className="text-[11px] text-muted-foreground">{review.location}</p>
                <p className="text-[11px] font-medium text-foreground/80 mt-0.5">
                  Purchased: {review.product}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

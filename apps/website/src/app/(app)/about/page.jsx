import Link from "next/link";
import { ArrowRight, Award, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE } from "@/lib/store-config";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Ranuja — Ahmedabad's trusted premium computer hardware store since 2015.",
};

export default function AboutPage() {
  return (
    <div className="container-store py-8 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <span className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
          About Ranuja
        </span>
        <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
          Building Trust in Every Component
        </h1>
        <p className="text-muted-foreground mt-6 text-lg">
          Since 2015, Ranuja has been Ahmedabad&apos;s premier destination for genuine computer
          hardware. From gaming enthusiasts to enterprise IT teams, we serve thousands of customers
          across Gujarat with expert guidance and reliable service.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {[
          {
            icon: Award,
            title: "10+ Years",
            description: "Serving the Ahmedabad PC community since 2015",
          },
          {
            icon: Users,
            title: "10,000+ Customers",
            description: "Trusted by enthusiasts and professionals alike",
          },
          {
            icon: MapPin,
            title: "Gujarat Wide",
            description: "Fast delivery across Ahmedabad and all of Gujarat",
          },
        ].map(({ icon: Icon, title, description }) => (
          <div key={title} className="border-border bg-card rounded-xl border p-8 text-center">
            <div className="bg-primary/5 mx-auto mb-4 flex size-14 items-center justify-center rounded-xl">
              <Icon className="text-primary size-7" />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{description}</p>
          </div>
        ))}
      </div>

      <div className="text-muted-foreground mx-auto mt-16 max-w-3xl space-y-6">
        <h2 className="text-foreground text-2xl font-semibold">Our Mission</h2>
        <p>
          We believe every PC builder deserves access to genuine, high-quality components with
          honest pricing and knowledgeable support. Our team of certified technicians helps
          customers choose compatible parts, troubleshoot builds, and maximize performance.
        </p>
        <p>
          Located on SG Highway in Ahmedabad, our showroom features the latest processors, graphics
          cards, motherboards, and peripherals from authorized brands including ASUS, MSI, NVIDIA,
          AMD, Intel, Corsair, and Logitech.
        </p>
      </div>

      <div className="mt-16 text-center">
        <Button size="lg" asChild>
          <Link href="/products">
            Explore Products
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}

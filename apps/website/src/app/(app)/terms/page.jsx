import { STORE } from "@/lib/store-config";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using Ranuja e-commerce platform.",
};

export default function TermsPage() {
  return (
    <div className="container-store py-8 lg:py-16">
      <article className="prose prose-neutral mx-auto max-w-3xl">
        <h1>Terms & Conditions</h1>
        <p className="lead text-muted-foreground">Last updated: January 2026</p>

        <h2>General</h2>
        <p>
          By accessing and using the {STORE.name} website, you agree to these terms and conditions.
          We reserve the right to modify these terms at any time.
        </p>

        <h2>Products & Pricing</h2>
        <p>
          All prices are listed in Indian Rupees (INR) and include applicable GST. Prices and
          availability are subject to change without notice. Product images are for illustration
          purposes.
        </p>

        <h2>Orders & Payment</h2>
        <p>
          Placing an order constitutes an offer to purchase. We reserve the right to cancel orders
          due to pricing errors, stock unavailability, or suspected fraud. Cash on Delivery is
          available across Gujarat.
        </p>

        <h2>Shipping & Delivery</h2>
        <p>
          Delivery timelines are estimates and may vary. Risk of loss passes to you upon delivery.
          Free shipping applies to orders above ₹5,000 within Gujarat.
        </p>

        <h2>Warranty</h2>
        <p>
          All products carry manufacturer warranty. {STORE.name} facilitates warranty claims but
          warranty terms are governed by respective manufacturers.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          {STORE.name} shall not be liable for indirect, incidental, or consequential damages
          arising from the use of our products or services.
        </p>

        <h2>Governing Law</h2>
        <p>
          These terms are governed by the laws of India. Disputes shall be subject to the
          jurisdiction of courts in Ahmedabad, Gujarat.
        </p>
      </article>
    </div>
  );
}

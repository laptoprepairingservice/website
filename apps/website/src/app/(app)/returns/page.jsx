export const metadata = {
  title: "Return Policy",
  description: "Ranuja return and refund policy for computer hardware products.",
};

export default function ReturnsPage() {
  return (
    <div className="container-store py-8 lg:py-16">
      <article className="prose prose-neutral mx-auto max-w-3xl">
        <h1>Return & Refund Policy</h1>
        <p className="lead text-muted-foreground">Last updated: January 2026</p>

        <h2>7-Day Return Window</h2>
        <p>
          Unopened products in original packaging may be returned within 7 days of delivery for a
          full refund. Opened products are eligible for return only if defective or damaged.
        </p>

        <h2>Non-Returnable Items</h2>
        <ul>
          <li>Opened software and digital products</li>
          <li>Custom-built or configured systems</li>
          <li>Products with broken manufacturer seals</li>
          <li>Items marked as final sale</li>
        </ul>

        <h2>Defective Products</h2>
        <p>
          If you receive a defective product, contact us within 48 hours. We will arrange a
          replacement or refund after verification. Manufacturer warranty claims are handled
          directly through authorized service centers.
        </p>

        <h2>Refund Processing</h2>
        <p>
          Approved refunds are processed within 5-7 business days to the original payment method.
          COD orders receive refunds via bank transfer.
        </p>

        <h2>How to Initiate a Return</h2>
        <p>
          Email support@Ranuja.in with your order number and reason for return. Our team will
          provide a return authorization and shipping instructions.
        </p>
      </article>
    </div>
  );
}

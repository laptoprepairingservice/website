import { STORE } from "@/lib/store-config";

export const metadata = {
  title: "Privacy Policy",
  description: "Ranuja privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container-store py-8 lg:py-16">
      <article className="prose prose-neutral mx-auto max-w-3xl">
        <h1>Privacy Policy</h1>
        <p className="lead text-muted-foreground">Last updated: January 2026</p>

        <h2>Information We Collect</h2>
        <p>
          When you create an account, place an order, or contact us, we collect personal information
          including your name, email address, phone number, and shipping address. Payment
          information is processed securely through our payment partners.
        </p>

        <h2>How We Use Your Information</h2>
        <p>
          We use your information to process orders, provide customer support, send order updates,
          and improve our services. We do not sell your personal data to third parties.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your personal information. All
          transactions are encrypted using SSL technology.
        </p>

        <h2>Cookies</h2>
        <p>
          We use cookies to enhance your browsing experience, remember your preferences, and analyze
          site traffic. You can control cookie settings through your browser.
        </p>

        <h2>Contact</h2>
        <p>For privacy-related inquiries, contact us at {STORE.email}.</p>
      </article>
    </div>
  );
}

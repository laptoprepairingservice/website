"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@ui/shadcn/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/shadcn/components/card";
import { FormField } from "@ui/shadcn/components/form-field";
import { Input } from "@ui/shadcn/components/input";
import { Textarea } from "@ui/shadcn/components/textarea";
import { STORE } from "@/lib/store-config";

const FAQ = [
  {
    q: "Do you offer same-day delivery in Ahmedabad?",
    a: "Yes, orders placed before 2 PM are dispatched same day for Ahmedabad city limits.",
  },
  {
    q: "Are all products covered by manufacturer warranty?",
    a: "Absolutely. Every product comes with full manufacturer warranty. We are an authorized dealer.",
  },
  {
    q: "Can I visit your store?",
    a: "Yes! Visit us at SG Highway, Ahmedabad. Our showroom is open Mon-Sat, 10 AM - 8 PM.",
  },
  {
    q: "Do you help with PC builds?",
    a: "Our technicians offer free compatibility checks and paid assembly services.",
  },
];

export default function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent!", { description: "We'll get back to you within 24 hours." });
  };

  return (
    <div className="py-8 lg:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold">Contact Us</h1>
        <p className="text-muted-foreground mt-4">
          Have a question? Our team is here to help you find the right components.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          {[
            { icon: MapPin, label: "Address", value: STORE.address },
            { icon: Phone, label: "Phone", value: STORE.phone },
            { icon: Mail, label: "Email", value: STORE.email },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="bg-primary/5 flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="text-primary size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-muted-foreground mt-1 text-sm">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <FormField label="Name" id="name">
                <Input id="name" required placeholder="Your name" />
              </FormField>
              <FormField label="Email" id="email">
                <Input id="email" type="email" required placeholder="you@example.com" />
              </FormField>
              <FormField label="Subject" id="subject" className="sm:col-span-2">
                <Input id="subject" required placeholder="How can we help?" />
              </FormField>
              <FormField label="Message" id="message" className="sm:col-span-2">
                <Textarea id="message" required placeholder="Your message..." rows={5} />
              </FormField>
              <Button type="submit" className="w-fit sm:col-span-2">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <section id="faq" className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-4">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="border-border rounded-xl border p-6">
              <h3 className="font-medium">{q}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

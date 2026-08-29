export const metadata = {
  title: "Coming Soon | Ranuja",
  description: "We are currently building something new. Coming soon.",
};

export default function HomePage() {
  return (
    <section className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-background px-6 py-12">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="size-[320px] rounded-full bg-primary/10 blur-[100px] sm:size-[480px]" />
      </div>

      <div className="mx-auto flex max-w-xl flex-col items-center text-center space-y-6">
        {/* Minimalist Status Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-xs">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span>Under Construction</span>
        </div>

        {/* Minimalist Hero Heading */}
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          Coming Soon<span className="text-primary">.</span>
        </h1>

        {/* Minimalist Tagline */}
        <p className="max-w-md text-base text-muted-foreground sm:text-lg leading-relaxed">
          We&apos;re currently building our new platform. Please check back soon.
        </p>
      </div>
    </section>
  );
}

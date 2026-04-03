import { Mail, Phone } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Refund Policy</h1>
        <p className="text-muted mt-3 leading-relaxed">
          Cloud Central &mdash; Voice Broadcasting App Refund Policy. Please read our refund terms carefully before purchasing any plan.
        </p>
      </div>

      <section className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-3">Non-Refundable Plans</h2>
        <p className="text-sm text-muted leading-relaxed">All plans purchased on Zero 8 Zero are non-refundable. Once credits are added to your account, they cannot be refunded or transferred.</p>
      </section>

      <section className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-3">Contact Us</h2>
        <p className="text-sm text-muted mb-4">If you have any questions about our Refund Policy, please contact us at:</p>
        <div className="space-y-2 text-sm text-muted">
          <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> <a href="mailto:cloudcentral24@gmail.com" className="text-primary hover:underline">cloudcentral24@gmail.com</a></p>
          <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +91 89515 37972</p>
        </div>
      </section>
    </article>
  );
}

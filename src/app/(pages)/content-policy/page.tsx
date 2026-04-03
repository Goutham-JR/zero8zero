import { CheckCircle, XCircle, Mail, Phone } from "lucide-react";

export default function ContentPolicyPage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Content Policy</h1>
        <p className="text-muted mt-3 leading-relaxed">
          Cloud Central is committed to providing a platform for legitimate and responsible voice broadcasting. This Content Policy outlines the types of content that are allowed and prohibited on our App.
        </p>
      </div>

      {/* Allowed */}
      <section className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-success flex items-center gap-2 mb-5">
          <CheckCircle className="w-5 h-5" /> Allowed Content
        </h2>
        <div className="space-y-4">
          {[
            { title: "Informational Broadcasts", text: "This includes public service announcements, company announcements, educational messages, and event reminders." },
            { title: "Promotional Broadcasts", text: "You can promote your business, products, or services, but they must be truthful and not misleading." },
            { title: "Customer Service Broadcasts", text: "You can use the App to send automated messages for appointment reminders, order confirmations, or other customer service notifications." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted mt-0.5">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prohibited */}
      <section className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-danger flex items-center gap-2 mb-5">
          <XCircle className="w-5 h-5" /> Prohibited Content
        </h2>
        <div className="space-y-4">
          {[
            { title: "Illegal Content", text: "This includes content that promotes or instructs on illegal activities, such as fraud, violence, or drug use." },
            { title: "Hate Speech", text: "Content that attacks a person or group on the basis of attributes such as race, religion, ethnic origin, national origin, sex, disability, sexual orientation, or gender identity is strictly prohibited." },
            { title: "Harassment", text: "Content that is threatening, abusive, or intended to cause emotional distress is not allowed." },
            { title: "Spam", text: "Sending unsolicited commercial messages or mass unsolicited messages is prohibited." },
            { title: "Deceptive Content", text: "Content that is misleading, deceptive, or fraudulent is not allowed. This includes false claims about products, services, or promotions." },
            { title: "Defamatory Content", text: "Content that is false and damages the reputation of an individual or organization is not allowed." },
            { title: "Personally Identifiable Information", text: "Do not broadcast the personal information of others without their consent." },
            { title: "Sexually Explicit Content", text: "Content that is sexually suggestive or explicit in nature is not allowed." },
            { title: "Copyrighted Content", text: "Do not broadcast content that infringes on the intellectual property rights of others." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted mt-0.5">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enforcement */}
      <section className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-3">Enforcement</h2>
        <p className="text-sm text-muted leading-relaxed">We reserve the right to remove any content that violates this Content Policy. We may also suspend or terminate your account for repeated violations.</p>
      </section>

      {/* Reporting */}
      <section className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-3">Reporting Violations</h2>
        <p className="text-sm text-muted mb-4">If you see content that you believe violates this Content Policy, please report it to us at:</p>
        <div className="space-y-2 text-sm text-muted">
          <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> <a href="mailto:cloudcentral24@gmail.com" className="text-primary hover:underline">cloudcentral24@gmail.com</a></p>
          <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +91 89515 37972</p>
        </div>
      </section>
    </article>
  );
}

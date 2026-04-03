import { Mail, Phone } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <article className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Privacy Policy</h1>
        <p className="text-muted mt-3 leading-relaxed">
          This Privacy Policy describes how Cloud Central (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and discloses your information when you use our voice broadcasting application (the &quot;App&quot;).
        </p>
      </div>

      <Section title="Information We Collect">
        <p className="text-sm text-muted mb-4">We collect several types of information for various purposes to improve our App and to provide you with the best service.</p>
        <div className="space-y-4">
          <InfoBlock title="Account Information" text="When you create an account with us, you may provide certain personal information, such as your name, email address, and company name." />
          <InfoBlock title="Usage Data" text="We collect information about your activity within the App. This may include the date and time you used the App, the features you accessed, and the broadcasts you created or sent." />
          <InfoBlock title="Device Information" text="We collect information about the device you use to access the App, such as the device type, operating system, unique device identifiers, and IP address." />
        </div>
      </Section>

      <Section title="How We Use Your Information">
        <BulletList items={[
          "To provide and maintain the App",
          "To create and manage your account",
          "To process your broadcasts",
          "To improve the App and develop new features",
          "To send you updates and promotional communications (with your consent)",
          "To comply with legal and regulatory obligations",
        ]} />
      </Section>

      <Section title="Sharing Your Information">
        <p className="text-sm text-muted leading-relaxed">We may share your information with third-party service providers who help us operate the App, such as data storage providers or analytics providers. These third parties are obligated to protect your information and use it only for the purposes we specify.</p>
        <p className="text-sm text-muted leading-relaxed mt-3">We will not share your personal information with any third-party for marketing purposes without your explicit consent.</p>
      </Section>

      <Section title="Data Retention">
        <p className="text-sm text-muted leading-relaxed">We will retain your information for as long as your account is active or as needed to provide you with the App. We may also retain certain information for legal or regulatory reasons.</p>
      </Section>

      <Section title="Your Choices">
        <BulletList items={[
          "You can access and update your account information at any time.",
          "You can opt out of receiving promotional communications from us.",
          "You can request to delete your account.",
        ]} />
      </Section>

      <Section title="Security">
        <p className="text-sm text-muted leading-relaxed">We take reasonable steps to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no internet transmission or electronic storage is ever completely secure.</p>
      </Section>

      <Section title="Children's Privacy">
        <p className="text-sm text-muted leading-relaxed">Our App is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.</p>
      </Section>

      <Section title="Changes to this Privacy Policy">
        <p className="text-sm text-muted leading-relaxed">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on the App.</p>
      </Section>

      <Section title="Contact Us">
        <p className="text-sm text-muted mb-4">If you have any questions about this Privacy Policy, please contact us at:</p>
        <div className="space-y-2 text-sm text-muted">
          <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> <a href="mailto:cloudcentral24@gmail.com" className="text-primary hover:underline">cloudcentral24@gmail.com</a></p>
          <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +91 89515 37972</p>
        </div>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card rounded-2xl border border-border p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-surface rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{text}</p>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
          {item}
        </li>
      ))}
    </ul>
  );
}

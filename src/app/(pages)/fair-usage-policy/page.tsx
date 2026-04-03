import { CheckCircle, XCircle, Mail, Phone, MapPin } from "lucide-react";

export default function FairUsagePolicyPage() {
  return (
    <article className="space-y-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Fair Usage Policy</h1>
        <p className="text-muted mt-3 leading-relaxed">
          At Zero 8 Zero by Cloud Central, we are committed to providing an affordable and effective marketing tool for businesses to reach their customers through bulk phone calls. To ensure the best experience for all users, please follow these fair usage guidelines.
        </p>
      </div>

      {/* Do's */}
      <section>
        <h2 className="text-xl font-bold text-success flex items-center gap-2 mb-6">
          <CheckCircle className="w-6 h-6" /> Do&apos;s
        </h2>
        <div className="space-y-5">
          {[
            { title: "Promote Your Business", items: ["Use Zero 8 Zero to share promotional messages about your products and services.", "Engage customers with special offers, discounts, and announcements about upcoming events."] },
            { title: "Send Timely Reminders", items: ["Utilize the app to send appointment reminders, payment notifications, and event alerts.", "Keep your customers informed and up-to-date with important information."] },
            { title: "Share Important Updates", items: ["Notify your customers about product launches, new features, and service updates.", "Maintain customer engagement with regular and relevant updates."] },
            { title: "Collect Customer Feedback", items: ["Use the Input IVR feature to gather valuable insights and feedback from your customers.", "Improve your services based on the feedback collected through interactive voice responses."] },
            { title: "Comply with Regulations", items: ["Adhere to all applicable laws and regulations, including TRAI regulations for call scheduling.", "Respect Do Not Disturb (DND) lists and ensure your campaigns comply with legal standards."] },
          ].map((section) => (
            <div key={section.title} className="bg-card rounded-2xl border border-border p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Don'ts */}
      <section>
        <h2 className="text-xl font-bold text-danger flex items-center gap-2 mb-6">
          <XCircle className="w-6 h-6" /> Don&apos;ts
        </h2>
        <div className="space-y-5">
          {[
            { title: "Avoid Spamming", items: ["Do not use Zero 8 Zero to send unsolicited messages or spam to your contacts.", "Ensure your communications are relevant and targeted to your audience."] },
            { title: "No Personal Information", items: ["Do not include personal information such as names, account numbers, or dates in your voice messages.", "Maintain the privacy and security of your customers' information."] },
            { title: "Prohibited Content", items: ["Do not use the platform to send offensive, harmful, or inappropriate content.", "Avoid any content that could be deemed as harassment, hate speech, or discriminatory."] },
            { title: "Respect Call Timing", items: ["Do not schedule calls outside the allowed hours of 9 AM to 9 PM as per TRAI regulations.", "Ensure your campaigns are conducted within the legal time frames to avoid disturbances."] },
            { title: "Avoid Overuse", items: ["Do not excessively use the system for non-business-related activities.", "Ensure that the platform is used primarily for legitimate business communication purposes."] },
          ].map((section) => (
            <div key={section.title} className="bg-card rounded-2xl border border-border p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-surface rounded-2xl border border-border p-6 text-sm text-muted leading-relaxed">
        By following these guidelines, you help us maintain a high-quality service for everyone. If you have any questions or need assistance, please contact our support team. Thank you for using Zero 8 Zero by Cloud Central!
      </div>

      {/* Contact */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-sm font-bold text-foreground mb-1">Zero 8 Zero by Cloud Central</h3>
        <p className="text-xs text-muted mb-4">Empowering your business communication through efficient voice broadcasting.</p>
        <div className="space-y-2 text-sm text-muted">
          <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> <a href="mailto:cloudcentral24@gmail.com" className="text-primary hover:underline">cloudcentral24@gmail.com</a></p>
          <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +91 89515 37972</p>
          <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /> 45, Kamarajar Street, 1st Cross, KK Pudur, Coimbatore, Tamil Nadu, 641038</p>
        </div>
      </div>
    </article>
  );
}

import { Mail, Phone } from "lucide-react";

export default function TermsPage() {
  return (
    <article className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Terms and Conditions</h1>
        <p className="text-muted mt-3 leading-relaxed">
          Cloud Central &mdash; Voice Broadcasting App Terms of Service. These terms describe how Cloud Central (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates and your rights when using our voice broadcasting application (the &quot;App&quot;).
        </p>
      </div>

      <TermSection num="1" title="Account and Use">
        <TermItem num="1.1" text="You must be at least 18 years old to create an account and use the App." />
        <TermItem num="1.2" text="You are responsible for maintaining the confidentiality of your account information, including your login credentials, and for all activity that occurs under your account." />
        <TermItem num="1.3" text="You agree to use the App only for lawful purposes and in accordance with all applicable laws and regulations." />
        <div className="mt-3">
          <TermItem num="1.4" text="You agree not to use the App to:" />
          <ul className="ml-10 mt-2 space-y-1.5">
            {["Send spam, unsolicited commercial messages, or harassing messages.", "Violate the privacy rights of others.", "Infringe on the intellectual property rights of others.", "Transmit any illegal or harmful content.", "Interfere with the operation of the App."].map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-muted"><span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0 mt-1.5" />{t}</li>
            ))}
          </ul>
        </div>
      </TermSection>

      <TermSection num="2" title="Content">
        <TermItem num="2.1" text="You are solely responsible for the content of your broadcasts created or sent through the App." />
        <TermItem num="2.2" text="You warrant that you have all necessary rights and permissions to use the content in your broadcasts." />
        <TermItem num="2.3" text="We reserve the right to remove any content that we believe violates these Terms or is otherwise inappropriate." />
      </TermSection>

      <TermSection num="3" title="Fees and Payment">
        <TermItem num="3.1" text="We may offer different pricing plans for the App. You will be responsible for paying all fees associated with your chosen plan." />
        <TermItem num="3.2" text="Payment terms will be specified during the signup process. We may use a third-party payment processor to collect your payment information." />
        <TermItem num="3.3" text="All prices are exclusive of 18% GST. Our GSTIN is 33DCTPK9031D1ZJ." />
        <TermItem num="3.4" text="We reserve the right to change our pricing plans at any time. We will provide notice of any such changes." />
      </TermSection>

      <TermSection num="4" title="Disclaimers">
        <TermItem num="4.1" text='The App is provided "as is" and without warranties of any kind, express or implied.' />
        <TermItem num="4.2" text="We disclaim all warranties, including but not limited to, warranties of merchantability, fitness for a particular purpose, and non-infringement." />
        <TermItem num="4.3" text="We do not warrant that the App will be uninterrupted or error-free." />
        <TermItem num="4.4" text="We are not responsible for any damages arising from your use of the App, including but not limited to, damages for loss of profits, data loss, or business interruption." />
      </TermSection>

      <TermSection num="5" title="Limitation of Liability">
        <TermItem num="5.1" text="To the maximum extent permitted by law, our liability to you for any damages arising out of or related to your use of the App is limited to the amount you paid for the App." />
        <TermItem num="5.2" text="We will not be liable for any indirect, incidental, consequential, or punitive damages." />
      </TermSection>

      <TermSection num="6" title="Term and Termination">
        <TermItem num="6.1" text="These Terms will remain in full force and effect while you use the App." />
        <TermItem num="6.2" text="We may terminate your access to the App for any reason, at any time, without notice." />
        <TermItem num="6.3" text="You may terminate these Terms by closing your account." />
      </TermSection>

      <TermSection num="7" title="Intellectual Property">
        <TermItem num="7.1" text="The App and all intellectual property rights associated with it are owned by Cloud Central or its licensors." />
        <TermItem num="7.2" text="You are granted a non-exclusive, non-transferable license to use the App in accordance with these Terms." />
      </TermSection>

      <TermSection num="8" title="Governing Law">
        <TermItem num="8.1" text="These Terms will be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions." />
      </TermSection>

      <TermSection num="9" title="Dispute Resolution">
        <TermItem num="9.1" text="Any dispute arising out of or relating to these Terms will be resolved by binding arbitration in accordance with the rules of the TRAI. The arbitration will be held in Coimbatore, Tamil Nadu." />
      </TermSection>

      <TermSection num="10" title="Entire Agreement">
        <TermItem num="10.1" text="These Terms constitute the entire agreement between you and us regarding your use of the App." />
      </TermSection>

      <TermSection num="11" title="Severability">
        <TermItem num="11.1" text="If any provision of these Terms is held to be invalid or unenforceable, such provision will be struck and the remaining provisions will remain in full force and effect." />
      </TermSection>

      <TermSection num="12" title="Waiver">
        <TermItem num="12.1" text="Our failure to enforce any provision of these Terms will not be construed as a waiver of such provision or any other provision." />
      </TermSection>

      <TermSection num="13" title="Updates to Terms">
        <TermItem num="13.1" text="We may update these Terms at any time. We will notify you of any changes by posting the new Terms on the App." />
      </TermSection>

      <section className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-3">14. Contact Us</h2>
        <p className="text-sm text-muted mb-4">If you have any questions about these Terms, please contact us at:</p>
        <div className="space-y-2 text-sm text-muted">
          <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> <a href="mailto:cloudcentral24@gmail.com" className="text-primary hover:underline">cloudcentral24@gmail.com</a></p>
          <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +91 89515 37972</p>
        </div>
      </section>
    </article>
  );
}

function TermSection({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card rounded-2xl border border-border p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">{num}. {title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function TermItem({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md shrink-0 mt-0.5">{num}</span>
      <p className="text-muted leading-relaxed">{text}</p>
    </div>
  );
}

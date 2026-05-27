'use client';

import React from 'react';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#1a1f1a]">
      {/* Hero */}
      <div className="bg-primary dark:bg-[#1c2a1c] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-mint/80 block mb-4">Legal</span>
          <h1 className="font-serif text-4xl md:text-5xl font-black text-cream mb-4">Privacy Policy</h1>
          <p className="text-cream/70 text-sm font-mono">Effective Date: April 8, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <RevealOnScroll>
          <Section title="1. Introduction">
            <p>Welcome to Brightside Finance Foundation ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard information when you visit our website or use our application (collectively, the "Service").</p>
            <p>By using our Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our practices, please do not use our Service.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="2. Information We Collect">
            <h3 className="font-semibold text-primary dark:text-mint mb-2">Information You Provide Directly</h3>
            <p>We collect personal information that you voluntarily provide when you:</p>
            <ul>
              <li>Fill out a contact form or submit an inquiry</li>
              <li>Sign up for our newsletter or email communications</li>
              <li>Create a user account or profile on our platform</li>
            </ul>
            <p>The types of personal information we may collect include:</p>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Contact details (phone number, mailing address, if provided)</li>
              <li>Any other information you choose to share with us</li>
            </ul>
            <h3 className="font-semibold text-primary dark:text-mint mt-4 mb-2">Automatically Collected Information</h3>
            <p>When you use our Service, we may automatically collect certain usage and analytics data, including:</p>
            <ul>
              <li>Pages visited and time spent on each page</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Referring URLs and clickstream data</li>
              <li>IP address (used in anonymized or aggregated form)</li>
            </ul>
            <p>This information helps us understand how our Service is used and allows us to improve your experience.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="3. How We Use Your Information">
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To send newsletters and updates you have subscribed to</li>
              <li>To maintain and improve the functionality of our Service</li>
              <li>To analyze usage trends and optimize user experience</li>
              <li>To comply with legal obligations and enforce our policies</li>
              <li>To communicate important notices regarding our Service</li>
            </ul>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="4. How We Share Your Information">
            <p>We take your privacy seriously. Brightside Finance Foundation does not sell, rent, or trade your personal information to third parties.</p>
            <p>We keep your data internal and only share it in the following limited circumstances:</p>
            <ul>
              <li><strong>Legal requirements:</strong> If required by law, court order, or governmental authority</li>
              <li><strong>Protection of rights:</strong> To protect the rights, property, or safety of Brightside Finance Foundation, our users, or the public</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of all or a portion of our assets, in which case users will be notified</li>
            </ul>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="5. Cookies and Tracking Technologies">
            <p>We may use cookies, web beacons, and similar tracking technologies to collect usage and analytics data about how you interact with our Service. Cookies are small data files stored on your device.</p>
            <p>You can control cookies through your browser settings. Disabling cookies may affect the functionality of certain parts of our Service. We do not use cookies to serve advertising or to track you across third-party websites.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="6. Children's Privacy">
            <p>Our Service is intended for a general audience and is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can delete such information.</p>
            <p>If we discover that we have inadvertently collected personal data from a child under 13, we will take steps to delete that information as quickly as possible.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="7. Data Security">
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="8. Data Retention">
            <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When your information is no longer needed, we will securely delete or anonymize it.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="9. Your Rights and Choices">
            <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul>
              <li><strong>Access:</strong> The right to request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> The right to request that we correct inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> The right to request that we delete your personal information</li>
              <li><strong>Opt-out:</strong> The right to unsubscribe from our email communications at any time</li>
            </ul>
            <p>To exercise any of these rights, please contact us using the information provided below. We will respond to your request within a reasonable timeframe.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="10. Third-Party Links">
            <p>Our Service may contain links to third-party websites or resources. We are not responsible for the privacy practices of those third parties and encourage you to review their privacy policies before providing any personal information.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="11. Changes to This Privacy Policy">
            <p>We may update this Privacy Policy from time to time. When we make material changes, we will update the "Effective Date" at the top of this policy and, where appropriate, notify you by email or through a prominent notice on our website. We encourage you to review this policy periodically to stay informed about how we protect your information.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="12. Contact Us">
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
            <div className="mt-4 p-5 bg-white dark:bg-[#242924] rounded-2xl border border-primary/10 dark:border-mint/10">
              <p className="font-semibold text-primary dark:text-mint">Brightside Finance Foundation</p>
              <p>1069 Angel Falls Drive, Frisco, Texas 75036</p>
              <p>Email: <a href="mailto:vvenkatesan@brightsidefinance.org" className="text-primary-light dark:text-mint hover:underline">vvenkatesan@brightsidefinance.org</a></p>
              <p>Website: <a href="https://www.brightsidefinance.org" className="text-primary-light dark:text-mint hover:underline">www.brightsidefinance.org</a></p>
            </div>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="mt-12 pt-8 border-t border-primary/10 dark:border-mint/10 text-center text-sm text-[#6b7280] dark:text-[#8fa887]">
            <p>© 2026 Brightside Finance Foundation. All rights reserved.</p>
            <p className="mt-1">Last updated: April 8, 2026</p>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-serif text-2xl font-bold text-primary dark:text-[#e8f0e0] mb-4 pb-2 border-b border-primary/10 dark:border-mint/10">
        {title}
      </h2>
      <div className="space-y-3 text-[#374151] dark:text-[#c5d4bc] leading-relaxed text-[15px] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-primary [&_strong]:dark:text-mint">
        {children}
      </div>
    </div>
  );
}

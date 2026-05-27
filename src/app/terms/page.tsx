'use client';

import React from 'react';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#1a1f1a]">
      {/* Hero */}
      <div className="bg-primary dark:bg-[#1c2a1c] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-mint/80 block mb-4">Legal</span>
          <h1 className="font-serif text-4xl md:text-5xl font-black text-cream mb-4">Terms and Conditions</h1>
          <p className="text-cream/70 text-sm font-mono">Effective Date: April 11, 2026</p>
          <p className="text-cream/50 text-xs mt-2">Brightside Finance Foundation  |  Nonprofit Education Corporation</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">

        <RevealOnScroll>
          <div className="mb-10 p-5 bg-white dark:bg-[#242924] rounded-2xl border border-primary/10 dark:border-mint/10 text-[15px] text-[#374151] dark:text-[#c5d4bc] leading-relaxed">
            <p>Please read these Terms and Conditions ("Terms") carefully before using any services offered by Brightside Finance Foundation ("Brightside," "we," "our," or "us"), including our website, mobile application, and online courses (collectively, the "Services"). These Terms constitute a legally binding agreement between you and Brightside.</p>
            <p className="mt-3">By accessing or using our Services, you confirm that you have read, understood, and agree to be bound by these Terms. If you are under the age of 18, your parent or legal guardian must review and agree to these Terms on your behalf. If you do not agree, please discontinue use of our Services immediately.</p>
            <p className="mt-3">Brightside Finance Foundation is a nonprofit educational corporation organized under the laws of the State of Texas, with a pending application for tax-exempt status under Section 501(c)(3) of the Internal Revenue Code. Our mission is to bring financial literacy education into the light for every K-12 student.</p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="1. Acceptance of Terms">
            <p>By using the Services — including visiting our website, downloading our app, enrolling in any course, or creating an account — you agree to comply with these Terms and all applicable laws and regulations. These Terms apply to all users of the Services, including visitors, registered users, students, parents, guardians, and educators.</p>
            <p>We reserve the right to update or modify these Terms at any time. Changes become effective upon posting to our website. Continued use of the Services following any modification constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="2. Eligibility & Parental Consent">
            <p>Our Services are designed primarily for K-12 students and educational audiences. The following eligibility requirements apply:</p>
            <ul>
              <li>Users under the age of 13 may only use our Services with verified parental or guardian consent, in compliance with the Children's Online Privacy Protection Act (COPPA).</li>
              <li>Users between the ages of 13 and 17 must have parental or guardian awareness and approval of their use of the Services.</li>
              <li>Parents and guardians who create accounts or enroll students represent that they have the legal authority to do so.</li>
              <li>Users must be located in the United States or otherwise eligible to use the Services under applicable law.</li>
            </ul>
            <p>By permitting a minor to use our Services, parents and guardians agree to be bound by these Terms on the minor's behalf and accept full responsibility for the minor's compliance.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="3. Accounts & Registration">
            <p>Account creation on Brightside is optional. You may access certain features of the Services without creating an account. However, some features — including course progress tracking and personalized learning tools — may require registration.</p>
            <Subsection title="3.1 Account Creation">
              <p>When you create an account, you agree to provide accurate, current, and complete information and to keep that information up to date. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.</p>
            </Subsection>
            <Subsection title="3.2 Minors' Accounts">
              <p>Accounts for users under 13 must be created and managed by a parent or guardian. We do not knowingly create accounts for children under 13 without verifiable parental consent. If we learn that we have collected personal information from a child under 13 without appropriate consent, we will promptly delete that information.</p>
            </Subsection>
            <Subsection title="3.3 Account Security">
              <p>You agree to notify us immediately of any unauthorized use of your account or any other security breach. Brightside will not be liable for any loss or damage arising from your failure to protect your account credentials.</p>
            </Subsection>
            <Subsection title="3.4 Account Termination">
              <p>We reserve the right, at our sole discretion, to suspend or terminate accounts that violate these Terms, that are inactive for extended periods, or for any other reason, with or without notice.</p>
            </Subsection>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="4. Description of Services">
            <p>Brightside provides free, nonprofit financial literacy education resources including:</p>
            <ul>
              <li>Online courses delivered through our website and mobile application</li>
              <li>Educational content including videos, reading materials, quizzes, and interactive exercises focused on personal finance</li>
              <li>Progress tracking and learning tools for students, parents, and educators</li>
              <li>Community features and financial education support resources</li>
            </ul>
            <p>All Services are provided free of charge. Brightside is funded through donations, grants, and other nonprofit revenue sources. We do not charge tuition, subscription fees, or any fees to access our educational content. Brightside reserves the right to modify, add, or discontinue any feature or component of the Services at any time without prior notice.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="5. User Conduct">
            <p>You agree to use the Services only for lawful, educational purposes and in a manner consistent with these Terms and all applicable laws. The following conduct is strictly prohibited:</p>
            <Subsection title="5.1 Prohibited Activities">
              <ul>
                <li>Submitting, posting, or sharing content that is unlawful, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable</li>
                <li>Engaging in any form of bullying, harassment, or intimidation of other users, including students, educators, or staff</li>
                <li>Impersonating any person or entity, or falsely claiming an affiliation with any person or organization</li>
                <li>Attempting to gain unauthorized access to any portion of the Services, other user accounts, or Brightside's systems or networks</li>
                <li>Using the Services for any commercial purpose, solicitation, or advertising without Brightside's prior written consent</li>
                <li>Uploading or transmitting viruses, malware, or any code designed to disrupt, damage, or limit the functionality of the Services</li>
                <li>Collecting or harvesting personally identifiable information from other users without their consent</li>
                <li>Using automated tools, bots, scrapers, or similar technologies to access, crawl, or index the Services</li>
                <li>Reproducing, distributing, modifying, or creating derivative works from any Brightside content without authorization</li>
                <li>Circumventing, disabling, or otherwise interfering with security-related features of the Services</li>
              </ul>
            </Subsection>
            <Subsection title="5.2 Reporting Violations">
              <p>If you become aware of any misuse of the Services or a violation of these Terms, please contact us at <a href="mailto:brightsidefinancefoundation@gmail.com" className="text-primary-light dark:text-mint hover:underline">brightsidefinancefoundation@gmail.com</a>. We take all reports seriously and will investigate appropriately.</p>
            </Subsection>
            <Subsection title="5.3 Consequences of Violations">
              <p>Brightside reserves the right, at its sole discretion, to remove any content, suspend or terminate any user account, and take any other appropriate action in response to violations of these Terms, including referring matters to law enforcement where applicable.</p>
            </Subsection>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="6. Intellectual Property">
            <Subsection title="6.1 Brightside Content">
              <p>All content on the Services — including but not limited to course materials, videos, text, graphics, logos, icons, images, audio clips, software, and the compilation thereof — is the property of Brightside Finance Foundation or its content suppliers and is protected by United States and international copyright, trademark, and other intellectual property laws.</p>
              <p>Subject to your compliance with these Terms, Brightside grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Services and their content solely for personal, non-commercial, educational purposes. This license does not include the right to:</p>
              <ul>
                <li>Reproduce, distribute, publicly display, or publicly perform any Brightside content</li>
                <li>Modify or create derivative works based on Brightside content</li>
                <li>Use data mining, robots, or similar data gathering tools</li>
                <li>Download or copy content for any commercial purpose</li>
              </ul>
            </Subsection>
            <Subsection title="6.2 Trademarks">
              <p>"Brightside," "Brightside Finance," the Brightside logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Brightside Finance Foundation. You may not use these marks without Brightside's prior written consent. All other trademarks referenced on the Services belong to their respective owners.</p>
            </Subsection>
            <Subsection title="6.3 User-Submitted Content">
              <p>If you submit, upload, or share content through the Services (such as responses, discussion posts, or feedback), you grant Brightside a worldwide, royalty-free, non-exclusive license to use, reproduce, modify, adapt, publish, and display such content for the purpose of operating and improving the Services. You represent and warrant that you own or have the right to submit such content and that it does not infringe any third-party rights.</p>
            </Subsection>
            <Subsection title="6.4 DMCA / Copyright Complaints">
              <p>If you believe that any content on the Services infringes your copyright, please contact our designated agent at <a href="mailto:brightsidefinancefoundation@gmail.com" className="text-primary-light dark:text-mint hover:underline">brightsidefinancefoundation@gmail.com</a> with a written notice that includes: (a) identification of the copyrighted work; (b) identification of the allegedly infringing material and its location; (c) your contact information; (d) a good-faith belief statement; and (e) a statement of accuracy under penalty of perjury.</p>
            </Subsection>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="7. Privacy & Data Protection">
            <p>Your privacy is extremely important to us. Our Privacy Policy, incorporated herein by reference, describes how we collect, use, and share information about you when you use our Services. By using the Services, you consent to the data practices described in our Privacy Policy.</p>
            <Subsection title="7.1 COPPA Compliance">
              <p>Brightside is committed to protecting the privacy of children. We comply with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect personal information from children under 13 without verifiable parental consent. Parents may review, request deletion of, or refuse further collection of their child's information by contacting <a href="mailto:brightsidefinancefoundation@gmail.com" className="text-primary-light dark:text-mint hover:underline">brightsidefinancefoundation@gmail.com</a>.</p>
            </Subsection>
            <Subsection title="7.2 California Privacy Rights (CCPA)">
              <p>If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA), including the right to:</p>
              <ul>
                <li>Know what personal information we collect, use, and disclose about you</li>
                <li>Request deletion of your personal information, subject to certain exceptions</li>
                <li>Opt out of the sale of your personal information (note: Brightside does not sell personal information)</li>
                <li>Non-discrimination for exercising your CCPA rights</li>
              </ul>
              <p>To exercise your California privacy rights, please submit a verifiable consumer request to <a href="mailto:brightsidefinancefoundation@gmail.com" className="text-primary-light dark:text-mint hover:underline">brightsidefinancefoundation@gmail.com</a>. We will respond to verifiable requests within 45 days as required by law.</p>
            </Subsection>
            <Subsection title="7.3 Educational Records (FERPA)">
              <p>To the extent applicable, Brightside complies with the Family Educational Rights and Privacy Act (FERPA). Where Brightside acts as a service provider to a school or school district, it will handle student educational records in accordance with FERPA and any applicable data processing agreements.</p>
            </Subsection>
            <Subsection title="7.4 Data Security">
              <p>Brightside implements reasonable technical and organizational measures to protect personal information against unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee the absolute security of your data.</p>
            </Subsection>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="8. Disclaimers & Limitation of Liability">
            <Subsection title="8.1 Disclaimer of Warranties">
              <p className="uppercase text-xs tracking-wide font-semibold text-[#6b7280] dark:text-[#8fa887]">The Services are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. To the fullest extent permitted by law, Brightside disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
              <p>Brightside does not warrant that: (a) the Services will be uninterrupted, timely, secure, or error-free; (b) results obtained from the Services will be accurate or reliable; (c) errors will be corrected; or (d) the Services or servers are free of viruses or other harmful components.</p>
            </Subsection>
            <Subsection title="8.2 Financial & Educational Disclaimer">
              <p>Our content is provided for general financial literacy and educational purposes only. Nothing on the Services constitutes professional financial, investment, legal, or tax advice. Brightside makes no guarantees regarding academic outcomes, test results, or financial outcomes as a result of using the Services. Always consult a qualified professional for advice specific to your individual circumstances.</p>
            </Subsection>
            <Subsection title="8.3 Limitation of Liability">
              <p className="uppercase text-xs tracking-wide font-semibold text-[#6b7280] dark:text-[#8fa887]">To the maximum extent permitted by applicable law, Brightside Finance Foundation, its officers, directors, employees, volunteers, partners, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of profits, or loss of goodwill, arising out of or in connection with these Terms or the Services. In no event shall Brightside's total cumulative liability to you for all claims exceed one hundred dollars ($100.00).</p>
            </Subsection>
            <Subsection title="8.4 Indemnification">
              <p>You agree to indemnify, defend, and hold harmless Brightside, its officers, directors, employees, volunteers, and agents from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to: (a) your use of the Services; (b) your violation of these Terms; (c) your violation of any applicable law or regulation; or (d) your infringement of any third-party rights.</p>
            </Subsection>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="9. Third-Party Links & Resources">
            <p>The Services may contain links to third-party websites, applications, or resources. These links are provided for informational and educational convenience only. Brightside does not endorse and is not responsible for the content, privacy practices, or availability of any third-party sites. You access any linked third-party site at your own risk.</p>
            <p>We are especially mindful that our primary audience is K-12 students. We endeavor to vet any third-party resources we link to, but we cannot guarantee the appropriateness of all external content. Parents and guardians are encouraged to monitor their children's online activity.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="10. Dispute Resolution">
            <Subsection title="10.1 Informal Resolution">
              <p>Before initiating any formal dispute, you agree to contact Brightside at <a href="mailto:brightsidefinancefoundation@gmail.com" className="text-primary-light dark:text-mint hover:underline">brightsidefinancefoundation@gmail.com</a> and provide a written description of the dispute. Both parties agree to make a good-faith effort to resolve the matter informally within thirty (30) days of written notice.</p>
            </Subsection>
            <Subsection title="10.2 Binding Arbitration">
              <p>If informal resolution is unsuccessful, any dispute, claim, or controversy arising out of or relating to these Terms or the Services shall be resolved by binding arbitration administered by the American Arbitration Association ("AAA") under its Consumer Arbitration Rules. The arbitration shall be conducted in Frisco, Texas, or via videoconference, and the arbitrator's decision shall be final and binding.</p>
              <p>You understand and agree that arbitration means you are waiving your right to a jury trial and your ability to participate in any class action or representative proceeding.</p>
            </Subsection>
            <Subsection title="10.3 Exceptions to Arbitration">
              <p>Notwithstanding the above, either party may seek injunctive or other equitable relief in a court of competent jurisdiction to prevent actual or threatened infringement of intellectual property rights or to address matters involving the safety of a minor.</p>
            </Subsection>
            <Subsection title="10.4 Class Action Waiver">
              <p className="uppercase text-xs tracking-wide font-semibold text-[#6b7280] dark:text-[#8fa887]">To the extent permitted by law, all claims must be brought in your individual capacity only, and not as a plaintiff or class member in any purported class, collective, or representative proceeding.</p>
            </Subsection>
            <Subsection title="10.5 Governing Law & Venue">
              <p>These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions. For matters not subject to arbitration, you consent to the exclusive jurisdiction of the state and federal courts located in Collin County, Texas.</p>
            </Subsection>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="11. Termination">
            <p>Brightside may suspend or terminate your access to the Services at any time and for any reason, including your violation of these Terms, without prior notice or liability. Upon termination, your right to use the Services immediately ceases.</p>
            <p>You may discontinue use of the Services at any time. If you have an account, you may request deletion by contacting <a href="mailto:brightsidefinancefoundation@gmail.com" className="text-primary-light dark:text-mint hover:underline">brightsidefinancefoundation@gmail.com</a>. Provisions relating to intellectual property, disclaimers, limitation of liability, and dispute resolution shall survive any termination.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="12. Accessibility">
            <p>Brightside is committed to making its Services accessible to all students, including those with disabilities. We strive to comply with the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level. If you experience any accessibility barriers, please contact <a href="mailto:brightsidefinancefoundation@gmail.com" className="text-primary-light dark:text-mint hover:underline">brightsidefinancefoundation@gmail.com</a> and we will make reasonable efforts to accommodate your needs.</p>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="13. General Provisions">
            <Subsection title="13.1 Entire Agreement">
              <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and Brightside regarding the Services and supersede all prior agreements, understandings, and representations.</p>
            </Subsection>
            <Subsection title="13.2 Severability">
              <p>If any provision of these Terms is held to be invalid, illegal, or unenforceable, that provision shall be modified to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.</p>
            </Subsection>
            <Subsection title="13.3 Waiver">
              <p>Brightside's failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision unless acknowledged and agreed to by Brightside in writing.</p>
            </Subsection>
            <Subsection title="13.4 Assignment">
              <p>You may not assign or transfer any of your rights or obligations under these Terms without Brightside's prior written consent. Brightside may assign its rights and obligations without restriction.</p>
            </Subsection>
            <Subsection title="13.5 Force Majeure">
              <p>Brightside shall not be liable for any failure or delay in performing its obligations to the extent resulting from causes beyond Brightside's reasonable control, including acts of God, natural disasters, pandemics, governmental actions, or internet outages.</p>
            </Subsection>
            <Subsection title="13.6 Notice">
              <p>Brightside may provide notice to you via email to the address associated with your account or through the Services. You may provide notice to Brightside at the contact information listed in Section 14.</p>
            </Subsection>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <Section title="14. Contact Information">
            <p>If you have any questions about these Terms or our Services, please reach out to us at:</p>
            <div className="mt-4 p-5 bg-white dark:bg-[#242924] rounded-2xl border border-primary/10 dark:border-mint/10 space-y-1">
              <p className="font-semibold text-primary dark:text-mint">Brightside Finance Foundation</p>
              <p>Frisco, Texas</p>
              <div className="mt-3 space-y-1 text-sm">
                {[
                  ['General Inquiries', 'brightsidefinancefoundation@gmail.com'],
                  ['Legal & Compliance', 'brightsidefinancefoundation@gmail.com'],
                  ['Privacy', 'brightsidefinancefoundation@gmail.com'],
                  ['User Conduct', 'brightsidefinancefoundation@gmail.com'],
                  ['Accessibility', 'brightsidefinancefoundation@gmail.com'],
                  ['Student Support', 'brightsidefinancefoundation@gmail.com'],
                ].map(([label, email]) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-[#6b7280] dark:text-[#8fa887] w-36 shrink-0">{label}:</span>
                    <a href={`mailto:${email}`} className="text-primary-light dark:text-mint hover:underline">{email}</a>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="mt-12 pt-8 border-t border-primary/10 dark:border-mint/10 text-center text-sm text-[#6b7280] dark:text-[#8fa887]">
            <p className="font-semibold text-primary dark:text-mint">Brightside Finance Foundation  |  Bringing finance into the light.</p>
            <p className="mt-1">Last updated: April 11, 2026</p>
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
      <div className="space-y-3 text-[#374151] dark:text-[#c5d4bc] leading-relaxed text-[15px] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-primary-light [&_a]:dark:text-mint">
        {children}
      </div>
    </div>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold text-primary dark:text-mint mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ScrollText } from 'lucide-react'
import {
  LegalLayout,
  LegalList,
  LegalSection,
  type LegalSectionMeta,
} from '../components/layout/LegalLayout'

const sections: LegalSectionMeta[] = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'account', title: 'Your Account' },
  { id: 'content', title: 'Your Content' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'public-sharing', title: 'Public Document Sharing' },
  { id: 'availability', title: 'Service Availability & Changes' },
  { id: 'fees', title: 'Fees & Payment' },
  { id: 'ip', title: 'Intellectual Property' },
  { id: 'warranties', title: 'Disclaimer of Warranties' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'termination', title: 'Termination' },
  { id: 'changes', title: 'Changes to These Terms' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'contact', title: 'Contact' },
]

const content: Record<string, ReactNode> = {
  acceptance: (
    <>
      <p>
        By creating a Billflow account or using Billflow on web or mobile, you agree to these Terms of
        Service (&quot;Terms&quot;). Billflow is a service for creating and managing business documents
        such as estimates, invoices, and receipts. If you do not agree to these Terms, do not use
        Billflow.
      </p>
      <p>
        These Terms form a binding agreement between you and TemiForge Studio (&quot;Billflow,&quot; &quot;we,&quot;
        &quot;our,&quot; &quot;us&quot;).
      </p>
    </>
  ),
  eligibility: (
    <p>
      You must be at least 18 years old, or the age of legal majority in your jurisdiction, to create
      a Billflow account. By using Billflow, you confirm that you meet this requirement and that you
      have the authority to act on behalf of any business you represent within Billflow.
    </p>
  ),
  account: (
    <p>
      You are responsible for keeping your login credentials secure and for all activity that occurs
      under your account. You agree to provide accurate business and contact information when using
      Billflow, and to keep that information up to date. Notify us immediately at{' '}
      <a href="mailto:support@billflow.app">support@billflow.app</a> if you suspect unauthorized access
      to your account.
    </p>
  ),
  content: (
    <>
      <p>
        You retain ownership of the documents, client data, and business information you store in Billflow
        (&quot;Your Content&quot;). You grant us a limited, non-exclusive license to host, process, store, and
        display Your Content solely as needed to operate and provide Billflow&apos;s features to you.
      </p>
      <p>
        You are solely responsible for Your Content, including its accuracy and your right to collect and
        store any client or third-party information within it. As set out in our{' '}
        <Link to="/privacy">Privacy Policy</Link>, you act as the data controller for any client records
        you enter into Billflow.
      </p>
    </>
  ),
  'acceptable-use': (
    <>
      <p>You agree not to use Billflow to:</p>
      <LegalList
        items={[
          'Violate any applicable law or regulation',
          'Create or send fraudulent, deceptive, or misleading invoices or estimates',
          'Upload content that infringes the intellectual property, privacy, or other rights of any third party',
          'Attempt to gain unauthorized access to Billflow, other accounts, or our systems',
          'Interfere with or disrupt Billflow\u2019s operation, including through malware, scraping, or excessive automated requests',
        ]}
      />
      <p>
        We may investigate and suspend or terminate accounts that violate this section, with or without
        notice, depending on severity.
      </p>
    </>
  ),
  'public-sharing': (
    <p>
      Billflow allows you to share documents via a public link. You are responsible for controlling who
      receives these links, as anyone with the link can view the shared document. We are not responsible
      for content you choose to share publicly through this feature.
    </p>
  ),
  availability: (
    <p>
      We aim to keep Billflow reliable but do not guarantee uninterrupted, error-free, or continuous
      access. Features may be added, changed, or removed as the product evolves. We are not liable for
      any loss resulting from downtime, maintenance, or discontinued features, though we will make
      reasonable efforts to notify you of significant changes.
    </p>
  ),
  fees: (
    <p>
      If you subscribe to a paid plan, you agree to pay the applicable fees as described at checkout.
      Fees are billed monthly or annually and are non-refundable except as required by law. We may change
      pricing with advance notice.
    </p>
  ),
  ip: (
    <p>
      Billflow, including its design, branding, and underlying software, is owned by TemiForge Studio
      and protected by intellectual property laws. These Terms do not grant you any rights to our
      trademarks, logos, or app code beyond what&apos;s needed to use Billflow as intended.
    </p>
  ),
  warranties: (
    <p>
      Billflow is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind, express or
      implied. We do not warrant that Billflow will be error-free, secure, or fit for a particular
      purpose, including compliance with tax, accounting, or invoicing regulations in your jurisdiction.
      You are responsible for verifying that documents generated through Billflow meet your local legal
      and regulatory requirements.
    </p>
  ),
  liability: (
    <p>
      To the maximum extent permitted by law, TemiForge Studio and Billflow will not be liable for any
      indirect, incidental, special, or consequential damages, including loss of revenue, data, or
      business opportunities, arising from your use of Billflow. Our total liability for any claim
      relating to Billflow will not exceed the amount you paid us, if any, in the 12 months preceding
      the claim.
    </p>
  ),
  termination: (
    <p>
      You may delete your account at any time from Account Settings. We may suspend or terminate your
      access if you violate these Terms, misuse the service, or if required by law. Upon termination,
      your right to use Billflow ends, though data deletion is handled per our{' '}
      <Link to="/privacy">Privacy Policy</Link>.
    </p>
  ),
  changes: (
    <p>
      We may update these Terms from time to time. If we make material changes, we will notify you
      through the app or by email before the changes take effect. Continued use of Billflow after
      changes take effect constitutes acceptance of the updated Terms.
    </p>
  ),
  'governing-law': (
    <p>
      These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to
      conflict of law principles, unless otherwise required by local law where you reside.
    </p>
  ),
  contact: (
    <p>
      Questions about these Terms? Email{' '}
      <a href="mailto:support@billflow.app">support@billflow.app</a>
    </p>
  ),
}

export default function TermsPage() {
  return (
    <LegalLayout
      icon={ScrollText}
      eyebrow="Legal"
      title="Terms of Service"
      intro="The ground rules for using Billflow to create and manage your estimates, invoices, and receipts."
      updated="July 2026"
      sections={sections}
    >
      {sections.map((s, i) => (
        <LegalSection key={s.id} id={s.id} index={i + 1} title={s.title}>
          {content[s.id]}
        </LegalSection>
      ))}
    </LegalLayout>
  )
}

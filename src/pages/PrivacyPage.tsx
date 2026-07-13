import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import {
  LegalLayout,
  LegalList,
  LegalSection,
  type LegalSectionMeta,
} from '../components/layout/LegalLayout'

const sections: LegalSectionMeta[] = [
  { id: 'overview', title: 'Overview' },
  { id: 'collect', title: 'Information We Collect' },
  { id: 'use', title: 'How We Use Information' },
  { id: 'controller', title: 'Your Role as Data Controller' },
  { id: 'third-party', title: 'Third-Party Services' },
  { id: 'public-sharing', title: 'Public Document Sharing' },
  { id: 'security', title: 'Data Storage & Security' },
  { id: 'retention', title: 'Data Retention' },
  { id: 'rights', title: 'Your Rights' },
  { id: 'children', title: "Children's Privacy" },
  { id: 'changes', title: 'Changes to This Policy' },
  { id: 'contact', title: 'Contact' },
]

const collectItems: { label: string; desc: string }[] = [
  {
    label: 'Account information',
    desc: 'email address, name, and password (managed securely via Supabase Authentication).',
  },
  {
    label: 'Business profile information',
    desc: 'your business name, logo, address, tax/registration details, and other information you add to personalize your invoices and documents.',
  },
  {
    label: 'Client records',
    desc: 'names, emails, addresses, and other details you enter about your own clients and customers in order to create estimates, invoices, and receipts.',
  },
  {
    label: 'Documents',
    desc: 'the estimates, invoices, and receipts you create, along with associated metadata (amounts, dates, statuses, and document history).',
  },
  {
    label: 'Device and usage information',
    desc: 'basic technical data such as device type, app version, and crash logs, used to maintain and improve app performance.',
  },
]

const content: Record<string, ReactNode> = {
  overview: (
    <>
      <p>
        Billflow (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;) respects your privacy. This policy explains what
        information we collect, why we collect it, how we use it, and the choices you have. By using
        Billflow, you agree to the practices described here.
      </p>
      <p>
        Billflow is intended for business and invoicing use. It is not directed at children, and you
        must be at least 18 years old (or the age of legal majority in your jurisdiction) to create
        an account.
      </p>
    </>
  ),
  collect: (
    <>
      <div className="space-y-3">
        {collectItems.map(({ label, desc }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            <p className="mt-1 text-sm text-slate-600">{desc}</p>
          </div>
        ))}
      </div>
      <p>We do not collect more information than is necessary to provide the app&apos;s features.</p>
    </>
  ),
  use: (
    <>
      <p>We use the information we collect to:</p>
      <LegalList
        items={[
          'Create, store, and manage your estimates, invoices, and receipts',
          'Generate PDF documents and enable sharing (download, link, or share sheet)',
          'Maintain your account and authenticate your access',
          'Provide customer support and respond to inquiries',
          'Maintain and improve the security, stability, and performance of the app',
        ]}
      />
      <p>
        We do not sell your personal information, and we do not use your data or your clients&apos; data
        for advertising.
      </p>
    </>
  ),
  controller: (
    <p>
      When you add your clients&apos; names, contact details, or financial information to Billflow,{' '}
      <strong>you</strong> are the data controller for that information, and Billflow acts as a data
      processor storing it on your behalf. You are responsible for ensuring you have the right to
      collect and store your clients&apos; information, and for complying with any privacy laws that
      apply to your own business.
    </p>
  ),
  'third-party': (
    <>
      <p>
        We rely on the following third-party services to operate Billflow. Each processes data only as
        needed to provide their service to us:
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <th className="px-4 py-2.5">Service</th>
              <th className="px-4 py-2.5">Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200">
              <td className="px-4 py-3 font-medium text-slate-900">Supabase</td>
              <td className="px-4 py-3 text-slate-600">
                Authentication, database, and secure file storage
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>We do not share your data with third parties for their own marketing purposes.</p>
    </>
  ),
  'public-sharing': (
    <p>
      Billflow allows you to share documents via a public link (<code>billflow.app/d/&#123;slug&#125;</code>).{' '}
      <strong>Anyone with access to this link can view the document</strong>, regardless of whether they
      have a Billflow account. Only share these links with intended recipients. You can generate a new
      link or disable sharing for a document at any time from within the app.
    </p>
  ),
  security: (
    <p>
      Your data is stored on secure cloud infrastructure with access controls and encryption in transit.
      While we take reasonable measures to protect your information, no system is 100% secure, and you
      are responsible for safeguarding your device and account credentials (including using a strong
      password and not sharing your login).
    </p>
  ),
  retention: (
    <p>
      We retain your account and document data for as long as your account remains active. If you delete
      your account, your data is permanently deleted from our active systems, though residual copies may
      persist in encrypted backups for up to 30 days before being purged.
    </p>
  ),
  rights: (
    <>
      <p>Depending on your location, you may have the right to:</p>
      <LegalList
        items={[
          'Access, correct, or export your data',
          'Delete your account and associated data',
          'Object to or restrict certain processing',
          'Request a copy of your data in a portable format',
        ]}
      />
      <p>
        You can update your profile, export your documents, or delete your account directly within the app.
        Deleting your account permanently removes your stored data, subject to the retention period above.
      </p>
      <p>
        If you are located in Nigeria, these rights are provided in line with the Nigeria Data Protection
        Act (NDPA) 2023. If you are located in the EU/UK, you additionally have rights under GDPR. If you
        are located in California, you have rights under the CCPA.
      </p>
    </>
  ),
  children: (
    <p>
      Billflow is not intended for use by anyone under 18. We do not knowingly collect information from
      children. If you believe a child has provided us with personal information, contact us and we will
      delete it.
    </p>
  ),
  changes: (
    <p>
      We may update this policy from time to time. If we make material changes, we will notify you through
      the app or by email before the changes take effect. The &quot;Last updated&quot; date at the top reflects
      the most recent revision.
    </p>
  ),
  contact: (
    <p>
      Privacy questions or requests? Email{' '}
      <a href="mailto:support@billflow.app">support@billflow.app</a>
    </p>
  ),
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      icon={ShieldCheck}
      eyebrow="Legal"
      title="Privacy Policy"
      intro="How Billflow collects, uses, and protects your data — and the choices you have over it."
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

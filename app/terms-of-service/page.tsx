import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-10">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900">Terms of Service</h1>
          <Link
            href="/"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Back to Home
          </Link>
        </div>

        <div className="space-y-6 text-sm leading-7 text-zinc-700">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">1. Acceptance of Terms</h2>
            <p>
              By using Tars Social, you agree to these Terms of Service and all
              applicable laws and regulations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">2. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account
              credentials and all activities under your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">3. Acceptable Use</h2>
            <p>
              You agree not to misuse the service, disrupt operations, attempt
              unauthorized access, or use the service for unlawful activities.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">4. Intellectual Property</h2>
            <p>
              The service, including software, branding, and content provided by us,
              remains the intellectual property of Tars Social and its licensors.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">5. Termination</h2>
            <p>
              We may suspend or terminate access to the service for violations of these
              terms or to protect platform integrity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">6. Limitation of Liability</h2>
            <p>
              The service is provided on an as-is basis. To the maximum extent permitted
              by law, we are not liable for indirect or consequential damages.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">7. Contact</h2>
            <p>
              For terms-related questions, contact: legal@tarssocial.com
            </p>
          </section>

          <p className="pt-4 text-xs text-zinc-500">Last updated: February 28, 2026</p>
        </div>
      </div>
    </main>
  );
}
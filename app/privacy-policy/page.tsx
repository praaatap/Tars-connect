import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-10">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900">Privacy Policy</h1>
          <Link
            href="/"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Back to Home
          </Link>
        </div>

        <div className="space-y-6 text-sm leading-7 text-zinc-700">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">1. Information We Collect</h2>
            <p>
              We collect account details you provide during sign-up, such as name,
              email address, and profile information. We also collect usage data needed
              to operate and improve messaging features.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">2. How We Use Information</h2>
            <p>
              Your information is used to authenticate users, deliver messages,
              maintain security, and improve product experience. We do not sell personal
              information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">3. Data Sharing</h2>
            <p>
              We may share data with trusted service providers required to operate the
              platform, such as authentication, hosting, and analytics providers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">4. Data Retention</h2>
            <p>
              We retain account and messaging data for as long as your account is active,
              unless a longer retention period is required by law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">5. Your Rights</h2>
            <p>
              You may request access, correction, or deletion of your data by contacting
              us. You may also close your account at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">6. Contact</h2>
            <p>
              For privacy-related questions, contact: privacy@tarssocial.com
            </p>
          </section>

          <p className="pt-4 text-xs text-zinc-500">Last updated: February 28, 2026</p>
        </div>
      </div>
    </main>
  );
}
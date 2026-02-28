import Link from "next/link";

export default function AdminSignInPage() {
  return (
    <div className="admin-shell">
      <div className="sign-in-card">
        <p className="eyebrow">Protected Internal Area</p>
        <h1 style={{ fontSize: "3rem", maxWidth: "10ch" }}>Admin access is intentionally gated.</h1>
        <p className="section-body">
          Phase 1 establishes the protected dashboard boundary before real admin authentication lands.
          Use the preview gate below to enter the internal shell during implementation.
        </p>
        <div className="sign-in-actions">
          <Link className="solid-chip" href="/admin/sign-in?preview=1">
            Enter preview dashboard
          </Link>
          <Link className="ghost-chip" href="/">
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Beat, BeatLicenseCode, getBeatLicenseOptions } from "@/lib/beats";
import { BeatInquiryForm } from "@/components/beats/beat-inquiry-form";

export function BeatLicenseInquiry({ beat }: { beat: Beat }) {
  const licenseOptions = getBeatLicenseOptions(beat);
  const [selectedLicense, setSelectedLicense] = useState<BeatLicenseCode>(licenseOptions[0].code);
  const activeLicense = licenseOptions.find((license) => license.code === selectedLicense) ?? licenseOptions[0];

  return (
    <section className="beat-license-shell">
      <div className="beat-license-head">
        <div>
          <p className="eyebrow">Licensing Flow</p>
          <h2>Select the lane that matches the release.</h2>
        </div>
        <p className="section-body">
          CBA is handling sales manually in v1. Choose the license tier that fits the release, then send the
          inquiry with the beat already attached.
        </p>
      </div>

      <div className="beat-license-grid">
        {licenseOptions.map((license) => {
          const isActive = license.code === activeLicense.code;

          return (
            <button
              key={license.code}
              type="button"
              className={`beat-license-card ${isActive ? "active" : ""}`}
              onClick={() => {
                setSelectedLicense(license.code);
              }}
            >
              <div className="beat-license-card-top">
                <div>
                  <span>{license.usage}</span>
                  <h3>{license.name}</h3>
                </div>
                <strong>${license.price}</strong>
              </div>
              <p>{license.shortDescription}</p>
              <ul>
                {license.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <em>{license.turnaround}</em>
            </button>
          );
        })}
      </div>

      <div className="beat-license-inquiry-stage">
        <div className="beat-license-active">
          <p className="eyebrow">Selected Tier</p>
          <h3>{activeLicense.name}</h3>
          <p>{activeLicense.shortDescription}</p>
          <div className="beat-detail-chip-row">
            <span>{activeLicense.usage}</span>
            <span>{activeLicense.turnaround}</span>
            <span>${activeLicense.price} anchor</span>
          </div>
        </div>
        <BeatInquiryForm beat={beat} selectedLicense={activeLicense.code} licenseLabel={activeLicense.name} />
      </div>
    </section>
  );
}

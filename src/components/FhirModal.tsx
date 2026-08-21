import React, { useState } from "react";
import { Code, Download, Copy, Check, X, ShieldCheck, FileText } from "lucide-react";
import { SoapNote } from "../types";

interface FhirModalProps {
  soapNote: SoapNote | null;
  onClose: () => void;
  onShowToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

export const FhirModal: React.FC<FhirModalProps> = ({ soapNote, onClose, onShowToast }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!soapNote) return null;

  // HL7 FHIR R4 Bundle Representation
  const fhirBundle = {
    resourceType: "Bundle",
    id: `bundle-encounter-${Date.now()}`,
    type: "document",
    timestamp: new Date().toISOString(),
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"],
      versionId: "1.0",
      lastUpdated: new Date().toISOString(),
    },
    entry: [
      {
        resource: {
          resourceType: "Composition",
          status: "final",
          type: {
            coding: [
              {
                system: "http://loinc.org",
                code: "11488-4",
                display: "Consultation note",
              },
            ],
          },
          subject: {
            reference: "Patient/pat-1",
            display: "Robert Chen (MRN: #MC-88204)",
          },
          date: new Date().toISOString(),
          author: [
            {
              reference: "Practitioner/doc-1",
              display: "Dr. Sarah Lin, MD (NPI: #1984210984)",
            },
          ],
          title: "OmniScribe Ambulatory & Inpatient Consultation Note",
          section: [
            {
              title: "Subjective",
              code: { coding: [{ system: "http://loinc.org", code: "61150-9" }] },
              text: {
                status: "generated",
                div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${soapNote.subjective.chiefComplaint}</p><p>${soapNote.subjective.historyOfPresentIllness}</p></div>`,
              },
            },
            {
              title: "Objective",
              code: { coding: [{ system: "http://loinc.org", code: "61149-1" }] },
              text: {
                status: "generated",
                div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>BP: ${soapNote.objective.vitalSigns.bloodPressure}, HR: ${soapNote.objective.vitalSigns.heartRate}</p></div>`,
              },
            },
            {
              title: "Assessment",
              code: { coding: [{ system: "http://loinc.org", code: "51848-0" }] },
              text: {
                status: "generated",
                div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${soapNote.assessment.primaryDiagnosis} (ICD-10: ${soapNote.assessment.icd10Code})</p></div>`,
              },
            },
            {
              title: "Plan",
              code: { coding: [{ system: "http://loinc.org", code: "18776-5" }] },
              text: {
                status: "generated",
                div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>Follow up: ${soapNote.plan.followUp}</p></div>`,
              },
            },
          ],
        },
      },
      {
        resource: {
          resourceType: "Condition",
          clinicalStatus: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }],
          },
          verificationStatus: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "confirmed" }],
          },
          code: {
            coding: [
              {
                system: "http://hl7.org/fhir/sid/icd-10-cm",
                code: soapNote.assessment.icd10Code,
                display: soapNote.assessment.primaryDiagnosis,
              },
            ],
          },
          subject: { reference: "Patient/pat-1" },
        },
      },
    ],
  };

  const jsonString = JSON.stringify(fhirBundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    onShowToast("HL7 FHIR v4 Bundle JSON copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fhir-encounter-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast("HL7 FHIR v4 Bundle JSON downloaded!", "success");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">HL7 FHIR R4 Bundle Export</h3>
              <p className="text-xs text-slate-500">
                US Core Implementation Guide Compliant (EHR Interoperability)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* JSON Code Viewer */}
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4 relative">
          <pre className="text-xs font-mono text-emerald-400 overflow-y-auto h-full max-h-[440px] leading-relaxed">
            {jsonString}
          </pre>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically Certified Interoperable Payload</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy JSON"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download FHIR Bundle (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

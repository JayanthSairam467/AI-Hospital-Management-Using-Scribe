export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: "Male" | "Female" | "Other";
  mrn: string;
  dob: string;
  bloodType: string;
  allergies: string[];
  currentMeds: string[];
  vitals: {
    bp: string;
    hr: string;
    rr: string;
    temp: string;
    spo2: string;
    bmi: string;
    weight: string;
  };
  primaryCondition: string;
  room?: string;
  avatarUrl?: string;
}

export interface TranscriptLine {
  id: string;
  speaker: "Doctor" | "Patient" | "Nurse";
  text: string;
  timestamp: string;
  category?: "symptom" | "medication" | "vital" | "general";
}

export interface SoapNote {
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: string[];
    currentMedications: string[];
    allergies: string[];
  };
  objective: {
    vitalSigns: {
      bloodPressure: string;
      heartRate: string;
      respiratoryRate: string;
      temperature: string;
      spO2: string;
      bmi: string;
    };
    physicalExam: string[];
    labDiagnosticResults: string[];
  };
  assessment: {
    primaryDiagnosis: string;
    icd10Code: string;
    differentialDiagnoses: string[];
    clinicalRiskTier: "Low" | "Moderate" | "High" | "Critical";
    clinicalRationale: string;
  };
  plan: {
    medicationsPrescribed: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }[];
    diagnosticOrders: string[];
    patientEducation: string[];
    followUp: string;
    redFlagWarnings: string[];
  };
  fhirResource?: {
    resourceType: string;
    id: string;
    status: string;
    category: string;
  };
}

export interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  category: string;
  stockUnits: number;
  maxUnits: number;
  minThreshold: number;
  unitType: string;
  status: "optimal" | "low" | "critical" | "surplus";
  batchNumber: string;
  expiryDate: string;
  location: string;
  dailyConsumption: number;
}

export type BedStatus = "available" | "occupied" | "reserved" | "critical" | "cleaning";

export interface Bed {
  id: string;
  code: string;
  ward: "ICU" | "Ward A" | "Ward B" | "Emergency Triage";
  floor: number;
  status: BedStatus;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  diagnosis?: string;
  attendingDoctor?: string;
  oxygenFlowLpm?: number;
  spO2?: number;
  heartRate?: number;
  occupiedSince?: string;
}

export interface OxygenManifold {
  wardName: string;
  currentLevelPct: number;
  pressurePsi: number;
  status: "normal" | "warning" | "critical";
  activeFlowLpm: number;
  estimatedHoursLeft: number;
}

export interface Ambulance {
  id: string;
  callSign: string;
  driver: string;
  paramedic: string;
  status: "in-transit" | "arriving" | "at-scene" | "available";
  etaMinutes: number;
  emergencyType: string;
  urgencyTier: "Cardiac Emergency" | "Trauma Level 1" | "Respiratory Failure" | "Routine Transfer";
  destinationBay: string;
  telemetry: {
    speedKmh: number;
    patientSpO2: number;
    patientHR: number;
    patientBP: string;
    ecgUploaded: boolean;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "on-duty" | "in-consult" | "in-or" | "on-break" | "on-call";
  shift: string;
  pagerId: string;
  patientsAssigned: number;
  avatarInitials: string;
}

export interface WhatIfMessage {
  id: string;
  sender: "doctor" | "ai";
  text: string;
  timestamp: string;
  tags?: string[];
  source?: string;
}

export interface ClinicalNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "ambulance" | "inventory" | "bed" | "oxygen" | "clinical";
  severity: "info" | "warning" | "critical";
  read: boolean;
  actionUrl?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "critical" | "warning" | "info";
  read: boolean;
}


import type { Patient } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PatientHistoryTabProps {
  patient: Patient
}

export function PatientHistoryTab({ patient }: PatientHistoryTabProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-white/90">Patient History</h3>

        <div className="space-y-6">
          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Medical History</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>• {patient.name === "Jane Doe" ? "Hypertension (diagnosed 2018)" : "COPD (diagnosed 2015)"}</li>
              <li>
                •{" "}
                {patient.name === "Jane Doe"
                  ? "Type 2 diabetes mellitus (diagnosed 2019)"
                  : "30 pack-year smoking history (quit 2020)"}
              </li>
              <li>• {patient.name === "Jane Doe" ? "Hyperlipidemia" : "Coronary artery disease"}</li>
            </ul>
          </section>

          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Surgical History</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>• {patient.name === "Jane Doe" ? "Appendectomy (2005)" : "Cholecystectomy (2010)"}</li>
              <li>• {patient.name === "Jane Doe" ? "Cesarean section (2000)" : "Right knee replacement (2018)"}</li>
            </ul>
          </section>

          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Family History</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li className="text-sm text-white/70">
                • {patient.name === "Jane Doe" ? "Mother: Brain cancer at age 58" : "Father: Lung cancer at age 62"}
              </li>
              <li>
                •{" "}
                {patient.name === "Jane Doe"
                  ? "Maternal aunt: Ovarian cancer at age 65"
                  : "Brother: Prostate cancer at age 59"}
              </li>
            </ul>
          </section>

          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Current Medications</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>• {patient.name === "Jane Doe" ? "Metformin 1000mg BID" : "Tiotropium bromide inhaler daily"}</li>
              <li>• {patient.name === "Jane Doe" ? "Lisinopril 10mg daily" : "Atorvastatin 40mg daily"}</li>
              <li>• {patient.name === "Jane Doe" ? "Atorvastatin 20mg daily" : "Aspirin 81mg daily"}</li>
            </ul>
          </section>

          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Allergies</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>• {patient.name === "Jane Doe" ? "Penicillin (hives)" : "Sulfa drugs (rash)"}</li>
              <li>
                • {patient.name === "Jane Doe" ? "No other known drug allergies" : "Contrast media (mild reaction)"}
              </li>
            </ul>
          </section>

          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Social History</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>• {patient.name === "Jane Doe" ? "Non-smoker" : "Former smoker (30 pack-years, quit 2020)"}</li>
              <li>• {patient.name === "Jane Doe" ? "Occasional alcohol use" : "Social alcohol use"}</li>
              <li>
                • {patient.name === "Jane Doe" ? "Retired elementary school teacher" : "Retired construction worker"}
              </li>
            </ul>
          </section>
        </div>
      </div>
    </ScrollArea>
  )
}

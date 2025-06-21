import type { Patient } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CaseOverviewTabProps {
  patient: Patient
}

export function CaseOverviewTab({ patient }: CaseOverviewTabProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-white/90">
          {patient.name === "Jane Doe" ? "Radiology Report: Brain MRI (August 15, 2024)" : "Radiology Report: Chest CT (August 12, 2024)"}
        </h3>

        <div className="space-y-6">
          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Patient Information</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>• Name: {patient.name}</li>
              <li>• DOB: {patient.dob}</li>
              <li>• MRN: {patient.mrn}</li>
              <li>• Case ID: {patient.caseId}</li>
              <li>• Date of Exam: {patient.name === "Jane Doe" ? "August 15, 2024" : "August 12, 2024"}</li>
            </ul>
          </section>

          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Referring Physician</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>• Dr. [REDACTED]</li>
            </ul>
          </section>

          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Indication</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>
                • {patient.name === "Jane Doe" ? "Evaluation of brain mass" : "Evaluation of left lung nodule"}
              </li>
            </ul>
          </section>

          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Technique</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>
                •{" "}
                {patient.name === "Jane Doe"
                  ? "MRI of the brain was performed using a dedicated head coil. Multiplanar, multisequence imaging was obtained before and after the administration of intravenous contrast."
                  : "CT of the chest was performed using a standard protocol with intravenous contrast. Images were acquired in the axial plane with 1mm slice thickness."}
              </li>
            </ul>
          </section>

          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Findings</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>
                •{" "}
                {patient.name === "Jane Doe"
                  ? "There is a 2.5 cm irregular mass in the right temporal lobe. The mass demonstrates irregular margins and heterogeneous enhancement. No evidence of midline shift or mass effect. No surrounding edema."
                  : "There is a 1.8 cm spiculated nodule in the left lower lobe. The nodule demonstrates irregular margins and ground-glass opacity. No evidence of mediastinal or hilar lymphadenopathy. No pleural effusion."}
              </li>
            </ul>
          </section>

          <section>
            <h4 className="text-md font-medium mb-2 text-white/80">Impression</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>
                •{" "}
                {patient.name === "Jane Doe"
                  ? "BI-RADS 5: Highly suspicious for malignancy. Recommend tissue diagnosis."
                  : "Lung adenocarcinoma, moderately differentiated. Recommend molecular testing and oncology referral."}
              </li>
            </ul>
          </section>
        </div>
      </div>
    </ScrollArea>
  )
}

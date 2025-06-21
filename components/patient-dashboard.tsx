"use client"

import type { Patient } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseOverviewTab } from "@/components/tabs/case-overview-tab"
import { PatientHistoryTab } from "@/components/tabs/patient-history-tab"
import { ImagesTab } from "@/components/tabs/images-tab"
import { BiomarkersTab } from "@/components/tabs/biomarkers-tab"
import { ResourcesTab } from "@/components/tabs/resources-tab"
import { VCFAnalysisTab } from "@/components/tabs/vcf-analysis-tab"
import { Button } from "@/components/ui/button"
import { generatePatientReport } from "@/lib/pdf-generator"
import { toast } from "sonner"

interface PatientDashboardProps {
  patient: Patient
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function PatientDashboard({ patient, activeTab, setActiveTab }: PatientDashboardProps) {
  const tabs = ["CASE OVERVIEW", "PATIENT HISTORY", "IMAGES", "BIOMARKERS", "RESOURCES", "VCF ANALYSIS"]

  const handleGenerateReport = () => {
    try {
      // Get sample biomarkers data
      const biomarkers = [
        { name: "CEA", value: "15.2", unit: "ng/mL", status: "Elevated" },
        { name: "CA 19-9", value: "89.3", unit: "U/mL", status: "Elevated" },
        { name: "PD-L1", value: "45", unit: "%", status: "Positive" },
        { name: "MSI Status", value: "Stable", unit: "", status: "Normal" },
        { name: "TMB", value: "8.2", unit: "mut/Mb", status: "Intermediate" }
      ]

      generatePatientReport({
        patient,
        biomarkers,
        customNotes: `Patient presented with ${patient.name === "Jane Doe" ? "progressive neurological symptoms" : "persistent respiratory symptoms"}. Multidisciplinary team consultation recommended for optimal treatment planning.`
      })
      
      toast.success(`Comprehensive report generated for ${patient.name}`)
    } catch (error) {
      console.error('Report generation failed:', error)
      toast.error('Failed to generate report. Please try again.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white/90">{patient.name}</h2>
        <div className="flex items-center space-x-4 text-xs text-white/70">
          <div>DOA: Today</div>
          <div>DOB: {patient.dob}</div>
          <div>MRN: {patient.mrn}</div>
        </div>
      </div>

      <div className="flex items-center border-b border-white/10">
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-white/10 w-full justify-start h-12 rounded-none">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className={`text-xs font-medium px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-[#4a6bff] data-[state=active]:text-white data-[state=active]:shadow-none rounded-none ${
                    activeTab === tab ? "" : "text-white/50"
                  }`}
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            className="text-xs bg-transparent border border-[#4a6bff] text-[#4a6bff] hover:bg-[#4a6bff]/10"
          >
            REPORT
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "CASE OVERVIEW" && <CaseOverviewTab patient={patient} />}
        {activeTab === "PATIENT HISTORY" && <PatientHistoryTab patient={patient} />}
        {activeTab === "IMAGES" && <ImagesTab patient={patient} />}
        {activeTab === "BIOMARKERS" && <BiomarkersTab patient={patient} />}
        {activeTab === "RESOURCES" && <ResourcesTab patient={patient} />}
        {activeTab === "VCF ANALYSIS" && <VCFAnalysisTab patient={patient} />}
      </div>
    </div>
  )
}

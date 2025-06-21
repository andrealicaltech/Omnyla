import type { Patient } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileIcon, BookIcon, LinkIcon, FileTextIcon } from "lucide-react"

interface ResourcesTabProps {
  patient: Patient
}

export function ResourcesTab({ patient }: ResourcesTabProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-white/90">Resources</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-[#1a1a30] border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90 flex items-center">
                <FileIcon className="h-4 w-4 mr-2" />
                Clinical Guidelines
              </CardTitle>
              <CardDescription className="text-white/70">
                {patient.name === "Jane Doe"
                  ? "Brain Cancer Treatment Guidelines"
                  : "Lung Cancer Treatment Guidelines"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center">
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "NCCN Guidelines for Brain Cancer (2024)"
                      : "NCCN Guidelines for Lung Cancer (2024)"}
                  </a>
                </li>
                <li className="flex items-center">
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "ASCO Brain Cancer Treatment Guidelines"
                      : "ASCO Lung Cancer Treatment Guidelines"}
                  </a>
                </li>
                <li className="flex items-center">
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "ESMO Clinical Practice Guidelines: Brain Cancer"
                      : "ESMO Clinical Practice Guidelines: Lung Cancer"}
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a30] border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90 flex items-center">
                <BookIcon className="h-4 w-4 mr-2" />
                Recent Literature
              </CardTitle>
              <CardDescription className="text-white/70">Relevant research articles</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center">
                  <FileTextIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "Genomic Profiling in Brain Cancer: A Path Towards Personalized Medicine (2024)"
                      : "Genomic Profiling in Lung Cancer: A Path Towards Personalized Medicine (2024)"}
                  </a>
                </li>
                <li className="flex items-center">
                  <FileTextIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "Advances in MRI Techniques for Brain Cancer Detection and Characterization"
                      : "Advances in CT Techniques for Lung Cancer Detection and Characterization"}
                  </a>
                </li>
                <li className="flex items-center">
                  <FileTextIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "Targeted Therapies for Brain Cancer: A Comprehensive Review"
                      : "Targeted Therapies for Lung Cancer: A Comprehensive Review"}
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a30] border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90 flex items-center">
                <FileIcon className="h-4 w-4 mr-2" />
                Clinical Trials
              </CardTitle>
              <CardDescription className="text-white/70">Relevant ongoing clinical trials</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center">
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "Phase II Trial of Neoadjuvant Immunotherapy in Brain Cancer"
                      : "Phase II Trial of Neoadjuvant Immunotherapy in Lung Cancer"}
                  </a>
                </li>
                <li className="flex items-center">
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "Combination Therapy with Targeted Agents in Brain Cancer"
                      : "Combination Therapy with CDK4/6 Inhibitors in Lung Cancer"}
                  </a>
                </li>
                <li className="flex items-center">
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "Novel Targeted Therapies for Brain Cancer"
                      : "Novel Targeted Therapies for Lung Cancer"}
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a30] border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90 flex items-center">
                <FileIcon className="h-4 w-4 mr-2" />
                Patient Education
              </CardTitle>
              <CardDescription className="text-white/70">Resources for patient education</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center">
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "Understanding Your Brain Cancer Diagnosis"
                      : "Understanding Your Lung Cancer Diagnosis"}
                  </a>
                </li>
                <li className="flex items-center">
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "Treatment Options for Brain Cancer"
                      : "Treatment Options for Lung Cancer"}
                  </a>
                </li>
                <li className="flex items-center">
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <a href="#" className="hover:text-[#4a6bff]">
                    {patient.name === "Jane Doe"
                      ? "Coping with Brain Cancer: Support Resources"
                      : "Coping with Lung Cancer: Support Resources"}
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  )
}

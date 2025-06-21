import type { Patient } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { InfoIcon } from "lucide-react"

interface BiomarkersTabProps {
  patient: Patient
}

export function BiomarkersTab({ patient }: BiomarkersTabProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white/90">OmniScreen: H&E-based Biomarker Panel</h3>
            <p className="text-xs text-white/70 mt-1">
              Requires verification with definitive analysis through molecular sequencing
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Switch id="drug-associations" />
              <Label htmlFor="drug-associations" className="text-xs text-white/70">
                Drug associations
              </Label>
            </div>
            <Badge variant="outline" className="text-xs bg-[#1a1a30] text-white/70 border-[#4a6bff]">
              Part 1, Slide 1
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Badge className="bg-[#2a2a50] hover:bg-[#2a2a50] text-white/90">Level 1: Well Supported</Badge>
          <Badge className="bg-[#3a3a60] hover:bg-[#3a3a60] text-white/90">Level 2: Promising</Badge>
          <Badge className="bg-[#4a4a70] hover:bg-[#4a4a70] text-white/90">Level 3: Preliminary</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1a1a30] rounded-lg p-4">
            <h4 className="text-md font-medium mb-4 text-white/90">
              Increased likelihood of harboring oncogenic alterations
            </h4>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/70 border-b border-white/10">
                  <th className="text-left pb-2">Biomarker</th>
                  <th className="text-left pb-2">PPV</th>
                  <th className="text-left pb-2">Specificity</th>
                  <th className="text-left pb-2">Alterations and known mutation-associated therapies</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-white/90">TP53</td>
                  <td className="py-3">0.63</td>
                  <td className="py-3">0.49</td>
                  <td className="py-3 text-white/70">
                    oncogenic point mutation + oncogenic copy number deletion for tumor suppressor genes
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-white/90">EGFR</td>
                  <td className="py-3">0.36</td>
                  <td className="py-3">0.47</td>
                  <td className="py-3 text-white/70">
                    oncogenic point mutation + oncogenic copy number amplification for oncogenes
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white/90">RTK</td>
                  <td className="py-3">0.56</td>
                  <td className="py-3">0.3</td>
                  <td className="py-3 text-white/70">pathway</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="bg-[#2a4a40] text-[#4adfb0] border-[#4adfb0]/30">Staurosporine</Badge>
              <Badge className="bg-[#2a4a40] text-[#4adfb0] border-[#4adfb0]/30">Icotinib</Badge>
              <Badge className="bg-[#4a3a30] text-[#ff9f70] border-[#ff9f70]/30">Ceritinib</Badge>
              <Badge className="bg-[#4a3a30] text-[#ff9f70] border-[#ff9f70]/30">Cetuximab</Badge>
              <Badge className="bg-[#4a3a30] text-[#ff9f70] border-[#ff9f70]/30">Neratinib</Badge>
              <Badge className="bg-[#4a3a30] text-[#ff9f70] border-[#ff9f70]/30">Pemetrexed</Badge>
              <Badge className="bg-[#4a3a30] text-[#ff9f70] border-[#ff9f70]/30">Lapatinib</Badge>
              <Badge className="bg-[#4a3a30] text-[#ff9f70] border-[#ff9f70]/30">Rociletinib</Badge>
              <Badge className="bg-[#4a3a30] text-[#ff9f70] border-[#ff9f70]/30">Afatinib</Badge>
            </div>
          </div>

          <div className="bg-[#1a1a30] rounded-lg p-4">
            <h4 className="text-md font-medium mb-4 text-white/90">No oncogenic alterations predicted</h4>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/70 border-b border-white/10">
                  <th className="text-left pb-2">Biomarker</th>
                  <th className="text-left pb-2">NPV</th>
                  <th className="text-left pb-2">Sensitivity</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-white/90">TSC1</td>
                  <td className="py-3">1</td>
                  <td className="py-3">1</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-white/90">ARID5B</td>
                  <td className="py-3">1</td>
                  <td className="py-3">1</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-white/90">STAG2</td>
                  <td className="py-3">1</td>
                  <td className="py-3">1</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-white/90">DICER1</td>
                  <td className="py-3">1</td>
                  <td className="py-3">1</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-white/90">EP300</td>
                  <td className="py-3">1</td>
                  <td className="py-3">1</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-white/90">KDM5C</td>
                  <td className="py-3">1</td>
                  <td className="py-3">1</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-white/90">KEAP1</td>
                  <td className="py-3">0.99</td>
                  <td className="py-3">0.97</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-white/90">BRAF</td>
                  <td className="py-3">0.98</td>
                  <td className="py-3">0.94</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-white/90">RB1</td>
                  <td className="py-3">0.99</td>
                  <td className="py-3">0.94</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white/90">KRAS</td>
                  <td className="py-3">0.91</td>
                  <td className="py-3">0.92</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-xs text-white/50 p-4 bg-[#1a1a30] rounded-lg">
          <div className="flex items-start">
            <InfoIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>
              Disclaimer: This is intended for informational purposes only and is not intended as medical or treatment
              advice. It does not describe if a person will or will not respond to a particular therapeutic and does not
              describe the association between detected variants and any specific therapeutic. Results should be
              confirmed by an independent testing before taking any medical action. This information should not be used
              to start, stop, or change any course of treatment and does not test for all possible variants that may
              affect treatment.
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

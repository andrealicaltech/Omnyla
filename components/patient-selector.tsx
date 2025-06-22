"use client"

import type { Patient } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface PatientSelectorProps {
  patients: Patient[]
  selectedPatient: Patient
  onSelectPatient: (patient: Patient) => void
}

export function PatientSelector({ patients, selectedPatient, onSelectPatient }: PatientSelectorProps) {
  const router = useRouter()

  const handleAddPatient = () => {
    router.push('/add-patient')
  }

  return (
    <div className="p-4 border-b border-white/10">
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs text-white/70">Select Patient</label>
          <Select
            value={selectedPatient.id}
            onValueChange={(value) => {
              const patient = patients.find((p) => p.id === value)
              if (patient) onSelectPatient(patient)
            }}
          >
            <SelectTrigger className="w-full bg-[#1a1a30] border-white/20 text-white">
              <SelectValue placeholder="Select a patient" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a30] border-white/20">
              {patients.map((patient) => (
                <SelectItem
                  key={patient.id}
                  value={patient.id}
                  className="text-white hover:bg-[#2a2a40] focus:bg-[#2a2a40]"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{patient.name}</span>
                    <span className="text-xs text-white/70">MRN: {patient.mrn}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleAddPatient}
          variant="outline" 
          size="sm"
          className="w-full bg-transparent border-[#4a6bff] text-[#4a6bff] hover:bg-[#4a6bff]/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>
    </div>
  )
}

export interface Patient {
  id: string
  name: string
  dob: string
  mrn: string
  caseId: string
  age: number
  sex: string
  diagnosis: string
  tumor_stage: number
  case_overview: {
    summary: string
    timeline: {
      date: string
      event: string
    }[]
  }
  biomarkers: {
    name: string
    result: string
    status: 'Positive' | 'Negative' | 'Pending'
  }[]
  imaging: {
    type: string
    date: string
    description: string
    url: string
  }[]
  reports: {
    type: string
    date: string
    summary: string
  }[]
}

export interface Message {
  id: string
  sender: string // 'user' or agent name like 'genetics'
  agentName?: string
  content: string
  timestamp: Date
}

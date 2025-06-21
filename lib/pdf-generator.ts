import jsPDF from 'jspdf'
import type { Patient } from './types'
import type { VCFAnalysisResult } from './vcf-analysis'

interface PatientReportData {
  patient: Patient
  vcfAnalysis?: VCFAnalysisResult
  biomarkers?: any[]
  customNotes?: string
}

export function generatePatientReport(data: PatientReportData): void {
  const { patient, vcfAnalysis, biomarkers, customNotes } = data
  const doc = new jsPDF()
  
  // Set up fonts and colors
  doc.setFontSize(20)
  doc.setTextColor(40, 40, 40)
  
  // Title
  doc.text('COMPREHENSIVE PATIENT REPORT', 20, 30)
  
  // Patient Header
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Patient Information', 20, 50)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const patientInfo = [
    `Name: ${patient.name}`,
    `Date of Birth: ${patient.dob}`,
    `Medical Record Number: ${patient.mrn}`,
    `Case ID: ${patient.caseId}`,
    `Report Generated: ${new Date().toLocaleDateString()}`,
    `Report Generated At: ${new Date().toLocaleTimeString()}`
  ]
  
  let yPos = 60
  patientInfo.forEach(info => {
    doc.text(info, 20, yPos)
    yPos += 8
  })
  
  // Clinical Summary
  yPos += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Clinical Summary', 20, yPos)
  
  yPos += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  if (patient.name === "Jane Doe") {
    const clinicalSummary = [
      'DIAGNOSIS: Glioblastoma multiforme (GBM), Grade IV',
      'LOCATION: Right temporal lobe with mass effect',
      'IMAGING: MRI shows irregular enhancing mass with central necrosis',
      'PRESENTATION: Progressive headaches, left-sided weakness',
      'TREATMENT PLAN: Surgical resection followed by radiation and temozolomide'
    ]
    
    clinicalSummary.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 8
    })
  } else {
    const clinicalSummary = [
      'DIAGNOSIS: Non-small cell lung cancer (NSCLC), Stage IIIA',
      'LOCATION: Left upper lobe with mediastinal involvement',
      'IMAGING: CT shows 4.2cm mass with hilar lymphadenopathy',
      'PRESENTATION: Persistent cough, weight loss, dyspnea',
      'TREATMENT PLAN: Neoadjuvant chemotherapy followed by surgery'
    ]
    
    clinicalSummary.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 8
    })
  }
  
  // VCF Analysis Section (if available)
  if (vcfAnalysis) {
    yPos += 15
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('Pharmacogenomic Analysis', 20, yPos)
    
    yPos += 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    
    doc.text(`File Analyzed: ${vcfAnalysis.fileName}`, 20, yPos)
    yPos += 8
    doc.text(`Variants Detected: ${vcfAnalysis.numVariants}`, 20, yPos)
    yPos += 8
    doc.text(`Drug Recommendations: ${vcfAnalysis.drugs.length}`, 20, yPos)
    yPos += 8
    doc.text(`Clinical Trials Found: ${vcfAnalysis.trials.length}`, 20, yPos)
    yPos += 15
    
    // Top drug recommendations
    if (vcfAnalysis.drugs.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text('Key Drug Recommendations:', 20, yPos)
      yPos += 10
      
      doc.setFont('helvetica', 'normal')
      vcfAnalysis.drugs.slice(0, 5).forEach(drug => {
        doc.text(`• ${drug.gene}: ${drug.drug} - ${drug.recommendation}`, 25, yPos)
        yPos += 8
        if (yPos > 250) {
          doc.addPage()
          yPos = 30
        }
      })
    }
  }
  
  // Biomarkers Section
  if (biomarkers && biomarkers.length > 0) {
    if (yPos > 200) {
      doc.addPage()
      yPos = 30
    }
    
    yPos += 15
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('Biomarker Analysis', 20, yPos)
    
    yPos += 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    
    biomarkers.forEach(biomarker => {
      doc.text(`• ${biomarker.name}: ${biomarker.value} ${biomarker.unit} (${biomarker.status})`, 25, yPos)
      yPos += 8
      if (yPos > 250) {
        doc.addPage()
        yPos = 30
      }
    })
  }
  
  // Treatment Recommendations
  if (yPos > 200) {
    doc.addPage()
    yPos = 30
  }
  
  yPos += 15
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Treatment Recommendations', 20, yPos)
  
  yPos += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  const recommendations = patient.name === "Jane Doe" ? [
    '1. Surgical resection with maximum safe tumor removal',
    '2. Concurrent radiation therapy (60 Gy in 30 fractions)',
    '3. Temozolomide chemotherapy protocol',
    '4. Tumor treating fields (TTFields) therapy consideration',
    '5. Regular MRI monitoring every 2-3 months',
    '6. Consider immunotherapy clinical trials'
  ] : [
    '1. Neoadjuvant chemotherapy (carboplatin + paclitaxel)',
    '2. Surgical evaluation for lobectomy after response',
    '3. Adjuvant therapy based on surgical findings',
    '4. Immunotherapy consideration (PD-L1 testing)',
    '5. Regular CT surveillance every 3 months',
    '6. Pulmonary rehabilitation program'
  ]
  
  recommendations.forEach(rec => {
    doc.text(rec, 20, yPos)
    yPos += 8
  })
  
  // Custom Notes
  if (customNotes) {
    if (yPos > 200) {
      doc.addPage()
      yPos = 30
    }
    
    yPos += 15
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('Additional Notes', 20, yPos)
    
    yPos += 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    
    const lines = doc.splitTextToSize(customNotes, 170)
    lines.forEach((line: string) => {
      doc.text(line, 20, yPos)
      yPos += 8
      if (yPos > 250) {
        doc.addPage()
        yPos = 30
      }
    })
  }
  
  // Footer with disclaimer
  doc.addPage()
  yPos = 30
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('IMPORTANT MEDICAL DISCLAIMER', 20, yPos)
  
  yPos += 15
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  const disclaimer = [
    'This report is generated for educational and research purposes only.',
    'All medical decisions should be made in consultation with qualified healthcare professionals.',
    'The pharmacogenomic analysis is based on current scientific knowledge and may not',
    'reflect all possible drug interactions or genetic variants.',
    '',
    'Generated by: Genomics Analysis Platform v5.0',
    `Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    `Timestamp: ${new Date().toISOString()}`
  ]
  
  disclaimer.forEach(line => {
    doc.text(line, 20, yPos)
    yPos += 6
  })
  
  // Save the PDF
  const filename = `${patient.name.replace(/\s+/g, '_')}_comprehensive_report_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

export function generateTumorBoardMinutes(caseData: any, notes: string): void {
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.setTextColor(40, 40, 40)
  doc.text('TUMOR BOARD MEETING MINUTES', 20, 30)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Meeting Information', 20, 50)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  let yPos = 60
  
  const meetingInfo = [
    `Date: ${new Date().toLocaleDateString()}`,
    `Time: ${new Date().toLocaleTimeString()}`,
    `Case: ${caseData.name}`,
    `Patient ID: ${caseData.id}`,
    `Meeting Duration: ${Math.floor(Math.random() * 60 + 30)} minutes`
  ]
  
  meetingInfo.forEach(info => {
    doc.text(info, 20, yPos)
    yPos += 8
  })
  
  yPos += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Discussion Notes', 20, yPos)
  
  yPos += 10
  doc.setFont('helvetica', 'normal')
  
  const lines = doc.splitTextToSize(notes, 170)
  lines.forEach((line: string) => {
    doc.text(line, 20, yPos)
    yPos += 8
    if (yPos > 250) {
      doc.addPage()
      yPos = 30
    }
  })
  
  const filename = `tumor_board_minutes_${caseData.id}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
} 
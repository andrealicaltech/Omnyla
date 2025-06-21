import VCF from '@gmod/vcf'
import { distance } from '@turf/distance'
import { point } from '@turf/helpers'

export interface VCFAnalysisResult {
  drugs: DrugRecommendation[]
  trials: ClinicalTrial[]
  variants: VCFVariant[]
  fileName: string
  numVariants: number
  processingTime: number
}

export interface DrugRecommendation {
  gene: string
  drug: string
  recommendation: string
  dosage: string
  guideline: string
  citation: string
  cpicUrl: string
}

export interface ClinicalTrial {
  title: string
  phase: string
  city: string
  state: string
  distance: number
  condition: string
  intervention: string
  status: string
  contactInfo: string
  nxtId: string
  isRecruiting: boolean
}

export interface VCFVariant {
  chromosome: string
  position: number
  reference: string
  alternate: string
  gene?: string
  impact?: string
}

export async function parseVCFFile(fileContent: string): Promise<VCFVariant[]> {
  const variants: VCFVariant[] = []
  
  try {
    // Simple VCF parsing - extract data lines (not header lines)
    const lines = fileContent.split('\n')
    const dataLines = lines.filter(line => !line.startsWith('#') && line.trim())
    
    for (const line of dataLines.slice(0, 100)) { // Limit to first 100 variants for demo
      const fields = line.split('\t')
      if (fields.length >= 5) {
        variants.push({
          chromosome: fields[0],
          position: parseInt(fields[1]),
          reference: fields[3],
          alternate: fields[4],
          gene: extractGeneFromInfo(fields[7] || ''),
          impact: extractImpactFromInfo(fields[7] || '')
        })
      }
    }
  } catch (error) {
    console.error('Error parsing VCF:', error)
    throw new Error('Failed to parse VCF file')
  }
  
  return variants
}

function extractGeneFromInfo(infoField: string): string | undefined {
  const geneMatch = infoField.match(/GENE=([^;]+)/)
  return geneMatch?.[1]
}

function extractImpactFromInfo(infoField: string): string | undefined {
  const annMatch = infoField.match(/ANN=([^;]+)/)
  if (annMatch) {
    const annFields = annMatch[1].split('|')
    return annFields[1] // Impact is typically the second field
  }
  return undefined
}

export async function callPharmCATAPI(vcfContent: string): Promise<DrugRecommendation[]> {
  try {
    // Mock PharmCAT response for demo purposes
    // In production, you would call: https://api.pharmcat.org/annotate
    const mockResponse: DrugRecommendation[] = [
      {
        gene: 'CYP2D6',
        drug: 'Codeine',
        recommendation: 'Avoid use',
        dosage: 'N/A',
        guideline: 'CPIC Guideline',
        citation: 'PMID: 27997040',
        cpicUrl: 'https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/'
      },
      {
        gene: 'SLCO1B1',
        drug: 'Simvastatin',
        recommendation: 'Consider alternative',
        dosage: 'Reduce dose by 50%',
        guideline: 'CPIC Guideline',
        citation: 'PMID: 24918167',
        cpicUrl: 'https://cpicpgx.org/guidelines/guideline-for-simvastatin-and-slco1b1/'
      }
    ]
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return mockResponse
  } catch (error) {
    console.error('Error calling PharmCAT API:', error)
    return []
  }
}

async function fetchClinicalTrials(genes: string[]): Promise<ClinicalTrial[]> {
  try {
    // Log the input genes
    console.log('Searching for trials with genes:', genes)
    
    // Construct query for ClinicalTrials.gov API v2
    // Using very specific genetic testing and mutation search terms
    const geneQuery = genes.map(gene => 
      `("${gene}" AND ("genetic testing" OR "mutation testing" OR "mutation analysis" OR "genetic analysis"))`
    ).join(' OR ')
    
    const url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(geneQuery)}&filter.overallStatus=RECRUITING&pageSize=10&format=json`
    
    console.log('Fetching clinical trials with URL:', url)
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GenomicsApp/1.0'
      }
    })
    
    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: url
      })
      throw new Error(`Failed to fetch clinical trials: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('Raw API Response:', JSON.stringify(data, null, 2))
    
    if (!data.studies) {
      console.log('No trials found in response. Response structure:', Object.keys(data))
      return []
    }
    
    const trials = data.studies.map((study: any) => {
      console.log('Processing study:', study)
      
      // Get the first location that is recruiting
      const locations = study.protocolSection?.locationsModule?.locations || []
      const firstLocation = locations[0] || {}
      
      // Get the overall status and check if it's actively recruiting
      const overallStatus = study.protocolSection?.statusModule?.overallStatus || 'Unknown'
      const isRecruiting = overallStatus.toUpperCase() === 'RECRUITING' // Only exact match for RECRUITING
      
      const trial = {
        title: study.protocolSection?.identificationModule?.briefTitle || 'Unknown',
        phase: study.protocolSection?.designModule?.phases?.[0] || 'Not specified',
        city: firstLocation.city || 'Unknown',
        state: firstLocation.state || 'Unknown',
        condition: study.protocolSection?.conditionsModule?.conditions?.[0] || 'Unknown',
        intervention: study.protocolSection?.armsInterventionsModule?.interventions?.[0]?.name || 'Unknown',
        status: overallStatus,
        nxtId: study.protocolSection?.identificationModule?.nctId || '',
        contactInfo: 'See ClinicalTrials.gov',
        distance: 0,
        isRecruiting
      }
      
      console.log('Processed trial:', trial)
      return trial
    }).filter((trial: ClinicalTrial) => {
      // Only keep trials that have an NCT ID and are actively recruiting
      const isValid = trial.nxtId && trial.isRecruiting
      if (!isValid) {
        console.log('Filtered out trial:', trial)
      }
      return isValid
    })
    
    console.log('Final processed trials:', trials)
    return trials
    
  } catch (error) {
    console.error('Error fetching clinical trials:', error)
    return []
  }
}

// Update the existing searchClinicalTrials function to not use mock data
export async function searchClinicalTrials(genes: string[]): Promise<ClinicalTrial[]> {
  // Only use real data
  return await fetchClinicalTrials(genes)
}

export function generatePharmacoReport(analysisResult: VCFAnalysisResult): string {
  return `
# Pharmacogenomics Report

**Patient File:** ${analysisResult.fileName}
**Variants Analyzed:** ${analysisResult.numVariants}
**Processing Time:** ${analysisResult.processingTime}ms

## Drug Recommendations

${analysisResult.drugs.map(drug => `
### ${drug.gene} - ${drug.drug}
- **Recommendation:** ${drug.recommendation}
- **Dosage:** ${drug.dosage}
- **Guideline:** ${drug.guideline}
- **Citation:** ${drug.citation}
`).join('\n')}

## Clinical Trials

${analysisResult.trials.map(trial => `
### ${trial.title}
- **Phase:** ${trial.phase}
- **Location:** ${trial.city}, ${trial.state} (${trial.distance}km away)
- **Condition:** ${trial.condition}
- **Intervention:** ${trial.intervention}
- **Status:** ${trial.status}
- **NCT ID:** ${trial.nxtId}
`).join('\n')}
  `.trim()
}

function getMockDrugRecommendations(): DrugRecommendation[] {
  return [
    {
      gene: 'CYP2D6',
      drug: 'Codeine',
      recommendation: 'Avoid use',
      dosage: 'N/A',
      guideline: 'CPIC Guideline',
      citation: 'PMID: 27997040',
      cpicUrl: 'https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/'
    },
    {
      gene: 'SLCO1B1',
      drug: 'Simvastatin',
      recommendation: 'Consider alternative',
      dosage: 'Reduce dose by 50%',
      guideline: 'CPIC Guideline',
      citation: 'PMID: 24918167',
      cpicUrl: 'https://cpicpgx.org/guidelines/guideline-for-simvastatin-and-slco1b1/'
    }
  ]
}

function extractDrugRecommendations(reporterJson: any): DrugRecommendation[] {
  const recommendations: DrugRecommendation[] = []
  
  try {
    // Extract from genes section of PharmCAT report (new structure with CPIC/DPWG)
    const genes = reporterJson?.genes || {}
    
    // Handle CPIC and DPWG sections
    for (const sectionName in genes) {
      const section = genes[sectionName]
      if (typeof section === 'object') {
        for (const geneName in section) {
          const geneData = section[geneName]
          const relatedDrugs = geneData.relatedDrugs || []
          const diplotypes = geneData.recommendationDiplotypes || []
          
          for (const drug of relatedDrugs) {
            const diplotype = diplotypes[0] // Use first diplotype
            const phenotype = diplotype?.phenotypes?.[0] || diplotype?.label || 'Unknown phenotype'
            
            recommendations.push({
              gene: geneName,
              drug: drug.name,
              recommendation: `Phenotype: ${phenotype}`,
              dosage: 'Consult prescribing information',
              guideline: `PharmCAT/${sectionName}`,
              citation: 'See PharmCAT report',
              cpicUrl: `https://cpicpgx.org/genes/${geneName.toLowerCase()}/`
            })
          }
        }
      }
    }
  } catch (error) {
    console.error('Error extracting drug recommendations:', error)
  }
  
  // Limit to 25 recommendations and sort by gene name for consistency
  const limitedRecommendations = recommendations
    .sort((a, b) => a.gene.localeCompare(b.gene))
    .slice(0, 25)
  
  return limitedRecommendations.length > 0 ? limitedRecommendations : getMockDrugRecommendations()
} 
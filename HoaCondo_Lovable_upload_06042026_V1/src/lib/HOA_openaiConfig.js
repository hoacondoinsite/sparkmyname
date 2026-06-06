/**
 * HOA_CODE_03 — openaiConfig.js
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Complete OpenAI integration with HOA document analysis engine,
 * Form 1076 auto-fill, HOA Health Score calculation, and report generation.
 *
 * SOP (embedded per Founder Override):
 * 1. Set VITE_OPENAI_API_KEY in Netlify env vars
 * 2. OpenAI calls are proxied through Netlify functions to protect the key
 * 3. The VITE_ prefix makes the key available client-side — use with caution
 * 4. Recommended: move all OpenAI calls to netlify/functions/ for production
 * ROLLBACK: Remove VITE_OPENAI_API_KEY to disable AI analysis
 *
 * COMPLIANCE REFERENCE:
 * - Fannie Mae Lender Letter LL-2026-03
 * - July 1, 2026: Master policy deductible requirements
 * - January 4, 2027: Reserve funding minimum increases 10% → 15%
 */

// ─────────────────────────────────────────────
// ENV VAR DETECTION
// ─────────────────────────────────────────────
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
export const openaiAvailable = !!(OPENAI_API_KEY);

if (!openaiAvailable) {
  console.warn('[HOAInsight] OpenAI env var not detected. AI analysis disabled.');
}

// ─────────────────────────────────────────────
// LL-2026-03 COMPLIANCE FRAMEWORK
// ─────────────────────────────────────────────
export const LL_2026_03 = {
  name: 'Fannie Mae Lender Letter LL-2026-03',
  deadlines: {
    MASTER_POLICY_DEDUCTIBLE: {
      date: '2026-07-01',
      description: 'Master policy deductible requirements take effect',
      requirement: 'HOA master insurance policy deductible must not exceed 5% of total insured value',
    },
    RESERVE_FUNDING_MIN: {
      date: '2027-01-04',
      description: 'Reserve funding minimum increases from 10% to 15%',
      requirement: 'HOA reserve fund must be funded to at least 15% of annual budget',
    },
  },
  checkCategories: [
    'master_policy_coverage',
    'master_policy_deductible',
    'reserve_fund_percentage',
    'reserve_study_recency',
    'litigation_status',
    'delinquency_rate',
    'commercial_space_percentage',
    'single_entity_ownership',
    'owner_occupancy_rate',
    'special_assessments',
    'structural_deficiencies',
    'form_1076_completeness',
  ],
};

// ─────────────────────────────────────────────
// SYSTEM PROMPT — HOA DOCUMENT ANALYZER
// ─────────────────────────────────────────────
const HOA_ANALYZER_SYSTEM_PROMPT = `You are an expert HOA compliance analyst specializing in Fannie Mae mortgage guidelines, specifically Lender Letter LL-2026-03. You analyze HOA and condominium documents to determine mortgage eligibility and compliance risk.

KEY COMPLIANCE DEADLINES:
- July 1, 2026: Master policy deductible requirements (max 5% of total insured value)
- January 4, 2027: Reserve funding minimum increases from 10% to 15% of annual budget

YOUR ANALYSIS MUST COVER:
1. Master insurance policy coverage and deductible compliance
2. Reserve fund percentage (current vs. required)
3. Reserve study recency (required within last 3 years)
4. Pending litigation disclosure
5. Owner delinquency rate (must be under 15%)
6. Commercial space percentage (must be under 35%)
7. Single-entity ownership concentration (must be under 10%)
8. Owner-occupancy rate (minimum 50% for warrantable)
9. Special assessments (amount, purpose, payment plan)
10. Structural deficiencies or deferred maintenance
11. Form 1076 completeness for lender submission

HOA HEALTH SCORE (0-100):
- 90-100: Excellent — fully warrantable, no issues
- 75-89: Good — warrantable with minor monitoring
- 60-74: Fair — warrantable but lender attention required
- 40-59: Poor — non-warrantable, significant issues
- 0-39: Critical — non-warrantable, multiple major failures

RESPONSE FORMAT: Always respond in valid JSON matching the AnalysisResult schema.`;

// ─────────────────────────────────────────────
// ANALYSIS RESULT SCHEMA
// ─────────────────────────────────────────────
export const AnalysisResultSchema = {
  hoa_health_score: 'number (0-100)',
  fannie_mae_warrantable: 'boolean',
  ll_2026_03_compliant: 'boolean',
  compliance_deadline_alerts: [
    {
      deadline: 'string (date)',
      status: 'string (compliant|non_compliant|unknown)',
      detail: 'string',
    },
  ],
  flags: [
    {
      category: 'string',
      severity: 'string (critical|warning|info)',
      finding: 'string',
      recommendation: 'string',
      ll_2026_03_reference: 'string',
    },
  ],
  reserve_fund: {
    current_percentage: 'number',
    required_percentage_now: 10,
    required_percentage_jan_2027: 15,
    funded_status: 'string',
    reserve_study_date: 'string',
    reserve_study_current: 'boolean',
  },
  insurance: {
    master_policy_present: 'boolean',
    coverage_amount: 'number',
    deductible_amount: 'number',
    deductible_percentage: 'number',
    deductible_compliant: 'boolean',
  },
  litigation: {
    pending_litigation: 'boolean',
    litigation_details: 'string',
    material_impact: 'boolean',
  },
  financials: {
    delinquency_rate: 'number',
    delinquency_compliant: 'boolean',
    special_assessments: 'boolean',
    special_assessment_details: 'string',
  },
  ownership: {
    owner_occupancy_rate: 'number',
    single_entity_concentration: 'number',
    commercial_space_pct: 'number',
  },
  form_1076: {
    completeness_score: 'number (0-100)',
    missing_fields: ['string'],
    ready_for_lender: 'boolean',
  },
  executive_summary: 'string',
  lender_recommendation: 'string',
};

// ─────────────────────────────────────────────
// CORE ANALYSIS FUNCTION
// ─────────────────────────────────────────────
export const analyzeHOADocument = async (documentText, documentType = 'general') => {
  if (!openaiAvailable) {
    return { error: 'OpenAI not configured', mock: true, hoa_health_score: 0 };
  }

  const userPrompt = `Analyze the following HOA/condominium document for Fannie Mae LL-2026-03 compliance.
Document Type: ${documentType}
Document Content:
---
${documentText.substring(0, 12000)}
---
Return your complete analysis as a JSON object matching the AnalysisResult schema. Be specific, cite actual numbers from the document where present.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: HOA_ANALYZER_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (err) {
    console.error('[HOAInsight] Analysis error:', err);
    return { error: err.message, hoa_health_score: null };
  }
};

// ─────────────────────────────────────────────
// HOA HEALTH SCORE CALCULATOR
// Can be used without OpenAI from structured data
// ─────────────────────────────────────────────
export const calculateHealthScore = ({
  reserveFundPct = 0,
  masterPolicyPresent = false,
  deductibleCompliant = false,
  delinquencyRate = 0,
  pendingLitigation = false,
  commercialSpacePct = 0,
  singleEntityConcentration = 0,
  ownerOccupancyRate = 0,
  specialAssessments = false,
  reserveStudyCurrent = false,
}) => {
  let score = 100;

  // Reserve funding (30 points max)
  if (reserveFundPct < 15) score -= Math.min(30, (15 - reserveFundPct) * 2);

  // Master policy (20 points)
  if (!masterPolicyPresent) score -= 20;
  else if (!deductibleCompliant) score -= 10;

  // Delinquency (15 points)
  if (delinquencyRate > 15) score -= 15;
  else if (delinquencyRate > 10) score -= 8;
  else if (delinquencyRate > 5) score -= 3;

  // Litigation (15 points)
  if (pendingLitigation) score -= 15;

  // Commercial space (5 points)
  if (commercialSpacePct > 35) score -= 5;

  // Single entity (5 points)
  if (singleEntityConcentration > 10) score -= 5;

  // Owner occupancy (5 points)
  if (ownerOccupancyRate < 50) score -= 5;

  // Special assessments (5 points)
  if (specialAssessments) score -= 5;

  // Reserve study currency (5 points)
  if (!reserveStudyCurrent) score -= 5;

  return Math.max(0, Math.round(score));
};

// ─────────────────────────────────────────────
// FORM 1076 AUTO-FILL HELPER
// ─────────────────────────────────────────────
export const generateForm1076Data = async (analysisResult, hoaDetails) => {
  if (!openaiAvailable || !analysisResult) return null;

  const prompt = `Based on this HOA compliance analysis, generate a complete Form 1076 (Condominium Project Questionnaire) data object for lender submission.

Analysis Result: ${JSON.stringify(analysisResult)}
HOA Details: ${JSON.stringify(hoaDetails)}

Return a JSON object with all Form 1076 fields populated. Use "UNKNOWN" for fields where data is not available.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a mortgage compliance expert who completes Fannie Mae Form 1076 accurately from HOA documents.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0]?.message?.content);
  } catch (err) {
    console.error('[HOAInsight] Form 1076 generation error:', err);
    return null;
  }
};

// ─────────────────────────────────────────────
// REPORT NARRATIVE GENERATOR
// ─────────────────────────────────────────────
export const generateReportNarrative = async (analysisResult, reportType = 'basic') => {
  if (!openaiAvailable) return null;

  const prompt = `Generate a professional HOA compliance report narrative for a ${reportType} report.
Analysis: ${JSON.stringify(analysisResult)}

Write 3-5 paragraphs suitable for a lender or real estate professional. Be specific about numbers. Lead with the Health Score and warrantability status. End with clear action items.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content;
  } catch (err) {
    console.error('[HOAInsight] Narrative generation error:', err);
    return null;
  }
};

export default { analyzeHOADocument, calculateHealthScore, generateForm1076Data, generateReportNarrative, openaiAvailable, LL_2026_03 };

/**
 * HOA_CODE_09 — ideaEngine.js
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Idea Engine that evaluates any concept against 8 criteria,
 * scores 0-100, generates executive package for concepts scoring 85 or above.
 *
 * SOP (embedded per Founder Override):
 * 1. Import in AdminFutureGrowth or any founder-only page
 * 2. Call evaluateIdea(concept) with a plain English description
 * 3. Scores below 85: returns scorecard only
 * 4. Scores 85+: auto-generates full executive package (pitch, SOP, checklist, financials)
 * ROLLBACK: This module has no side effects — simply stop importing it
 */

import { openaiAvailable } from './HOA_openaiConfig';

// ─────────────────────────────────────────────
// 8 EVALUATION CRITERIA
// ─────────────────────────────────────────────
export const EVALUATION_CRITERIA = [
  {
    id: 'market_size',
    name: 'Market Size',
    weight: 15,
    description: 'Total addressable market and realistic capture potential',
    levels: {
      high: 'TAM > $100M, clear path to $1M+ ARR within 3 years',
      medium: 'TAM $10M–$100M, achievable $100K–$1M ARR',
      low: 'TAM < $10M or unclear path to meaningful revenue',
    },
  },
  {
    id: 'platform_fit',
    name: 'Platform Fit',
    weight: 15,
    description: 'How well the idea leverages existing HOACONDInsight infrastructure',
    levels: {
      high: 'Directly uses existing AI engine, Stripe, Supabase with <2 weeks new build',
      medium: 'Requires 2–6 weeks of new development on existing foundation',
      low: 'Requires significant new technology or infrastructure (>6 weeks)',
    },
  },
  {
    id: 'regulatory_alignment',
    name: 'Regulatory Alignment',
    weight: 15,
    description: 'Leverages mandatory compliance requirements (LL-2026-03 and similar)',
    levels: {
      high: 'Directly tied to a regulatory mandate that creates forced purchase',
      medium: 'Compliance-adjacent but not mandated',
      low: 'No regulatory driver',
    },
  },
  {
    id: 'competitive_moat',
    name: 'Competitive Moat',
    weight: 12,
    description: 'Defensibility via patents, data, network effects, or switching costs',
    levels: {
      high: 'Patent protection and/or strong data network effects',
      medium: 'Brand and switching costs, but replicable',
      low: 'Easily copied with no IP protection',
    },
  },
  {
    id: 'time_to_revenue',
    name: 'Time to Revenue',
    weight: 12,
    description: 'How quickly the idea can generate first dollar of revenue',
    levels: {
      high: 'Revenue possible within 30 days of build completion',
      medium: 'Revenue within 60–90 days',
      low: 'Revenue 90+ days away, long sales cycles or regulatory approval needed',
    },
  },
  {
    id: 'capital_efficiency',
    name: 'Capital Efficiency',
    weight: 10,
    description: 'Revenue potential relative to investment required',
    levels: {
      high: 'Can generate $10+ for every $1 invested within 12 months',
      medium: '$3–10 return per $1 invested',
      low: 'Capital-intensive relative to expected return',
    },
  },
  {
    id: 'founder_advantage',
    name: 'Founder Advantage',
    weight: 11,
    description: 'Peter\'s unique position as HOA unit owner, platform builder, and legal knowledge',
    levels: {
      high: 'Requires firsthand HOA experience AND compliance expertise — unique combination',
      medium: 'Benefits from HOA knowledge but others could replicate',
      low: 'Generic product any SaaS founder could build',
    },
  },
  {
    id: 'risk_profile',
    name: 'Risk Profile',
    weight: 10,
    description: 'Legal, regulatory, and execution risk',
    levels: {
      high: 'Low risk — clear legal path, no UPL concerns, no regulatory hurdles',
      medium: 'Moderate risk — manageable with attorney review',
      low: 'High risk — significant legal, regulatory, or execution challenges',
    },
  },
];

// ─────────────────────────────────────────────
// IDEA EVALUATOR
// ─────────────────────────────────────────────
export const evaluateIdea = async (conceptDescription) => {
  if (!openaiAvailable) {
    return { error: 'OpenAI not configured. Cannot evaluate idea.', score: null };
  }

  const criteriaText = EVALUATION_CRITERIA.map(c =>
    `${c.id} (weight: ${c.weight}%): ${c.description}\n  High: ${c.levels.high}\n  Medium: ${c.levels.medium}\n  Low: ${c.levels.low}`
  ).join('\n\n');

  const prompt = `You are a strategic advisor for HOACONDInsight LLC, an AI-powered HOA compliance platform built around Fannie Mae Lender Letter LL-2026-03.

Company context:
- Platform: AI-powered HOA compliance analysis for mortgage professionals
- Founder: Peter Klein, sole owner, based in Hypoluxo FL, HOA unit owner with firsthand dispute experience
- Core product: $39 HOA compliance report for Fannie Mae LL-2026-03 compliance
- Infrastructure: React/Vite, Supabase, Stripe, OpenAI, Resend, deployed on Netlify
- IP: Two provisional patents filed (June 2026)
- Target market: National mortgage lenders, title companies, banks, law firms

CONCEPT TO EVALUATE:
${conceptDescription}

EVALUATION CRITERIA (score each 0-10, then weight):
${criteriaText}

Return a JSON object with this exact structure:
{
  "concept_summary": "2-sentence plain English summary of the idea",
  "scores": {
    "market_size": { "score": 0-10, "rationale": "1 sentence" },
    "platform_fit": { "score": 0-10, "rationale": "1 sentence" },
    "regulatory_alignment": { "score": 0-10, "rationale": "1 sentence" },
    "competitive_moat": { "score": 0-10, "rationale": "1 sentence" },
    "time_to_revenue": { "score": 0-10, "rationale": "1 sentence" },
    "capital_efficiency": { "score": 0-10, "rationale": "1 sentence" },
    "founder_advantage": { "score": 0-10, "rationale": "1 sentence" },
    "risk_profile": { "score": 0-10, "rationale": "1 sentence" }
  },
  "weighted_score": 0-100,
  "verdict": "GO | HOLD | NO",
  "top_strength": "The single strongest reason to pursue this",
  "top_risk": "The single biggest risk or obstacle",
  "immediate_next_step": "One specific action Peter can take in the next 7 days"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const evaluation = JSON.parse(data.choices[0]?.message?.content);

    // Auto-generate executive package if score >= 85
    if (evaluation.weighted_score >= 85) {
      evaluation.executive_package = await generateExecutivePackage(conceptDescription, evaluation);
      evaluation.package_generated = true;
    } else {
      evaluation.package_generated = false;
    }

    return evaluation;
  } catch (err) {
    console.error('[HOAInsight] Idea evaluation error:', err);
    return { error: err.message, score: null };
  }
};

// ─────────────────────────────────────────────
// EXECUTIVE PACKAGE GENERATOR (score >= 85 only)
// ─────────────────────────────────────────────
const generateExecutivePackage = async (concept, evaluation) => {
  const prompt = `Generate a complete executive launch package for this HOACONDInsight business concept.

Concept: ${concept}
Evaluation Score: ${evaluation.weighted_score}/100
Verdict: ${evaluation.verdict}
Top Strength: ${evaluation.top_strength}

Generate a JSON object with:
{
  "one_page_pitch": "Complete one-page pitch for this product (300 words, plain English, for Peter to review)",
  "revenue_model": {
    "pricing": "Specific pricing recommendation",
    "year_1_projection": "Conservative annual revenue estimate",
    "break_even_timeline": "When does this cover its build cost"
  },
  "build_plan": {
    "phase_1": "Week 1-2: specific tasks",
    "phase_2": "Week 3-4: specific tasks",
    "launch_date_estimate": "Realistic launch date from today"
  },
  "10_step_sop": [
    "Step 1: ...",
    "Step 2: ...",
    "...through Step 10"
  ],
  "pre_launch_checklist": [
    "Item 1",
    "...15 items total"
  ],
  "claude_build_instruction": "Complete instruction to give Claude to build this product. Be specific about files to create, APIs to integrate, and UI to build.",
  "risks_and_mitigations": [
    { "risk": "...", "mitigation": "..." }
  ],
  "success_metrics": {
    "30_days": "What success looks like at 30 days",
    "90_days": "What success looks like at 90 days",
    "12_months": "What success looks like at 12 months"
  }
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0]?.message?.content);
  } catch (err) {
    console.error('[HOAInsight] Executive package generation error:', err);
    return null;
  }
};

// ─────────────────────────────────────────────
// SCORE DISPLAY HELPERS
// ─────────────────────────────────────────────
export const getScoreColor = (score) => {
  if (score >= 85) return '#4ade80';
  if (score >= 70) return '#fbbf24';
  if (score >= 50) return '#f97316';
  return '#f87171';
};

export const getVerdictDisplay = (verdict) => {
  const map = {
    GO: { color: '#4ade80', bg: '#14532d', label: '✓ GO — Build This' },
    HOLD: { color: '#fbbf24', bg: '#713f12', label: '⏸ HOLD — Build Later' },
    NO: { color: '#f87171', bg: '#7f1d1d', label: '✗ NO — Skip' },
  };
  return map[verdict] || map.HOLD;
};

export default { evaluateIdea, EVALUATION_CRITERIA, getScoreColor, getVerdictDisplay };

/**
 * HOA_CODE_13 — patentConfig.js
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Patent configuration — both provisional applications correctly documented.
 * App 1: 64/081,022 · App 2: 64/082,247 (corrected from earlier versions)
 */

export const PATENTS = {
  PROVISIONAL_1: {
    applicationNumber: '64/081,022',
    confirmationNumber: '3971',
    filingDate: '2026-06-02',
    filingTime: '7:44 PM ET',
    title: 'AI-Powered HOA and Condominium Document Analysis System for Mortgage Compliance',
    applicant: 'Peter Klein',
    entityStatus: 'Micro Entity',
    filingFee: 65,
    filedProSe: true,
    nonprovisionalDeadline: '2027-06-02',
    notes: 'Filed pro se at patent.uspto.gov. Confirmation received June 2, 2026.',
  },
  PROVISIONAL_2: {
    applicationNumber: '64/082,247',
    filingDate: '2026-06-04',
    title: 'Compliance Scoring and Risk Flagging Engine for HOA Mortgage Warrantability Assessment',
    applicant: 'Peter Klein',
    entityStatus: 'Micro Entity',
    filingFee: 65,
    filedProSe: true,
    nonprovisionalDeadline: '2027-06-04',
    notes: 'Filed pro se at patent.uspto.gov. Serial number confirmed June 4, 2026.',
  },
};

export const IP_COUNSEL = {
  firm: 'Fish & Richardson P.C.',
  email: 'NewMatters@fr.com',
  engagementDeadline: '2026-09-04', // Within 90 days of first filing
  notes: 'Engage within 90 days of first provisional filing. Send one email to NewMatters@fr.com.',
};

export const TRADEMARKS = {
  HOAINSIGHT: { mark: 'HOAInsight™', status: 'Pending', class: '42', filedBy: 'Peter Klein' },
  HOACONDOINSIGHT: { mark: 'HOACondoInsight™', status: 'Pending', class: '42', filedBy: 'Peter Klein' },
  KNOW_THE_RISKS: { mark: 'Know the Risks Before You Sign™', status: 'Pending', class: '42', filedBy: 'Peter Klein' },
};

export const IP_INSURANCE = {
  provider: 'IPISC',
  phone: '800-537-7863',
  targetCoverage: '$5,000,000',
  purchaseDeadline: '2026-06-16', // Within 10 days of first filing
  notes: 'Call 800-537-7863. Target $5M aggregate coverage.',
};

export default { PATENTS, IP_COUNSEL, TRADEMARKS, IP_INSURANCE };

/**
 * Rule-based desk recommendations from live metrics + analysis bundle keywords.
 * Not a hosted LLM - deterministic, auditable logic for competition / gov desk use.
 */

export function buildDivisionAiPack({ divisionName, liveRow, snap, deep }) {
  if (!liveRow) return [];
  const {
    schemePenetration: pen,
    ndviStress: stress,
    grievanceIdx: griv,
    precipMmMarJun2024: pmm,
  } = liveRow;
  if (pen == null || stress == null || griv == null) return [];
  const items = [];

  if (stress >= 72) {
    items.push({
      priority: 'high',
      tag: 'Moisture / drought stress',
      title: 'Rainfall drought proxy is in the top band - treat as drought-sensitive this week',
      body:
        `Relative moisture / drought stress for ${divisionName} is in the top band (${stress}% proxy from Mar–Jun precipitation recharge vs other divisions). `
        + 'Pre-position drought codes, cattle camps, and PFMS advance where soil moisture is likely limiting-not only where complaints spike.',
    });
  } else if (stress <= 25) {
    items.push({
      priority: 'low',
      tag: 'Moisture / drought stress',
      title: 'Rain-recharge window looks supportive',
      body:
        `${divisionName} sits in a lower relative stress band (${stress}%). Use freed capacity to clear PMFBY crop-cutting backlogs and bank KYC friction rather than climate escalations.`,
    });
  }

  if (pen < 72) {
    items.push({
      priority: 'high',
      tag: 'Scheme uptake',
      title: 'Raise desk completion in lowest uptake blocks',
      body:
        `Filing intensity is about ${pen}% for ${divisionName}. Prioritise camps and help-desks in the blocks at the bottom of the uptake table; cross-check the registration driver list against Aadhaar and land-record queues.`,
    });
  }

  if (griv >= 40) {
    items.push({
      priority: 'medium',
      tag: 'Grievance load',
      title: 'Route TAO capacity to SLA-heavy bands',
      body:
        `Composite caseload index is ${griv}. Cross-read SLA table with topic mix: if “Data / Aadhaar mismatch” dominates, run e-KYC correction drives before escalation to PFMS returns.`,
    });
  }

  if (pmm != null && pmm < 280) {
    items.push({
      priority: 'medium',
      tag: 'Rain gauge',
      title: 'Archive Mar–Jun precip was below peer divisions',
      body:
        `Open-Meteo archive shows ${pmm} mm cumulative rain at the division sample point - compare with IMD district grids before declaring revenue relief; point samples can miss localised storms.`,
    });
  }

  if (deep?.ndviZones?.length) {
    const top = [...deep.ndviZones].sort((a, b) => b.stress - a.stress)[0];
    if (top) {
      items.push({
        priority: 'medium',
        tag: 'Geo blocks',
        title: `Prioritise field verification: ${top.zone}`,
        body: top.deskNote,
      });
    }
  }

  if (snap?.gap > 40000) {
    items.push({
      priority: 'medium',
      tag: 'Inclusion',
      title: 'Eligible–applied gap is wide in the model cohort',
      body:
        `Gap ≈ ${snap.gap.toLocaleString('en-IN')} in the merged eligibility cohort - align camps with the top two “non-registration” slices in the pie before adding new schemes.`,
    });
  }

  return items.slice(0, 6);
}

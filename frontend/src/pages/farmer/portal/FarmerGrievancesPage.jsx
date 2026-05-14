import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getFarmerGrievances, analyzeGrievanceText } from '../../../utils/aiGrievanceEngine';
import { Btn, FarmerPageShell, FpCard, fp } from './farmerPortalUi';

export default function FarmerGrievancesPage() {
  const { t } = useLanguage();
  const [showDrawer, setShowDrawer] = useState(false);
  const [newGrievanceText, setNewGrievanceText] = useState('');
  const [grievances, setGrievances] = useState(getFarmerGrievances('MH-AS-PUN-10000001'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const analysis = analyzeGrievanceText(newGrievanceText);
      const newGrievance = {
        id: `GRV-2026-${Math.floor(4000 + Math.random() * 1000)}`,
        grievanceType: analysis.category,
        scheme: analysis.detectedScheme,
        description: newGrievanceText,
        status: 'Submitted',
        derivedStatus: 'Submitted',
        submittedAt: new Date().toISOString(),
        assignedOfficer: analysis.routeTo,
        aiInsights: analysis,
        fraudScore: 0,
        linkedTickets: [],
        timeline: [
          { status: 'Submitted', at: new Date().toISOString(), by: 'Farmer' }
        ]
      };
      setGrievances([newGrievance, ...grievances]);
      setNewGrievanceText('');
      setIsSubmitting(false);
      setShowDrawer(false);
    }, 1000);
  };

  return (
    <FarmerPageShell
      title={t('Grievance center')}
      subtitle={t('Raise, track, and escalate issues related to schemes, land records, or payments.')}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <Btn onClick={() => setShowDrawer(true)}>{t('Raise complaint')}</Btn>
        <Btn variant="ghost">{t('Track grievance')}</Btn>
        <Btn variant="ghost">{t('Upload proof')}</Btn>
      </div>

      {grievances.length === 0 ? (
        <FpCard className="py-12 text-center text-[0.875rem]" style={{ color: fp.muted }}>
          {t('No grievances filed.')}
        </FpCard>
      ) : (
        <div className="space-y-4">
          {grievances.map((g) => (
            <FpCard key={g.id} className="overflow-hidden border border-[#eaeaea]">
              <div className="p-4 bg-[#fafbfb] border-b border-[#eaeaea] flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[0.75rem] font-medium bg-white border border-[#eaeaea] px-2 py-0.5 rounded text-[#555]">
                      {g.id}
                    </span>
                    <span className="text-[0.6875rem] font-bold px-2 py-0.5 rounded bg-[#f0f4f8] text-[#335c85]">
                      {g.scheme}
                    </span>
                  </div>
                  <h3 className="mt-2 text-[0.9375rem] font-bold" style={{ color: fp.text }}>{g.grievanceType}</h3>
                  <p className="mt-1 text-[0.8125rem] text-[#666] line-clamp-2">"{g.description}"</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[0.6875rem] font-bold px-2 py-1 rounded ${
                    g.aiInsights?.severity === 'Critical' ? 'bg-[#fef2f2] text-[#b91c1c]' :
                    g.aiInsights?.severity === 'High' ? 'bg-[#fffbeb] text-[#b45309]' :
                    'bg-[#f0fdf4] text-[#15803d]'
                  }`}>
                    {g.derivedStatus}
                  </span>
                  <span className="text-[0.6875rem] text-[#888]">Assigned: {g.assignedOfficer}</span>
                </div>
              </div>
              
              <div className="p-4 bg-white">
                <h4 className="text-[0.75rem] font-bold text-[#555] mb-3 uppercase tracking-wider">Live Tracking Timeline</h4>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#eaeaea] before:to-transparent">
                  {(g.timeline || [{status: 'Submitted', at: g.submittedAt, by: 'Farmer'}]).map((step, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-[#0066cc] text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-0 mr-3 md:mx-auto"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-[#eaeaea] bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-[#333] text-[0.8125rem]">{step.status}</div>
                          <time className="font-mono text-[0.6875rem] text-[#888]">
                            {new Date(step.at).toLocaleDateString()}
                          </time>
                        </div>
                        <div className="text-[0.75rem] text-[#666]">Action by: {step.by}</div>
                      </div>
                    </div>
                  ))}
                  {g.derivedStatus !== 'Resolved' && g.derivedStatus !== 'Closed' && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border border-[#eaeaea] bg-white text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-0 mr-3 md:mx-auto"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-dashed border-[#ccc] bg-[#fafafa]">
                         <div className="font-bold text-[#888] text-[0.8125rem]">Awaiting action...</div>
                         <div className="text-[0.75rem] text-[#999]">SLA Target: {g.aiInsights?.slaDays || 7} Days</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FpCard>
          ))}
        </div>
      )}

      {/* Slide-out Drawer for "Raise Grievance" */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-[#eaeaea] flex items-center justify-between bg-[#f8f9fa]">
              <h2 className="text-[1.125rem] font-bold text-[#333]">Raise New Grievance</h2>
              <button onClick={() => setShowDrawer(false)} className="text-[#888] hover:text-[#333]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6 p-4 bg-[#f0f4f8] rounded-lg border border-[#d1e0eb]">
                <h3 className="text-[0.8125rem] font-bold text-[#2a4d6f] mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[1rem]">smart_toy</span>
                  AI Pre-Classification
                </h3>
                <p className="text-[0.75rem] text-[#4a6b8c]">
                  Your complaint will be automatically routed to the correct department (PM-KISAN, PMFBY, etc.) and assigned a priority based on your description.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[0.8125rem] font-bold text-[#444] mb-1">Describe the Issue Detailedly *</label>
                  <textarea 
                    value={newGrievanceText}
                    onChange={(e) => setNewGrievanceText(e.target.value)}
                    placeholder="e.g. I have not received my Soyabean crop loss compensation despite the panchanama being completed 4 months ago..."
                    className="w-full border border-[#ccc] rounded p-3 text-[0.875rem] h-32 focus:outline-none focus:border-[#0066cc]"
                  />
                </div>

                <div>
                  <label className="block text-[0.8125rem] font-bold text-[#444] mb-1">Attach Evidence (Optional)</label>
                  <div className="border-2 border-dashed border-[#ccc] rounded p-6 text-center bg-[#fafafa] cursor-pointer hover:bg-[#f0f0f0]">
                    <span className="material-symbols-outlined text-[#888] text-3xl mb-2">upload_file</span>
                    <p className="text-[0.8125rem] text-[#666]">Click to upload photos, 7/12 extracts, or bank statements</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#eaeaea] flex justify-end gap-2 bg-[#f8f9fa]">
              <Btn variant="ghost" onClick={() => setShowDrawer(false)}>Cancel</Btn>
              <Btn onClick={handleSubmit} disabled={isSubmitting || !newGrievanceText.trim()}>
                {isSubmitting ? 'Analyzing & Routing...' : 'Submit Grievance'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </FarmerPageShell>
  );
}

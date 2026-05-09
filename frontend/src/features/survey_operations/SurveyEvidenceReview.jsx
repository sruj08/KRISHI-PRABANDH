import React from 'react';
import GeoVerifiedMedia from '../../shared/components/GeoVerifiedMedia';

/**
 * SurveyEvidenceReview
 * The "Hero Screen" split-view for deep-diving into a single claim.
 * Operational, high-density, flat design.
 */
const SurveyEvidenceReview = ({ survey, onBack }) => {
  if (!survey) return null;

  return (
    <div className="flex flex-col h-full bg-surface font-body text-gray-900">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-gray-300 bg-white flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack} 
            className="group flex items-center gap-2 text-gray-500 hover:text-primary text-xs font-bold uppercase tracking-widest transition-none"
          >
            <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
            BACK TO QUEUE
          </button>
          <div className="w-px h-8 bg-gray-300"></div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-widest uppercase flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">folder_special</span>
              Claim: {survey.id}
            </h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-mono mt-1">
              SUBJECT: {survey.farmer} • CAPTURE: {survey.date}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-white border border-error text-error text-xs font-bold uppercase tracking-widest rounded hover:bg-error-light/20 transition-none shadow-sm">
            FLAG / REJECT
          </button>
          <button className="px-6 py-2 bg-primary border border-primary-dark text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-primary-dark transition-none shadow-sm">
            APPROVE PAYOUT
          </button>
        </div>
      </div>

      {/* Split Screen Content */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT: Video Evidence */}
        <div className="w-1/2 p-6 border-r border-gray-300 overflow-y-auto relative z-10 custom-scrollbar bg-white">
          <h2 className="text-[11px] font-bold text-gray-500 uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">videocam</span>
            Field Evidence (Live Capture)
          </h2>
          
          <div className="rounded-sm overflow-hidden border border-gray-300 bg-gray-100">
            <GeoVerifiedMedia 
              url="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2069&auto=format&fit=crop" 
              type="image"
              gps={{ lat: 18.5204, lng: 73.8567 }}
              timestamp={new Date().toISOString()}
              aiConfidence={survey.confidence}
            />
          </div>
          
          <div className="mt-6 bg-gray-50 p-5 border border-gray-300 rounded-sm relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <h3 className="text-[11px] font-bold text-gray-700 uppercase mb-4 tracking-widest flex items-center justify-between">
              <span>AI Assessment Report</span>
              <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">PROCESSING COMPLETE</span>
            </h3>
            
            <ul className="text-[13px] text-gray-800 space-y-3 font-mono">
              <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500">Subject Detected:</span> 
                <span className="font-bold text-gray-900 bg-gray-200 px-2 py-0.5 rounded border border-gray-300">Soybean</span>
              </li>
              <li className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500">Damage Pattern:</span> 
                <span className="font-bold text-amber-dark bg-amber-light border border-amber/30 px-2 py-0.5 rounded">Waterlogging (Severe)</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500">Estimated Loss %:</span> 
                <span className="font-bold text-error-dark bg-error-light border border-error/30 px-2 py-0.5 rounded">
                  {survey.confidence > 90 ? '70-80%' : '40-50%'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT: Geo-Intelligence & Satellite */}
        <div className="w-1/2 p-6 bg-surface overflow-y-auto relative z-10 custom-scrollbar">
          <h2 className="text-[11px] font-bold text-gray-500 uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">satellite</span>
            Satellite Verification
          </h2>
          
          <div className="w-full aspect-video bg-gray-200 border border-gray-300 rounded-sm flex items-center justify-center relative overflow-hidden group">
            {/* Standard map image */}
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" 
              className="w-full h-full object-cover" 
              alt="Satellite view" 
            />

            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] font-mono border border-gray-300 shadow-sm rounded-sm flex items-center gap-2 text-gray-900 font-bold">
              <span className="w-1.5 h-1.5 bg-error rounded-full"></span>
              NDVI INDEX: -0.42 (CRITICAL)
            </div>
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] font-mono border border-gray-300 shadow-sm rounded-sm text-gray-700">
              LAT: {survey.location?.split(',')[0]} <br/>
              LNG: {survey.location?.split(',')[1]}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white p-4 border border-gray-300 rounded-sm">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Rainfall (Past 7 Days)</div>
              <div className="text-3xl font-mono font-bold text-gray-900">420<span className="text-sm text-gray-500 ml-1">mm</span></div>
              <div className="text-[10px] text-gray-600 mt-2 flex items-center gap-1 font-mono bg-error-light/50 px-2 py-1 rounded border border-error/20 inline-flex">
                <span className="material-symbols-outlined text-[14px] text-error">trending_up</span>
                <span className="text-error-dark font-bold">+300% deviation</span>
              </div>
            </div>
            
            <div className="bg-white p-4 border border-gray-300 rounded-sm">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Soil Moisture</div>
              <div className="text-3xl font-mono font-bold text-gray-900">98<span className="text-sm text-gray-500 ml-1">%</span></div>
              <div className="text-[10px] text-gray-600 mt-2 flex items-center gap-1 font-mono bg-amber-light/50 px-2 py-1 rounded border border-amber/20 inline-flex">
                <span className="material-symbols-outlined text-[14px] text-amber-dark">warning</span>
                <span className="text-amber-dark font-bold">Saturation Warning</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SurveyEvidenceReview;

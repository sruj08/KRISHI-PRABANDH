import React from 'react';

/**
 * GeoVerifiedMedia
 * A component designed to display survey evidence (video/images) overlaid with
 * critical telemetry data (GPS coordinates, Timestamp, Accuracy).
 */
const GeoVerifiedMedia = ({ url, type = 'image', gps, timestamp, aiConfidence }) => {
  return (
    <div className="relative bg-gray-200 overflow-hidden border border-gray-300 rounded-sm aspect-video w-full flex items-center justify-center">
      {type === 'image' ? (
        <img src={url} alt="Field Evidence" className="object-cover w-full h-full" />
      ) : (
        <video src={url} controls className="object-cover w-full h-full" />
      )}
      
      {/* Telemetry Overlay - Top Left */}
      <div className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-mono px-2 py-1 flex flex-col gap-0.5 rounded-sm z-20">
        <span className="text-success-light flex items-center gap-1 font-bold">
          <span className="material-symbols-outlined text-[12px]">verified</span>
          GEO-VERIFIED
        </span>
        <span>LAT: {gps?.lat?.toFixed(5) || 'UNKNOWN'}</span>
        <span>LNG: {gps?.lng?.toFixed(5) || 'UNKNOWN'}</span>
      </div>

      {/* Timestamp Overlay - Top Right */}
      <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded-sm z-20 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-error rounded-full"></span>
        {timestamp ? new Date(timestamp).toLocaleString() : 'LIVE FEED REC'}
      </div>

      {/* AI Intelligence Overlay - Bottom Left */}
      {aiConfidence && (
        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/90 text-white text-[11px] font-mono px-2 py-1 border-l-2 border-l-primary rounded-sm z-20">
          <span className="material-symbols-outlined text-[14px] text-primary-light">memory</span>
          AI CONFIDENCE: <span className="text-primary-light font-bold">{aiConfidence}%</span>
        </div>
      )}
    </div>
  );
};

export default GeoVerifiedMedia;

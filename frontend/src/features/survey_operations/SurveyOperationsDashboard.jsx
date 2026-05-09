import React, { useState } from 'react';
import SurveyTriageQueue from './SurveyTriageQueue';
import SurveyEvidenceReview from './SurveyEvidenceReview';

/**
 * SurveyOperationsDashboard
 * Replaces the generic Sahayak/Officer dashboard.
 * Acts as the Command Center for handling incoming field surveys.
 */
const SurveyOperationsDashboard = () => {
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  return (
    <div className="h-full min-h-[calc(100vh-56px)] overflow-hidden bg-surface flex flex-col">
      {!selectedSurvey ? (
        <SurveyTriageQueue onSelectSurvey={setSelectedSurvey} />
      ) : (
        <SurveyEvidenceReview 
          survey={selectedSurvey} 
          onBack={() => setSelectedSurvey(null)} 
        />
      )}
    </div>
  );
};

export default SurveyOperationsDashboard;

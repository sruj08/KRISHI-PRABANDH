import React from 'react';
import DivisionCrossDistrictFraud from '../division/DivisionCrossDistrictFraud';

/** Officer-route wrapper: reuse division fraud intelligence in taluka officer context. */
const OfficerCrossDistrictWrapper = () => (
  <div style={{ minHeight: '100%', background: '#f2f3ef' }}>
    <DivisionCrossDistrictFraud />
  </div>
);

export default OfficerCrossDistrictWrapper;

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const StatusBadge = ({ status, className = '' }) => {
  const { t } = useLanguage();
  let badgeClass = 'badge-grey';
  let icon = '';

  switch (status?.toLowerCase()) {
    case 'pending':
    case 'survey pending':
    case 'under scrutiny':
      badgeClass = 'badge-pending'; // typically amber/orange
      icon = 'schedule';
      break;
    case 'verified':
    case 'approved':
      badgeClass = 'badge-verified'; // typically success/green
      icon = 'check_circle';
      break;
    case 'inspection req.':
    case 'urgent inspection':
    case 'urgent':
    case 'rejected':
      badgeClass = 'badge-error'; // typically red
      icon = 'error';
      break;
    case 'completed':
    case 'task completed':
    case 'applied':
      badgeClass = 'badge-blue'; // typically blue
      icon = 'pending_actions';
      break;
    default:
      badgeClass = 'badge-grey';
      icon = 'info';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
        {icon}
      </span>
      {status}
    </span>
  );
};

export default StatusBadge;

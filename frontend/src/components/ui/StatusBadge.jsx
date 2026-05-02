import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  let badgeClass = 'badge-grey';
  let icon = '';

  switch (status?.toLowerCase()) {
    case 'pending':
    case 'survey pending':
      badgeClass = 'badge-pending';
      icon = 'schedule';
      break;
    case 'verified':
      badgeClass = 'badge-verified';
      icon = 'check_circle';
      break;
    case 'inspection req.':
    case 'urgent inspection':
    case 'urgent':
      badgeClass = 'badge-error';
      icon = 'error';
      break;
    case 'completed':
    case 'task completed':
      badgeClass = 'badge-blue';
      icon = 'done_all';
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

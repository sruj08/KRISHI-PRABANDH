import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import SearchInput from '../components/ui/SearchInput';
import ApplicationCard from '../components/ui/ApplicationCard';

const Applications = () => {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState('');

  const apps = [
    { name: 'Sandeep Kadam', location: 'Plot 42, North Sector', scheme: 'PM-Kisan', dateLabel: 'Submitted', date: 'Oct 24', status: 'Pending' },
    { name: 'Savita Deshmukh', location: 'Plot 18, East Sector', scheme: 'Tractor Subsidy', dateLabel: 'Verified', date: 'Oct 22', status: 'Verified' },
    { name: 'Anand Jadhav', location: 'Plot 05, South Sector', scheme: 'Crop Loss Claim', dateLabel: 'Submitted', date: 'Oct 25', status: 'Inspection Req.', isUrgent: true },
    { name: 'Vikas More', location: 'Plot 99, West Sector', scheme: 'Seed Distro', dateLabel: 'Submitted', date: 'Oct 24', status: 'Pending' },
  ];

  return (
    <div className="flex-col gap-4 animate-fade-in">
      <header className="mb-2">
        <h2 className="text-xl fw-bold text-primary-dark">{t("Applications", lang)}</h2>
      </header>

      <div className="sticky" style={{ top: 'var(--header-height)', backgroundColor: 'var(--surface)', padding: 'var(--sp-2) 0', zIndex: 10 }}>
        <SearchInput 
          placeholder="Search farmer or ID..." 
          value={search} 
          onChange={setSearch} 
          onFilterClick={() => console.log('Filter clicked')}
        />
      </div>

      <div className="flex-col gap-4 mt-2 mb-6">
        {apps.map((app, index) => (
          <ApplicationCard key={index} {...app} />
        ))}
      </div>
    </div>
  );
};

export default Applications;

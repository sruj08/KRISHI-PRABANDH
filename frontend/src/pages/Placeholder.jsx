import React from 'react';

const Placeholder = ({ title }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">construction</span>
        <h2 className="text-lg font-medium text-gray-700">Module Under Construction</h2>
        <p className="text-gray-500 mt-2">
          The {title} module is currently being developed and will be available soon.
        </p>
      </div>
    </div>
  );
};

export default Placeholder;

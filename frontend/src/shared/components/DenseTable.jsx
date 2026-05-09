import React from 'react';

/**
 * DenseTable
 * A GIS-inspired dense data grid with sticky headers and striped rows.
 * Flattened for maximum operational legibility.
 */
const DenseTable = ({ headers, data, onRowClick }) => {
  return (
    <div className="overflow-x-auto bg-white border border-gray-300 w-full rounded-sm custom-scrollbar">
      <table className="w-full text-left border-collapse text-[13px] font-body">
        <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-300 shadow-sm">
          <tr>
            {headers.map((header, idx) => (
              <th 
                key={idx} 
                className="py-3 px-4 text-gray-700 font-bold uppercase tracking-widest whitespace-nowrap text-[10px]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="py-8 text-center text-gray-500 italic font-mono text-xs">
                [ NO DATA FOUND ]
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`group hover:bg-primary/5 transition-none ${onRowClick ? 'cursor-pointer' : ''} ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
              >
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="py-2.5 px-4 text-gray-800 whitespace-nowrap transition-none">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DenseTable;

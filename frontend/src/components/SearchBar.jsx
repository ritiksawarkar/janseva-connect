import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  placeholder = 'Search by tracking ID, title, or area...',
  value = '',
  onChange,
  onSearch,
  className = ''
}) => {
  const [internalVal, setInternalVal] = useState(value);

  useEffect(() => {
    setInternalVal(value);
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(internalVal);
  };

  const handleClear = () => {
    setInternalVal('');
    if (onChange) onChange('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center w-full ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={internalVal}
        onChange={(e) => {
          setInternalVal(e.target.value);
          if (onChange) onChange(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder:text-slate-400 shadow-2xs"
      />
      {internalVal && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;

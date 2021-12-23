import { useState } from 'react';

export default function useSearch(initSearch) {
  const [search, setSearch] = useState(initSearch || '');
  const handleSearch = (event) => setSearch(event.target.value);

  return {
    search,
    handleSearch,
  };
}

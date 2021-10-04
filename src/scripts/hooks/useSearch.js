import { useState } from 'react';

export default function useSearch() {
  const [search, setSearch] = useState('');
  const handleSearch = (event) => setSearch(event.target.value);

  return {
    search,
    handleSearch,
  };
}

import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  actions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  searchable = true,
  searchKeys = [],
  actions,
  onRowClick,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof T | string) => {
    setSortConfig((currentSort) => {
      if (!currentSort || currentSort.key !== key) {
        return { key, direction: 'asc' };
      }
      if (currentSort.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) => {
      return searchKeys.some((key) => {
        const value = item[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchKeys]);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  return (
    <div className='space-y-4'>
      {searchable && (
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Search className='h-5 w-5 text-gray-400' />
          </div>
          <input
            type='text'
            placeholder='Search...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm'
          />
        </div>
      )}

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer select-none' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className='flex items-center space-x-1'>
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className='inline-flex flex-col'>
                        <ChevronUp
                          className={`h-3 w-3 ${
                            sortConfig?.key === column.key &&
                            sortConfig?.direction === 'asc'
                              ? 'text-red-500'
                              : 'text-gray-400'
                          }`}
                        />
                        <ChevronDown
                          className={`h-3 w-3 -mt-1 ${
                            sortConfig?.key === column.key &&
                            sortConfig?.direction === 'desc'
                              ? 'text-red-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {sortedData.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                  >
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] || '')}
                  </td>
                ))}
                {actions && (
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

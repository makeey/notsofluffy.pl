'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';

interface SearchInputProps {
  placeholder?: string;
  initialValue?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  redirectOnSubmit?: boolean;
}

export function SearchInput({
  placeholder = 'Search for products...',
  initialValue = '',
  onSearch,
  showSuggestions = true,
  className = '',
  size = 'md',
  redirectOnSubmit = true,
}: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const suggestionsTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get search suggestions
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!showSuggestions || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.getSearchSuggestions(searchQuery, 5);
      setSuggestions(response.suggestions);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [showSuggestions]);

  // Handle input change with debounced suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestionsDropdown(true);

    // Clear existing timeout
    if (suggestionsTimeout.current) {
      clearTimeout(suggestionsTimeout.current);
    }

    // Get suggestions after a delay
    if (showSuggestions) {
      suggestionsTimeout.current = setTimeout(() => {
        getSuggestions(value);
      }, 300);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestionsDropdown(false);
    
    if (onSearch) {
      onSearch(query);
    }
    
    if (redirectOnSubmit && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestionsDropdown(false);
    
    if (onSearch) {
      onSearch(suggestion);
    }
    
    if (redirectOnSubmit) {
      router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding suggestions to allow for suggestion clicks
    setTimeout(() => setShowSuggestionsDropdown(false), 200);
  };

  // Handle input focus
  const handleFocus = () => {
    if ((suggestions?.length || 0) > 0) {
      setShowSuggestionsDropdown(true);
    }
  };

  // Size-based styling
  const sizeClasses = {
    sm: 'py-2 pl-8 pr-3 text-sm',
    md: 'py-3 pl-10 pr-3 text-sm',
    lg: 'py-4 pl-12 pr-4 text-base',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconPositionClasses = {
    sm: 'pl-2',
    md: 'pl-3',
    lg: 'pl-4',
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (suggestionsTimeout.current) {
        clearTimeout(suggestionsTimeout.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center ${iconPositionClasses[size]}`}>
          <MagnifyingGlassIcon 
            className={`${iconSizeClasses[size]} text-gray-400`} 
            aria-hidden="true" 
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`
            block w-full rounded-md border-0 ${sizeClasses[size]} text-gray-900 
            ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
            focus:ring-2 focus:ring-inset focus:ring-indigo-600 
            sm:leading-6
          `}
        />
        
        {/* Search Suggestions Dropdown */}
        {showSuggestions && showSuggestionsDropdown && ((suggestions?.length || 0) > 0 || isLoading) && (
          <div className="absolute z-50 mt-1 w-full rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
            {isLoading && (
              <div className="px-4 py-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span>Loading suggestions...</span>
                </div>
              </div>
            )}
            
            {!isLoading && suggestions?.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                <div className="flex items-center space-x-2">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 584px;
  margin: 0 auto;
  padding: 20px 0;
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: white;
  border: 1px solid #dfe1e5;
  border-radius: 24px;
  box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
  
  &:hover {
    box-shadow: 0 1px 6px rgba(32, 33, 36, 0.45);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 100px 0 50px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  outline: none;
  background: transparent;
`;

const IconButton = styled.button`
  position: absolute;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa0a6;

  &:hover {
    color: #202124;
  }
`;

const SearchIcon = styled(IconButton)`
  left: 16px;
`;

const KeyboardIcon = styled(IconButton)`
  right: 40px;
`;

const CloseButton = styled(IconButton)`
  right: 8px;
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dfe1e5;
  border-radius: 0 0 24px 24px;
  margin-top: -1px;
  padding: 0;
  list-style: none;
  box-shadow: 0 4px 6px rgba(32, 33, 36, 0.28);
  z-index: 1000;
  height: 200px;
  overflow-y: auto;
  font-size: 14px;
`;

const SuggestionItem = styled.li`
  padding: 8px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  white-space: pre;
  height: 40px;
  box-sizing: border-box;
  
  &:hover {
    background-color: #f8f9fa;
  }

  &.selected {
    background-color: #f1f3f4;
  }
`;

const SearchIconWrapper = styled.div`
  margin-right: 12px;
  color: #9aa0a6;
  display: flex;
  align-items: center;
`;

const KeywordSpan = styled.span`
  margin-right: 8px;
`;

const HighlightedText = styled.span`
  color: #1a73e8;
  font-weight: bold;
`;

const SearchBar = ({ initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const fetchSuggestions = async () => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('검색어:', searchQuery);
      const response = await fetch(`http://localhost:8080/youtube/suggestion?keyword=${searchQuery}`);
      console.log('API 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error('추천 검색어를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('API 응답 전체 데이터:', JSON.stringify(data, null, 2));
      
      let combinedSuggestions = [];
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item && item.keywords && Array.isArray(item.keywords)) {
            const combinedKeywords = item.keywords.join(' ');
            combinedSuggestions.push(combinedKeywords);
          }
        });
      } else if (data && data.keywords && Array.isArray(data.keywords)) {
        combinedSuggestions = [data.keywords.join(' ')];
      }
      
      console.log('결합된 keywords:', combinedSuggestions);
      setSuggestions(combinedSuggestions);
    } catch (error) {
      console.error('추천 검색어 로딩 중 오류:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : -1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else {
            handleSearch(e);
          }
          break;
        case 'Escape':
          setSuggestions([]);
          setSelectedIndex(-1);
          break;
      }
    };

    const inputElement = searchRef.current?.querySelector('input');
    if (inputElement) {
      inputElement.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [suggestions, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const handleSuggestionClick = async (suggestion) => {
    console.log('선택된 추천어:', suggestion);
    const [input, keywords] = suggestion.split(' ');
    
    try {
      const url = `http://localhost:8080/youtube/suggested/structured?input=${input}&keywords=${keywords}`;
      console.log('API 요청 URL:', url);
      
      const response = await fetch(url);
      console.log('API 응답 상태:', response.status);
      
      const data = await response.json();
      console.log('API 응답 데이터:', JSON.stringify(data, null, 2));
      
      setSearchQuery(suggestion);
      setSuggestions([]);
      navigate(`/search/${encodeURIComponent(suggestion)}`, { 
        state: { 
          searchResults: data,
          input: input,
          keywords: keywords
        } 
      });
    } catch (error) {
      console.error('추천어 처리 중 오류 발생:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const words = searchQuery.trim().split(' ');
        let url;
        let input = '';
        let keywords = '';
        
        if (words.length >= 2) {
          input = words[0];
          keywords = words.slice(1).join(' ');
          url = `http://localhost:8080/youtube/suggested/structured?input=${input}&keywords=${keywords}`;
        } else {
          url = `http://localhost:8080/youtube/search?keyword=${searchQuery.trim()}`;
        }
        
        console.log('검색 실행:', searchQuery);
        console.log('API 요청 URL:', url);
        
        const response = await fetch(url);
        console.log('검색 API 응답 상태:', response.status);
        
        if (!response.ok) {
          throw new Error('검색 결과를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        console.log('검색 결과:', data);
        setSuggestions([]);
        navigate(`/search/${encodeURIComponent(searchQuery.trim())}`, { 
          state: { 
            searchResults: data,
            input,
            keywords,
            searchQuery: searchQuery.trim()
          }
        });
      } catch (error) {
        console.error('검색 중 오류 발생:', error);
      }
    }
  };

  const handleInputClick = () => {
    if (searchQuery.length > 0) {
      fetchSuggestions();
    }
  };

  const highlightMatch = (text) => {
    if (!searchQuery) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
      <HighlightedText key={i}>{part}</HighlightedText> : 
      part
    );
  };

  return (
    <SearchContainer ref={searchRef}>
      <form onSubmit={handleSearch}>
        <SearchWrapper>
          <SearchIcon>
            <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20px" height="20px">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </SearchIcon>
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={(e) => {
              console.log('입력값 변경:', e.target.value);
              setSearchQuery(e.target.value);
            }}
            onClick={handleInputClick}
            placeholder="검색어를 입력하세요"
          />
          {searchQuery && (
            <>
              <KeyboardIcon>
                <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20px" height="20px">
                  <path fill="currentColor" d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>
                </svg>
              </KeyboardIcon>
              <CloseButton onClick={() => setSearchQuery('')}>
                <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20px" height="20px">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </CloseButton>
            </>
          )}
        </SearchWrapper>
        {suggestions.length > 0 && (
          <SuggestionsList>
            {suggestions.map((combinedKeywords, index) => (
              <SuggestionItem 
                key={index}
                onClick={() => handleSuggestionClick(combinedKeywords)}
                className={index === selectedIndex ? 'selected' : ''}
              >
                <SearchIconWrapper>
                  <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16px" height="16px">
                    <path fill="#9aa0a6" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </SearchIconWrapper>
                {combinedKeywords.split(' ').map((keyword, i) => (
                  <KeywordSpan key={i}>
                    {highlightMatch(keyword)}
                  </KeywordSpan>
                ))}
              </SuggestionItem>
            ))}
          </SuggestionsList>
        )}
      </form>
    </SearchContainer>
  );
};

export default SearchBar;
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

const ResultsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ResultItem = styled.div`
  display: flex;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Thumbnail = styled.img`
  width: 240px;
  height: 135px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
`;

const ChannelTitle = styled.p`
  margin: 0 0 5px 0;
  color: #666;
  font-size: 14px;
`;

const ViewCount = styled.p`
  margin: 0;
  color: #888;
  font-size: 14px;
`;

const SearchResults = () => {
  const location = useLocation();
  const { searchResults, input, keywords } = location.state || {};

  console.log('받은 데이터:', { input, keywords, searchResults });

  if (!searchResults || searchResults.length === 0) {
    return (
      <ResultsContainer>
        <p>검색 결과가 없습니다.</p>
      </ResultsContainer>
    );
  }

  // 검색어가 모두 포함된 결과를 우선 정렬
  const sortedResults = [...searchResults].sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    const inputLower = input?.toLowerCase() || '';
    const keywordsLower = keywords?.toLowerCase() || '';

    // 정확한 단어 매칭 확인
    const aHasInput = aTitle.includes(inputLower);
    const aHasKeywords = aTitle.includes(keywordsLower);
    const bHasInput = bTitle.includes(inputLower);
    const bHasKeywords = bTitle.includes(keywordsLower);

    // 두 단어 모두 포함된 경우 우선순위 1
    if (aHasInput && aHasKeywords && !(bHasInput && bHasKeywords)) return -1;
    if (!(aHasInput && aHasKeywords) && bHasInput && bHasKeywords) return 1;

    // 한 단어만 포함된 경우 우선순위 2
    if ((aHasInput || aHasKeywords) && !(bHasInput || bHasKeywords)) return -1;
    if (!(aHasInput || aHasKeywords) && (bHasInput || bHasKeywords)) return 1;

    return 0;
  });

  console.log('정렬된 결과:', sortedResults);

  return (
    <ResultsContainer>
      {sortedResults.map((result) => (
        <ResultItem key={result.id}>
          <Thumbnail src={result.thumbnails} alt={result.title} />
          <Content>
            <Title>{result.title}</Title>
            <ChannelTitle>{result.channelTitle}</ChannelTitle>
            <ViewCount>조회수: {result.viewCount.toLocaleString()}회</ViewCount>
          </Content>
        </ResultItem>
      ))}
    </ResultsContainer>
  );
};

export default SearchResults; 
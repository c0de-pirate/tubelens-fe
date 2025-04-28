import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import styled from 'styled-components';

const SearchPageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchResults = styled.div`
  margin-top: 20px;
`;

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const VideoCard = styled.div`
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const VideoInfo = styled.div`
  padding: 12px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #030303;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ChannelInfo = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #606060;
`;

const ChannelName = styled.div`
  margin-top: 4px;
  color: #606060;
`;

const ViewCount = styled.div`
  margin-top: 4px;
  color: #606060;
`;

const Loading = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #606060;
`;

const Error = styled.div`
  text-align: center;
  padding: 20px;
  color: #ff0000;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #606060;
`;

const SearchPage = () => {
  const { keyword } = useParams();
  const location = useLocation();
  const [videos, setVideos] = useState(location.state?.searchResults || []);
  const [loading, setLoading] = useState(!location.state?.searchResults);
  const [error, setError] = useState(null);
  const searchQuery = location.state?.searchQuery || keyword || '';

  useEffect(() => {
    const fetchVideos = async () => {
      // Skip if we already have results from navigation state
      if (location.state?.searchResults) {
        setVideos(location.state.searchResults);
        return;
      }

      if (!keyword) {
        setVideos([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let url;
        const words = keyword.split(' ');
        
        if (words.length >= 2) {
          const input = words[0];
          const keywords = words.slice(1).join(' ');
          url = `http://localhost:8080/youtube/suggested/structured?input=${input}&keywords=${keywords}`;
        } else {
          url = `http://localhost:8080/youtube/search?keyword=${keyword}`;
        }
        
        console.log('API 요청 URL:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('검색 결과를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        setVideos(data);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [keyword, location.state]);

  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M 조회수`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K 조회수`;
    }
    return `${count} 조회수`;
  };

  return (
    <SearchPageContainer>
      <SearchBar initialQuery={searchQuery} />
      <SearchResults>
        <h2>검색 결과: {searchQuery}</h2>
        {loading && <Loading>검색 중...</Loading>}
        {error && <Error>{error}</Error>}
        {!loading && !error && videos.length === 0 && (
          <NoResults>검색 결과가 없습니다.</NoResults>
        )}
        {!loading && !error && videos.length > 0 && (
          <VideoGrid>
            {videos.map((video) => (
              <VideoCard key={video.id}>
                <Thumbnail 
                  src={video.thumbnails} 
                  alt={video.title} 
                />
                <VideoInfo>
                  <Title>{video.title}</Title>
                  <ChannelInfo>
                    <ChannelName>{video.channelTitle}</ChannelName>
                    <ViewCount>
                      {formatViewCount(video.viewCount)}
                    </ViewCount>
                  </ChannelInfo>
                </VideoInfo>
              </VideoCard>
            ))}
          </VideoGrid>
        )}
      </SearchResults>
    </SearchPageContainer>
  );
};

export default SearchPage; 
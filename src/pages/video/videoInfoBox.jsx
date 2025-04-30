import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getVideoData } from './hook';
import SearchBar from '../../components/SearchBar';
import mainLogo from '../../assets/mainlogo.png';

const VideoInfoBox = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [videoInfo, setVideoInfo] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const fetchVideoData = async () => {
      console.log('VideoInfoBox received videoId:', videoId);
      if (!videoId) {
        return;
      }
      setIsLoading(true);
      try {
        const data = await getVideoData(videoId);
        setVideoInfo(data);
      } catch (error) {
        console.error('비디오 데이터를 가져오는 중 에러 발생:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId, navigate, location]);

  const getFirstLine = (text) => {
    return text ? text.split('\n')[0] : '';
  };

  const handleVideoClick = (newVideoId) => {
    console.log('handleVideoClick 호출됨', newVideoId);
    navigate(`/video/${newVideoId}`);
  };

  return (
    <>
      <SearchBar />
      <div className="flex px-16 py-6 gap-8" style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>
        {/* 메인 비디오 섹션 */}
        <div className="flex-1">
          {/* 메인 비디오 */}
          <div className="w-full h-[500px] mb-4 bg-gray-200 rounded-xl overflow-hidden">
            {videoInfo && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                className="rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
          
          {/* 비디오 정보 */}
          <h1 className="text-xl font-bold mb-2">{videoInfo?.title || '비디오 제목'}</h1>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-900 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <img 
                      src={mainLogo}
                      alt={`${videoInfo?.channelTitle || '채널'} 프로필`}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{videoInfo?.channelTitle || '채널명'}</span>
                  </div>
                  <span>•</span>
                  <span>조회수 {videoInfo?.viewCount ? (videoInfo.viewCount >= 10000 ? `${Math.floor(videoInfo.viewCount / 10000)}만` : videoInfo.viewCount) : '0'}회</span>
                  <span>•</span>
                  <span>{videoInfo?.publishedAt ? videoInfo.publishedAt.split('T')[0].replace(/(\d{4})-(\d{2})-(\d{2})/, '$1년 $2월 $3일') : '날짜'}</span>
                </div>
                <div className="mt-4 text-gray-600 text-sm">
                  {videoInfo?.description ? (
                    <>
                      {showFullDescription ? videoInfo.description : getFirstLine(videoInfo.description)}
                      {videoInfo.description.includes('\n') && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
                        >
                          {showFullDescription ? '간략히' : '더보기'}
                        </button>
                      )}
                    </>
                  ) : '비디오 설명'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 추천 비디오 섹션 */}
        <div className="w-[400px]">
          <h2 className="text-lg font-bold mb-2">추천 콘텐츠</h2>
          {isLoading ? (
            <div className="text-center text-gray-500 py-4">로딩 중...</div>
          ) : videoInfo?.relatedVideos && videoInfo.relatedVideos.length > 0 ? (
            videoInfo.relatedVideos.map((video, index) => (
              <div 
                key={index} 
                className="flex gap-3 py-1 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => {
                  handleVideoClick(video.id)
                }}
              >
                <div className="w-[168px] h-[94px] bg-gray-200 rounded-lg overflow-hidden">
                  <img src={video.thumbnails} alt={video.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="line-clamp-2 text-sm font-semibold text-gray-800">{video.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{video.channelTitle}</p>
                  <p className="text-xs text-gray-500">
                    조회수 {video.viewCount >= 10000 ? `${Math.floor(video.viewCount / 10000)}만` : video.viewCount}회
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">추천 비디오가 없습니다.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoInfoBox; 
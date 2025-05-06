import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getVideoData } from './hook';
import SearchBar from '../../components/SearchBar';

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
      <div className="flex px-16 py-6 gap-8">
        {/* 메인 비디오 섹션 */}
        <div className="flex-1">
          {/* 메인 비디오 */}
          <div className="w-full h-[500px] mb-4 bg-gray-200">
            {videoInfo && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
          
          {/* 비디오 정보 */}
          <div className="flex items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold">{videoInfo?.title || '비디오 제목'}</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <span>{videoInfo?.channelTitle || '채널명'}</span>
                <span>•</span>
                <span>조회수 {videoInfo?.viewCount ? (videoInfo.viewCount >= 10000 ? `${Math.floor(videoInfo.viewCount / 10000)}만` : videoInfo.viewCount) : '0'}회</span>
                <span>•</span>
                <span>{videoInfo?.publishedAt ? videoInfo.publishedAt.split('T')[0].replace(/(\d{4})-(\d{2})-(\d{2})/, '$1년 $2월 $3일') : '날짜'}</span>
              </div>
              <p className="mt-4 text-gray-700">
                {videoInfo?.description ? (
                  <>
                    {showFullDescription ? videoInfo.description : getFirstLine(videoInfo.description)}
                    {videoInfo.description.includes('\n') && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        {showFullDescription ? '간략히' : '더보기'}
                      </button>
                    )}
                  </>
                ) : '비디오 설명'}
              </p>
            </div>
          </div>
        </div>

        {/* 추천 비디오 섹션 */}
        <div className="w-[400px] space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-500 py-4">로딩 중...</div>
          ) : videoInfo?.relatedVideos && videoInfo.relatedVideos.length > 0 ? (
            videoInfo.relatedVideos.map((video, index) => (
              <div 
                key={index} 
                className="flex gap-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => {
                  // console.log('Clicked video:', video)
                  handleVideoClick(video.id)
                }}
              >
                <div className="w-[168px] h-[94px] bg-gray-200 rounded-lg overflow-hidden">
                  <img src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} alt={video.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="font-medium line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{video.channelTitle}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {video.videoId}
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
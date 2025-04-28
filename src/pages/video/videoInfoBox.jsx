import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getVideoData } from './hook';

const VideoInfoBox = () => {
  const { videoId } = useParams();
  const [videoInfo, setVideoInfo] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const data = await getVideoData(videoId);
        console.log(data.relatedVideos);
        setVideoInfo(data);
      } catch (error) {
        console.error('비디오 데이터를 가져오는 중 에러 발생:', error);
      }
    };

    fetchVideoData();
  }, [videoId]);

  const getFirstLine = (text) => {
    return text.split('\n')[0];
  };

  if (!videoInfo) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="flex px-16 py-6 gap-8">
      {/* 메인 비디오 섹션 */}
      <div className="flex-1">
        {/* 메인 비디오 */}
        <div className="w-full h-[500px] mb-4">
          <iframe
            width="100%"
            height="100%"
            src={`https://${videoInfo.embedHtml}`}  // 템플릿 리터럴 사용
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        
        {/* 비디오 정보 */}
        <div className="flex items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">{videoInfo.title}</h1>
            <div className="flex items-center gap-2 text-gray-600 mt-2">
              <span>{videoInfo.channelTitle}</span>
              <span>•</span>
              <span>조회수 {videoInfo.viewCount >= 10000 ? `${Math.floor(videoInfo.viewCount / 10000)}만` : videoInfo.viewCount}회</span>
              <span>•</span>
              <span>{videoInfo.publishedAt.split('T')[0].replace(/(\d{4})-(\d{2})-(\d{2})/, '$1년 $2월 $3일')}</span>
            </div>
            <p className="mt-4 text-gray-700">
              {showFullDescription ? videoInfo.description : getFirstLine(videoInfo.description)}
              {videoInfo.description.includes('\n') && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  {showFullDescription ? '간략히' : '더보기'}
                </button>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 추천 비디오 섹션 */}
      <div className="w-[400px] space-y-4">
        {videoInfo.relatedVideos && videoInfo.relatedVideos.length > 0 ? (
          videoInfo.relatedVideos.map((video, index) => (
            <div key={index} className="flex gap-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
              <div className="w-[168px] h-[94px] bg-gray-200 rounded-lg overflow-hidden">
                <img src={video.thumbnails} alt={video.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-medium line-clamp-2">{video.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{video.channelTitle}</p>
                <p className="text-sm text-gray-500 mt-1">
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
  );
};

export default VideoInfoBox; 
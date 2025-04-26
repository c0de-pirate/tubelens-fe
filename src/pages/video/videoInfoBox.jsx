import React from 'react';

const VideoInfoBox = () => {
  return (
    <div className="flex px-16 py-6 gap-8">
      {/* 메인 비디오 섹션 */}
      <div className="flex-1">
        {/* 메인 비디오 */}
        <div className="w-full h-[500px] bg-gray-200 mb-4" />
        
        {/* 비디오 정보 */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold">영상제목</h1>
            <div className="flex items-center gap-2 text-gray-600 mt-2">
              <span>채널명</span>
              <span>•</span>
              <span>조회수 3회</span>
              <span>•</span>
              <span>3시간전</span>
            </div>
            <p className="mt-4 text-gray-700">영상 설명</p>
          </div>
        </div>
      </div>

      {/* 추천 비디오 섹션 */}
      <div className="w-[400px] space-y-4">
        {Array(5).fill(null).map((_, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-[168px] h-[94px] bg-gray-200" />
            <div className="flex flex-col">
              <h3 className="font-medium">영상제목</h3>
              <p className="text-sm text-gray-600">채널이름</p>
              <p className="text-sm text-gray-500">조회수</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoInfoBox; 
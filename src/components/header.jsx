import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/mainlogo.png";
import { fetchUserInfo } from '../utils/api';
import axios from '../utils/api'; // API 호출을 위한 axios 추가

// 서버 설정을 한 곳에서 관리
const SERVER_CONFIG = {
  host: 'localhost',
  port: 80,
  baseURL: function() {
    return `http://${this.host}:${this.port}`;
  }
};

function Header() {
  const hasToken = localStorage.getItem('token') !== null;
  const [loginStatus, setLoginStatus] = useState(hasToken ? '확인 중' : null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(hasToken);
  const [isLoginChecked, setIsLoginChecked] = useState(false);
  
  // 인기 급상승 영상 관련 상태 추가
  const [showTrendingModal, setShowTrendingModal] = useState(false);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [sortBy, setSortBy] = useState('views'); // 'views' 또는 'likes'
  const [onlyToday, setOnlyToday] = useState(true); // 기본값: 오늘만

  const handleGoogleLogin = () => {
    window.location.href = `${SERVER_CONFIG.baseURL()}/oauth2/authorization/google`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setLoginStatus(null);
    setUserInfo(null);
  };

  // 인기 급상승 영상 토글
  const toggleTrendingModal = async () => {
    if (!showTrendingModal) {
      // 모달을 열 때만 데이터를 가져옴
      await fetchTrendingVideos();
    }
    setShowTrendingModal(!showTrendingModal);
  };

  // 인기 급상승 영상 가져오기
  const fetchTrendingVideos = async () => {
    try {
      setTrendingLoading(true);
      // 정렬 기준과 기간에 따라 API 호출
      const period = onlyToday ? 'today' : '';
      console.log(`API 호출: /api/videos/trending/${sortBy}?limit=10&period=${period}`);
      
      const response = await axios.get(`/api/videos/trending/${sortBy}`, {
        params: {
          limit: 10,
          period
        }
      });
      
      console.log("인기 급상승 영상 API 응답:", response);
      
      // response.data가 배열인지 확인
      if (Array.isArray(response.data)) {
        setTrendingVideos(response.data);
      } else {
        console.error("API 응답이 배열이 아닙니다:", response.data);
        setTrendingVideos([]);
      }
    } catch (error) {
      console.error('인기 급상승 영상 가져오기 실패:', error);
      console.error('오류 상세:', error.response || error.message);
      // 오류 발생 시 빈 배열 설정
      setTrendingVideos([]);
    } finally {
      setTrendingLoading(false);
    }
  };

  // 정렬 기준 변경
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // 기간 필터 변경
  const handlePeriodChange = (e) => {
    setOnlyToday(e.target.checked);
  };

  // 정렬 기준이나 기간 필터가 변경되면 데이터를 다시 가져옴
  useEffect(() => {
    if (showTrendingModal) {
      fetchTrendingVideos();
    }
  }, [sortBy, onlyToday]);

  const checkLoginStatus = async () => {
    console.log("checkLoginStatus 시작");
    try {
      console.log("fetchUserInfo 호출 전");
      const response = await fetchUserInfo();
      console.log("fetchUserInfo 응답:", response.data);
      let processedUserInfo;
      if (typeof response.data === 'string' && response.data.includes('Username=')) {
        const username = response.data.match(/Username=(.*?),/)?.[1] || '사용자';
        const authorities = response.data.match(/Granted Authorities=\[(.*?)\]/)?.[1] || '';
        
        processedUserInfo = {
          name: username,
          email: '정보 없음',
          picture: null,
          authorities: authorities.split(', ')
        };  
      } else {
        processedUserInfo = response.data;
      }
      
      setUserInfo(processedUserInfo);
      setLoginStatus('성공');
    } catch (error) {
      console.error("로그인 상태 확인 실패:", error);
      console.error("상세 오류:", error.message, error.response?.status);
      setLoginStatus(null);
      setUserInfo(null);
    } finally {
      setLoading(false);
      setIsLoginChecked(true); // 로그인 체크 완료 표시 추가
    }
  };
  
  useEffect(() => {
    // 이미 로그인 체크를 했다면 다시 실행하지 않음
    if (isLoginChecked) return;
    
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      window.history.replaceState({}, document.title, '/');
    }
    
    console.log("checkLoginStatus 호출 전");
    checkLoginStatus();
  }, []);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    if (showTrendingModal) {
      const handleClickOutside = (event) => {
        const modal = document.getElementById('trending-modal');
        if (modal && !modal.contains(event.target) && 
            !event.target.closest('.trending-button')) {
          setShowTrendingModal(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTrendingModal]);

  return (
    <>
      {/* 무지개 테두리 CSS 스타일 추가 */}
      <style jsx>{`
        @keyframes rainbow-border-animation {
          0% { border-color: #ff0000; }
          14% { border-color: #ff7f00; }
          28% { border-color: #ffff00; }
          42% { border-color: #00ff00; }
          57% { border-color: #0000ff; }
          71% { border-color: #4b0082; }
          85% { border-color: #9400d3; }
          100% { border-color: #ff0000; }
        }

        .rainbow-border {
          border: 3px solid #ff0000;
          animation: rainbow-border-animation 5s linear infinite;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      <header className="w-full flex items-center justify-between px-6 py-2 bg-white shadow-lg z-10">
        {/* 왼쪽: 로고와 텍스트 */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <img src={logo} alt="TubeLens Logo" className="w-14 h-14" />
        </Link>
        {/* 가운데: 버튼 2개 */}
        <div className="flex items-center gap-4 ml-auto mr-8">
          {/* 인기 급상승 영상 버튼과 모달 */}
          <div className="relative">
            <button 
              onClick={toggleTrendingModal}
              className="trending-button text-base font-medium text-black hover:text-blue-600 focus:outline-none cursor-pointer"
            >
              인기 급상승 영상 <span className="inline-block">🔼</span>
            </button>
            
            {/* 인기 급상승 영상 모달/드롭다운 */}
            {showTrendingModal && (
              <div 
                id="trending-modal"
                className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg w-96 z-50 rainbow-border"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">인기 급상승 영상</h3>
                  
                  {/* 필터 옵션 */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="sort-views"
                          name="sort"
                          value="views"
                          checked={sortBy === 'views'}
                          onChange={handleSortChange}
                        />
                        <label htmlFor="sort-views">조회수</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="sort-likes"
                          name="sort"
                          value="likes"
                          checked={sortBy === 'likes'}
                          onChange={handleSortChange}
                        />
                        <label htmlFor="sort-likes">좋아요</label>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="only-today"
                        checked={onlyToday}
                        onChange={handlePeriodChange}
                      />
                      <label htmlFor="only-today">오늘만</label>
                    </div>
                  </div>
                  
                  {/* 비디오 목록 */}
                  <div className="max-h-80 overflow-y-auto">
                    {trendingLoading ? (
                      <div className="flex justify-center items-center h-20">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    ) : Array.isArray(trendingVideos) && trendingVideos.length > 0 ? (
                      <ul className="space-y-3">
                        {trendingVideos.map(video => (
                          <li key={video.id} className="border-b pb-2">
                            <a 
                              href={`https://www.youtube.com/watch?v=${video.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-start"
                            >
                              <div className="w-24 h-16 bg-gray-200 flex-shrink-0 mr-3 overflow-hidden rounded">
                                {video.thumbnails ? (
                                  <img 
                                    src={video.thumbnails} 
                                    alt={video.title} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                                    No Image
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{video.channelTitle}</p>
                                <p className="text-xs text-gray-500">
                                  {sortBy === 'views' 
                                    ? `조회수 ${video.viewCount?.toLocaleString() || 0}회`
                                    : `좋아요 ${video.likeCount?.toLocaleString() || 0}개`
                                  }
                                </p>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        인기 급상승 영상이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {loginStatus === '성공' && userInfo && (
            <>
              <span className="mx-2 text-gray-300 text-xl">|</span>
              <Link to="/mypage" className="text-base font-medium text-black hover:text-blue-600 focus:outline-none">채널 분석</Link>
            </>
          )}
        </div>
        {/* 오른쪽: 로그인 버튼 또는 사용자 정보 */}
        <div className="ml-8">
          {loading ? (
            <div className="h-10 w-[120px] opacity-0"></div>
          ) : loginStatus === '성공' && userInfo ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{userInfo.name}님 안녕하세요!</span>
              <button 
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center border border-gray-400 rounded-2xl px-3 py-2 bg-white hover:shadow transition min-w-[120px] max-w-[400px] h-10"
            >
              <div className="mr-3 w-5 h-5 flex items-center justify-center">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="font-medium text-sm">Google 로그인</span>
            </button>
          )}
        </div>
      </header>
    </>
  );
}

export default Header;
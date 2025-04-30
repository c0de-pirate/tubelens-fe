import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/mainlogo.png";
import { fetchUserInfo } from '../utils/api';

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

  const handleGoogleLogin = () => {
    window.location.href = `${SERVER_CONFIG.baseURL()}/oauth2/authorization/google`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setLoginStatus(null);
    setUserInfo(null);
  };

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


  return (
    <header className="w-full flex items-center justify-between px-6 py-2 bg-white shadow-lg z-10">
      {/* 왼쪽: 로고와 텍스트 */}
      <Link to="/" className="flex items-center gap-2 cursor-pointer">
        <img src={logo} alt="TubeLens Logo" className="w-14 h-14" />
      </Link>
      {/* 가운데: 버튼 2개 */}
      <div className="flex items-center gap-4 ml-auto mr-8">
        <button className="text-base font-medium text-black hover:text-blue-600 focus:outline-none">인기 급상승 영상 <span className="inline-block">🔼</span></button>
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
  );
}

export default Header;

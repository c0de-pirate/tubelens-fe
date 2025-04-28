// src/api/api.js
import axios from 'axios';
import { refreshAccessToken } from './auth';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const newToken = await refreshAccessToken();
          
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } else {
            // 토큰 갱신 실패, 로그인 되지 않은 상태로 간주
            console.log("인증되지 않은 상태, API 호출 취소");
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.error("토큰 갱신 중 오류:", refreshError);
          return Promise.reject(error);
        }
      }
      
      return Promise.reject(error);
    }
  );

// API 함수들 정의
export const fetchUserInfo = () => {
    console.log("fetchUserInfo 호출됨, 토큰:", localStorage.getItem('token'));
    return api.get('/api/user/me');
  };

export const fetchRefresh = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return Promise.reject(new Error('인증 토큰이 없습니다'));
  }

  return api.post('/refresh', {}, {
    headers: {
      'Content-Type': 'application/json',
      'refreshToken': refreshToken
    },
    withCredentials: true
  });
};

// 다른 API 호출 함수들...

export default api;
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import Header from '../../components/header';
import axios from 'axios';

// // API 클라이언트 생성 - 주석을 제거하고 실제로 사용하도록 설정
const api = axios.create({
  baseURL: '/api', // 프록시 설정에 따라 조정 가능
  timeout: 10000
});

// 1. 라벨/색상 정의
const FUNNEL_LABELS = {
  ext_URL: "외부 링크 클릭률",
  yt_SEARCH: "유튜브 클릭률",
  related_VIDEO: "관련 동영상 유입률",
  playlist: "재생목록 유입률",
  subscriber: "구독자 유입률",
  channel: "채널 페이지 유입률",
  notification: "알림 클릭 유입률",
  advertising: "광고 유입률",
  etc: "기타"
};
const FUNNEL_KEYS = [
  "ext_URL", "yt_SEARCH", "related_VIDEO", "playlist", "subscriber", "channel", "notification", "advertising", "etc"
];
const FUNNEL_COLORS = [
  "#60A5FA", "#6366F1", "#34D399", "#F59E42", "#F472B6", "#A78BFA", "#F87171", "#FBBF24", "#D1D5DB"
];

// 도넛차트 컴포넌트
function DonutChart({ data, width = 180, height = 180, onSectionClick }) {
  const ref = useRef();
  const [hoverIdx, setHoverIdx] = useState(null);
  const palette = [
    '#D9D9D9', // 기타
    '#4B6CFA', // 검색어
    '#E2B5E8', // 업무 분야
    '#A3C6BD', // 활동 분야
  ];

  useEffect(() => {
    const radius = Math.min(width, height) / 2;
    const thickness = radius * 0.22;
    const svg = d3.select(ref.current)
      .attr('width', width)
      .attr('height', height);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);
    const pie = d3.pie().value(d => d.value).padAngle(0.08).sort(null);
    const arc = d3.arc().innerRadius(radius - thickness).outerRadius(radius);
    const arcHover = d3.arc().innerRadius(radius - thickness - 4).outerRadius(radius + 4);
    g.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', (d, i) => hoverIdx === i ? arcHover(d) : arc(d))
      .attr('fill', (d, i) => data[i].color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 4)
      .style('filter', (d, i) => hoverIdx === i ? 'drop-shadow(0 4px 16px #0002)' : 'none')
      .style('cursor', 'pointer')
      .on('mouseenter', (e, d, i) => setHoverIdx(i))
      .on('mouseleave', () => setHoverIdx(null))
      .on('click', (e, d) => onSectionClick(d.data.label));
    const total = data.reduce((sum, d) => sum + d.value, 0);
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 28)
      .attr('font-weight', 700)
      .attr('fill', '#222')
      .text(`${total}%`);
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('y', 22)
      .attr('font-size', 15)
      .attr('fill', '#888')
      .text('유입경로');
  }, [data, width, height, hoverIdx, onSectionClick]);

  return <svg ref={ref} style={{ display: 'block' }}></svg>;
}

export default function Mypage() {
  const svgRef = useRef();
  const [barAnimated, setBarAnimated] = useState(false);
  const [cloudKey, setCloudKey] = useState(0);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [channelId, setChannelId] = useState('');
  const [userName, setUserName] = useState('');
  // 도넛차트 데이터
  const [funnelData, setFunnelData] = useState(
    FUNNEL_KEYS.map((key, idx) => ({
      key,
      label: FUNNEL_LABELS[key],
      value: 0,
      color: FUNNEL_COLORS[idx]
    }))
  );

  const handleDonutSectionClick = (label) => {
    setSelectedCondition(label);
  };

  // 인증 헤더 생성 함수
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!token || !refreshToken) {
      console.error('토큰이 없습니다');
      return null;
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'refreshToken': refreshToken
    };
  };

  // 태그 데이터 가져오기
  const fetchTags = async () => {
    setLoading(true);

    try {
      // 인증 헤더 가져오기
      const headers = getAuthHeaders();
      console.log(headers);
      
      if (!headers) {
        setLoading(false);
        return;
      }

      // 백엔드 API 호출
      const response = await api.get('http://localhost/api/mypage', { headers });
      console.log('태그 데이터 응답:', response.data);

      // 응답 데이터 처리
      if (Array.isArray(response.data)) {
        setWordCloudData(response.data);
      } else {
        console.error('응답 데이터 형식이 예상과 다릅니다:', response.data);
        setWordCloudData([]);
      }
      
      setCloudKey(prev => prev + 1);
      
      // 채널 ID가 있는 경우 저장
      if (response.data.channelId) {
        setChannelId(response.data.channelId);
        
        // 로컬 스토리지 유저 정보 업데이트
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        userInfo.channel_id = response.data.channelId;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
    } catch (error) {
      console.error('태그 데이터 가져오기 실패:', error);
      
      // 상세 오류 정보 로깅
      if (error.response) {
        console.error('응답 오류:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('요청 오류:', error.request);
      } else {
        console.error('기타 오류:', error.message);
      }
      
      alert('태그 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 워드클라우드 새로고침 핸들러
  const handleRefreshWordCloud = async () => {
    setLoading(true);
    try {
      // 인증 헤더 가져오기
      const headers = getAuthHeaders();
      
      if (!headers) {
        setLoading(false);
        return;
      }

      // 서버에서 태그 데이터 새로고침 호출
      await api.post('http://localhost/api/mypage/refresh', {}, { headers });
      
      // 새로운 태그 데이터 가져오기
      await fetchTags();
    } catch (error) {
      console.error('워드클라우드 새로고침 실패:', error);
      
      // 상세 오류 정보 로깅
      if (error.response) {
        console.error('응답 오류:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('요청 오류:', error.request);
      } else {
        console.error('기타 오류:', error.message);
      }
      
      alert('워드클라우드 새로고침 실패');
    } finally {
      setLoading(false);
    }
  };

  async function callapi() {
    console.log("callapi 호출")
    const headers = getAuthHeaders();
  
    if (!headers) {
      setLoading(false);
      return;
    }
  
    try {
      const response = await api.post('/funnel', {}, { headers });
      console.log('응답 데이터:', response.data);
      
      if (response.data) {
        // 총 합계 계산
        const totalViews = Object.values(response.data).reduce((sum, val) => 
          typeof val === 'number' ? sum + val : sum, 0);
        
        console.log('총 조회수:', totalViews); // 디버깅용
        
        // 도넛 차트 데이터 업데이트 - 백엔드 키가 이미 프론트엔드 키와 동일함
        const updatedFunnelData = FUNNEL_KEYS.map((key, idx) => {
          // 백엔드 응답에서 직접 키 사용
          const value = totalViews > 0 && response.data[key] !== undefined
            ? Math.round((response.data[key] / totalViews) * 100)
            : 0;
          
          return {
            key,
            label: FUNNEL_LABELS[key],
            value: value,
            color: FUNNEL_COLORS[idx]
          };
        });
        
        setFunnelData(updatedFunnelData);
        console.log('업데이트된 퍼널 데이터:', updatedFunnelData);
      }
    } catch (error) {
      console.error('퍼널 데이터 가져오기 실패:', error);
      
      if (error.response) {
        console.error('응답 오류:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('요청 오류:', error.request);
      } else {
        console.error('기타 오류:', error.message);
      }
    }
  }

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    // 사용자 정보 가져오기
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    if (userInfo.name) {
      setUserName(userInfo.name);
    }

    callapi()

    fetchTags();
  }, []);

  // 워드클라우드 렌더링
  useEffect(() => {
    if (!wordCloudData || wordCloudData.length === 0) return;
    
    const width = 400;
    const height = 400;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    svg.selectAll('*').remove();
    
    // 최대 크기 계산
    const maxSize = Math.max(...wordCloudData.map(d => d.size));
    // 최소 크기 설정
    const minSize = 20;
    
    const layout = cloud()
      .size([width, height])
      .words(wordCloudData.map(d => ({ 
        text: d.text, 
        size: Math.max(minSize, (d.size / maxSize) * 60) // 크기 조정: 최소 20px, 최대 60px
      })))
      .padding(5)
      .rotate(() => Math.random() < 0.5 ? 0 : 90)
      .font('Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif')
      .fontSize(d => d.size)
      .fontWeight(700)
      .on('end', draw);
    layout.start();
    function draw(words) {
      svg.append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif')
        .style('font-weight', '700')
        .style('fill', (d, i) => d3.schemeCategory10[i % 10])
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text(d => d.text);
    }
    setTimeout(() => setBarAnimated(true), 200);
  }, [cloudKey, wordCloudData]);

  const maxSize = wordCloudData.length > 0 ? Math.max(...wordCloudData.map(d => d.size)) : 0;
  // 크기 순서대로 정렬
  const sortedWordCloudData = [...wordCloudData].sort((a, b) => b.size - a.size);
  
  const getBarStyle = (idx, widthPercent, hovered) => ({
    width: `${widthPercent}%`,
    height: '100%',
    borderRadius: 12,
    background: `linear-gradient(90deg, ${d3.schemeCategory10[idx % 10]} 60%, #fff 100%)`,
    boxShadow: hovered
      ? `0 4px 16px 0 ${d3.schemeCategory10[idx % 10]}55, 0 2px 8px 0 #0002`
      : `0 2px 8px 0 #0001`,
    transition: 'width 1s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.2s',
    position: 'relative',
    cursor: 'pointer',
    transform: hovered ? 'scale(1.03)' : 'scale(1)',
    zIndex: hovered ? 2 : 1,
  });

  return (
    <div>
      <Header />
      <div style={{ padding: '20px' }}>
        <h1>{userName}</h1>
        {/* 1행: 도넛차트 + 검색조건 */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 72,
          width: '100%',
          maxWidth: 880,
          margin: '40px auto 0 auto',
          boxSizing: 'border-box',
        }}>
          {/* 도넛차트 */}
          <div style={{ minWidth: 150, width: 300, height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: 50 }}>
            <DonutChart 
              data={funnelData} 
              width={300} 
              height={300} 
              onSectionClick={handleDonutSectionClick}
            />
          </div>
          {/* 검색조건(범례) */}
          <div style={{ width: 400, height: 300, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px #0001', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>검색 조건</h2>
            <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
              {funnelData.map((item, idx) => (
                <div 
                  key={item.label} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: 12,
                    cursor: 'pointer',
                    background: selectedCondition === item.label ? '#f5f6fa' : 'transparent',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => setSelectedCondition(item.label)}
                >
                  <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: item.color, marginRight: 12 }}></span>
                  <span style={{ color: '#222', fontWeight: 500, fontSize: 16 }}>{item.label}</span>
                  <span style={{ marginLeft: 'auto', color: '#888', fontWeight: 500 }}>{item.value}%</span>
                  <span style={{ marginLeft: 8, color: '#bbb' }}>{'>'}</span>
                </div>
              ))}
              <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginTop: 24 }}>유입경로</div>
            </div>
          </div>
        </div>
        {/* 2행: 워드클라우드 + 막대그래프 */}
        <div style={{ marginTop: '40px', display: 'flex', gap: 24, alignItems: 'flex-start', width: '100%', justifyContent: 'center', maxWidth: 880, marginLeft: 'auto', marginRight: 'auto' }}>
          {/* 워드클라우드 왼쪽 */}
          <div style={{ width: 400, height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #0001', position: 'relative' }}>
            {loading && (
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                background: 'rgba(255, 255, 255, 0.7)', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                borderRadius: 12,
                zIndex: 10
              }}>
                <div style={{ 
                  width: 40, 
                  height: 40, 
                  border: '4px solid #f3f3f3', 
                  borderTop: '4px solid #4B6CFA', 
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
            <button
              onClick={handleRefreshWordCloud}
              disabled={loading}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                background: loading ? '#e5e7eb' : '#f5f6fa',
                border: 'none',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 4px #0001',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.18s, box-shadow 0.18s',
                outline: 'none',
                opacity: loading ? 0.7 : 1,
                zIndex: 20
              }}
              title="워드클라우드 새로고침"
              onMouseOver={e => { e.currentTarget.style.background = '#e0e7ff'; }}
              onMouseOut={e => { e.currentTarget.style.background = loading ? '#e5e7eb' : '#f5f6fa'; }}
            >
              <svg
                width="22" height="22" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transition: 'transform 0.3s',
                  transform: loading ? 'rotate(360deg)' : 'none',
                  color: loading ? '#6C63FF' : '#4B6CFA',
                }}
              >
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.13-.32 2.18-.87 3.07l1.46 1.46A7.963 7.963 0 0 0 20 12c0-4.42-3.58-8-8-8zm-6.36 2.05l-1.41 1.41A7.963 7.963 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.13.32-2.18.87-3.07l-1.46-1.46z" fill="currentColor"/>
              </svg>
            </button>
            <svg ref={svgRef} width={400} height={400} style={{ display: 'block' }} key={cloudKey}></svg>
            {!loading && wordCloudData.length === 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#888'
              }}>
                <p>데이터가 없습니다</p>
                <button
                  onClick={handleRefreshWordCloud}
                  style={{
                    padding: '8px 16px',
                    background: '#4B6CFA',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '12px'
                  }}
                >
                  데이터 불러오기
                </button>
              </div>
            )}
          </div>
          {/* 막대그래프 오른쪽 */}
          <div style={{ width: 400, height: 400, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px #0001', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>단어 빈도(크기)</h2>
            <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
              {wordCloudData.length > 0 ? (
                sortedWordCloudData.map((item, idx) => {
                  const widthPercent = maxSize > 0 ? (item.size / maxSize) * 100 : 0;
                  const hovered = hoveredIdx === idx;
                  return (
                    <div
                      key={item.text}
                      style={{ display: 'flex', alignItems: 'center', marginBottom: 22, minHeight: 32 }}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <span style={{ width: 80, fontWeight: 500, color: hovered ? d3.schemeCategory10[idx % 10] : '#222', transition: 'color 0.2s' }}>{item.text}</span>
                      <div style={{ flex: 1, background: '#F0F1F3', borderRadius: 12, height: 22, margin: '0 12px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                        <div style={getBarStyle(idx, barAnimated ? widthPercent : 0, hovered)}>
                          <span style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: hovered ? d3.schemeCategory10[idx % 10] : '#222',
                            fontWeight: 700,
                            fontSize: 15,
                            textShadow: '0 1px 4px #fff8',
                            transition: 'color 0.2s',
                            pointerEvents: 'none',
                          }}>{item.size}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  color: '#888'
                }}>
                  {loading ? '로딩 중...' : '데이터가 없습니다'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import Header from '../../components/header';
import { fetchRefresh } from '../../utils/api';

// 도넛차트 컴포넌트
function DonutChart({ data, width = 180, height = 180 }) {
  const ref = useRef();
  const [hoverIdx, setHoverIdx] = useState(null);
  const palette = [
    '#6C63FF', '#00C9A7', '#FFD166', '#FF6B6B', '#43B0F1',
    '#A3C6BD', '#E2B5E8', '#4B6CFA', '#D9D9D9',
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
      .attr('fill', (d, i) => palette[i % palette.length])
      .attr('stroke', '#fff')
      .attr('stroke-width', 4)
      .style('filter', (d, i) => hoverIdx === i ? 'drop-shadow(0 4px 16px #0002)' : 'none')
      .style('cursor', 'pointer')
      .on('mouseenter', (e, d, i) => setHoverIdx(i))
      .on('mouseleave', () => setHoverIdx(null));
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
  }, [data, width, height, hoverIdx]);

  return <svg ref={ref} style={{ display: 'block' }}></svg>;
}

export default function Mypage() {
  const svgRef = useRef();
  const [barAnimated, setBarAnimated] = useState(false);
  const [cloudKey, setCloudKey] = useState(0);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [channelId, setChannelId] = useState('');
  const [userName, setUserName] = useState('');
  // 도넛차트 데이터 - 백엔드에서 받아오도록 변경 예정
  const [inflowData, setInflowData] = useState([
    { label: '기타', value: 20, color: '#D9D9D9' },
    { label: '검색어', value: 50, color: '#4B6CFA' },
    { label: '업무 분야', value: 20, color: '#E2B5E8' },
    { label: '활동 분야', value: 10, color: '#A3C6BD' },
  ]);

  // 태그 데이터 가져오기
  const fetchTags = async (cid) => {
    if (!cid) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/${cid}`);

      // TagDto 형식을 워드클라우드 데이터 형식으로 변환
      // TagDto: { text: string, count: number } => WordCloud: { text: string, size: number }
      const wordCloudData = response.data.map(tag => ({
        text: tag.text,
        size: tag.count
      }));

      setWordCloudData(wordCloudData);
      setCloudKey(prev => prev + 1);
    } catch (error) {
      console.error('태그 데이터 가져오기 실패:', error);
      alert('태그 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 워드클라우드 새로고침 핸들러
  const handleRefreshWordCloud = async () => {
    setLoading(true);
    try {
      const response = await fetchRefresh();
      
      // API 응답 데이터를 워드클라우드 형식으로 변환
      const wordCloudData = response.data.map(tag => ({
        text: tag.text,  // 태그 이름
        size: tag.size   // 태그 크기
      }));
      
      setWordCloudData(wordCloudData);
      setCloudKey(k => k + 1); // 워드클라우드 강제 리렌더링
    } catch (e) {
      console.error('워드클라우드 새로고침 실패:', e);
      alert('워드클라우드 새로고침 실패');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    handleRefreshWordCloud();
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
    const layout = cloud()
      .size([width, height])
      .words(wordCloudData.map(d => ({ text: d.text, size: d.size })))
      .padding(5)
      .rotate(() => Math.random() < 0.5 ? 0 : 90)
      .font('Impact')
      .fontSize(d => d.size)
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
        .style('font-family', 'Impact')
        .style('fill', (d, i) => d3.schemeCategory10[i % 10])
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text(d => d.text);
    }
    setTimeout(() => setBarAnimated(true), 200);
  }, [cloudKey, wordCloudData]);

  const maxSize = wordCloudData.length > 0 ? Math.max(...wordCloudData.map(d => d.size)) : 0;
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
        <h1>마이페이지 - {userName}</h1>
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
            <DonutChart data={inflowData} width={300} height={300} />
          </div>
          {/* 검색조건(범례) */}
          <div style={{ width: 400, height: 300, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px #0001', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>검색 조건</h2>
            <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
              {inflowData.map((item, idx) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
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
                wordCloudData.map((item, idx) => {
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
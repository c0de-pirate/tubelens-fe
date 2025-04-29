import Header from "../../components/header";
import heroImg from "../../assets/hero.png";
import { useEffect, useLayoutEffect, useState } from "react";

export default function Main() {
  const [showText, setShowText] = useState(false);
  const [showText2, setShowText2] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  const text2Lines = [
    "콘텐츠 크리에이터를 위한 지능적 분석 솔루션",
    "인기 트렌드를 파악하고 채널 성과를 심층 분석하여 당신의 유튜브 여정을 선명하게 비춰드립니다",
    "데이터를 통해 더 스마트하게 성장하세요"
  ];
  const [showText2Lines, setShowText2Lines] = useState([false, false, false]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setTimeout(() => setShowText(true), 100);
    setTimeout(() => setShowTitle(true), 600);
    setTimeout(() => setShowText2(true), 1000);
    // 각 줄별로 interval 적용 (0.3초씩 더 지연)
    text2Lines.forEach((_, idx) => {
      setTimeout(() => {
        setShowText2Lines(prev => {
          const copy = [...prev];
          copy[idx] = true;
          return copy;
        });
      }, 1200 + idx * 350);
    });
    // 돋보기 애니메이션: 로고 등장 후 0.3초 뒤
    setTimeout(() => setShowMagnifier(true), 1000);
  }, []);

  return (
    <>
      <Header/>
      <div
        className="min-h-screen flex flex-col items-center justify-start"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
        }}
      >
        <div className="pt-72 pb-8 w-full flex flex-col items-center">
          {/* 임시 검색창 */}
          <div className="w-full max-w-6xl bg-white rounded-full shadow flex items-center px-4 py-5 mb-4 mt-2">
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-lg text-gray-800 pl-8"
              placeholder="검색어를 입력하세요..."
            />
            <button className="ml-0 text-gray-500 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </button>
          </div>
          <div className="w-full max-w-6xl mb-4 ml-2">
            <div
              className={`text-6xl font-extrabold text-left leading-tight drop-shadow-lg transition-all duration-700 ${showText ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}
            >
              <span className="inline-block align-middle">
                <svg viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg" className="h-60 w-auto">
                  <defs>
                    <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF3366" />
                      <stop offset="100%" stopColor="#FF9966" />
                    </linearGradient>
                  </defs>
                  <rect x="10" y="20" width="300" height="60" rx="30" fill="none" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.1))" />
                  <text x="30" y="65" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="38" letterSpacing="-0.5" filter="drop-shadow(6px 6px 12px rgba(0,0,0,0.45))">
                    <tspan fill="url(#logoGradient2)">Tube</tspan>
                    <tspan fill="#333333">lens</tspan>
                  </text>
                  <rect x="10" y="20" width="15" height="60" rx="5" fill="url(#logoGradient2)" />
                  <g
                    style={{
                      transformOrigin: '290px 75px',
                      transform: showMagnifier
                        ? 'rotate(0deg)'
                        : 'rotate(90deg)',
                      opacity: showMagnifier ? 1 : 0,
                      transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)'
                    }}
                  >
                    <circle cx="260" cy="50" r="20" fill="none" stroke="url(#logoGradient2)" strokeWidth="3" style={{filter: 'drop-shadow(8px 8px 20px #FF3366CC)'}} />
                    <circle cx="260" cy="50" r="10" fill="none" stroke="url(#logoGradient2)" strokeWidth="2" />
                    <line x1="273" y1="63" x2="290" y2="75" stroke="url(#logoGradient2)" strokeWidth="4" strokeLinecap="round" />
                  </g>
                </svg>
              </span>
              <br/>
              <span className={`text-4xl font-semibold text-black transition-all duration-700 ${showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>당신의 유튜브 성장을 위한 렌즈</span>
            </div>
            <div
              className={`text-2xl font-medium text-left mt-8 drop-shadow space-y-4`}
            >
              {text2Lines.map((line, idx) => (
                <div
                  key={idx}
                  className={`text-black transition-all duration-700 ${showText2Lines[idx] ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
          {/* 실제 검색바 컴포넌트로 교체: */}
          {/* <SearchBar /> */}
        </div>
      </div>
    </>
  );
}
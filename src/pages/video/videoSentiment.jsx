import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export default function VideoSentiment({ videoId }) {
  const ref = useRef(null);
  const [sentiment, setSentiment] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
  });

  useEffect(() => {
    if (!videoId) return;
    fetch(`/sentiment/${videoId}`)
      .then((res) => res.json())
      .then((data) => setSentiment(data))
      .catch(() => setSentiment({ positive: 0, neutral: 0, negative: 0 }));
  }, [videoId]);

  const total = sentiment.positive + sentiment.neutral + sentiment.negative;
  const percent = total
    ? [
        {
          label: "긍정",
          value: Math.round((sentiment.positive / total) * 100),
          color: "#4FADF7",
        },
        {
          label: "중립",
          value: Math.round((sentiment.neutral / total) * 100),
          color: "#BDBDBD",
        },
        {
          label: "부정",
          value: Math.round((sentiment.negative / total) * 100),
          color: "#F76F6F",
        },
      ]
    : [
        { label: "긍정", value: 0, color: "#4FADF7" },
        { label: "중립", value: 0, color: "#BDBDBD" },
        { label: "부정", value: 0, color: "#F76F6F" },
      ];

  useEffect(() => {
    const width = 320;
    const height = 320;
    const radius = Math.min(width, height) / 2;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value((d) => d.value);
    const data_ready = pie(percent);

    const arc = d3.arc().innerRadius(80).outerRadius(radius);

    svg
      .selectAll("path")
      .data(data_ready)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "#fff")
      .style("stroke-width", "2px");
  }, [percent]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F5F5F5",
      }}
    >
      <div
        style={{
          width: "70vw",
          height: "70vh",
          display: "flex",
          background: "#fff",
          borderRadius: "24px",
          boxShadow: "0 4px 24px #ddd",
          overflow: "hidden",
        }}
      >
        {/* 왼쪽: 그래프 */}
        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#D7D7D7",
          }}
        >
          <svg
            ref={ref}
            style={{
              background: "#fff",
              borderRadius: "50%",
              boxShadow: "2px 2px 12px #bbb",
              display: "block",
            }}
          />
        </div>
        {/* 오른쪽: 텍스트 */}
        <div
          style={{
            width: "50%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <div
            style={{
              textAlign: "left",
              fontSize: "2rem",
              fontWeight: "bold",
              lineHeight: "2.6rem",
              minWidth: "260px",
              boxShadow: "2px 2px 12px #eee",
              padding: "36px 48px",
              borderRadius: "12px",
            }}
          >
            <div style={{ 
              marginBottom: "28px", 
              fontSize: "2.2rem",
              textAlign: "center"
            }}>
              감정 분석 결과
            </div>
            <div style={{ color: "#3B82F6" }}>1. 긍정 : {percent[0].value}%</div>
            <div style={{ margin: "28px 0", color: "#A78BFA" }}>2. 중립: {percent[1].value}%</div>
            <div style={{ color: "#EF4444" }}>3. 부정: {percent[2].value}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
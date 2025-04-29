export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.log("리프레시 토큰 없음, 로그인 필요");
      return null; // 에러를 던지지 않고 null 반환
    }
    
    try {
      const response = await fetch("http://localhost:8080/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    
      if (!response.ok) {
        console.log("토큰 갱신 실패");
        return null;
      }
    
      const data = await response.json();
      localStorage.setItem("token", data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error("토큰 갱신 중 오류:", error);
      return null;
    }
  };
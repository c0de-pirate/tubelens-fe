import axios from "axios";

export const getVideoData = async (videoId) => {
  try {
    const [videoResponse, recommendResponse] = await Promise.all([
      axios.get(`http://localhost:8080/videos?videoId=${videoId}`),
      axios.get(`http://localhost:8080/videos/recomm?videoId=${videoId}`),
    ]);

    return {
      ...videoResponse.data,
      relatedVideos: recommendResponse.data,
    };
  } catch (error) {
    console.error("비디오 데이터를 가져오는 중 에러 발생:", error);
    throw error;
  }
};

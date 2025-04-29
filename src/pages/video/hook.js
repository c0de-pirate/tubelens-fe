import axios from "axios";

export const getVideoData = async (videoId) => {
  try {
    console.log('getVideoData 호출됨', videoId);
    const [videoResponse, recommendResponse] = await Promise.all([
      axios.get(`/api/videos?videoId=${videoId}`),
      axios.get(`/api/videos/recomm?videoId=${videoId}`),
    ]);

    console.log('videoResponse.data:', videoResponse.data);
    console.log('recommendResponse.data:', recommendResponse.data);

    return {
      ...videoResponse.data,
      relatedVideos: recommendResponse.data,
    };
  } catch (error) {
    console.error("비디오 데이터를 가져오는 중 에러 발생:", error);
    throw error;
  }
};

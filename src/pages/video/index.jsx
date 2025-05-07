import { useParams } from 'react-router-dom';
import VideoInfoBox from "./videoInfoBox";
import VideoSentiment from "./videoSentiment";

export default function Videodetail() {
  // URL에서 videoId 가져오기
  const { videoId } = useParams();
  
  return (
    <>
      <VideoInfoBox />
      <VideoSentiment videoId={videoId} />
    </>
  );
}
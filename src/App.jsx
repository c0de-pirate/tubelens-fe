import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Main from "./pages/main";
import Search from "./pages/search";
import Video from "./pages/video"
import MyPage from "./pages/mypage"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/search/:keyword" element={<Search />} />
          <Route path="/video/:videoId" element={<Video />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

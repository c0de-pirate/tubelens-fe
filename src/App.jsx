import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';

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
          <Route path="/search" element={<Search />} />
          <Route path="/search/:keyword" element={<Search />} />
          <Route path="/video/:videoId" element={<Video />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/search/:query" element={<SearchResults />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

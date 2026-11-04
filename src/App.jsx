import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Header from './header.jsx'
import Pricing from "./pricing.jsx";
import Project from './projects.jsx'
import Photos from './photos.jsx'
import Article from './article.jsx'
import Tutorial from './tutorial.jsx'
import Email from './email.jsx'
import Footer from './footer.jsx'
import banner from './assets/banner.jpg'
import pfp from './assets/pfp.webp'
import Login from './login.jsx'
import SignUp from './sign-up.jsx'
import Post from './post.jsx'
import BrowsePosts from './browseposts.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/" element={
            <>
              <Header />
              <div>
                <div className="image-container">
                  <img className="banner-image" src={banner} />
                  <div className="hover-name">
                    <p className="name">Hey, I'm Aerin Saini</p>
                  </div>
                </div>
                <div className="info">
                  <img className="pfp" src={pfp} />
                  <span>I am a full-stack developer in Chitkara University.</span>
                  <span>--------------------------------</span>
                  <span><strong>Here's what I've done so far</strong></span>
                </div>
                <Project />
                <Photos />
                <Email />
                <div className="info">
                  <span>--------------------------------</span>
                  <span>Featured Articles</span>
                </div>
                <Article />
                <div className="info">
                  <span>--------------------------------</span>
                  <span className="info">Featured Tutorials</span>
                </div>
                <Tutorial />
                <Footer />
              </div>
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/Post" element={<Post />} />
        <Route path="/Browse-posts" element={<BrowsePosts />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>

    </BrowserRouter>


  );
}

export default App;

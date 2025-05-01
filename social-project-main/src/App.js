import { Route, Routes } from "react-router";
import "./App.css";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import Home from "./pages/Home";
import Header from "./components/Header/Header";
import User from "./components/UserData/User";
import Posts from "./components/Posts/Posts";
import Favorites from "./components/Favorites/Favorites";
import Saved from "./components/Saved/Saved";
import CreatePost from "./pages/Create Post/CreatePost";
import EditMe from "./pages/Edit My Profile/EditMyProfile";
import { useSelector } from "react-redux";
import PostDetails from "./pages/FullPost/FullPost";
import ReadUserProfile from "./pages/Read User Profile/ReadUserProfile";

const MainLayout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
);

const NotFound = () => (
  <MainLayout>
    <div className="text-center text-[50px] mt-40">
      <b>404</b>
      <p>Page no found</p>
    </div>
  </MainLayout>
);

function App() {
  const user = useSelector((state) => state.auth.data?.user);
  return (
    <Routes>
      <Route
        index
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path={`/${user?.id}/posts`}
        element={
          <MainLayout>
            <User />
            <Posts />
          </MainLayout>
        }
      />
      <Route
        path={`/${user?.id}/favorites`}
        element={
          <MainLayout>
            <User />
            <Favorites />
          </MainLayout>
        }
      />
      <Route
        path={`/${user?.id}/saved`}
        element={
          <MainLayout>
            <User />
            <Saved />
          </MainLayout>
        }
      />
      <Route
        path={`/${user?.id}/createPost`}
        element={
          <MainLayout>
            <CreatePost />
          </MainLayout>
        }
      />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path={`/${user?.id}/editMe`} element={<EditMe />} />
      <Route
        path="posts/:id"
        element={
          <MainLayout>
            <PostDetails />
          </MainLayout>
        }
      />
      <Route
        path="user/:id"
        element={
          <MainLayout>
            <ReadUserProfile />
          </MainLayout>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

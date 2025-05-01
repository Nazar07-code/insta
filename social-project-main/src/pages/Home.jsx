import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
  postSave,
  postLike,
  postLikeDelete,
  postSaveDelete,
  clearComments,
} from "../redux/slices/posts";
import { Comments } from "../components/Comments/Comment";

import "./Home.css";
import instance from "../axios";

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [posts, setPosts] = useState([]);
  const [isLiked, setIsLiked] = useState({});
  const [isSaved, setIsSaved] = useState({});
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentsChangeModal, setCommentsChangeModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.data?.user);

  useEffect(() => {
    instance
      .get("/posts/")
      .then((res) => setPosts(res.data))
      .catch((err) => console.warn(err))
      .finally(() => setIsLoading(false));
  }, []);
  const toggleExpand = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  useEffect(() => {
    const fetchLikesAndSaves = async () => {
      if (!user?.id) return;

      try {
        const [likesRes, savedRes] = await Promise.all([
          instance.get(`/like/user/${user.id}/`),
          instance.get(`/saved/user/${user.id}/`),
        ]);

        const likedPosts =
          likesRes.data[0]?.like_items.map((item) => item.post.id) || [];
        const savedPosts =
          savedRes.data[0]?.saved_items.map((item) => item.post.id) || [];

        setIsLiked(
          likedPosts.reduce((acc, postId) => {
            acc[postId] = true;
            return acc;
          }, {})
        );

        setIsSaved(
          savedPosts.reduce((acc, postId) => {
            acc[postId] = true;
            return acc;
          }, {})
        );
      } catch (err) {
        console.error("Error to getting favorites/saved posts", err);
      }
    };

    fetchLikesAndSaves();
  }, [user?.id]);

  const liked = (post) => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    const alreadyLiked = isLiked[post.id];

    setIsLiked((prev) => ({ ...prev, [post.id]: !alreadyLiked }));

    if (alreadyLiked) {
      dispatch(postLikeDelete(post.id));
    } else {
      dispatch(postLike(post.id));
    }
  };

  const saved = (post) => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    const alreadySaved = isSaved[post.id];

    setIsSaved((prev) => ({ ...prev, [post.id]: !alreadySaved }));

    if (alreadySaved) {
      dispatch(postSaveDelete(post.id));
    } else {
      dispatch(postSave(post.id));
    }
  };

  const changeComments = (postId) => {
    setSelectedPostId(postId);
    setCommentsChangeModal((prev) => !prev);
  };

  return (
    <div className="main-posts flex flex-col justify-center items-center gap-[50px]">
      {isLoading
        ? Array(5)
            .fill(null)
            .map((_, i) => <PostSkeleton key={i} />)
        : posts.map((post) => (
            <div
              key={post.id}
              className="main-post w-[600px] flex flex-col gap-5 overflow-hidden"
            >
              <div className="flex justify-center">
                {post.media.length > 1 ? (
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    className="w-full max-h-[600px]"
                  >
                    {post.media.map((item) => (
                      <SwiperSlide key={item.id}>
                        {item.media_type === "image" ? (
                          <img
                            src={item.media}
                            alt="media"
                            className="w-full max-h-[600px] object-cover"
                          />
                        ) : item.media_type === "video" ? (
                          <video
                            src={item.media}
                            controls
                            className="w-full max-h-[600px] object-cover"
                          />
                        ) : null}
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : post.media.length === 1 ? (
                  post.media[0].media_type === "image" ? (
                    <img
                      src={post.media[0].media}
                      alt="media"
                      className="w-full max-h-[600px] object-cover"
                    />
                  ) : (
                    <video
                      src={post.media[0].media}
                      controls
                      className="w-full max-h-[600px] object-cover"
                    />
                  )
                ) : null}
              </div>

              <div className="p-4 flex flex-col gap-4">
                <div className="user flex gap-4 items-center">
                  <Link
                    to={`/user/${post.user.id}`}
                    className="cursor-pointer text-[20px] font-semibold"
                  >
                    <img
                      className="rounded-full w-10 h-10"
                      src={post.user.avatar || "/images/avatar-default.svg"}
                      alt="avatar"
                    />
                  </Link>
                  <Link
                    to={`/user/${post.user.id}`}
                    className="cursor-pointer text-[20px] font-semibold"
                  >
                    {post.user.username}
                  </Link>
                </div>

                <div className="tags flex flex-wrap gap-2">
                  {post.tags
                    ?.split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag)
                    .map((tag, idx) => (
                      <span
                        key={idx}
                        className="cursor-pointer font-semibold text-blue-300"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>

                <p className="text-[18px] font-medium">{post.title}</p>
                <p
                  className={`description transition-all duration-900 ${
                    expandedPosts[post.id]
                      ? "height-auto"
                      : "max-h-[100px] overflow-hidden"
                  }`}
                >
                  {post.description}
                </p>

                {post.description.length > 150 && (
                  <button
                    className="text-blue-300 text-sm mt-1"
                    onClick={() => toggleExpand(post.id)}
                  >
                    {expandedPosts[post.id] ? "Close" : "More"}
                  </button>
                )}

                <div className="btns flex items-center justify-end gap-5">
                  <button onClick={() => liked(post)} className="like-btn">
                    <img
                      src={
                        isLiked[post.id]
                          ? "/images/heart-active.svg"
                          : "/images/heart.svg"
                      }
                      alt="Like"
                    />
                  </button>
                  <button onClick={() => saved(post)} className="save-btn">
                    <img
                      src={
                        isSaved[post.id]
                          ? "/images/saved-active.svg"
                          : "/images/saved.svg"
                      }
                      alt="Save"
                    />
                  </button>
                  <button
                    onClick={() => {
                      dispatch(clearComments());
                      changeComments(post.id);
                    }}
                    className="comment-btn"
                  >
                    <img src="/images/comment.svg" alt="Comment" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      <Comments
        postId={selectedPostId}
        changeComments={() => setCommentsChangeModal(false)}
        commentsChangeModal={commentsChangeModal}
      />
    </div>
  );
}

export const PostSkeleton = () => (
  <div className="main-post w-[600px] flex flex-col gap-5 p-4 bg-[#393E46] rounded-[20px] animate-pulse">
    <div className="w-full h-[400px] bg-gray-700 rounded-md" />
    <div className="flex gap-4 items-center">
      <div className="w-10 h-10 bg-gray-600 rounded-full" />
      <div className="w-32 h-4 bg-gray-600 rounded-md" />
    </div>
    <div className="w-3/4 h-4 bg-gray-600 rounded-md" />
    <div className="w-full h-20 bg-gray-700 rounded-md" />
    <div className="flex justify-end gap-4">
      <div className="w-8 h-8 bg-gray-600 rounded-md" />
      <div className="w-8 h-8 bg-gray-600 rounded-md" />
      <div className="w-8 h-8 bg-gray-600 rounded-md" />
    </div>
  </div>
);

export default Home;

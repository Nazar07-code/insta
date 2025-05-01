import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router";

import "./Saved.css";

const Saved = () => {
  const user = useSelector((state) => state.auth.data?.user);
  
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/v1/saved/user/${user?.id}/`
        );
        const items = res.data[0]?.saved_items || [];
        const posts = items.map((item) => item.post);
        setSavedPosts(posts);
      } catch (err) {
        console.error("Ошибка при получении сохранённых постов:", err);
      }
    };

    if (user?.id) fetchSavedPosts();
  }, [user?.id]);

  return (
    <div className="posts">
      {savedPosts.length ? (
        savedPosts.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`}>
            <div className="post">
              {post.media.length > 0 &&
                (post.media[0].media_type === "image" ? (
                  <img
                    className="img"
                    src={post.media[0].media}
                    alt="Post preview"
                  />
                ) : (
                  <video className="img" src={post.media[0].media} muted />
                ))}
              <div className="overlay w-[25px] rounded-full p-1">
                <img src="/images/more.svg" alt="more" />
              </div>
            </div>
          </Link>
        ))
      ) : (
        <p className="text-center">У вас пока нету сохранённых постов</p>
      )}
    </div>
  );
};

export default Saved;

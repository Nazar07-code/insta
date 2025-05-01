import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { useSelector } from "react-redux";

import "./Post.css";

const UserPosts = () => {
  const user = useSelector((state) => state.auth.data?.user);
  
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/v1/posts/user/${user?.id}`
        );
        setPosts(res.data);
      } catch (err) {
        console.error("Ошибка при получении постов:", err);
      }
    };

    if (user?.id) {
      fetchUserPosts();
    }
  }, [user?.id]);

  return (
    <div className="posts">
      {posts.length ? (
        posts.map((post) => (
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
        <p className="text-center">У вас пока нету постов</p>
      )}
    </div>
  );
};

export default UserPosts;

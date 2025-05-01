import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router";

import "./Favorite.css";

const Favorites = () => {
  const user = useSelector((state) => state.auth.data?.user);
  const [favoritePosts, setFavoritePosts] = useState([]);

  useEffect(() => {
    const fetchFavoritePosts = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/v1/like/user/${user?.id}/`
        );
        const items = res.data[0]?.like_items || [];
        const posts = items.map((item) => item.post);
        posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setFavoritePosts(posts);
      } catch (err) {
        console.error(err);
      }
    };

    if (user?.id) fetchFavoritePosts();
  }, [user?.id]);

  return (
    <div className="posts">
      {favoritePosts.length ? (
        favoritePosts.map((post) => (
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
        <p className="text-center">У вас пока нету понравившихся постов</p>
      )}
    </div>
  );
};

export default Favorites;

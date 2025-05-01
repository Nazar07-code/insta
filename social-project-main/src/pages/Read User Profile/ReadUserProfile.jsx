import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import instance from "../../axios";
import "../../components/Posts/Post.css";

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [subscriptionsCount, setSubscriptionsCount] = useState(0);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchIsSubscribed = async () => {
    try {
      const { data } = await instance.get(`/is-subscribe/${id}/`);
      setIsSubscribed(data.is_subscribed);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubsCounts = async () => {
    try {
      const subscriptionsRes = await instance.get(`/subscriptions/${id}/`);
      setSubscriptionsCount(subscriptionsRes.data.subscriptions_count);

      const subscribersRes = await instance.get(`/subscribers/${id}/`);
      setSubscribersCount(subscribersRes.data.subscribers_count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (isSubscribed) {
        await instance.delete(`/subscribe/${id}/`);
      } else {
        await instance.post(`/subscribe/${id}/`);
      }
      await fetchIsSubscribed();
      await fetchSubsCounts();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIsSubscribed();
    fetchSubsCounts();
    const fetchUserData = async () => {
      try {
        const userRes = await instance.get(`/users/${id}`);
        setUser(userRes.data);

        const postsRes = await instance.get(`/posts/user/${id}`);
        setPosts(postsRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();
  }, [id]);

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <>
      <div className="info flex justify-center items-center gap-5 px-1 mt-10">
        <div className="avatar">
          <img
            className="w-[120px] h-[120px] mr-1 bg-gray-600 rounded-full object-cover"
            src={user.avatar || "/images/avatar-default.svg"}
            alt="avatar"
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-10">
            <div className="nickname font-bold text-xl">@{user.username}</div>
            {currentUser && currentUser.id !== user.id && (
              <button
                onClick={handleSubscribe}
                className={`subscribe-btn text-[20px] font-medium px-5 py-1 rounded-xl text-white ${
                  isSubscribed ? "bg-gray-400" : "bg-red-600"
                }`}
              >
                {isSubscribed ? "Unsubscribe" : "Subscribe"}
              </button>
            )}
          </div>
          <div className="counts text-center flex items-center gap-10">
            <p>Subscriptions {subscriptionsCount}</p>
            <p>Subscribers {subscribersCount}</p>
            <p>Posts {posts.length}</p>
          </div>
        </div>
      </div>

      <div className="posts mt-10">
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
          <p className="text-center mt-10">User don't have any posts</p>
        )}
      </div>
    </>
  );
};

export default UserProfile;

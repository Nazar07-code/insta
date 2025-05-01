import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchComments, createComment } from "../../redux/slices/posts";
import { selectIsAuth } from "../../redux/slices/auth"; // импорт селектора

import "./Comment.css";

export const Comments = ({ commentsChangeModal, changeComments, postId }) => {
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth); // определяем авторизацию
  const post = useSelector((state) => state.posts.comments);

  useEffect(() => {
    if (
      postId &&
      (!post?.comments || post.comments.length === 0) &&
      commentsChangeModal
    ) {
      dispatch(fetchComments(postId));
    }
  }, [dispatch, postId, commentsChangeModal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    dispatch(createComment({ postId, content, parent: replyTo }));
    setContent("");
    setReplyTo(null);
  };

  const renderComments = (comments, parentId = null) => {
    return comments
      .filter((c) => c.parent === parentId)
      .map((comment) => (
        <div
          key={comment.id}
          className="ml-4 my-2 p-2 border-l border-gray-400"
        >
          <div className="title flex gap-4 items-center my-2">
            <img
              className="w-[40px] rounded-full"
              src={comment?.user?.avatar || "/images/avatar-default.svg"}
              alt="avatar"
            />
            <div>
              <b>{comment?.user.username}</b>
              <p>{comment.created_at}</p>
            </div>
          </div>
          <p className="text">{comment?.content}</p>
          <button
            className="text-blue-400 text-sm"
            onClick={() => setReplyTo(comment?.id)}
          >
            Reply
          </button>
          {renderComments(comments, comment?.id)}
        </div>
      ));
  };

  return (
    <div
      className={`comments ${
        commentsChangeModal ? "open" : ""
      } z-90 flex flex-col gap-2 p-4`}
    >
      <button onClick={changeComments} className="cross">
        <p className="text-[25px]">✕</p>
      </button>

      {isAuth ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            className="w-full p-2 bg-gray-500 rounded-xl outline-none mt-10"
            placeholder={replyTo ? "Reply on comment" : "Write comment"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-1 rounded"
            >
              Send
            </button>
            {replyTo && (
              <button
                type="button"
                className="text-gray-500"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="text-gray-400 italic mt-4">
          You must be logged in to comment.
        </p>
      )}

      <div>
        {post?.comments && post.comments.length > 0 ? (
          renderComments(post.comments)
        ) : (
          <p>No comments</p>
        )}
      </div>
    </div>
  );
};

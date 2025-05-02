import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { createPost } from "../../redux/slices/posts";
import instance from "../../axios";
import "./CreatePost.css";

const CreatePost = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [files, setFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");

  const handleMediaUpload = (e) => {
    const supportedVideoFormats = ["video/mp4", "video/webm", "video/ogg"];
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((file) => {
      const isVideo = file.type.startsWith("video");
      const isSupported = !isVideo || supportedVideoFormats.includes(file.type);

      if (!isSupported) {
        alert(`Media format ${file.name} don't supported`);
      }

      return isSupported;
    });

    const previews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));

    setFiles((prev) => [...prev, ...validFiles]);
    setMediaPreviews((prev) => [...prev, ...previews]);
  };

  const removeMedia = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = new FormData();
    postData.append("title", title);
    postData.append("tags", tags);
    postData.append("description", description);

    const result = await dispatch(createPost(postData));

    if (!result.payload || !result.payload.id) return;

    const postId = result.payload.id;

    for (const file of files) {
      const mediaData = new FormData();
      mediaData.append("media", file);
      mediaData.append(
        "media_type",
        file.type.startsWith("video") ? "video" : "image"
      );
      mediaData.append("post", postId);

      await instance.post(
        "http://127.0.0.1:8000/api/v1/post-images/",
        mediaData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    }

    navigate(-1, { state: { newPost: result.payload } });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="create-post w-[600px] flex flex-col overflow-hidden">
        <div className="import-file mb-4 flex flex-wrap gap-4 justify-center">
          <label className="custom-file-upload cursor-pointer">
            <input
              className="hidden"
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              multiple
            />
            <img
              className="import-img"
              src="/images/folder-add.svg"
              alt="Добавить медиа"
            />
          </label>

          {mediaPreviews.map((item, idx) => (
            <div key={idx} className="multi-media relative group">
              {item.type === "image" ? (
                <img
                  src={item.preview}
                  alt="preview"
                  className=" object-cover rounded-[10px] "
                />
              ) : (
                <video
                  src={item.preview}
                  className="video object-cover rounded-[10px] "
                  controls
                />
              )}

              <button
                type="button"
                onClick={() => removeMedia(idx)}
                className="remove-button"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tags (optional)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <textarea
            className="description-input p-5"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <button className="create flex justify-center" type="submit">
            Create post
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreatePost;

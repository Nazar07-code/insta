import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAuth,
  fetchRegister,
  selectIsAuth,
} from "../../redux/slices/auth";
import "./Auth.css";

function Register() {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (!file) {
      setAvatarPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords don't match");
    if (password.length < 4) return alert("Password length less than 4");

    const formData = new FormData();
    formData.append("username", name);
    formData.append("first_name", "");
    formData.append("last_name", "");
    formData.append("email", email);
    formData.append("password", password);
    if (avatar) {
      formData.append("avatar", avatar);
    } else {
      formData.append("avatar", "");
    }

    const res = await dispatch(fetchRegister(formData));

    if (!res.payload || res.payload.message !== "Пользователь создан") {
      return alert("Register error");
    }

    const loginRes = await dispatch(fetchAuth({ email, password }));

    if (!loginRes.payload || !loginRes.payload.token) {
      return alert("Autrh error");
    }

    window.localStorage.setItem("token", loginRes.payload.token);
    window.localStorage.setItem("user", JSON.stringify(loginRes.payload.user));
  };

  if (isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <div className="avatar">
          <input
            type="file"
            id="avatar"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
          />
          <label htmlFor="avatar" className="avatar">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <img className="w-[35px]" src="/images/photo.svg" alt="" />
              </div>
            )}
          </label>
        </div>

        <div className="input">
          <input
            type="text"
            placeholder="Name"
            required
            value={name.trim()}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="input">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <img src="/images/mail.svg" alt="Email icon" />
        </div>

        <div className="input">
          <input
            type={isPasswordShown ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <img
            src={
              isPasswordShown
                ? "/images/eye-show.svg"
                : "/images/eye-dashed.svg"
            }
            className="cursor-pointer"
            alt="Toggle visibility"
            onClick={() => setIsPasswordShown((prev) => !prev)}
          />
        </div>
        <div className="input">
          <input
            type={isPasswordShown ? "text" : "password"}
            placeholder="Confirm password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button type="submit">Create new account</button>
        <Link to="/auth/login">
          <button className="log-link">Login</button>
        </Link>
      </form>
    </div>
  );
}

export default Register;

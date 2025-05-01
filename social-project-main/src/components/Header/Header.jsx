import React from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";

import { selectIsAuth } from "../../redux/slices/auth";

import "./Header.css";

const Header = () => {
  const isAuth = useSelector(selectIsAuth);
  const user = useSelector((state) => state.auth.data?.user);

  return (
    <div className="header py-2 px-5 flex justify-between items-center">
      <Link to="/" className="logo cursor-pointer">
        <img className="w-[50px]" src="/images/logo.svg" alt="logo" />
      </Link>
      {isAuth ? (
        <Link
          to={`/${user.id}/posts`}
          className="header-avatar rounded-full bg-gray-500"
        >
          <img
            className="rounded-full"
            src={user?.avatar || "/images/avatar-default.svg"}
            alt="avatar"
          />
        </Link>
      ) : (
        <Link
          to="/auth/login"
          className="log-in flex items-center rounded-xl gap-1 py-2 px-4"
        >
          <button>Login</button>
          <img className="w-[30px]" src="/images/log-in.svg" alt="login" />
        </Link>
      )}
    </div>
  );
};

export default Header;

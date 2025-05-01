import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";

import { fetchAuth, selectIsAuth } from "../../redux/slices/auth";

const Login = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  
  const [isPasswordShown, setIsPasswordShown] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values) => {
    const data = await dispatch(fetchAuth(values));
    if (!data.payload) {
      return alert("Incorrect login or password");
    }
    if ("token" in data.payload) {
      localStorage.setItem("token", data.payload.token);
      localStorage.setItem("user", JSON.stringify(data.payload.user));
    }
  };

  if (isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <form className="login" onSubmit={handleSubmit(onSubmit)}>

      <div className="input">
        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: "Enter email" })}
        />
        <img src="/images/mail.svg" alt="Email icon" />
      </div>
      {errors.email && <span className="error">{errors.email.message}</span>}

      <div className="input">
        <input
          type={isPasswordShown ? "text" : "password"}
          placeholder="Password"
          {...register("password", { required: "Enter password" })}
        />
        <img
          src={
            isPasswordShown ? "/images/eye-show.svg" : "/images/eye-dashed.svg"
          }
          className="cursor-pointer"
          alt="Toggle visibility"
          onClick={() => setIsPasswordShown((prev) => !prev)}
        />
      </div>
      {errors.password && (
        <span className="error">{errors.password.message}</span>
      )}

      <button
        className="log-in cursor-pointer"
        type="submit"
        disabled={!isValid}
      >
        Login
      </button>
      <Link to="/auth/register">
        <button className="reg-link">Register</button>
      </Link>
    </form>
  );
};

export default Login;

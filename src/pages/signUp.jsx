import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, NavLink } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { registerUser } from "../authSlice";
import { auth, googleProvider} from "../../firebase"
import { signInWithPopup } from "firebase/auth";

import Login from "./login";

function Signup() {

  

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const signupSchema = z.object({
    firstName: z.string().min(3, "length is less than 3"),
    emailId: z.string().email("Invalid Email"),
    password: z
      .string()
      .min(6, "invalid password")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    const userData = dispatch(registerUser(data));
    
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // You may also send this to your backend or store it in Redux
      const data = {
        firstName: user.displayName || "Google User",
        emailId: user.email,
        password: "google-oauth", // dummy password if your backend requires it
        isGoogle: true, // custom flag
      };

      dispatch(registerUser(data));
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

 

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card flex-shrink-0 w-125 max-w-sm shadow-2xl bg-base-100"
    >
      <div className="card-body">
        <div className="form-control">
          <label className="label">
            <span className="label-text">First Name</span>
          </label>
          <input
            type="text"
            {...register("firstName")}
            placeholder="Enter your first name"
            className="input input-bordered"
          />
          {errors.firstName && (
            <span className="text-error label-text-alt">
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            {...register("emailId")}
            placeholder="Enter email"
            className="input input-bordered"
          />
          {errors.emailId && (
            <span className="text-error label-text-alt">
              {errors.emailId.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            {...register("password")}
            placeholder="Enter password"
            className="input input-bordered"
          />
          {errors.password && (
            <span className="text-error label-text-alt">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="form-control mt-6">
          <button type="submit" className="btn btn-primary">
            Sign Up
          </button>
        </div>

        

        {/* <div className="divider">OR</div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="btn btn-outline btn-accent"
        >
          Continue with Google
        </button> */}

        <div>
          <p>{isAuthenticated?.message ? isAuthenticated.message : ""}</p>
        </div>
      </div>
    </form>
  );
}


  
  


export default Signup;
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';//for creates validator in frontend (schema)
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { loginUser } from "../authSlice" ;

function Login(){
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  

    const loginSchema = z.object({
      emailId:z.string().email("Invalid Email"),
      password:z.string().min(6,"invalid password").regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    })

    const {register,handleSubmit,formState: { errors },} = useForm({ resolver: zodResolver(loginSchema) });

    useEffect(() => {
     
      if (isAuthenticated) {
    
        navigate('/home');
      }
    }, [isAuthenticated, navigate]);

    const onSubmit=(data) => dispatch(loginUser(data));
    
    return (
 <form 
  onSubmit={handleSubmit(onSubmit)} 
  className="card flex-shrink-0 w-100 max-w-sm shadow-2xl bg-base-100 "
>
  <div className="card-body">

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
        <span className="text-error label-text-alt">{errors.emailId.message}</span>
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
        <span className="text-error label-text-alt">{errors.password.message}</span>
      )}
    </div>

    <div className="form-control mt-6">
      <button type="submit" className="btn btn-primary">
        Login
      </button>
    </div>
  </div>
</form>
    )
}


export default Login;
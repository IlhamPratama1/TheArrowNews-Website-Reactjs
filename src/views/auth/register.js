import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axiosInstance from '../../axios';
import { useAuth } from '../../auth';

export default function RegisterView() {
    const history = useHistory();
    const auth = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password_confirm: ""
    });
    const [ error, setError ] = useState({});
    const [ success, setSuccess ] = useState();
    const [ loadingSubmit, setLoadingSubmit ] = useState(false);

    function FormOnChange(e) {
        setFormData( prevData => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    };

    function RegisterForm(e) {
        e.preventDefault();
        setLoadingSubmit(true);
        if (formData.password !== formData.password_confirm) {
            let errors = {}
            errors['password_confirm'] = "password not match";
            setError(errors);
            setLoadingSubmit(false);
            return;
        }
		axiosInstance
			.post(`user/register/`, {
				email: formData.email,
				user_name: formData.username,
				password: formData.password,
			})
			.then((res) => {
                setSuccess('Register Success');
                PostLoginForm();
                setLoadingSubmit(false);
			})
            .catch(function(err) {
                let errors = {}
                if(err.response.data.email !== undefined) {
                    errors['email'] = err.response.data.email[0];
                }
                if(err.response.data.password !== undefined) {
                    errors['password'] = err.response.data.password[0];
                }
                if(err.response.data.user_name !== undefined) {
                    errors['user_name'] = err.response.data.user_name[0];
                }
                setError(errors);
                setLoadingSubmit(false);
            });
    }

    function PostLoginForm() {
        axiosInstance
			.post(`token/`, {
				email: formData.email,
				password: formData.password,
			})
			.then((res) => {				
				localStorage.setItem('access_token', res.data.access);
				localStorage.setItem('refresh_token', res.data.refresh);
				localStorage.setItem('user_id', res.data.id);
                localStorage.setItem('user_name', res.data.username);
                auth.signin(() => {
                    history.push('/');
                }, localStorage.getItem('refresh_token'));
			})
    }

    useEffect(() => {
        if (auth.user) {
            history.push('/');
        }
    });

    return(
        <div className="mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="hidden lg:block">
                    <img className="h-screen w-full object-cover" alt="auth" src="/static/images/auth_image.png" />
                </div>
                <div className="flex items-center">
                    <div className="my-48 mx-8 lg:m-auto space-y-12">
                        <div className="flex items-end space-x-4">
                            <h1 className="font-oswald font-bold text-5xl uppercase">Register</h1>
                            <p className="font-oswald text-lg">or</p>
                            <Link to="/login" className="font-oswald text-5xl uppercase" style={{
                                'textDecoration': 'underline',
                                'textDecorationColor': '#FCA311',                            
                            }}>Login</Link>
                        </div>
                        <form className="z-40 space-y-4 w-full">
                            <div className="space-y-2">
                                <label className="font-mont uppercase font-bold text-lg">Username</label>
                                <input name="username" onChange={FormOnChange} value={formData.username} type="text" placeholder="enter your username" className="focus:outline-none focus:border-yellow-main p-4 w-full h-12 border"></input>
                                <br />
                                <span style={{ color: "red" }}>{error["user_name"]}</span>
                            </div>
                            <div className="space-y-2">
                                <label className="font-mont uppercase font-bold text-lg">Email</label>
                                <input name="email" onChange={FormOnChange} value={formData.email} type="text" placeholder="enter your username" className="focus:outline-none focus:border-yellow-main p-4 w-full h-12 border"></input>
                                <span style={{ color: "red" }}>{error["email"]}</span>
                            </div>
                            <div className="space-y-2">
                                <label className="font-mont uppercase font-bold text-lg">Password</label>
                                <input name="password" onChange={FormOnChange} value={formData.password} type="password" placeholder="enter your username" className="focus:outline-none focus:border-yellow-main p-4 w-full h-12 border"></input>
                                <span style={{ color: "red" }}>{error["password"]}</span>
                            </div>
                            <div className="space-y-2">
                                <label className="font-mont uppercase font-bold text-lg">Password Confirmation</label>
                                <input name="password_confirm" onChange={FormOnChange} value={formData.password_confirm} type="password" placeholder="enter your username" className="focus:outline-none focus:border-yellow-main p-4 w-full h-12 border"></input>
                                <span style={{ color: "red" }}>{error["password_confirm"]}</span>
                            </div>
                            <span style={{ color: "green" }}>{success}</span>
                            <br />
                            <div className="flex items-center space-x-3">
                                <button onClick={e => RegisterForm(e)} className="font-oswald font-bold bg-yellow lg:text-2xl px-6 py-2 lg:py-4 lg:px-8">Register</button>
                                {loadingSubmit && <svg className="animate-spin bg-black h-5 w-5 mr-3" viewBox="0 0 24 24"></svg> }
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
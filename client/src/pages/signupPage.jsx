import { useRef, useState } from 'react';
import './cssfile/signup2.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, Navigate } from 'react-router-dom';

const Signup = () => {
    const em = useRef(null);
    const name = useRef(null);
    const phone = useRef(null);
    const psswrd = useRef(null);
    const confirm_psswrd = useRef(null);
    const [user_type, setUser_type] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [redirectToLogin, setRedirectToLogin] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = {
            name: name.current.value,
            phone: phone.current.value,
            email: em.current.value,
            password: psswrd.current.value,
            confirm_password: confirm_psswrd.current.value,
            user_type: user_type,
        };

        // Basic frontend validation
        if (
            !user.name ||
            !user.phone ||
            !user.email ||
            !user.password ||
            !user.confirm_password ||
            !user.user_type
        ) {
            toast.error("Please fill in all fields.");
            return;
        }

        if (user.password !== user.confirm_password) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user),
            });

            const result = await res.json();
            console.log('response : ', result);

            if (result.errors) {
                result.errors.forEach(err => toast.error(err.msg || err));
                setIsSubmitting(false);
                return;
            }

            if (result.success) {
                toast.success("Signup successful!");
                setTimeout(() => setRedirectToLogin(true), 2000); // Give time for toast to show
            } else {
                toast.error(result.message || "Signup failed!");
                psswrd.current.value = "";
                confirm_psswrd.current.value = "";
            }

        } catch (error) {
            console.log("error while verifying data", error);
            toast.error("Something went wrong while submitting the form.");
            psswrd.current.value = "";
            confirm_psswrd.current.value = "";
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={6000} />

            {redirectToLogin && <Navigate to="/login" replace />}

            <div className="signup-container">

                <div className="logo-container">
                    <div className="logo">
                        <div className="logo-dots">
                            <div className="logo-dot"></div>
                            <div className="logo-dot"></div>
                            <div className="logo-dot"></div>
                            <div className="logo-dot"></div>
                        </div>
                    </div>
                    <h2>Create Account</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Your Name"
                        ref={name}
                        className="form-input"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        ref={em}
                        className="form-input"
                    />
                    <input
                        type="tel"
                        placeholder="Phone"
                        ref={phone}
                        className="form-input"
                    />
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            ref={psswrd}
                            className="form-input"
                        />
                        <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </span>
                    </div>
                    <div className="password-wrapper">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            ref={confirm_psswrd}
                            className="form-input"
                        />
                        <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </span>
                    </div>

                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                value="guest"
                                name="user_type"
                                onChange={(e) => setUser_type(e.target.value)}
                            /> User
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="host"
                                name="user_type"
                                onChange={(e) => setUser_type(e.target.value)}
                            /> Host
                        </label>
                    </div>

                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? "Signing Up..." : "Sign Up"}
                    </button>

                    <p className="loginLink">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </form>
            </div>
        </>
    );
};

export default Signup;

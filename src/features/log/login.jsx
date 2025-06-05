import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TogglePanel from './components/TogglePanel';
//log

const Login = () => {
    const containerRef = useRef(null);
    const navigate = useNavigate(); 
    
    const handleRegisterClick = () => {
        containerRef.current.classList.add('active');
    };
    
    const handleLoginClick = () => {
        containerRef.current.classList.remove('active');
    };
    
    const handleBackClick = () => {
        navigate('/'); 
    };

    return (
        <div className="login-wrapper">
            <button className="back-button" onClick={handleBackClick}>
                ⬅ Atras
            </button>
            <div className="containerlog" id="container" ref={containerRef}>
                <RegisterForm />
                <LoginForm />
                <TogglePanel onSignIn={handleLoginClick} onSignUp={handleRegisterClick} />
            </div>
        </div>
    );
};

export default Login;
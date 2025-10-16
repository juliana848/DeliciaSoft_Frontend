import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TogglePanel from './components/TogglePanel';

const Login = () => {
    const containerRef = useRef(null);
    const navigate = useNavigate(); 
    
    const handleRegisterClick = () => {
        containerRef.current.classList.add('active');
    };
    
    const handleLoginClick = () => {
        containerRef.current.classList.remove('active');
    };

    return (
        <div className="login-wrapper">
            <div className="containerlog" id="container" ref={containerRef}>
                <RegisterForm onCambiarALogin={handleLoginClick} />
                <LoginForm />
                <TogglePanel onSignIn={handleLoginClick} onSignUp={handleRegisterClick} />
            </div>
        </div>
    );
};

export default Login;
import React, { useRef } from 'react';
import './Login.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TogglePanel from './components/TogglePanel';

const Login = () => {
  const containerRef = useRef(null);

  const handleRegisterClick = () => {
    containerRef.current.classList.add('active');
  };

  const handleLoginClick = () => {
    containerRef.current.classList.remove('active');
  };

  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <div className="login-wrapper">
      <button className="back-button" onClick={handleBackClick}>
        ⬅ Atras
      </button>
      

      <div className="container" id="container" ref={containerRef}>
        <RegisterForm />
        <LoginForm />
        <TogglePanel onSignIn={handleLoginClick} onSignUp={handleRegisterClick} />
      </div>
    </div>
  );
};

export default Login;

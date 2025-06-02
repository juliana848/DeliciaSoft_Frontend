import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

const Layout = ({ children, userRole = 'admin', showSidebar = true }) => {
  return (
    <div className="layout-container">
      {showSidebar && <Sidebar userRole={userRole} />}
      <div className={`main-content ${showSidebar ? 'with-sidebar' : 'full-width'}`}>
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
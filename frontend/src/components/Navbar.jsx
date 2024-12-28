import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const logoutHandler = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar bg-primary px-4 py-3 fs-4">
      <div className="container-fluid ">
        <a className="navbar-brand fs-3">File Manager</a>
        <form onSubmit={logoutHandler}>
          <button className="btn bg-light btn-hover-success btn-lg" type="submit">Logout</button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;

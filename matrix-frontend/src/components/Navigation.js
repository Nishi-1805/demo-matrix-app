import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../redux/slices/authSlice"; // Import clearUser action
import  matrixService  from "../services/matrixService";

const Navigation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth); // Ensure auth exists in state
  const user = auth?.user; // Safely access user

  const handleLogout = async () => {
    try {
      if (matrixService.client) {
        await matrixService.client.logout();
      }
      dispatch(clearUser()); // Clear user from Redux
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav style={styles.navbar}>
      <div>
        <Link to="/" style={styles.logo}>
          <img
            src="https://matrix.org/images/matrix-logo.svg"
            alt="Matrix Logo"
            style={styles.logoImage}
          />
          <span>Matrix Chat</span>
        </Link>
      </div>
      <ul style={styles.navLinks}>
  <li>
    <Link to="/Home" style={styles.link}>Home</Link>
  </li>
  {!user ? (
    <>
      <li>
        <Link to="/signup" style={styles.link}>Sign Up</Link>
      </li>
      <li>
        <Link to="/login" style={styles.link}>Login</Link>
      </li>
    </>
  ) : (
    <>
      <li>
        <Link to="/chat" style={styles.link}>Chat</Link>
      </li>
      <li>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </li>
      <li>
      <Link to="/platforms">Connect Platforms</Link>
      </li>
    </>
    
  )}
</ul>

    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2c3e50",
    padding: "15px 30px",
    color: "#fff",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    color: "#fff",
    fontSize: "20px",
  },
  logoImage: {
    width: "40px",
    marginRight: "10px",
  },
  navLinks: {
    listStyle: "none",
    display: "flex",
    alignItems: "center",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    marginLeft: "20px",
    fontSize: "16px",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "20px",
    fontSize: "16px",
  },
};

export default Navigation;

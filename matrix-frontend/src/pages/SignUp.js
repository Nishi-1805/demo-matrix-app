import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import  matrixService  from "../services/matrixService";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      if (!username.includes(":")) {
        setError("Username must include a homeserver, e.g., @user:tchncs.de");
        return;
      }

      await matrixService.register(username, password);
      alert("✅ Account created! You can now log in.");
      navigate("/login");
    } catch (error) {
      setError("Sign-up failed: " + error.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="@username:tchncs.de"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;

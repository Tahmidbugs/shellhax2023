import React from "react";
import "./feed.css";
import Logo from "../assets/logo.png";
import Commit from "../assets/commit.gif";
import { Link, useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <div style={{ height: "80vh" }}>
      <Navbar />
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={Commit} alt="Commit" style={{ width: "20%" }} />
          <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>
            Get connected w/{" "}
            <span style={{ color: "green" }}> GitConnected </span>
          </h1>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Connect to Software Engineers you can relate to
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "50%",
          }}
        >
          <button
            onClick={() => {
              setModalVisible(true);
            }}
            className="landing-button"
            style={{
              backgroundColor: "#1a1a1a",
              color: "white",
              width: "30%",
              height: "50px",
              borderRadius: "20px",
            }}
          >
            Login with Github
          </button>
        </div>
      </div>
      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <p>Well, hello there!</p>
            <p style={{ textAlign: "center" }}>
              We're going to now talk to the GitHub API. Ready? to begin!
            </p>
            <a
              href={`https://github.com/login/oauth/authorize?scope=user:email&client_id=295ff29b3700c941fbd6`}
              className="modal-buttons"
            >
              Login
            </a>

            <p>
              This site uses Github's public API which has a user limit of 60
              API calls for unauthorized users. Having logged in provides an
              auth token with the lowest scope to get 5000 API calls so that you
              can leave it all to us!
            </p>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

const Navbar = () => {
  return (
    <div className="navbar">
      <div style={{ display: "flex" }}>
        <img src={Logo} alt="Logo" className="navbar-logo" />
      </div>
      <div className="navbar-links">
        <a href="#logout">Logout</a>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <div className="footer">
      <p>© 2023 Tahmid Abdurafov Khan Tadi All Rights Reserved.</p>
    </div>
  );
};

export default Landing;

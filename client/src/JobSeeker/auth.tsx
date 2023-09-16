import React from "react";
import { FC } from "react";
import { useLocation, Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const MyNavbar: React.FC = () => {
  const location = useLocation();
  const tooltip = (
    <Tooltip id="tooltip">
      Not seeing what you expected? clear local storage and login again!
    </Tooltip>
  );

  const tooltipHome = (
    <Tooltip id="tooltip">
      <>
        <ul>
          <li>Why Login? Click on login to get info!</li>
          <li>Getting 500: Error, clear local storage and login</li>
        </ul>
      </>
    </Tooltip>
  );

  const tooltipResult = (
    <Tooltip id="tooltip">
      Not seeing anything? You might not have followers yet. Not that case?
      clear local storage and login
    </Tooltip>
  );

  return (
    <nav className="navbar navbar-dark bg-dark">
      <Link to="/" className="navbar-brand" style={{ marginLeft: "20px" }}>
        GitConnected
      </Link>
      {
        <div
          className="navbar-nav ml-auto"
          style={{ display: "flex", flexDirection: "row" }}
        >
          {location.pathname === "/result" && (
            <div className="nav-item">
              <Link
                to="/visual"
                className="nav-link"
                style={{ marginRight: "20px" }}
              >
                Visualize
              </Link>
            </div>
          )}
          {location.pathname !== "/" && (
            <div className="nav-item">
              <Link
                to="/result"
                className="nav-link"
                style={{ marginRight: "20px" }}
              >
                Result
              </Link>
            </div>
          )}
          {location.pathname === "/visual" && (
            <div className="nav-item" style={{ margin: "auto" }}>
              <OverlayTrigger placement="bottom" overlay={tooltip}>
                <img
                  src="/question.png"
                  alt=""
                  width={"30px"}
                  height={"30px"}
                />
              </OverlayTrigger>
            </div>
          )}

          {location.pathname === "/" && (
            <div className="nav-item" style={{ marginRight: "20px" }}>
              <OverlayTrigger placement="bottom" overlay={tooltipHome}>
                <img
                  src="/question.png"
                  alt=""
                  width={"30px"}
                  height={"30px"}
                />
              </OverlayTrigger>
            </div>
          )}
          {location.pathname === "/result" && (
            <div className="nav-item" style={{ marginRight: "20px" }}>
              <OverlayTrigger placement="bottom" overlay={tooltipResult}>
                <img
                  src="/question.png"
                  alt=""
                  width={"30px"}
                  height={"30px"}
                />
              </OverlayTrigger>
            </div>
          )}
        </div>
      }
    </nav>
  );
};

const Auth: FC = () => {
  return (
    <div style={{ background: "lightblue", height: "100vh" }}>
      <MyNavbar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          marginTop: "20px",
          backgroundColor: "lightblue",
        }}
      >
        <p>Well, hello there!</p>
        <p style={{ textAlign: "center" }}>
          We're going to now talk to the GitHub API. Ready? to begin!
        </p>
        {/* <button
          ref={`https://github.com/login/oauth/authorize?scope=user:email&client_id=${process.env.CLIENT_ID}`}
        >
          Login
        </button> */}
        <p>
          This site uses Github's public API which has a user limit of 60 API
          calls for unauthorized users. Having logged in provides an auth token
          with the lowest scope to get 5000 API calls so that you can leave it
          all to us!
        </p>
      </div>
    </div>
  );
};

export default Auth;

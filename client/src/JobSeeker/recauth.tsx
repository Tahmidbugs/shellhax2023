import React,{useState} from "react";
import { FC } from "react";
import { useLocation, Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";

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


function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add your signup logic here
    console.log("Form data submitted:", formData);

    const {email,password} = formData

    //add to redis
    try{
        axios.post("http//:localhost:6379",{email,password});
    }catch(err){
        console.log(err); 
    }
    

    // Reset the form fields after submission
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}



const Recauth: FC = () => {
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
        <SignupPage></SignupPage>
      </div>
    </div>
  );
};

export default Recauth;

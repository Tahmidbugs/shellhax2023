import React from "react";
import Feed from "./Feed.js";
import "./feed.css";
import Logo from "../assets/logo.png";
import "./feed.css";
import Job from "./Job.js";

function RIndex(props) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [jobDetails, setJobDetails] = React.useState(null);
  return (
    <div>
      <Navbar setModalVisible={setModalVisible} setJobDetails={setJobDetails} />
      {!jobDetails && (
        <>
          <div style={{ marginLeft: 20 }}>
            <h2>
              Hello <span style={{ color: "orange" }}> Recruiter!</span>
            </h2>
            <p>
              Here is the list of jobs you have added so far. Choose job to
              start gitAnalysis
            </p>
          </div>
          <Feed
            setModalVisible={setModalVisible}
            modalVisible={modalVisible}
            setJobDetails={setJobDetails}
          />
        </>
      )}
      {jobDetails && (
        <Job jobDetails={jobDetails} setJobDetails={setJobDetails} />
      )}
      <Footer />
    </div>
  );
}

const Navbar = ({ setModalVisible, setJobDetails }) => {
  return (
    <div className="navbar">
      <div style={{ display: "flex" }}>
        <img
          src={Logo}
          alt="Logo"
          className="navbar-logo"
          onClick={() => {
            setJobDetails(null);
          }}
        />
      </div>
      <div className="navbar-links">
        <button className="add-button" onClick={() => setModalVisible(true)}>
          Add a new Job
        </button>
        <a href="#home">Home</a>

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

export default RIndex;

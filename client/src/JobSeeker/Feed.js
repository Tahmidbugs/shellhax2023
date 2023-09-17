import React from "react";
import axios from "axios";
import Logo from "../assets/logo.png";

import { db } from "../firebase.js";
import { processExtractedText } from "./pdfExtract.js";
import { useNavigate } from "react-router-dom";
import { Bars, ThreeDots } from "react-loading-icons";
import { useState } from "react";
import "./result.css";
import { BarChart } from "./BarChart.tsx";

function Feed(props) {
  const [token, setToken] = React.useState(localStorage.getItem("TOKEN"));
  const [userName, setUserName] = React.useState("");
  const [userData, setUserData] = React.useState(null);
  const [loadingResume, setLoadingResume] = React.useState(false);
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [elevatorPitch, setElevatorPitch] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [viewReferrals, setViewReferrals] = React.useState(false);
  const [matchList, setMatchList] = React.useState();

  const navigate = useNavigate();

  console.log("userData", userData);

  React.useEffect(() => {
    const newToken = localStorage.getItem("TOKEN");
    setToken(newToken);
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get("code");

    if (sessionCode && (!newToken || newToken === "undefined")) {
      axios
        .get(`http://127.0.0.1:5000/api/auth?code=${sessionCode}`)
        .then((response) => {
          // Extract the access token

          const { data } = response;
          console.log("data", data);
          localStorage.setItem("TOKEN", data.access_token);
          const newUrl = "http://127.0.0.1:3000/seekerhome"; // client url
          window.location.href = newUrl;
          window.location.reload();
        })
        .catch((error) => {
          //token revoked
          localStorage.removeItem("TOKEN");
          console.error("Error:", error);
        });
    } else {
      console.log("not called");
    }
  }, [token]);

  React.useEffect(() => {
    var token = localStorage.getItem("TOKEN");
    console.log(token);
    const headers = {
      Authorization: `token ${token}`,
    };

    fetch("https://api.github.com/user", { headers })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error(
            `Failed to fetch user data. Status code: ${response.status}`
          );
        }
      })
      .then((user_data) => {
        const username = user_data.login;
        console.log(`GitHub username: ${username}`);
        setUserName(username);
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, []);

  React.useEffect(() => {
    if (userName === "") return;
    else
      db.collection("users")
        .doc(userName)
        .get()
        .then((doc) => {
          if (doc.exists) {
            console.log("Document data:", doc.data());
            setModalVisible(!doc.data().resume);
            setUserData(doc.data());
          } else {
            console.log("No such document!");
            db.collection("users").doc(userName).set({
              resume: false,
              profile: false,
              elevatorPitch: "",
              skills: [],
            });
            setModalVisible(true);
            setUserData({
              resume: false,
              profile: false,
              elevatorPitch: "",
              skills: [],
            });

            console.log("modalVisible", modalVisible);
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
  }, [userName]);

  const handleElevatorChange = (e) => {
    const { name, value } = e.target;

    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    db.collection("users")
      .doc(userName)
      .update({ elevatorPitch: userData?.elevatorPitch });
  };

  const handleFindClick = async (e) => {
    e.preventDefault();
    if (userName === "") {
      console.log("here");
      setError("User name left empty");
      setTimeout(() => {
        setError("");
      }, 2000);
    }
    // if in localstorage just return
    else if (localStorage.getItem("data")) {
      setLoading(false);
      setViewReferrals(true);
      return;
    } else {
      await axios
        .post("http://127.0.0.1:5000/api/" + userName, {
          token: localStorage.getItem("TOKEN") || "",
        })
        .then((res) => {
          if (localStorage.getItem("data")) {
            // Remove the item from local storage
            localStorage.removeItem("data");
          }
          localStorage.setItem("data", JSON.stringify(res.data));
          setLoading(false);
          setViewReferrals(true);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          setError("500 : Internal server Error");
          setTimeout(() => {
            setError("");
          }, 2000);
        });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="feed" style={{ marginLeft: 30, marginBottom: 100 }}>
        {userName === "" ? (
          <h3>Fetching your username</h3>
        ) : (
          <h3>Welcome {userName}</h3>
        )}

        {modalVisible && (
          <AskForResume
            userName={userName}
            setUserData={setUserData}
            setLoadingResume={setLoadingResume}
            setModalVisible={setModalVisible}
            setElevatorPitch={setElevatorPitch}
          />
        )}
        {userData && (
          <div>
            {userData?.elevatorPitch && (
              <>
                <h4
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.0em",
                    color: "#333",
                  }}
                >
                  Here is an elevator pitch tailored from your resume
                </h4>
                <div>
                  <textarea
                    name="elevatorPitch"
                    rows="4"
                    cols="150"
                    value={userData?.elevatorPitch}
                    onChange={handleElevatorChange}
                  />
                </div>
                <button
                  onClick={() => {
                    db.collection("users")
                      .doc(userName)
                      .update({ elevatorPitch: userData?.elevatorPitch });
                  }}
                  style={{
                    backgroundColor: "#1a1a1a",
                    color: "white",
                    width: "10%",
                    height: "30px",
                    borderRadius: "20px",
                  }}
                >
                  Update
                </button>
              </>
            )}

            {userData?.skills?.length !== 0 && (
              <>
                <h4
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.0em",
                    color: "#333",
                    marginTop: 20,
                  }}
                >
                  Your technical skills
                </h4>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    flexWrap: "wrap",
                    margin: 20,
                  }}
                >
                  {userData?.skills?.map((skill) => {
                    return (
                      <span
                        style={{
                          padding: 10,
                          marginRight: 10,
                          marginBottom: 10,
                          fontWeight: "bold",
                          borderRadius: 20,
                          borderWidth: 10,
                          borderColor: "black",
                          border: "solid",
                          backgroundColor: "lightgrey",
                        }}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {!viewReferrals && (
          <div
            className="get-referrals"
            onClick={(e) => {
              setLoading(true);
              handleFindClick(e);
            }}
          >
            <button
              style={{
                backgroundColor: "#1a1a1a",
                color: "white",
                width: "30%",
                height: "50px",
                borderRadius: "20px",
                display: viewReferrals ? "hidden" : "block",
              }}
            >
              Connect with professionals of similar interests
            </button>
          </div>
        )}
        <div>
          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            {loading && <ThreeDots stroke="#1a1a1a" fill="#1a1a1a" />}
          </div>
          {viewReferrals && <Results userData={userData} />}
        </div>
      </div>

      <Footer />
    </div>
  );
}

const AskForResume = ({
  userName,
  setLoadingResume,
  setModalVisible,
  setUserData,
  setElevatorPitch,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [fileName, setFileName] = React.useState(null);
  const [fileUrl, setFileUrl] = React.useState(null);
  console.log("Ask for Resume Ran");
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    setFileName(file.name);
    setFileUrl(URL.createObjectURL(file));
    console.log("file", file);
    console.log("fileUrl", fileUrl);
    console.log("fileName", fileName);
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("pdfFile", file);
    console.log("formData", formData);
    // Make an API request to /upload
    axios
      .post("http://127.0.0.1:5000/api/upload", formData)
      .then((response) => {
        console.log("response", response);
        // Update the state with the extracted PDF text
        const { data } = response;
        setLoading(true);
        processExtractedText(data)
          .then((result) => {
            console.log("result", result);
            const skills = result.skills;
            const elevatorPitch = result.message;
            setElevatorPitch(elevatorPitch);
            db.collection("users").doc(userName).update({
              resume: true,
              skills: skills,
              elevatorPitch: elevatorPitch,
            });
            setUserData((prevData) => ({
              ...prevData,
              resume: true,
              skills: skills,
              elevatorPitch: elevatorPitch,
            }));

            setModalVisible(false);
          })
          .catch((error) => {
            console.error("Error extracting text from PDF:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching PDF text:", error);
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Upload your resume</h3>

        {loading ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Bars stroke="#1a1a1a" fill="#1a1a1a" />
              {loading && <p>Uploading...</p>}
            </div>
          </>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <>
              <input type="file" onChange={handleFileChange} />

              <button
                type="submit"
                className="modal-buttons"
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "white",
                  width: "10%",
                  height: "50px",
                  borderRadius: "20px",
                }}
              >
                Submit
              </button>
            </>
          </form>
        )}
      </div>
    </div>
  );
};

const Navbar = () => {
  let navigate = useNavigate();

  const handleLogOut = () => {
    localStorage.removeItem("TOKEN");

    navigate("/");
  };

  return (
    <div className="navbar">
      <div style={{ display: "flex" }}>
        <img src={Logo} alt="Logo" className="navbar-logo" />
      </div>
      <div
        className="navbar-links"
        onClick={handleLogOut}
        style={{ cursor: "pointer" }}
      >
        Logout
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

const imageBaseStyle = {
  borderRadius: "50%",
  borderWidth: "10px",
  border: "solid",
  borderColor: "black",
  height: "100px",
  width: "100px",
  cursor: "pointer",
  transition: "transform 0.3s ease",
};

const ListComponent = ({ items, userData }) => {
  const [clicked, setClick] = useState(false);

  const handleMouseEnter = (e) => {
    e.target.style.transform = "scale(1.3)";
  };

  const handleMouseLeave = (e) => {
    e.target.style.transform = "scale(1)";
  };

  const handleClick = () => {
    setClick((clicked) => !clicked);
  };

  const handleWriteEmail = async (item) => {
    const emailBody = await axios.post("http://localhost:5000/api/email", {
      token: localStorage.getItem("TOKEN") || "",
      user: item,
      userData: userData,
    });
    console.log(emailBody);
    // Write email

    window.location.href = `mailto:${item.email}?subject=Referral%20Request&body=${emailBody.data}`;
  };

  return clicked ? (
    <div className="CompleteListDiv">
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-evenly",
                alignItems: "center",
                width: 300,
                height: 300,
                backgroundColor: "#3B383D",
                color: "white",
                borderRadius: 20,
              }}
            >
              <img
                src={item?.avatar_url}
                style={imageBaseStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                alt=""
              />
              <div style={{ textAlign: "center", width: "200px" }}>
                <div>{item.login}</div>
                <div>{item.name}</div>
                <div>{item.location}</div>
                {item.company && (
                  <div style={{ fontWeight: "bold" }}>{item.company}</div>
                )}
              </div>
            </div>
            {index !== items.length - 1 && (
              <img
                src="/arrow-right-solid.svg"
                alt=""
                width={"150px"}
                height={"50px"}
                style={{
                  margin: "auto",
                  marginRight: "20px",
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            )}
          </div>
          <div>
            {index === items.length - 1 && (
              <button
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "white",
                  height: "30px",
                  borderRadius: "20px",
                }}
                onClick={() => {
                  handleWriteEmail(item);
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Write an email
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div>
      <div
        style={{
          display: "flex",
          marginTop: "20px",
          alignItems: "center",
        }}
      >
        <img
          src={items[items.length - 1]?.avatar_url}
          style={{ ...imageBaseStyle, marginRight: "20px" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          alt=""
        />
        <div style={{ marginTop: 10 }}>
          <div>{items[items.length - 1].login}</div>
          <div>{items[items.length - 1].name}</div>
          <div>{items[items.length - 1].location}</div>
          {items[items.length - 1].company && (
            <div className="SinglePersonCard">
              Company: {items[items.length - 1].company}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const Results = ({ userData }) => {
  const item = JSON.parse(localStorage.getItem("data") || "{}");
  const typedData = item.companypaths;
  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };
  const navigate = useNavigate();
  return (
    <div style={{ marginBottom: 100 }}>
      <BarChart data={data} />
      <div className="feed" style={{ marginBottom: 100 }}>
        {typedData && typedData.length !== 0 ? (
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginTop: 40,
                textAlign: "center",
              }}
            >
              A summary of your mutual connections
            </h4>
            <button
              style={{
                backgroundColor: "#1a1a1a",
                color: "white",
                width: "10%",
                height: "50px",
                borderRadius: "20px",
              }}
              onClick={() => navigate("/visualize")}
            >
              Visualize in graphs
            </button>
          </div>
        ) : (
          <h4>No referrals found in your circle!</h4>
        )}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {typedData && typedData.length > 0 ? (
            <span>Click user to see how you're connected!</span>
          ) : (
            <span>Get more followers.</span>
          )}
        </div>

        {typedData?.map((list, index) => (
          <div
            style={{
              display: "flex",
              margin: "30px",
              justifyContent: "center",
            }}
            key={index}
          >
            <ListComponent
              items={list}
              key={index}
              userData={userData}
            ></ListComponent>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;

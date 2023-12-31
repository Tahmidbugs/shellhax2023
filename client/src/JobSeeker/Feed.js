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
import { motion, AnimatePresence } from "framer-motion";

const Welcome = ({ userName }) => {
  return (
    <div style={{ marginTop: 10 }}>
      <h3
        style={{
          fontSize: "2.5rem",
          color: "#333",
          textAlign: "left",
          fontWeight: "300",
        }}
      >
        Welcome{" "}
        <span
          style={{
            color: "#555",
            fontStyle: "italic",
            fontWeight: "600",
            transition: "color 0.5s ease-in-out",
          }}
        >
          {userName}
        </span>
      </h3>
    </div>
  );
};

const API_KEY = "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";

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
              username: userName,
              resume: false,
              profile: false,
              elevatorPitch: "",
              skills: [],
            });
            setModalVisible(true);
            setUserData({
              username: userName,
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

  const processExtractedText = async (textmap) => {
    console.log("Checking");
    //userData.elevatorPitch
    //userData.username
    // Rest of your code for processing the extracted text here
    for (const name in textmap) {
      if (textmap.hasOwnProperty(name)) {
        const value = textmap[name];
  
        const options = {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are a job recruiter that extracts important information from a resume regarding skills, projects, experience, certifications etc.",
              },
              {
                role: "user",
                content: `Analyse the my subsequent elevator pitch and the details of the person who's referral I am about to ask, and tailor my elevator pitch which needs to be written in first person to him so that it increases my probability of getting his/her referral. Also give me a score between 0 to 1, where 0 is the lowest and 1 the highest of how much my profile matches with that of the person. Only return the output as JSON code and the elevator pitch under message, and the score under score. Elevator pitch: ${userData.elevatorPitch} , Person's information ${value}. The person's data contains all the repositiories he has worked in and the languages he used in each. The name of the person is ${name}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 600,
          }),
        };
        try {
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            options
          );
          const data = await response.json();
          console.log(data.choices[0].message.content);
          //return ensureJson(data.choices[0].message.content);
        } catch (error) {
          console.error("Error extracting text from PDF:", error);
          throw error;
        }
      }
    } 
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
    else if (localStorage.getItem("data") && localStorage.getItem("hashmap")) {
      setLoading(false);
      setViewReferrals(true);
      const item = JSON.parse(localStorage.getItem("data") || "{}");
      const companylist = item.companypaths;
      const token = localStorage.getItem("TOKEN");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Set the Authorization header with the token
        },
      };

      const people_name = [];
      companylist.forEach((list) => {
        people_name.push(list[list.length - 1].login);
      });

      // user name list
      var minn = 10;
      for (const user of people_name) {
        try {
          const res = await axios.get(
            `https://api.github.com/users/${user}/repos`,
            config
          );
          // console.log(res);
          const size = res.data.length;
          if (size < minn) {
            minn = size;
          }
        } catch (error) {
          console.log(error);
        }
      }

      // console.log(minn);
      const hashmap = {}; // map<string,[JSON Object]>
      for (const user of people_name) {
        try {
          const res = await axios.get(
            `https://api.github.com/users/${user}/repos`,
            config
          );

          const newlist = res.data.slice(0, minn);
          for (const repo of newlist) {
            try {
              //for each repo
              const repoName = repo.name;
              const languagesRes = await axios.get(
                `https://api.github.com/repos/${user}/${repoName}/languages`
              );

              // langres ={"java":4656,"js":3244}
              // [{reponame:"xde",["py"]}]
              if (!hashmap[user]) {
                // If the user key doesn't exist, create it as an empty array
                hashmap[user] = [];
              }

              hashmap[user].push({
                repoName,
                languages: Object.keys(languagesRes.data),
              });
              // newlist.push({ repoName, languagesRes });
            } catch (error) {
              console.log(error);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
      console.log(hashmap);

      return;
    } else {
      await axios
        .post("http://127.0.0.1:5000/api/" + userName, {
          token: localStorage.getItem("TOKEN") || "",
        })
        .then(async (res) => {
          if (localStorage.getItem("data")) {
            // Remove the item from local storage
            localStorage.removeItem("data");
          }
          localStorage.setItem("data", JSON.stringify(res.data));
          const item = JSON.parse(localStorage.getItem("data") || "{}");
      const companylist = item.companypaths;
      const token = localStorage.getItem("TOKEN");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Set the Authorization header with the token
        },
      };

      const people_name = [];
      companylist.forEach((list) => {
        people_name.push(list[list.length - 1].login);
      });

      // user name list
      var minn = 10;
      for (const user of people_name) {
        try {
          const res = await axios.get(
            `https://api.github.com/users/${user}/repos`,
            config
          );
          // console.log(res);
          const size = res.data.length;
          if (size < minn) {
            minn = size;
          }
        } catch (error) {
          console.log(error);
        }
      }

      // console.log(minn);
      const hashmap = {}; // map<string,[JSON Object]>
      for (const user of people_name) {
        try {
          const res = await axios.get(
            `https://api.github.com/users/${user}/repos`,
            config
          );

          const newlist = res.data.slice(0, minn);
          for (const repo of newlist) {
            try {
              //for each repo
              const repoName = repo.name;
              const languagesRes = await axios.get(
                `https://api.github.com/repos/${user}/${repoName}/languages`
              );

              // langres ={"java":4656,"js":3244}
              // [{reponame:"xde",["py"]}]
              if (!hashmap[user]) {
                // If the user key doesn't exist, create it as an empty array
                hashmap[user] = [];
              }

              hashmap[user].push({
                repoName,
                languages: Object.keys(languagesRes.data),
              });
              // newlist.push({ repoName, languagesRes });
            } catch (error) {
              console.log(error);
            }
          }
        } catch (error) {
          console.log(error);
              }      }
              processExtractedText(hashmap)
      console.log(hashmap);

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
      <div className="feed" style={{ marginLeft: 30 }}>
        {userName === "" ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 100,
            }}
          >
            <Bars stroke="#1a1a1a" fill="#1a1a1a" />
          </div>
        ) : (
          <>
            <Welcome userName={userName} />

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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {userData?.elevatorPitch && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: -100 }} // initial state
                      animate={{ opacity: 1, y: 0 }} // final state
                      exit={{ opacity: 0, y: 100 }} // exit state
                      transition={{ duration: 1.8 }} // optional, specify the duration
                    >
                      <div
                        style={{
                          paddingRight: 20,
                          border: "solid",
                          borderLeftWidth: 0,
                          borderRightWidth: 10,
                          borderRadius: 5,
                          borderTopWidth: 0,
                          borderBottomWidth: 0,
                          borderColor: "#333",
                        }}
                      >
                        <h4
                          style={{
                            fontWeight: "bold",
                            fontSize: "1.0em",
                            color: "#333",
                          }}
                        >
                          Here is an elevator pitch tailored from your resume
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            margin: "20px 0",
                          }}
                        >
                          <textarea
                            name="elevatorPitch"
                            rows="4"
                            cols="150"
                            value={userData?.elevatorPitch}
                            onChange={handleElevatorChange}
                            style={{
                              width: "100%",
                              padding: "15px",
                              fontSize: "18px",
                              fontWeight: "500",
                              border: "2px solid #333",
                              borderRadius: "10px",
                              outline: "none",
                              boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
                              transition: "all 0.3s ease",
                              resize: "none",
                            }}
                            onFocus={(e) => {
                              e.target.style.boxShadow =
                                "0px 5px 20px rgba(0, 128, 0, 0.1)";
                            }}
                            onBlur={(e) => {
                              e.target.style.boxShadow =
                                "0px 3px 10px rgba(0,0,0,0.1)";
                            }}
                          />
                        </div>

                        <button
                          onClick={() => {
                            db.collection("users").doc(userName).update({
                              elevatorPitch: userData?.elevatorPitch,
                            });
                          }}
                          style={{
                            backgroundColor: "#1a1a1a",
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "20px",
                            marginTop: -5,
                          }}
                        >
                          Update
                        </button>
                      </div>
                      {/* Your actual component markup here */}
                    </motion.div>
                  </AnimatePresence>
                )}

                {userData?.skills?.length !== 0 && (
                  <div style={{ width: "40%" }}>
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
                      {userData?.skills?.map((skill, index) => {
                        const generateRandomLightColor = () => {
                          // Generate a random light R, G, and B value within a certain range
                          const randomR = Math.floor(Math.random() * 56) + 200; // Random number between 200-255
                          const randomG = Math.floor(Math.random() * 56) + 200; // Random number between 200-255
                          const randomB = Math.floor(Math.random() * 56) + 200; // Random number between 200-255

                          // Concatenate the RGB values into a full RGB string
                          const randomRGB = `rgb(${randomR}, ${randomG}, ${randomB})`;

                          return randomRGB;
                        };

                        return (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, x: -30 }} // Initial state when the component is added
                            animate={{ opacity: 1, x: 0 }} // Final state when the component is added
                            exit={{ opacity: 0, x: 10 }} // State when the component is removed
                            whileHover={{ scale: 1.1 }} // State while hovering
                            transition={{ duration: 1.0 }}
                            style={{
                              padding: 10,
                              marginRight: 10,
                              marginBottom: 10,
                              fontWeight: "bold",
                              borderRadius: 20,
                              borderWidth: 10,
                              borderColor: "black",
                              border: "solid",
                              cursor: "pointer",
                              backgroundColor: generateRandomLightColor(),
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#1B1B1B"; // Matte Black
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                generateRandomLightColor(); // Resetting to the original color
                              e.currentTarget.style.color = "black";
                            }}
                          >
                            {skill}
                          </motion.span>
                        );
                      })}
                    </div>
                  </div>
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
          </>
        )}
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
              username: userName,
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
    <div
      className="modal"
      style={{
        position: "fixed",
        zIndex: "1",
        left: "0",
        top: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: "white",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "0px 8px 16px 0px rgba(0, 0, 0, 0.2)",
          width: "50%",
        }}
      >
        <h3
          style={{
            color: "#1a1a1a",
            textAlign: "center",
            borderBottom: "2px solid #1a1a1a",
            paddingBottom: "10px",
            marginBottom: "15px",
          }}
        >
          Upload your resume
        </h3>

        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bars stroke="#1a1a1a" fill="#1a1a1a" />
            {loading && <p style={{ color: "#1a1a1a" }}>Uploading...</p>}
          </div>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <input
              type="file"
              onChange={handleFileChange}
              style={{
                marginBottom: "15px",
              }}
            />

            <button
              type="submit"
              style={{
                backgroundColor: "#1a1a1a",
                color: "white",
                width: "100%",
                height: "50px",
                borderRadius: "25px",
                fontSize: "1.2rem",
                boxShadow: "0px 8px 16px 0px rgba(0, 0, 0, 0.2)",
              }}
            >
              Submit
            </button>
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

const ListComponent = ({ items }) => {
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
    const emailBody = console.log(emailBody);
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
              flexDirection: "column",
              justifyContent: "space-evenly",
              alignItems: "center",
              width: 300,
              height: 300,
              backgroundColor: "#3B383D",
              color: "white",
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
const Results = () => {
  const item = JSON.parse(localStorage.getItem("data") || "{}");
  const typedData = item.companypaths;
  const matchList = [
    { name: "Alice", matchPercent: 50 },
    { name: "Bob", matchPercent: 70 },
    { name: "Charlie", matchPercent: 80 },
    // ... more data
  ];
  const generateRandomLightColor = () => {
    // Generate a random light R, G, and B value within a certain range
    const randomR = Math.floor(Math.random() * 56) + 200; // Random number between 200-255
    const randomG = Math.floor(Math.random() * 56) + 200; // Random number between 200-255
    const randomB = Math.floor(Math.random() * 56) + 200; // Random number between 200-255

    // Concatenate the RGB values into a full RGB string
    const randomRGB = `rgb(${randomR}, ${randomG}, ${randomB})`;

    return randomRGB;
  };

  // Create labels and data arrays from matchList
  const labels = matchList.map((item) => item.name);
  const dataValues = matchList.map((item) => item.matchPercent);
  const backgroundColors = labels.map(() => generateRandomLightColor());

  // Populate the chart data
  const data = {
    labels,
    datasets: [
      {
        label: "Match Percentages",
        data: dataValues,
        backgroundColor: backgroundColors,
        // Other attributes here...
      },
    ],
  };
  const navigate = useNavigate();
  return (
    <div style={{ marginBottom: 100 }}>
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
            <ListComponent items={list} key={index}></ListComponent>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;

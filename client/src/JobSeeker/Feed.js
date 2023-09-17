import React from "react";
import axios from "axios";
import Logo from "../assets/logo.png";

import { db } from "../firebase.js";
import { processExtractedText } from "./pdfExtract.js";

function Feed(props) {
  const [token, setToken] = React.useState(localStorage.getItem("TOKEN"));
  const [userName, setUserName] = React.useState("");
  const [userData, setUserData] = React.useState(null);
  const [loadingResume, setLoadingResume] = React.useState(false);
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);

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
    // Grab userprofile, resume from Firebase
    if (userName === "") return;
    else
      db.collection("users")
        .doc(userName)
        .get()
        .then((doc) => {
          if (doc.exists) {
            console.log("Document data:", doc.data());
            const { resume, profile } = doc.data();
            // if (resume) {
            //   setLoadingResume(true);
            // }
            // if (profile) {
            //   setLoadingProfile(true);
            // }
            setUserData(doc.data());
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            db.collection("users").doc(userName).set({
              resume: false,
              profile: false,
            });
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
  }, [userName]);

  const handleElevatorChange = (e) => {
    const { name, value } = e.target;

    // Update the ElevatorPitch field in userData
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    db.collection("users")
      .doc(userName)
      .update({ elevatorPitch: userData.elevatorPitch });
  };

  return (
    <div>
      <Navbar />
      <div className="feed" style={{ marginLeft: 30 }}>
        {userName === "" ? (
          <h3>Fetching your username</h3>
        ) : (
          <h3>Welcome {userName}</h3>
        )}
        {userData && (
          <div>
            {userData.resume ? (
              <p>Resume: Uploaded</p>
            ) : (
              <>
                {modalVisible && (
                  <AskForResume
                    userName={userName}
                    setLoadingResume={setLoadingResume}
                    setModalVisible={setModalVisible}
                  />
                )}
              </>
            )}
            {userData.elevatorPitch !== "" ? (
              <>
                <p>Elevator Pitch</p>
                <textarea
                  name="elevatorPitch"
                  rows="4"
                  cols="150"
                  value={userData.elevatorPitch}
                  onChange={handleElevatorChange}
                />
                <button
                  onClick={() => {
                    db.collection("users")
                      .doc(userName)
                      .update({ ElevatorPitch: userData.elevatorPitch });
                  }}
                >
                  Update
                </button>
              </>
            ) : (
              <>
                <p>Elevator Pitch</p>
                <textarea
                  name="ElevatorPitch"
                  rows="10"
                  cols="30"
                  value={userData.ElevatorPitch}
                  onChange={handleElevatorChange}
                />
                <button
                  onClick={() => {
                    db.collection("users")
                      .doc(userName)
                      .update({ ElevatorPitch: userData.elevatorPitch });
                  }}
                >
                  Submit
                </button>
              </>
            )}
            {userData.skills.length !== 0 && (
              <>
                <p>Skills</p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    flexWrap: "wrap",
                  }}
                >
                  {userData.skills.map((skill) => {
                    return (
                      <span
                        style={{
                          paddding: 30,
                          fontWeight: "bold",
                          borderRadius: 20,
                          borderWidth: 10,
                          borderColor: "black",
                          border: "solid",
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

        <div className="get-referrals">
          <button>Connect with professionals of similar interests</button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const AskForResume = ({ userName, setLoadingResume, setModalVisible }) => {
  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [fileName, setFileName] = React.useState(null);
  const [fileUrl, setFileUrl] = React.useState(null);
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
        processExtractedText(data)
          .then((result) => {
            console.log("result", result);
            const skills = result.skills;
            const elevatorPitch = result.message;
          })
          .then(() => {
            setModalVisible(false);
            setLoading(false);
            setLoadingResume(true);
          });
      })
      .catch((error) => {
        console.error("Error fetching PDF text:", error);
      });
  };

  //   const handleSubmit = (e) => {
  //     e.preventDefault();
  //     setLoading(true);
  //     const storageRef = db.storage().ref();
  //     const fileRef = storageRef.child(file.name);
  //     fileRef.put(file).then(() => {
  //       console.log("Uploaded a file");
  //       fileRef.getDownloadURL().then((url) => {
  //         console.log("url", url);
  //         db.collection("users")

  //           .doc(userName)
  //           .update({
  //             resume: true,
  //             resumeUrl: url,
  //           })
  //           .then(() => {
  //             console.log("Document successfully updated!");
  //             setLoading(false);
  //             setLoadingResume(true);
  //           })
  //           .catch((error) => {
  //             // The document probably doesn't exist.
  //             console.error("Error updating document: ", error);
  //           });
  //       });
  //     });
  //   };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Upload your resume</h3>
        <form onSubmit={handleFormSubmit}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit" className="modal-buttons">
            Submit
          </button>
        </form>
        {loading && <p>Uploading...</p>}
        {fileUrl && <img src={fileUrl} alt="resume" />}
      </div>
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

export default Feed;

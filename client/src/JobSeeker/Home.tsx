import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";
import { Button } from "react-bootstrap";
import "./HomeComp.css";


type User = {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
  name: string | null;
  company: null | string;
  location: string | null;
  email: null | string;
  bio: string | null;
  followers: number;
  layer: number;
};

const HomeComponent: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("TOKEN")
  );
  useEffect(() => {
    const newToken = localStorage.getItem("TOKEN");
    setToken(newToken);
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get("code");

    if (sessionCode && localStorage.getItem("TOKEN") === null) {
      axios
        .get(
          `https://getconnected.bullsmarketplace.com/api/auth?code=${sessionCode}`
        )
        .then((response) => {
          // Extract the access token

          const { data } = response;
          localStorage.setItem("TOKEN", data.access_token);
          const newUrl = "https://gitconnected.netlify.app"; // client url
          window.location.href = newUrl;
          window.location.reload();
        })
        .catch((error) => {
          //token revoked
          localStorage.removeItem("TOKEN");
          console.error("Error:", error);
        });
    }
  }, [token]);

  const [username, setUsername] = useState<string>("");
  const [Loading, setLoading] = useState<boolean>(false);
  const [Error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleFindClick = async (e: React.FormEvent) => {
    e.preventDefault();
    //make api call to end point
    if (username == "") {
      console.log("here");
      setError("User name left empty");
      setTimeout(() => {
        setError("");
      }, 2000);
    } else {
      setLoading(true);
      await axios
        .post("https://getconnected.bullsmarketplace.com/api/" + username, {
          token: localStorage.getItem("TOKEN") || "",
        })
        .then((res) => {
          if (localStorage.getItem("data")) {
            // Remove the item from local storage
            localStorage.removeItem("data");
          }
          localStorage.setItem("data", JSON.stringify(res.data));
          setLoading(false);
          navigate("/result");
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const showResult = () => {
    navigate("/result");
  };

  interface Map {
    [key: string]: User[];
  }

  const item = JSON.parse(localStorage.getItem("data") || "{}");
  const adjMap: Map = item.adjmap;

  return (
    <div className="Container">
      <div
        className="form-group"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <img src="/25231.png" alt="" height={"250px"} />
        <h1 style={{ textAlign: "center" }}>
          Best place for students and recruiters
        </h1>
        <p style={{ textAlign: "center" }}>
          Enter your GitHub Username to find people who might refer you.
        </p>
        <form onSubmit={handleFindClick}>
          <>
            {token && token !== "undefined" && (
              <input
                style={{ width: "200px", margin: "auto", height: "50px" }}
                type="text"
                className="form-control"
                id="basicInput"
                placeholder="Khan168"
                value={username}
                onChange={handleInputChange}
              />
            )}
            {Error !== "" ? (
              <span
                style={{
                  color: "red",
                  display: "block",
                  margin: "auto",
                  textAlign: "center",
                }}
              >
                {Error}
              </span>
            ) : (
              ""
            )}
          </>

          {token == null || token == "undefined" ? (
            <Button
              onClick={() => {
                navigate("/auth");
              }}
              variant="dark"
              style={{
                width: "200px",
                display: "block",
                margin: "auto",
                marginTop: "10px",
              }}
            >
              Login with Github
            </Button>
          ) : !Loading ? (
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100px",
                display: "block",
                margin: "auto",
                marginTop: "10px",
              }}
            >
              Find!
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "5px",
              }}
            >
              <RotatingLines
                strokeColor="grey"
                strokeWidth="5"
                animationDuration="0.75"
                width="40"
                visible={true}
              />
            </div>
          )}
          {adjMap && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: "10px", display: "block" }}
              onClick={showResult}
            >
              See Loaded results for{" "}
              {Object.values(adjMap)[0]?.[0].login || "User"}!
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default HomeComponent;
import React,{ FC, useState } from "react";
import "./result.css";
import { useLocation, Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

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

type Data = User[][];

interface ListProps {
  items: User[];
}

const ListComponent: React.FC<ListProps> = ({ items }) => {
  const [clicked, setClick] = useState<boolean>(false);
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
              width: "100%",
            }}
            key={index}
          >
            <img
              src={item?.avatar_url}
              style={{
                borderRadius: "50%",
                height: "100px",
                width: "100px",
                cursor: "pointer",
              }}
              onClick={() => {
                setClick((clicked) => !clicked);
              }}
              alt=""
            ></img>
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
              width={"50px"}
              height={"50px"}
              style={{ margin: "auto", marginRight: "20px" }}
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
          style={{
            borderRadius: "50%",
            height: "100px",
            width: "100px",
            cursor: "pointer",
            marginRight: "20px",
          }}
          onClick={() => {
            setClick((clicked) => !clicked);
          }}
          alt=""
        ></img>
        <div>
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

const Result: FC = () => {
  const item = JSON.parse(localStorage.getItem("data") || "{}");
  const typedData: Data = item.companypaths;
  return (
    <div
      style={{ background: "lightblue", height: "100%", minHeight: "100vh" }}
    >
      <MyNavbar />
      <div style={{ padding: "20px" }}>
        {typedData && typedData.length !== 0 ? (
          <h1>Your top Referrals:</h1>
        ) : (
          <h1>No referrals found in your circle!</h1>
        )}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {typedData && typedData.length > 0 ? (
            <span>Click user to see how you're connected!</span>
          ) : (
            <span>Get more followers.</span>
          )}
          <span>
            Tip: Click <strong>Visualize</strong> to see your circle
          </span>
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

export default Result;

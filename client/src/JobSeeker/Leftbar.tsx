import React from "react";

type LeftbarProps = {
  name: string;
  avatar: string;
  bio: null | string;
  comp: null | string;
  location: null | string;
  followers: number;
  layer: number;
};

const numberToColorMap: Map<number, string> = new Map<number, string>([
  [0, "#99ea99"], // Red
  [1, "#5c5cdb"], // Orange
  [2, "#EE82EE"], // Yellow
  [3, "#008000"], // Green
  [4, "#5c5cdb"], // Blue
  [5, "#4B0082"], // Indigo
  [6, "#EE82EE"], // Violet
  [7, "#FFC0CB"], // Pink
]);

const Leftbar: React.FC<LeftbarProps> = (props) => {
  return (
    <>
      <>
        {props.name === "" ? (
          <div className="LeftBarStyle">
            Click on user to display Info
          </div>
        ) : (
          <div
            className="LeftBarStyle"
            style={{
              backgroundColor: numberToColorMap.get(props.layer),
            }}
          >
            <div
              className="user-info"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                height: "100%",
              }}
            >
              <div className="avatar">
                <img
                  src={props.avatar}
                  style={{
                    borderRadius: "50%",
                    height: "100px",
                    width: "100px",
                  }}
                ></img>
              </div>
              <div className="details">
                <h2 className="name">{props.name}</h2>
                {props.comp && (
                  <p className="email">
                    <strong>{props.comp}</strong>
                  </p>
                )}
                <p className="location">{props.location}</p>
                <p className="bio">{props.bio}</p>
                <p className="followers">Followers: {props.followers}</p>
                <p className="layer">Layer: {props.layer}</p>
              </div>
            </div>
          </div>
        )}
      </>
    </>
  );
};

export default Leftbar;
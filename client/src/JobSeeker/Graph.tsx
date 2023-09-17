import { FC, useEffect, useState } from "react";
import "@react-sigma/core/lib/react-sigma.min.css";
import { UndirectedGraph } from "graphology";
import {
  SigmaContainer,
  ControlsContainer,
  SearchControl,
  useLoadGraph,
  useRegisterEvents,
  FullScreenControl,
} from "@react-sigma/core";
import Leftbar from "./Leftbar.tsx";
import "./Visual.css"
import React from "react";

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

type Data = {
  [key: string]: User[];
};

export const LoadGraphWithHook: FC = () => {
  const item = JSON.parse(localStorage.getItem("data") || "{}");
  const typedData: Data = item.adjmap;
  const MyGraph: FC = () => {
    const loadGraph = useLoadGraph();

    useEffect(() => {
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
      // Create the graph
      const graph = new UndirectedGraph();
      const mySet: Set<number> = new Set<number>();
      const mapData: Map<string, User[]> = new Map<string, User[]>();

      for (const key in typedData) {
        if (Object.hasOwnProperty.call(typedData, key)) {
          const userArray: User[] = typedData[key];
          mapData.set(key, userArray);
        }
      } //to create a map out of the key-value object so that you can use map method to iterate over k-v pair

      
      let num = 0;
      let count=0
      for (const [_=undefined, value] of mapData) {
        for (let index = 0; index < value.length; index++) {
          num -= 40;
          if (!mySet.has(value[index].id)) {
            const NeighborNode = {
              avatar_url: value[index].avatar_url,
              email: value[index].email,
              name: value[index].name,
              location: value[index].location,
              bio: value[index].bio,
              comp:value[index].company,
              followers: value[index].followers,
              layer: value[index].layer

            };
            const y = count % 2==0 ? -num -index*20 : num + index*20;
            count++;
            graph.addNode(JSON.stringify(NeighborNode), {
              //graph.addNode in documentn has takes string as the identifier but because I have to display information on click, I stringified the node data
              x: value[index].layer * 2500,
              y: y,
              label: value[index].login,
              size: 20,
              color: numberToColorMap.get(value[index].layer),
              user: value[index],
            });
            const CurrNode = {
              avatar_url: value[0].avatar_url,
              email: value[0].email,
              name: value[0].name,
              location: value[0].location,
              bio: value[0].bio,
              comp: value[0].company,
              followers: value[0].followers,
              layer: value[0].layer
            };
            graph.addEdgeWithKey(
              value[index].id,
              JSON.stringify(NeighborNode),
              JSON.stringify(CurrNode),
              {
                label: "",
                color: numberToColorMap.get(value[0].layer),
              }
            );
          }
          mySet.add(value[index].id);
        }
      }
      loadGraph(graph);
    }, [loadGraph]);

    return null;
  };

  const GraphEvents: React.FC = () => {
    const registerEvents = useRegisterEvents();

    useEffect(() => {
      // Register the events
      registerEvents({
        // node events
        clickNode: (event) => {
          const raw = event.node;
          const info = JSON.parse(raw);
          const {
            name,
            location,
            avatar_url,
            bio,
            comp,
            followers,
            layer
          }: {
            name: string;
            comp: string | null;
            location: string | null;
            avatar_url: string;
            bio: string | null;
            followers: number;
            layer: number;
          } = info;
          setName(name);
          setAvatar(avatar_url);
          setLocation(location);
          setBio(bio);
          setComp(comp);
          setfollowers(followers)
          setLayer(layer)
        },
      });
    }, [registerEvents]);

    return null;
  };

  const [name, setName] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [bio, setBio] = useState<string | null>(null);
  const [comp, setComp] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [followers, setfollowers] = useState<number>(0);
  const [layer, setLayer] = useState<number>(0);

  return (
    <div className="VisualpageDiv">
      <Leftbar
        name={name}
        avatar={avatar}
        bio={bio}
        comp={comp}
        location={location}
        followers={followers}
        layer={layer}
      ></Leftbar>
      <SigmaContainer
        settings={{
          renderEdgeLabels: true,
          defaultEdgeType: "arrow",
          labelSize: 15,
        }}
        style={{
          backgroundColor: "grey",
          height: "90vh",
          borderTop: "1px solid white",
          borderBottom: "1px solid white",
          margin:"auto"
        }}
      >
        <MyGraph />
        <GraphEvents />
        <ControlsContainer position={"top-right"}>
          <SearchControl style={{ width: "200px" }} />
        </ControlsContainer>
        <ControlsContainer position={"bottom-right"}>
          <FullScreenControl />
        </ControlsContainer>
      </SigmaContainer>
    </div>
  );
};
import React, { useEffect } from "react";
import GoogleMapReact from "google-map-react";
import styles from "./map.module.scss";
import { DeviceContext } from "../Home";
import { useNavigate } from "react-router-dom";
import {
  collection,
  DocumentData,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
} from "firebase/firestore";

export function Marker(props: { id: number; lat: number; lng: number }) {
  const [device, setDevice] = React.useContext(DeviceContext);
  const navigate = useNavigate();
  return (
    <div
      className={styles.marker}
      onClick={() => {
        setDevice(props.id);
        navigate("/devices/detail/");
      }}
    >
      {props.id}
    </div>
  );
}

export default function SimpleMap() {
  const db = getFirestore();

  const [data, setData] = React.useState<DocumentData[]>([]);

  React.useEffect(() => {
    const ubsub = onSnapshot(collection(db, "devices"), (querySnapshot) => {
      const dataTemp: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        dataTemp.push(doc.data());
      });
      setData(dataTemp);
      return () => {
        ubsub();
      };
    });
  }, []);

  const defaultProps = {
    center: {
      lat: 41.8349,
      lng: -87.627,
    },
    zoom: 14,
  };

  return (
    // Important! Always set the container height explicitly
    <div style={{ height: "32em", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyDAK-NEM2_3wgC29Jmz2NwL9KzHd7xvm8I" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
      >
        {data.map((device) => (
          <Marker
            key={device.id}
            id={device.id}
            lat={device.location._lat}
            lng={device.location._long}
          />
        ))}
      </GoogleMapReact>
    </div>
  );
}

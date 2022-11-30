import React from "react";
import GoogleMapReact from 'google-map-react';
import styles from "./map.module.scss";
import { DeviceContext } from "../Home";
import { useNavigate } from "react-router-dom";

function Marker(props: { id: number, lat: number, lng: number }) {
  const [device, setDevice] = React.useContext(DeviceContext)
  const navigate = useNavigate();
  return <div className={styles.marker} onClick={()=>{
    setDevice(props.id);
    navigate("/devices/detail/")
  }}>{props.id}</div>
}

export default function SimpleMap() {
  const defaultProps = {
    center: {
      lat: 41.8349,
      lng: -87.6270
    },
    zoom: 14
  };

  return (
    // Important! Always set the container height explicitly
    <div style={{ height: '32em', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyDAK-NEM2_3wgC29Jmz2NwL9KzHd7xvm8I" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
      >
        <Marker
          id={1}
          lat={41.8349}
          lng={-87.6270}
        />
        <Marker
          id={2}
          lat={41.84}
          lng={-87.6276}
        />
        <Marker
          id={3}
          lat={41.83}
          lng={-87.65}
        />
      </GoogleMapReact>
    </div>
  );
}


import React from "react";
import GoogleMapReact from 'google-map-react';


 export default function SimpleMap(){
  const defaultProps = {
    center: {
      lat: 41.7,
      lng: -87.5
    },
    zoom: 11
  };
  return (
    // Important! Always set the container height explicitly
    <div style={{ height: '600vh', width: '80%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyALXYvBmfMNerap5QWqnPDwHTPrGO3WmOE" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
      >
    
      </GoogleMapReact>
    </div>
  );
}


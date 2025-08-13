import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Modal, Table, Button } from 'antd';
import MapGL, { Source, Layer, _useMapControl as useMapControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from "@turf/turf";
import { findIntersectedObjects } from '../util';
import { set } from 'lodash';

const mapboxApiKey = "pk.eyJ1Ijoia21pcmFjbGUtaGRjIiwiYSI6ImNsMG55aDBqdjFrdDEzZG1nMjU3OHhmbTEifQ.FttXr9iJO5gZHcLUITwO8A"

const layerStyle = {
  id: 'data',
  type: 'circle',
  paint: {
    'circle-radius': 5,
    'circle-color': '#ff0000'
  }
};

function CustomControl(props) {
  const [counter, setCounter] = useState(0);
  const {context, containerRef} = useMapControl({
    onDragStart: evt => {
      // prevent the base map from panning
      evt.stopPropagation();
    },
    onClick: evt => {
      if (evt.type === 'click') {
        setCounter(v => v + 1);
      }
    }
  });

  return (
    <div
      style={{
        backgroundColor: 'red',
        // width: '200px',
        // height: '200px',
        bottom: '30px',
        right: '10px',
        position: 'absolute',

      }}
      ref={containerRef}
    >
      <Button onClick={props.handleModalOpen}>
        Show Comparison Matches
      </Button>
    </div>
  );
}

export default function MapViz(props) {
  const initialViewportState = {
    longitude: 39.392,
    latitude: 48.551,
    zoom: 3
  }
  const [viewport, setViewport] = useState(initialViewportState);
  const [geojson, setGeojson] = useState(null)
  const [hoverInfo, setHoverInfo] = useState(null);
  const [comparisonColumns, setComparisonColumns] = useState([]);
  const [comparisonMatches, setComparisonMatches] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false)

  console.log('Map props', props)

  const handleViewportChange = (viewport) => {
    setViewport(viewport);
  }

  const onHover = useCallback(event => {
    const {
      features,
      srcEvent: {offsetX, offsetY}
    } = event;
    const hoveredFeature = features && features[0];

    setHoverInfo(
      hoveredFeature
        ? {
            feature: hoveredFeature,
            x: offsetX,
            y: offsetY
          }
        : null
    );
  }, []);

  useEffect(() => {
    if (props.data && props.data.length > 0) {
      const geojson = {
        type: 'FeatureCollection',
        features: props.data.map(item => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [item.longitude, item.latitude]
          },
          properties: {
            ...item,
          }
        }))
      };

      setGeojson(geojson);
    }
  }, [props.data]);

  useEffect(() => {
    if (!props.enableCompare) {
      return
    }

    if (!props.geofences || props.geofences.length === 0) {
      return;
    }

    if (!props.data || props.data.length === 0) {
      return;
    }

    const geofenceLookup = {}
    const fieldToCompare = props.fieldToCompare;

    props.geofences.forEach((geofence, idx) => {
      console.log('geofence', geofence, idx)
      geofenceLookup[idx] = []
    })

    props.data.map(item => {
      // console.log('item', item)
      props.geofences.forEach((geofence, idx) => {
        const polygon = turf.polygon(geofence.coordinates);
        const point = turf.point([item.longitude, item.latitude]);
        const isInside = turf.booleanPointInPolygon(point, polygon);
        if (isInside) {
          geofenceLookup[idx].push(item);
        }
      })
    });

    console.log('geofenceLookup', geofenceLookup);
    console.log('geofenceLookup values', Object.values(geofenceLookup));

    const intersection = findIntersectedObjects(Object.values(geofenceLookup), fieldToCompare);
    setComparisonMatches(intersection);
    // console.log('grouped', grouped);
  }, [props.geofences]);

  const handleModalClose = () => {
    setModalIsOpen(false);
  }

  const handleModalOpen = () => {
    setModalIsOpen(true);
  }

  useEffect(() => {
    if (comparisonMatches.length == 0) {
      return
    }

    const columns = Object.keys(comparisonMatches[0]).map(key => ({
      title: key,
      dataIndex: key,
      key: key,
    }));

    setComparisonColumns(columns);

  }, [comparisonMatches])

  const columns = [
    {
      title: 'Test 1',
      dataIndex: 'one',
      key: 'one',
    },
    {
      title: 'Test 2',
      dataIndex: 'two',
      key: 'two',
    },
    {
      title: 'Test 3',
      dataIndex: 'three',
      key: 'three',
    },
  ]

  const data = [
    {
      'key': '1',
      'one': 'foo',
      'two': 'bar',
      'three': 'baz',
    },
    {
      'key': '1',
      'one': 'foo',
      'two': 'bar',
      'three': 'baz',
    },
    {
      'key': '1',
      'one': 'foo',
      'two': 'bar',
      'three': 'baz',
    },
    {
      'key': '1',
      'one': 'foo',
      'two': 'bar',
      'three': 'baz',
    },

  ]

  return (
    <div
      style={{
        height: `${props.height}px`,
        width: `${props.width}px`,
      }}
    >
      <Modal
        title="Comparison Matches"
        visible={modalIsOpen}
        onCancel={handleModalClose}
        width={800}
        height={600}
        footer={[
          <Button key="back" onClick={handleModalClose}>
            Return
          </Button>
        ]}
      >
        <Table columns={comparisonColumns} dataSource={comparisonMatches} />

      </Modal>
      <MapGL
        {...viewport}
        width={props.width}
        height={props.height}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14
        }}
        mapboxApiAccessToken={mapboxApiKey}
        mapStyle="mapbox://styles/kmiracle-hdc/clneys7ey07zh01qici3jgnwu"
        onViewportChange={handleViewportChange}
        onHover={onHover}
        interactiveLayerIds={['data']}


      >
        <CustomControl handleModalOpen={handleModalOpen} />
        {/* <div
          style={{
            bottom: '10px',
            left: '10px',
            width: '500px',
            minHeight: '200px',
            backgroundColor: '#0d1117',
            position: 'absolute',
            color: '#ffffff',
            padding: '10px',
          }}
        >
          <h4>Comparison Matches</h4>
          {comparisonMatches.map(match => (
            <div>
              {Object.entries(match).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> {value.toString()}
                </div>
              ))}
            </div>
          ))}
        </div> */}
        {geojson && (
          <Source type="geojson" data={geojson}>
            <Layer {...layerStyle} />
          </Source>
        )}
        {hoverInfo && (
          <div
            style={{
              top: '10px',
              left: '10px',
              width: '400px',
              minHeight: '200px',
              backgroundColor: '#0d1117',
              position: 'absolute',
              color: '#ffffff',
              padding: '10px',
            }}
          >
            <h4>Details</h4>
            {Object.entries(hoverInfo.feature.properties).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {value.toString()}
              </div>
            ))}
          </div>
        )}
      </MapGL>
    </div>
  );
}
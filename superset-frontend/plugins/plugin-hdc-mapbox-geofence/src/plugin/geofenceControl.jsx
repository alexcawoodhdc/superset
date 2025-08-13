// GeofenceControl.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'antd';
import { t } from '@superset-ui/core';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

// Hack from: https://github.com/mapbox/mapbox-gl-draw/issues/1357
// const styles=[{id:"gl-draw-polygon-fill",type:"fill",filter:["all",["==","$type","Polygon"],],paint:{"fill-color":["case",["==",["get","active"],"true"],"orange","blue",],"fill-opacity":.1}},{id:"gl-draw-lines",type:"line",filter:["any",["==","$type","LineString"],["==","$type","Polygon"],],layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":["case",["==",["get","active"],"true"],"orange","blue",],"line-dasharray":["case",["==",["get","active"],"true"],["literal",[.2,2]],["literal",[.2,2]],],"line-width":2}},{id:"gl-draw-point-outer",type:"circle",filter:["all",["==","$type","Point"],["==","meta","feature"],],paint:{"circle-radius":["case",["==",["get","active"],"true"],7,5,],"circle-color":"white"}},{id:"gl-draw-point-inner",type:"circle",filter:["all",["==","$type","Point"],["==","meta","feature"],],paint:{"circle-radius":["case",["==",["get","active"],"true"],5,3,],"circle-color":["case",["==",["get","active"],"true"],"orange","blue",]}},{id:"gl-draw-vertex-outer",type:"circle",filter:["all",["==","$type","Point"],["==","meta","vertex"],["!=","mode","simple_select"],],paint:{"circle-radius":["case",["==",["get","active"],"true"],7,5,],"circle-color":"white"}},{id:"gl-draw-vertex-inner",type:"circle",filter:["all",["==","$type","Point"],["==","meta","vertex"],["!=","mode","simple_select"],],paint:{"circle-radius":["case",["==",["get","active"],"true"],5,3,],"circle-color":"orange"}},{id:"gl-draw-midpoint",type:"circle",filter:["all",["==","meta","midpoint"],],paint:{"circle-radius":3,"circle-color":"orange"}},];

const styles = [
  // Polygon fill (active)
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#ff0000',
      'fill-opacity': 0.1,
    },
  },
  // Polygon outline (active)
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#ff0000',
      'line-width': 4,
    },
  },
  // Polygon fill (inactive)
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#ff0000',
      'fill-opacity': 0.1,
    },
  },
  // Polygon outline (inactive)
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#ff0000',
      'line-width': 4,
    },
  },
  // Vertex points
  {
    id: 'gl-draw-polygon-and-line-vertex-halo-active',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#FFF',
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-active',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 3,
      'circle-color': '#ff0000',
    },
  },
]

const GeofenceControl = ({
  value,
  onChange,
  mapboxApiKey = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1Ijoia21pcmFjbGUtaGRjIiwiYSI6ImNsMG55aDBqdjFrdDEzZG1nMjU3OHhmbTEifQ.FttXr9iJO5gZHcLUITwO8A',
  ...props
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPolygons, setCurrentPolygons] = useState(value || []);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);

  // console.log('GeofenceControl props', props);
  // console.log('geofence_mode', props.geofence_mode);
  // console.log('multi_geofence', props.multi_geofence);

  useEffect(() => {
    if (isModalVisible && mapContainer.current) {

      if (map.current) {
        map.current.remove();
        map.current = null;
        draw.current = null;
      }

      mapboxgl.accessToken = mapboxApiKey

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/kmiracle-hdc/clneys7ey07zh01qici3jgnwu',
        center: [
          39.392,
          48.551,
        ],
        zoom: 3,
      });

      draw.current = new MapboxDraw({
        displayControlsDefault: true,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: 'draw_polygon',
        styles,
      });

      map.current.addControl(draw.current);

      map.current.on('load', () => {
        map.current.resize();

        if (currentPolygons) {
          currentPolygons.forEach(polygon => {
            const feature = {
              type: 'Feature',
              properties: {},
              geometry: polygon,
            };
            draw.current.add(feature);
          });
        }
      });

      map.current.on('draw.create', updatePolygon);
      map.current.on('draw.delete', updatePolygon);
      map.current.on('draw.update', updatePolygon);
    }

  }, [isModalVisible, mapboxApiKey]);

  const updatePolygon = () => {
    if (draw.current) {
      const data = draw.current.getAll();
      if (data.features.length > 0) {
        const polygons = data.features.map(feature => feature.geometry);
        setCurrentPolygons(polygons);
      } else {
        setCurrentPolygons([]);
      }
    }
  };

  const handleOk = () => {
    onChange(currentPolygons);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setCurrentPolygons(value || []);
    setIsModalVisible(false);
  };

  const clearPolygon = () => {
    if (draw.current) {
      draw.current.deleteAll();
      setCurrentPolygons([]);
    }
  };

  const getPolygonSummary = () => {
    if (currentPolygons.length === 0) {
      return t('No geofences selected');
    } else {
      return t(`${currentPolygons.length} geofence(s) selected`);
    }

    // return polygon summary'
    // if (!value) return t('No polygon selected');
    
    // const coordinates = value.coordinates[0];
    // const pointCount = coordinates.length - 1; // Last point is same as first
    // return t('Polygon with %s points', pointCount);
  };

  return (
    <div className="polygon-drawing-control">
      <label>{props.label}</label>
      <div style={{ marginBottom: 8 }}>
        <Button 
          type="primary" 
          onClick={() => setIsModalVisible(true)}
          style={{ marginRight: 8 }}
        >
          {value ? t('Edit Geofence(s)') : t('Draw Geofence(s)')}
        </Button>
        {value && (
          <Button 
            onClick={() => onChange(null)}
            danger
          >
            {t('Clear')}
          </Button>
        )}
      </div>
      
      <div style={{ fontSize: '12px', color: '#666' }}>
        {getPolygonSummary()}
      </div>

      <Modal
        title={t('Draw Polygon on Map')}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        height={600}
        footer={[
          <Button key="clear" onClick={clearPolygon}>
            {t('Clear Polygon')}
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            {t('Cancel')}
          </Button>,
          <Button key="ok" type="primary" onClick={handleOk}>
            {t('Apply Polygon')}
          </Button>,
        ]}
      >
        <div 
          ref={mapContainer}
          style={{ 
            width: '100%', 
            height: '500px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px'
          }}
        />
        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
          {t('Click on the map to start drawing a polygon. Double-click to finish.')}
        </div>
      </Modal>
    </div>
  );
};

export default GeofenceControl;
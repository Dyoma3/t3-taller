<template>
  <v-app style="font-family: Itim">
    <v-app-bar
      app
      style="background: linear-gradient(90deg, rgba(72,83,253,1) 0%, rgba(129,234,220,1) 100%)"
      dark
    >
      <div class="d-flex align-center">

        <div class="ml-7" style="font-family: Satisfy;font-size:28px">
          Bin-Laden Airlines Control Center
        </div>
      </div>

      <v-spacer></v-spacer>

      <div class="mr-7" style="font-size:20px;color:purple">
        Our flights are the bomb!	&#128163;
      </div>
    </v-app-bar>

    <v-main>
      <v-container class="mt-2">
      <div class="d-flex align-center flex-column">
        <transition name="map">
          <div id="mapContainer" v-if="mapVisible" class="map-container"/>
        </transition>
        <div style="top: 300px; position:fixed">
          <v-progress-circular v-if="mapLoading" color="ternary" size="60" indeterminate/>
        </div>
      </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import io from 'socket.io-client';
import myImage from './assets/logo.png'

export default {
  name: 'App',

  data: () => ({
    map: null,
    socket: null,
    mapLoading: true,
    mapVisible: false,
    flights: [],
    airplanes: {},
    randomCoordinates: [-120, 40],
  }),
  mounted() {
    this.mapVisible = true;
    // timeout is for loading the map before the animation
    setTimeout(() => {
      mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN;
      this.map = new mapboxgl.Map({
        container: 'mapContainer',
        style: 'mapbox://styles/mapbox/streets-v11',
        bounds: [
          [180, 84],
          [-180, -60]
        ],
      });
      this.map.on('load', () => {
        this.map.addControl(new mapboxgl.FullscreenControl());
        this.map.resize();
        this.mapLoading = false;
        this.map.loadImage(myImage, (error, image) => {
          if (error) return;
          // Add the image to the map style.
          this.map.addImage('cat', image);
        });

        this.socket = io('wss://tarea-3-websocket.2021-1.tallerdeintegracion.cl', {
          path: '/flights',
        });
        this.socket.on('FLIGHTS', this.getFlights);
        this.socket.on('POSITION', this.getPosition);
        // this.socket.on('CHAT', this.getMessage);
        this.socket.emit('FLIGHTS', {});
      });
    }, 50);
  },
  methods: {
    getPosition(message) {
      if (!this.airplanes[message.code]) return;
      this.airplanes[message.code].setLngLat(
        [message.position[1], message.position[0]]
      );

    },
    getFlights(message) {
      this.flights = message;
      this.flights.forEach((flight) => {
        this.map.addSource(`${flight.code}Route`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [flight.origin[1], flight.origin[0]],
                [flight.destination[1], flight.destination[0]],
              ],
            },
          },
        });
        this.map.addLayer({
          id: `${flight.code}Route`,
          type: 'line',
          source: `${flight.code}Route`,
          layout: {
          'line-cap': 'round'
          },
          paint: {
            'line-color': 'green',
            'line-width': 3,
          },
        });
        // Add airplane marker
        const el = document.createElement('div');
        el.className = 'marker';
        const angleRadian = Math.atan(
          (flight.destination[0] - flight.origin[0])
          / (flight.destination[1] - flight.origin[1])
        );
        let angleDegrees = (angleRadian / Math.PI) * 180;
        if (
          angleDegrees >= 0
          && (flight.destination[0] - flight.origin[0]) < 0
        ) {
          angleDegrees += 180;
        } else if (
          angleDegrees < 0
          && (flight.destination[0] - flight.origin[0] > 0)
        ) {
          angleDegrees += 180;
        }
        this.airplanes[flight.code] = new mapboxgl.Marker({ element: el, rotation: -angleDegrees + 90 })
          .setLngLat([0, -80])
          .addTo(this.map);
      });
    },
    getMessage(message) {
      console.log(message);
    },
  },
};
</script>
<style>
.map-container {
  height: 500px;
  width:750px;
  overflow: hidden;
  border-style: solid;
  border-radius: 5px;
  border-color: #9e74d0;
  position: relative;
}
.marker {
  background-image: url('assets/plane.png');
  background-size: 100%;
  width: 30px;
  height: 30px;
  cursor: pointer;
}
.bounce-enter-active {
  animation: bounce 0.9s;
}
.bounce-leave-active {
  animation: bounce 0.3s reverse;
}
@keyframes bounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
.map-enter-active {
  transition: all 0.4s ease 1.2s;
}
.map-leave-active {
  transition: all 0.3s;
}
.map-enter,
.map-leave-to {
  top: -100vh;
  position: relative;
}
.map-enter-to,
.map-leave {
  top: 0vh;
  position: relative;
}
</style>

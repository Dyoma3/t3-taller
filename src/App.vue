<template>
  <v-app style="font-family: Itim">
    <v-app-bar
      app
      style="background: linear-gradient(90deg, rgba(72,83,253,1) 0%, rgba(129,234,220,1) 100%)"
      dark
    >
      <div class="d-flex align-center">

        <div class="ml-7" style="font-family: Satisfy;font-size:28px">
          Bin-Laden Control Center
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
        <v-speed-dial
          style="position:fixed;right:80px;bottom:60px"
          v-model="chat"
          transition="slide-y-reverse-transition"
        >
          <template v-slot:activator>
            <v-btn
              v-if="showingChat"
              color="#6c4a94"
              style="color:white; animation: bounceInLeft; animation-duration: 1s;
              height:50px;width:130px;font-size:22px;text-transform: none"
              rounded
            >
              <v-icon class="mr-2">
                mdi-chat
              </v-icon>
              Chat
            </v-btn>
          </template>
          <div style="width:50px;height:100px;background-color:black">

          </div>

        </v-speed-dial>
        <div
          v-if="showingFlights"
          class="mt-5"
          style="width:750px; animation: flipInX; animation-duration:1s"
        >
          <div
            class="d-flex justify-center align-center"
            style="width: 100%; height: 20px; background-color: #6c4a94; color:white;
            overflow:hidden;border-radius: 5px 5px 0px 0px"
          >
            Vuelos
          </div>
          <v-carousel
            height="140"
            hide-delimiter-background
            style="background-color: #9e74d0"
          >
            <v-carousel-item v-for="(carouselNumber, i) in carouselNumberArray" :key="i">
              <v-row
                class="align-center justify-space-between px-16 mt-0"
                style="height:140px;"
              >
                <div v-for="(n, j) in [0, 1, 2]" :key="j" style="height:100px">
                  <v-hover v-slot="{ hover }">
                  <div
                    v-if="flights.length > (carouselNumber * 3 + n)"
                    class="d-flex align-center justify-center flex-column"
                    style="height:100px;width:150px;background-color:#6c4a94;
                    border-radius: 20px; position:relative"
                  >
                    <div class="card-text">
                      #{{ flights[carouselNumber * 3 + n].code }}
                    </div>
                    <div class="card-text">
                      origen: {{ flights[carouselNumber * 3 + n].code }}
                    </div>
                    <div class="card-text">
                      destino: {{ flights[carouselNumber * 3 + n].code }}
                    </div>
                    <div
                      v-if="hover"
                      class="d-flex align-center justify-center"
                      style="position: absolute; height:100%; width:100%;
                      background-color: rgba(255, 255, 255, 0.7); border-radius:20px;
                      color: #6c4a94; font-size: 20px; font-weight: 600"
                    >
                      Ver más
                    </div>
                  </div>
                  </v-hover>
                </div>
              </v-row>
            </v-carousel-item>
          </v-carousel>
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
import 'animate.css';

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
    chat: false,
    showingChat: false,
    showingFlights: false,
  }),
  computed: {
    carouselNumberArray() {
      let number = parseInt(this.flights.length / 3, 10);
      if (this.flights.length % 3 > 0) {
        number += 1;
      }
      const numbersArray = [];
      for (let i = 0; i < number; i ++) {
        numbersArray.push(i);
      }
      return numbersArray;
    }
  },
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
    setTimeout(() => {
      this.showingChat = true;
    }, 1800);
    setTimeout(() => {
      this.showingFlights = true;
    }, 2700);
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
.card-text {
  color: white;
  font-size: 17px;
}
.map-enter-active {
  animation: bounceInDown 1s;
  animation-delay: 1s;
  transition: all 0.3s;
  transition-delay: 1s;
  /* transition: all 0.4s ease 1.2s; */
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

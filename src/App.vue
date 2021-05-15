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

        <!-- Chat -->
        <v-btn
          v-if="showingChat"
          color="#6c4a94"
          style="color:white; animation: bounceInLeft;animation-duration: 1s;
          height:50px; width:130px; font-size:22px; text-transform: none;
          position: fixed; bottom: 30px; right: 50px;"
          rounded
          @click="chat = !chat"
        >
          <v-icon class="mr-2">
            {{ chat ? 'mdi-close' : 'mdi-chat'}}
          </v-icon>
          {{ chat ? 'Close' : 'Chat' }}
        </v-btn>
        <transition name="chat">
          <div
            id="chatWindow"
            v-if="chat && confirmedNickName"
            class="chat"
            style="bottom: 90px; right: 15px;"
          >
            <div
              class="d-flex"
              style="width: 100%; position: absolute; bottom:10px;
              padding-right: 20px; padding-left: 20px"
            >
              <v-text-field
                class="mr-0"
                style="border-radius: 4px 0px 0px 4px; margin-bottom:-25px"
                outlined
                dense
                v-model="message"
                label="Message"
              />
              <v-btn
                class="ma-0"
                style="border-radius: 0px 4px 4px 0px;
                color: white; box-shadow: none; width: 76px;"
                @click="sendMessage"
                color="#9e74d0"
                height="40"
                :disabled="message === ''"
              >
                Send
              </v-btn>
            </div>
          </div>
        </transition>
        
        <transition name="chat">
          <div
            id="confirmNickNameWindow"
            v-if="chat && !confirmedNickName"
            class="chat d-flex align-center"
            style="bottom: 90px; right: 15px; height: 80px;
            padding-left: 20px; padding-right: 20px"
          >
            <v-text-field
              class="mr-0"
              style="border-radius: 4px 0px 0px 4px;margin-bottom:-25px"
              outlined
              dense
              v-model="nickName"
              label="Nickname"
            />
            <v-btn
              class="ma-0"
              style="border-radius: 0px 4px 4px 0px;
              color: white; box-shadow: none; width: 76px;"
              @click="confirmedNickName = true"
              color="#9e74d0"
              height="40"
              :disabled="nickName === ''"
            >
              Confirm
            </v-btn>
          </div>
        </transition>

        <!-- Flights Carousel -->
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
                class="align-center justify-space-between mt-0"
                style="height:140px;padding-right: 85px; padding-left:85px"
              >
                <div v-for="(n, j) in [0, 1, 2]" :key="j" style="height:100px">
                  <v-hover
                    v-if="flights.length > (carouselNumber * 3 + n)"
                    v-slot="{ hover }"
                  >
                    <div
                      class="d-flex align-center justify-center flex-column"
                      style="height:100px;width:180px;background-color:#6c4a94;
                      border-radius: 20px; position:relative"
                    >
                      <div class="card-text">
                        Flight #{{ flights[carouselNumber * 3 + n].code }}
                      </div>
                      <div class="card-text">
                        {{ flights[carouselNumber * 3 + n].airline }}
                      </div>
                      <div
                        v-if="hover"
                        class="d-flex align-center justify-center card-hover"
                        @click="openFlight(flights[carouselNumber * 3 + n].code)"
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

      <!-- Flight Dialog -->
      <v-dialog
        :fullscreen="$vuetify.breakpoint.smAndDown"
        transition="dialog-bottom-transition"
        v-model="dialogVisible"
        width="540"
        style="background-color:#9e74d0"
      >
          <div
            v-if="dialogCode"
            class="d-flex align-center flex-column pt-3"
            style="background-color:#6c4a94; width: 540px;"
          >
            <div
              class="d-flex align-center justify-center"
              style="height: 40px; background-color: #6c4a94; font-size: 20px;
              color: white; width:100%"
            >
              #{{ dialogCode }}
            </div>
            <div class="dialog-text">
              Airline: {{ dialogFlight.airline }}
            </div>
            <div class="dialog-text">
              Plane: {{ dialogFlight.plane }}
            </div>
            <div class="dialog-text">
              Number of Seats: {{ dialogFlight.seats }}
            </div>
            <div class="dialog-text">
              Origin {{ dialogFlight.origin[0] }}Lat
              , {{dialogFlight.origin[1]}}Lon
            </div>
            <div class="dialog-text">
              Destination {{ dialogFlight.destination[0] }}Lat
              , {{dialogFlight.destination[1]}}Lon
            </div>
            <v-row class="mx-0 mb-5 mt-3 dialog-text">
              <v-col
                class="ma-0 pa-0 d-flex justify-center"
                style="font-size: 22px"
                cols="12">
                Passengers
              </v-col>
              <v-col
                class="mb-2 pa-0 d-flex justify-center col-6"
                v-for="(passenger, i) in dialogFlight.passengers"
                :key="i"
              >
                {{ passenger.name }}, {{ passenger.age }}
              </v-col>
            </v-row>
          </div>
      </v-dialog>
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
    dialogVisible: false,
    dialogCode: null,
    nickName: '',
    confirmedNickName: false,
    message: '',
    messages: [],
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
    },
    dialogFlight() {
      let selectedFlight = null;
      this.flights.forEach((flight) => {
        if (flight.code === this.dialogCode) {
          selectedFlight = flight;
        }
      });
      return selectedFlight;
    },
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
        this.socket.on('CHAT', this.getMessage);
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
      message.forEach((flight) => {
        this
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
    openFlight(code) {
      this.dialogCode = code;
      this.dialogVisible = true;
    },
    sendMessage() {
      this.socket.emit('CHAT', {
        name: this.nickName,
        message: this.message,
      });
      this.message = '';
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
.card-hover {
  position: absolute;
  height:100%;
  width:100%;
  background-color:rgba(255, 255, 255, 0.7);
  border-radius:20px;
  color: #6c4a94;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
}
.dialog-text {
  margin-top: 5px;
  color: white;
  font-size: 20px;
}
.chat {
  width:300px;
  height:400px;
  border-style: solid;
  border-radius: 10px;
  border-color: #9e74d0;
  border-width: 1px;
  background-color: #efeef1;
  position: fixed;
  z-index: 2;
}
.chat-enter-active {
  animation: zoomIn 0.3s;
}
.chat-leave-active {
  animation: zoomOut 0.3s;
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

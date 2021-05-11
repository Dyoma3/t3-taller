<template>
  <v-app style="font-family: Itim">
    <v-app-bar
      app
      style="background: linear-gradient(90deg, rgba(72,83,253,1) 0%, rgba(129,234,220,1) 100%)"
      dark
    >
      <div class="d-flex align-center">

        <div class="ml-7" style="font-family: Satisfy;font-size:28px">
          Bin-Laden Airlines
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
        <div id="mapContainer" class="map-container"/>
      </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import mapboxgl from 'mapbox-gl';

export default {
  name: 'App',

  data: () => ({
    map: null,
    mapLoading: true,
  }),
  mounted() {
    mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN;
    this.map = new mapboxgl.Map({
      container: 'mapContainer',
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: -1,
      center: [0, 0],
    });
    this.map.on('load', () => {
      this.map.resize();
      this.mapLoading = false;
      this.map.fitBounds([
        [180, 84],
        [-180, -60]
      ]);
    });
  },
};
</script>
<style scoped>
.map-container {
  height: 500px;
  width:750px;
  overflow: hidden;
}
</style>

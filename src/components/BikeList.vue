<template>
  <div class="card-deck" style="padding: 1vw; padding-top: 0px;">
    <div v-if="bikes.length" class="row flex-nowrap">
      <Bike
        v-for="bike in bikes.slice().reverse()"
        v-bind:key="bike.id"
        v-bind:bike="bike"
        v-bind:currentUser="currentUser"
        v-bind:isSignedIn="isSignedIn"
      />
      <div class="card card-special">
        <div class="card-body text-center d-flex align-items-center justify-content-center">
          <button data-toggle="modal" data-target="#newBikeModal" type="button" class="btn btn-dark card-title">Add New Bike</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Bike from "./Bike.vue";
import { eventBus } from "../main";

export default {
    name: "BikeList",

    components: { Bike },

    props: {
      currentUser: String,
    },

    data() {
      return {
        error: "",
        success: "",
        bikes: [],
        filters: new Map(),
        following: [],
        isSignedIn: false,
      };
    },

    created: function() {

      eventBus.$on("create-bike-success", () => {
        this.loadBikes();
      });

      eventBus.$on("log-in-success", res => {
        this.isSignedIn = true;
        this.loadBikes();
      });

      eventBus.$on("sign-up-success", res => {
        this.isSignedIn = true;
        this.loadBikes();
      });

      eventBus.$on("log-out-success", () => {
        this.isSignedIn = false;
        this.loadBikes();
      });

      eventBus.$on("user-logged-in", response => {
        this.isSignedIn = true;
        this.loadBikes();
      });

      eventBus.$on("new-bike-created", () => {
        this.loadBikes();
      });

      eventBus.$on("bike-deleted", () => {
        this.loadBikes();
      });

      eventBus.$on("bike-updated", () => {
        this.loadBikes();
      });
    },

    mounted: function() {
      this.loadBikes();
    },

    methods: {
      loadBikes: function() {
        axios.get("/api/bikes").then(response => {
          this.bikes = response.data.filter(b => b.owner === this.currentUser);
        });
      },
    }
};
</script>

<style scoped>


body{
  overflow: scroll !important;
}

.card-title{
  font-size: 20px;
}

.card-body{
  font-size: 15px;
}

.card{
  margin-right: 15px;
  margin-left: 0px;
  min-width: 260px;
  max-width: 260px;
}

.card-deck{
  margin-left: 0vw;
}

.card-special{
  background-color: rgba(142, 85, 114, 0.5);
  margin-right: 30px;
}
</style>

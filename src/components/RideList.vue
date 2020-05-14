<template>
  <div class="card-deck" style="padding: 1vw; padding-top: 0px;">
    <div v-if="rides.length" class="row flex-nowrap">
      <Ride
        v-for="ride in rides.slice().reverse()"
        v-bind:key="ride.id"
        v-bind:ride="ride"
        v-bind:currentUser="currentUser"
        v-bind:isSignedIn="isSignedIn"
        v-bind:userRides="userRides"
      />
      <!-- <div class="card card-special">
        <div class="card-body text-center d-flex align-items-center justify-content-center">
          <button data-toggle="modal" data-target="#newBikeModal" type="button" class="btn btn-dark card-title">Add New Bike</button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Ride from "./Ride.vue";
import { eventBus } from "../main";

export default {
    name: "RideList",

    components: { Ride },

    props: {
      currentUser: String,
      userRides: Boolean,
    },

    data() {
      return {
        error: "",
        success: "",
        rides: [],
        filters: new Map(),
        following: [],
        isSignedIn: false,
      };
    },

    created: function() {

      eventBus.$on("reserve-ride-success", () => {
        this.loadRides();
      });

      eventBus.$on("reviewed-ride-success", () => {
        this.loadRides();
      });

      eventBus.$on("stolen-ride-success", () => {
        this.loadRides();
      });

      eventBus.$on("arrived-ride-success", () => {
        this.loadRides();
      });

      eventBus.$on("finished-ride-success", () => {
        this.loadRides();
      });

      eventBus.$on("use-ride-success", () => {
        this.loadRides();
      });

      eventBus.$on("cancel-ride-success", () => {
        this.loadRides();
      });

      eventBus.$on("confirm-ride-success", () => {
        this.loadRides();
      });

      eventBus.$on("returned-ride-success", () => {
        this.loadRides();
      });

      eventBus.$on("create-bike-success", () => {
        this.loadRides();
      });

      eventBus.$on("log-in-success", () => {
        this.isSignedIn = true;
        this.loadRides();
      });

      eventBus.$on("sign-up-success", () => {
        this.isSignedIn = true;
        this.loadRides();
      });

      eventBus.$on("log-out-success", () => {
        this.isSignedIn = false;
        this.loadRides();
      });

      eventBus.$on("user-logged-in", () => {
        this.isSignedIn = true;
        this.loadRides();
      });

      eventBus.$on("new-bike-created", () => {
        this.loadRides();
      });
    },

    mounted: function() {
      this.loadRides();
    },

    methods: {
      loadRides: function() {
        if (this.userRides) {
          axios.get("/api/rides").then(response => {
            this.rides = response.data;
          });
        } else {
          axios.get("/api/rides/own").then(response => {
            this.rides = response.data;
          });
        }
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
}
</style>

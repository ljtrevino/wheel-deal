<template>
  <div class="post-list">
    <div v-if="bikes.length">
      <Post
        v-for="bike in bikes.slice().reverse()"
        v-bind:key="bike.id"
        v-bind:bike="bike"
        v-bind:currentUser="username"
        v-bind:isSignedIn="isSignedIn"
      />
    </div>
    <div v-else>
      <p style="text-align: center">There are no bikes to display!</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Post from "./Post.vue";
import { eventBus } from "../main";

export default {
    name: "PostList",

    components: { Post },

    data() {
      return {
        error: "",
        success: "",
        bikes: [],
        filters: new Map(),
        username: "",
        following: [],
        isSignedIn: false,
        bikesVisibleOnMap: []
      };
    },

    mounted(){
      this.loadBikes();
      axios.get('/api/users/current')
      .then(response => {
        if (response !== ""){
          this.username = response.data.username;
          this.isSignedIn = true;
        } else {
          this.username = "Not Logged In";
          this.isSignedIn = false;
        }
      });
    },

    created: function() {

      eventBus.$on("create-bike-success", () => {
        this.loadBikes();
      });

      eventBus.$on("add-filter", filter => {
        this.filters.set(filter[0], filter[1]);
        this.loadBikes();
      });

      eventBus.$on("remove-filter", filter => {
        this.filters.delete(filter);
        this.loadBikes();
      });

      eventBus.$on("log-in-success", res => {
        this.isSignedIn = true;
        this.username = `${res.data.username}`;
        this.loadBikes();
      });

      eventBus.$on("sign-up-success", res => {
        this.isSignedIn = true;
        this.username = `${res.data.username}`;
        this.loadBikes();
      });

      eventBus.$on("log-out-success", () => {
        this.isSignedIn = false;
        this.loadBikes();
      });

      eventBus.$on("user-logged-in", response => {
        this.isSignedIn = true;
        this.username = `${response}`;
        this.loadBikes();
      });

      eventBus.$on("new-bike-created", () => {
        this.loadBikes();
      });

      eventBus.$on("map-changed", res => {
        this.bikesVisibleOnMap = res;
        this.loadBikes();
      });
    },

    methods: {
      loadBikes: function() {
        if (this.filters.has("availability")){ // filter by availability
          axios.put("/api/bikes/availability", {start: this.filters.get("availability").start, end: this.filters.get("availability").end})
          .then(response => {
            this.bikes = response.data;
            if (this.filters.has("location")){ // filter by location
              let visible_bike_ids = this.bikesVisibleOnMap.map(bike => bike.id)
              this.bikes = this.bikes.filter(b => visible_bike_ids.includes(b.id))
            }
            if (this.filters.has("type")){ // filter by bike type
              this.bikes = this.bikes.filter(b => b.type === this.filters.get("type"));
            }
            if (this.filters.has("price")){ // filter by price range
              this.bikes = this.bikes.filter(b => b.daily <= this.filters.get("price").to && b.daily >= this.filters.get("price").from);
            }
            if (!this.filters.has("location")){ // solves issue of bike markers disappearing from map after they go out of view once
              eventBus.$emit("bike-posts-loaded", this.bikes);
            }
          });
        } else {
          axios.get("/api/bikes").then(response => {
            this.bikes = response.data;

            if (this.filters.has("location")){ // filter by location
              let visible_bike_ids = this.bikesVisibleOnMap.map(bike => bike.id)
              this.bikes = this.bikes.filter(b => visible_bike_ids.includes(b.id))
            }
            if (this.filters.has("type")){ // filter by bike type
              this.bikes = this.bikes.filter(b => b.type === this.filters.get("type"));
            }
            if (this.filters.has("price")){ // filter by price range
              this.bikes = this.bikes.filter(b => b.daily <= this.filters.get("price").to && b.daily >= this.filters.get("price").from);
            }
            if (!this.filters.has("location")){ // solves issue of bike markers disappearing from map after they go out of view once
              eventBus.$emit("bike-posts-loaded", this.bikes);
            }
          });
        }
      },
    }
};
</script>

<style scoped>
</style>

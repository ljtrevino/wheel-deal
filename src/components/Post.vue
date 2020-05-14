<template>
  <div>
    <div class="card mb-3" v-bind:id="bike.id">
      <div class="row no-gutters">
        <div class="col-lg-2 d-flex align-items-center justify-content-center" style="margin-left: 10px;">
          <img v-if="bike.url === ''" class="card-img" src="https://i.imgur.com/ZY43CVv.png"/>
          <img v-else v-bind:src="bike.url" class="card-img">
        </div>
        <div class="col-lg">
          <div class="card-body mb-0" v-on:click="navigateToListing()">
            <span>
              <h4 class="card-title mb-1" style="display: inline-block;">{{ this.bike.title }}</h4>
              <h4 class="card-rating">★ {{this.rating}}</h4>
            </span>
            <div>
              <p class="card-text mb-0">{{ this.bike.type }}</p>
            </div>
            <span>
              <p class="card-text mb-0" style="display: inline-block;"><small class="text-muted">Posted by {{ this.bike.owner }}</small></p>
              <h4 class="card-price">${{ this.bike.daily }} / day</h4>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "Post",

  props: {
    bike: Object,
    currentUser: String,
    isSignedIn: Boolean,
  },

  data() {
    return {
      username: "",
      rating: 5.0,
    };
  },

  methods: {
    reserveBike: function() {
      axios.post('/api/rides/', {bikeId: this.bike.id, start: "2019-12-02 15:35:06", end: "2019-12-09 00:00:00"})
        .then((res) => {
          eventBus.$emit("reserve-ride-success", res);
        })
        .catch(err => {
          eventBus.$emit("reserve-ride-error", err);
        })
        .then();
    },
    getRating: function() {
      axios.get('/api/reviews/' + this.bike.id + '/rating', {bike_id: this.bike.id})
        .then((res) => {
          this.rating = res.data;
        });
    },
    navigateToListing: function(){
      if (this.isSignedIn){
        this.$router.push({name: `Listing`, params: {bike: this.bike, rating: this.rating}});
      } else {
        eventBus.$emit("must-log-in");
      }
    },
  },

  created(){
  },

  mounted(){
    axios.get('/api/reviews/' + this.bike.id + '/rating', {bike_id: this.bike.id})
      .then((res) => {
        this.rating = res.data;
      });
  },
};
</script>

<style scoped>
textarea {
  border-radius: 0px;
}
</style>

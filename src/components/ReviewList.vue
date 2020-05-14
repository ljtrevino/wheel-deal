<template>
  <div class="card-deck" style="padding: 1vw; padding-top: 0px;">
    <div v-if="reviews.length" class="row flex-nowrap">
      <Review
        v-for="review in reviews.slice().reverse()"
        v-bind:key="review.id"
        v-bind:review="review"
        v-bind:isSignedIn="isSignedIn"
      />
    </div>
    <div v-else>
      <p style="text-align: center; margin-top:20px;">There are no reviews to display!</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Review from "./Review.vue";
import { eventBus } from "../main";

export default {
    name: "ReviewList",

    components: { Review },

    props: {
      bike_id: Number,
    },

    data() {
      return {
        error: "",
        success: "",
        reviews: [],
        filters: new Map(),
        following: [],
        isSignedIn: false,
      };
    },

    methods: {
      loadReviews: function() {
        axios.get("/api/reviews/for/"+ this.bike_id).then(response => {
          this.reviews = response.data;
        });
      },
    },

    created: function() {
      eventBus.$on("user-logged-in", () => {
        this.isSignedIn = true;
        this.loadReviews();
      });
    },

    mounted: function() {
      let vm = this;
      Vue.nextTick(function () {
        vm.loadReviews();
      });
    },
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

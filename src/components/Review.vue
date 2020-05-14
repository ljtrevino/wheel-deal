<template>
  <div>
    <div class="card">
      <!-- <img src="../../public/images/bikeDemo.png" class="card-img-top" alt="..."> -->
      <div class="card-body">
        <h4>{{this.review.reviewer}}&nbsp;&nbsp;<span class="card-rating">★ {{this.review.rating}}</span></h4>
        <!-- <h5 class="card-title">Rating: {{this.review.rating}}</h5> -->
        <p class="card-text" style="font-size: 15px;">{{ this.review.text }}</p>
        <p class="card-text text-muted" style="display: inline-block;">Reviewed created on {{ this.review.timestamp }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "Review",

  props: {
    review: Object,
    currentUser: String,
    isSignedIn: Boolean,
  },

  data() {
    return {

    };
  },

  methods: {
  },
};
</script>

<style scoped>
textarea {
  border-radius: 0px;
}

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
  max-width: 260px;
  min-width: 260px;
}

.card-deck{
  margin-left: 0vw;
}

.card-special{
  background-color: rgba(142, 85, 114, 0.5);
}
</style>

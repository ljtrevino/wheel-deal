<template>
  <div>
    <div class="card">
      <!-- <img src="../../public/images/bikeDemo.png" class="card-img-top" alt="..."> -->
      <div class="card-body">
        <h5 class="card-title">Ride ID: {{this.ride.id}}</h5>
        <p class="card-text">Start: {{ formattedStart }}</p>
        <p class="card-text">End: {{ formattedEnd }}</p>
        <h5 class="card-title">Status: {{ this.ride.status }}</h5>
        <div v-if="this.ride.status === 'arrived'">
          <h5 class="card-title">Waiting for bike owner to confirm ride start.</h5>
        </div>
        <div v-if="this.ride.status === 'finished'">
          <h5 class="card-title">Waiting for bike owner to confirm bike return.</h5>
        </div>
      </div>
      <div class="row" style="margin-left: 0.5vw; margin-right: 0.5vw; padding-bottom: 5px">

        <div class="col" v-if="this.ride.status === 'reserved' && this.userRides" style="padding: 0px; margin-right: 5px;">
          <button class="btn btn-dark" v-on:click="startRide()" style="width: 100%">Start Ride</button>
        </div>
        <div class="col" v-if="this.ride.status === 'riding' && this.userRides" style="padding: 0px; margin-right: 5px;">
          <button class="btn btn-dark" v-on:click="endRide()" style="width: 100%">End Ride</button>
        </div>
        <div class="col" v-if="(this.ride.status === 'reserved' || this.ride.status === 'arrived') && this.userRides" style="padding: 0px; margin-left: 5px;">
          <button class="btn btn-light" v-on:click="cancelRide()" style="width: 100%; border: 2px solid #e1e5ea;">Cancel Ride</button>
        </div>

        <div class="col" v-if="this.ride.status === 'arrived' && !this.userRides" style="padding: 0px; margin-right: 5px;">
          <button class="btn btn-dark" v-on:click="confirmRide()" style="width: 100%">Confirm Ride</button>
        </div>
        <div class="col" v-if="this.ride.status === 'finished' && !this.userRides" style="padding: 0px; margin-right: 5px;">
          <button class="btn btn-dark" v-on:click="finishRide()" style="width: 100%">Finish Ride</button>
        </div>

        <div class="col" v-if="this.ride.status === 'returned' && this.userRides" style="padding: 0px; margin-left: 5px;">
          <button data-toggle="modal" v-bind:data-target="'#rateRide'+ride.id" class="btn btn-dark" type="button" style="width: 100%; border: 2px solid #e1e5ea;">Rate Bike</button>
        </div>

        <div class="col" v-if="(this.ride.status === 'riding' || this.ride.status === 'finished') && !this.userRides && this.isLate()" style="padding: 0px; margin-left: 5px;">
          <button data-toggle="modal" v-bind:data-target="'#stolen'+ride.id" class="btn btn-dark" type="button" style="width: 100%; border: 2px solid #e1e5ea;">Report Stolen</button>
        </div>
      </div>
    </div>


    <div class="modal" tabindex="-1" role="dialog" v-bind:id="'rateRide'+ride.id">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Rate Bike (ID: {{this.ride.bikeid}})</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <!-- <div class="form-group">
              <label class="col-form-label">Rating (out of 5)</label>
              <input v-model="rating" type="number" class="form-control" />
            </div> -->
            <div class="form-group">
              <label class="col-form-label">Rating (out of 5)</label>
              <select v-model="rating" class="form-control">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option default>5</option>
              </select>
            </div>
            <div class="form-group">
              <label class="col-form-label">Comment</label>
              <input v-model="comment" type="text" class="form-control" aria-labelledby="sign-up-password-label"/>
            </div>
          </div>
          <div class="modal-footer">
            <button v-on:click="rateRide" type="button" class="btn btn-dark">Submit Rating</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" tabindex="-1" role="dialog" v-bind:id="'stolen'+ride.id">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Are you sure you want to report this bike stolen?</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>You will receive the damage fee for this bike.</p>
          </div>
          <div class="modal-footer">
            <button v-on:click="stolenRide" data-dismiss="modal" type="button" class="btn btn-dark">Report Stolen</button>
            <button data-dismiss="modal" type="button" class="btn btn-dark">Cancel</button>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";
import moment from 'moment';

export default {
  name: "Ride",

  props: {
    ride: Object,
    currentUser: String,
    isSignedIn: Boolean,
    userRides: Boolean,
  },

  data() {
    return {
      username: "",
      rating: 5,
      comment: "",
    };
  },

  computed: {
    formattedStart: function () {
      return moment(this.ride.start).format('MM/DD/YYYY')
    },
    formattedEnd: function () {
      return moment(this.ride.end).format('MM/DD/YYYY')
    }
  },

  methods: {
    startRide: function() {
      axios.put('api/rides/arrived/' + this.ride.id, {})
        .then((res) => {
          eventBus.$emit("arrived-ride-success", res);
        })
        .catch(err => {
          eventBus.$emit("arrived-ride-error", err);
        })
    },
    endRide: function() {
      axios.put('api/rides/finished/' + this.ride.id, {})
        .then((res) => {
          eventBus.$emit("finished-ride-success", res);
        })
        .catch(err => {
          eventBus.$emit("finished-ride-error", err);
        })
    },
    cancelRide: function() {
      axios.put('api/rides/cancel/' + this.ride.id, {})
        .then((res) => {
          eventBus.$emit("cancel-ride-success", res);
        })
        .catch(err => {
          eventBus.$emit("cancel-ride-error", err);
        })
    },
    confirmRide: function() {
      axios.put('api/rides/confirm/' + this.ride.id, {})
        .then((res) => {
          eventBus.$emit("confirm-ride-success", res);
        })
        .catch(err => {
          eventBus.$emit("confirm-ride-error", err);
        })
    },
    finishRide: function() {
      axios.put('api/rides/returned/' + this.ride.id, {})
        .then((res) => {
          eventBus.$emit("returned-ride-success", res);
        })
        .catch(err => {
          eventBus.$emit("returned-ride-error", err);
        })
    },
    rateRide: function(){
      axios.post('api/reviews', {rideid: this.ride.id, recipient: this.ride.bikeid, rating: this.rating, text: this.comment})
        .then(() => {
          axios.put('api/rides/reviewed/' + this.ride.id, {})
            .then((res) => {
              eventBus.$emit("reviewed-ride-success", res);
            })
            .catch(err => {
              eventBus.$emit("reviewed-ride-error", err);
            })
          $('#rateRide'+this.ride.id).modal('hide');
        })

    },
    stolenRide: function(){
      var fee = 0;
      axios.get('api/bikes/bike/' + this.ride.bikeid + '/damageFee')
        .then((res) => {
          fee = res.data;
          axios.post('/api/users/account/balance/transfer', {amount: -fee.damagefee, user: this.ride.user})
            .then(() => {
              axios.put('/api/rides/stolen/' + this.ride.id)
                .then(() => {
                  eventBus.$emit("stolen-ride-success", res);
                  eventBus.$emit("balance-updated", fee.damagefee);
                });
            });
        });
    },
    isLate: function() {
      return moment(this.ride.end).isBefore(moment().endOf('day'));
    }
    // editPost: function() {
    //   if (this.post.id.match(/^[0-9a-z-]+$/i)){
    //     axios.put('/api/freets/freet/'+this.post.id, {id: this.post.id, content: this.content})
    //       .then((res) => {
    //         eventBus.$emit("edit-post-success", res);
    //       })
    //       .catch(err => {
    //         eventBus.$emit("edit-post-error", err);
    //       })
    //       .then(() => (this.url = ""));
    //   } else {
    //     axios.get('/badID')
    //       .then(() => {
    //         eventBus.$emit("bad-id-error", this.post);
    //       })
    //       .catch(err => {
    //         eventBus.$emit("bad-id-error", err);
    //       })
    //       .then(() => (this.url = ""));
    //   }
    // },

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

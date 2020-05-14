<template>
  <div style="margin: 20px;">
    <div class="row">
      <div class="col-3">
        <div class="row" style="height: calc(50vh - 75px)">
          <!-- bike image -->
          <div class="col-lg">
            <img v-if="!bike || bike.url === ''" class="card-img" src="https://i.imgur.com/ZY43CVv.png"/>
            <img v-else v-bind:src="bike.url" class="card-img">
          </div>
        </div>
        <div class="row d-flex align-items-end justify-content-center" style="height: calc(50vh - 75px)">
          <!-- bike location map -->
          <div class="col-lg" style="height: 100%">
            <GmapMap
            :center="{lat: this.bike.latitude, lng: this.bike.longitude}"
            :zoom="14"
            style="width: 100%; height: 100%"
            >
            <GmapMarker ref="myMarker"
              :position="{lat: this.bike.latitude, lng: this.bike.longitude}"
              :draggable="false"
            />
          </GmapMap>
          </div>
        </div>
      </div>
      <div class="col-9">
        <h2>{{this.bike.title}}&nbsp;&nbsp;<span class="card-rating" style="float:none">★ {{this.rating}}</span></h2>
        <p class="card-text text-muted" style="display: inline-block;">Posted by {{ this.bike.owner }}</p>
        <h4 class="row"><span class="col-4">{{this.getEmoji(this.bike.type)}} {{this.bike.type}} Bike</span>  <span class="col-8 text-right" style="color: #8ACB88; width: 100%">${{this.bike.daily}}/day &nbsp;&nbsp;&nbsp;&nbsp; ${{this.bike.weekly}}/week &nbsp;&nbsp;&nbsp;&nbsp; ${{this.bike.monthly}}/month</span></h4>
        <br>
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <label class="input-group-text" for="datetimerange">Reservation Timeframe</label>
          </div>
            <input id="datetimerange" type="text" class="form-control" name="datetimes" />
        </div>

        <button v-if="this.username === this.bike.owner" disabled type="button" class="btn btn-dark mb-2 mt-1" style="width: 100%;" >Reserve this Bike</button>
        <button v-else v-on:click="myChangeFunction" type="button" data-target="#confirmReservationModal" class="btn btn-dark mb-2 mt-1" style="width: 100%;">Reserve this Bike</button>
        <div class="card-deck section" style="margin-top:10px;">
        </div>

        <div style="font-size: 30px; padding-left: 1vw; padding-top: 0.25vw;">
          Reviews
        </div>
        <div class="card-deck section" style="padding: 1vw; padding-top: 0px; overflow: scroll;">
          <ReviewList
            v-bind:bike_id="bike.id"
          />
        </div>



      </div>
    </div>


    <div class="modal" tabindex="-1" role="dialog" id="confirmReservationModal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Reservation</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>This reservation will cost ${{this.totalPrice}} in total.  If the bike is not returned, the damage fee is ${{this.bike.damagefee}}.  Confirm to complete your reservation.</p>
          </div>
          <div class="modal-footer">
            <button v-on:click="createReservation" type="button" class="btn btn-dark">Confirm</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" tabindex="-1" role="dialog" id="reservationCompleteModal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reservation Complete</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Your reservation is complete!  To view the details, go to your account page!</p>
          </div>
          <div class="modal-footer">
            <button data-dismiss="modal" type="button" class="btn btn-dark">Close</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" tabindex="-1" role="dialog" id="reservationErrorModal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reservation Error</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Sorry, you do not have suffient funds in your account to complete this transaction!</p>
          </div>
          <div class="modal-footer">
            <button data-dismiss="modal" type="button" class="btn btn-dark">Close</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";
import moment from 'moment'
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import ReviewList from "../components/ReviewList.vue";


export default {
  name: 'app',
  data () {
    return {
      bike: {},
      rating: 5.0,
      totalPrice: 0,
      startTime: '',
      endTime: '',
      username: '',
      unavailableDates: [],
      balance: 0,
    }
  },
  created: function() {
    eventBus.$on("user-logged-in", (res) => {
      this.username = res;
    });
  },
  methods: {
    initializeState: function(){
      if (this.$route.params.bike){
        this.bike = this.$route.params.bike;
        localStorage.bike = JSON.stringify(this.$route.params.bike);
      } else {
        this.bike = JSON.parse(localStorage.bike);
      }
      if (this.$route.params.rating){
        this.rating = this.$route.params.rating;
        localStorage.rating = JSON.stringify(this.$route.params.rating);
      } else {
        this.rating = JSON.parse(localStorage.rating);
      }
    },
    getPosition: function(str, m, i) {
      return str.split(m, i).join(m).length;
    },
    myChangeFunction: function () {
      if (document.getElementById('datetimerange') !== null){
        let datetimerange = document.getElementById('datetimerange').value;
        this.startTime = moment(datetimerange.substr(0, datetimerange.trim().indexOf(' ')));
        let tempStart = moment(datetimerange.substr(0, datetimerange.trim().indexOf(' ')));
        this.endTime = moment(datetimerange.substr(this.getPosition(datetimerange, ' ', 2)+1, this.getPosition(datetimerange, ' ', 1)));

        let weekDiff = 0;
        let dayDiff = 0;
        let monthDiff = this.endTime.diff(this.startTime, 'months');
        tempStart.add(monthDiff, 'months');

        if (this.endTime.diff(tempStart, 'days')+1 >= 7) {
          weekDiff = parseInt((this.endTime.diff(tempStart, 'days')+1)/7);
          dayDiff = (this.endTime.diff(tempStart, 'days')+1)%7;
        } else {
          dayDiff = (this.endTime.diff(tempStart, 'days')+1);
        }

        this.totalPrice = monthDiff * this.bike.monthly + weekDiff * this.bike.weekly + dayDiff * this.bike.daily;
        $('#confirmReservationModal').modal('show');
      }
    },
    createReservation: function(){
      // get balance of user
      axios.get('/api/users/account/balance')
      .then(response => {
          this.balance = response.data.balance;
          // check if balance is suffient to make purchase
          if (this.balance >= this.totalPrice) {
            // make ride
          axios.post('/api/rides', {bikeId: this.bike.id, start: this.startTime, end: this.endTime})
          .then(() => {
              // update money in account
              axios.post('/api/users/account/balance/transfer', {amount: this.totalPrice, user: this.bike.owner})
              .then(() => {
                eventBus.$emit("balance-updated", this.totalPrice);
                $('#confirmReservationModal').modal('hide');
                $('#reservationCompleteModal').modal('show');
              });
          });
          } else {
            $('#confirmReservationModal').modal('hide');
            $('#reservationErrorModal').modal('show');
          }
      });
    },
    getEmoji: function(title){
      if (title === 'Mountain'){
        return '⛰️'
      } else if (title === 'Road'){
        return '🛣️'
      } else if (title === 'Hybrid'){
        return '🚲'
      } else {
        return ''
      }
    },
    isDateInvalid: function(date){
      let result = false
      this.unavailableDates.forEach(function(item){
        if (moment(date).isSame(moment(item))) {
          result = true
        }
      });
      return result;
    },
    sameDay: function(d1, d2) {
      return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
    }
  },
  components: {
    DateRangePicker,
    ReviewList,
  },
  mounted() {
    this.initializeState();

    axios.get('/api/users/current')
    .then(response => {
      if (response !== ""){
        this.username = response.data.username;
      } else {
        this.username = "Not Logged In";
      }
    });

    let isDateInvalid = this.isDateInvalid;

    axios.get('/api/bikes/bike/'+ this.bike.id +'/unavailability')
    .then(response => {
        this.unavailableDates = response.data.map(d => moment(d.replace('_','-').replace('_','-'),'MM-DD-YY'));
    }).then(() => {
      $(function() {
        $('input[name="datetimes"]').daterangepicker({
          timePicker: false,
          startDate: moment().startOf('hour'),
          endDate: moment().startOf('hour').add(32, 'hour'),
          maxDate: moment('2020-02-29', 'YYYY-MM-DD'),
          applyButtonClasses: "btn-dark",
          isInvalidDate: isDateInvalid,
          autoApply: true,
          locale: {
            format: 'YYYY-MM-DD'
          }
        });
      });
    });
  },
};
</script>

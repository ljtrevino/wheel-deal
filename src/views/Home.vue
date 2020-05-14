<template>
  <div>
    <FilterBar/>
    <div v-if="showLoginAlert" class="alert alert-info alert-dismissible fade show" role="alert">
      <strong>Don't be a third wheel!</strong>  Log in to be able to reserve a bike and see all bike details, ratings, and reviews.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="row" style="margin: 0.5vw;">
      <div class="col" style="overflow: scroll;height: calc(100vh - 70px - 49px - 20px - 10px)" id="theScrollContainer">
        <div v-if="isSignedIn" class="row">
          <div class="col">
            <button v-on:click="" type="button" data-toggle="modal" data-target="#pickForMe" class="btn btn-dark mb-2 mt-1" style="width: 100%;">Pick a bike for me</button>
          </div>
          <div class="col">
            <button v-on:click="startCreateBike()" type="button" data-toggle="modal" class="btn btn-dark mb-2 mt-1" style="width: 100%;">Create New Bike Listing</button>
          </div>
        </div>
        <div class="card mb-3" v-if="showCreateCard">
          <CreatePost/>
        </div>
        <div>
          <PostList/>
        </div>
      </div>
      <div v-if="showMap" class="col-6" id="map-view">
        <GmapMap
        :center="{lat: latitude, lng: longitude}"
        :zoom="14"
        style="width: 100%; height: 100%"
        ref="map"
        @bounds_changed="filterMarkers()"
        >

        <GmapMarker ref="myMarker"
          v-for="bike in posts"
          :position="{lat: bike.latitude, lng: bike.longitude}"
          :draggable="false"
          @click="clickMarker(bike.id)"
        />

      </GmapMap>
      </div>
    </div>

    <!-- Pick a bike for me modal -->
    <div class="modal fade" id="pickForMe" tabindex="-1" role="dialog" aria-labelledby="pickForMeLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="pickForMeLabel">Pick a bike for me</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Our magic bike genies will match you with a bike close to you that is available within your preferred timeframe!  Just enter your preferred location and timeframe below:</p>
            <div class="row">
              <div class="col" style="margin-left: 1rem;">
                <div class="row">
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <label class="input-group-text" for="latitude">Latitude</label>
                    </div>
                    <input v-model="pickForMeLatitude" v-bind:id="pickForMeLatitude" type="number" class="form-control" aria-labelledby="" placeholder=""/>
                  </div>
                </div>
                <div class="row">
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <label class="input-group-text" for="longitude">Longitude</label>
                    </div>
                    <input v-model="pickForMeLongitude" v-bind:id="pickForMeLongitude" type="number" class="form-control" aria-labelledby="" placeholder=""/>
                  </div>
                </div>
              </div>
              <div class="col-2" style="display: flex;">
                <button type="button" class="btn btn-dark" data-toggle="modal" data-target="#pickLatLongModal" style="margin-bottom: 1rem;">
                  Pick with Map
                </button>
              </div>
            </div>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <label class="input-group-text" for="pickForMeDatetimerange">Timeframe</label>
              </div>
                <input id="pickForMeDatetimerange" type="text" class="form-control" name="pickdatetimes" />
            </div>
          </div>
          <div class="modal-footer">
            <button v-on:click="pickForMe" type="button" class="btn btn-dark">Reserve a bike for me!</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="pickLatLongModal" tabindex="-1" role="dialog" aria-labelledby="pickLatLongModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="pickLatLongModalLabel">Drag Pin to Pick Latitude and Longitude</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body" style="height: 50vh;">
            <GmapMap
            :center="{lat:this.pickForMeLatitude, lng:this.pickForMeLongitude}"
            :zoom="14"
            style="width: 100%; height: 100%"
          >
            <GmapMarker ref="myMarker"
              :position="marker.position"
              :draggable="true"
              @dragend="updateCoordinates($event.latLng)"
            />
          </GmapMap>
          </div>
          <div style="margin-left: 10px;">
            <p>Current Latitude: {{this.marker.position.lat}}</p>
            <p>Current Longitude: {{this.marker.position.lng}}</p>
          </div>
          <div class="modal-footer">
            <button v-on:click="updateLatLongtoMarker" type="button" class="btn btn-dark">Update latitude and longitude</button>
          </div>
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
            <img v-if="validBikes.length > 0 && validBikes[0].url === ''" class="card-img" src="https://i.imgur.com/ZY43CVv.png" style="width: 100%"/>
            <img v-if="validBikes.length > 0 && validBikes[0].url !== ''" v-bind:src="validBikes[0].url" class="card-img" style="width: 100%">
            <p v-if="validBikes.length > 0">The reservation for this bike will cost ${{this.totalPrice}} in total.  If the bike is not returned, the damage fee is ${{this.validBikes[0].damagefee}}.  Confirm to complete your reservation.</p>
          </div>
          <div class="modal-footer">
            <button v-on:click="createReservation" type="button" class="btn btn-dark">Confirm</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" tabindex="-1" role="dialog" id="pickMeErrorModal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Pick A Bike For Me Error</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>There are no bikes available close to that location within your given time frame :(</p>
          </div>
          <div class="modal-footer">
            <button data-dismiss="modal" type="button" class="btn btn-dark">Ok</button>
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
  </div>
</template>

<script>
import FilterBar from "../components/FilterBar.vue";
import PostList from "../components/PostList.vue";
import CreatePost from "../components/CreatePost.vue";
import axios from "axios";
import { eventBus } from "../main";
import moment from 'moment'
import DateRangePicker from 'vue2-daterange-picker'
//you need to import the CSS manually (in case you want to override it)
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'

export default {
  name: 'app',
  data () {
    return {
      showMap: true,
      showCreateCard: false,
      showLoginAlert: false,
      posts: [],
      latitude: 42.3601,
      longitude: -71.0942,
      filtered: [],
      pickForMeLatitude: 42.3601,
      pickForMeLongitude: -71.0942,
      pickForMeStartTime: undefined,
      pickForMeEndTime: undefined,
      marker: {position: {lat: 42.3601, lng: -71.0942}},
      validBikes: [],
      totalPrice: 0,
      isSignedIn: false,
    }
  },
  created: function() {
    eventBus.$on("toggle-map", res => {
      this.showMap = res;
    });
    eventBus.$on("new-bike-created", () => {
      this.showCreateCard = false;
    });
    eventBus.$on("cancel-bike-publish", () => {
      this.showCreateCard = false;
    });
    eventBus.$on("must-log-in", () => {
      this.showLoginAlert = true;
    });
    eventBus.$on("bike-posts-loaded", res => {
      this.posts = res;
    });

    // toggle isSignedIn
    eventBus.$on("log-in-success", () => {
      this.isSignedIn = true;
    });
    eventBus.$on("user-logged-in", () => {
      this.isSignedIn = true;
    });
    eventBus.$on("sign-up-success", () => {
      this.isSignedIn = true;
    });
    eventBus.$on("log-out-success", () => {
      this.isSignedIn = false;
    });
  },
  methods: {
    pickForMe(){
      let datetimerange = document.getElementById('pickForMeDatetimerange').value;
      this.pickForMeStartTime = moment(datetimerange.substr(0, datetimerange.trim().indexOf(' ')));
      let tempStart = moment(datetimerange.substr(0, datetimerange.trim().indexOf(' ')));
      this.pickForMeEndTime = moment(datetimerange.substr(this.getPosition(datetimerange, ' ', 2)+1, this.getPosition(datetimerange, ' ', 1)));

      axios.get('/api/bikes/search/?lat=' + this.pickForMeLatitude + '&lon=' + this.pickForMeLongitude + '&start=' + this.pickForMeStartTime.format('YYYY-MM-DD') + '&end=' + this.pickForMeEndTime.format('YYYY-MM-DD'))
        .then(response => {
          this.validBikes = response.data;

          if (this.validBikes.length === 0){
            $('#pickForMe').modal('hide');
            $('#pickMeErrorModal').modal('show');
          } else { // calculate price and show reservation modal for confirmation
              let weekDiff = 0;
              let dayDiff = 0;
              let monthDiff = this.pickForMeEndTime.diff(this.pickForMeStartTime, 'months');
              tempStart.add(monthDiff, 'months');
              if (this.pickForMeEndTime.diff(tempStart, 'days')+1 >= 7) {
                weekDiff = parseInt((this.pickForMeEndTime.diff(tempStart, 'days')+1)/7);
                dayDiff = (this.pickForMeEndTime.diff(tempStart, 'days')+1)%7;
              } else {
                dayDiff = (this.pickForMeEndTime.diff(tempStart, 'days')+1);
              }
              this.totalPrice = monthDiff * this.validBikes[0].monthly + weekDiff * this.validBikes[0].weekly + dayDiff * this.validBikes[0].daily;
              $('#pickForMe').modal('hide');
              $('#confirmReservationModal').modal('show');
            }

        }).catch(err =>{
          $('#pickForMe').modal('hide');
          $('#pickMeErrorModal').modal('show');
        });
      },
      createReservation: function(){
        axios.post('/api/rides', {bikeId: this.validBikes[0].id, start: this.pickForMeStartTime.format('YYYY-MM-DD'), end: this.pickForMeEndTime.format('YYYY-MM-DD')})
        .then(() => {
          axios.post('/api/users/account/balance/transfer', {amount: this.totalPrice, user: this.validBikes[0].owner})
          .then(() => {
            eventBus.$emit("balance-updated", this.totalPrice);
            $('#confirmReservationModal').modal('hide');
            $('#reservationCompleteModal').modal('show');
          })
        });
      },

    getPosition: function(str, m, i) {
      return str.split(m, i).join(m).length;
    },
    updateCoordinates(location) {
      this.marker.position.lat = location.lat();
      this.marker.position.lng = location.lng();
    },
    updateLatLongtoMarker(){
      this.pickForMeLatitude = this.marker.position.lat
      this.pickForMeLongitude = this.marker.position.lng
      $('#pickLatLongModal').modal('hide');
    },
    filterMarkers: function(){
           this.filtered = [];

           const b = this.$refs.map.$mapObject.getBounds();

           this.posts.forEach(bike => {

               let bikePosition = {};

               bikePosition = {
                   position: {
                       lat: bike.latitude,
                       lng: bike.longitude,
                   }
               };

               let m = new window.google.maps.Marker( bikePosition );

               if( b.contains( m.getPosition() ) ){
                   this.filtered.push(bike);
               }
           });
      eventBus.$emit("map-changed", this.filtered);
    },
    startCreateBike: function() {
      this.showCreateCard = true;
      eventBus.$emit("start-create-bike");
    },
    clickMarker: function(id){
      let pos = $("#"+id).position().top;
      if (pos !== 0){
        $('#theScrollContainer').animate({
            scrollTop: pos
        }, 2000);
      }

      var $el = $(("#"+id)),
          originalColor = $el.css("background-color");

      $el.css("background-color", "#ede2e8");
      setTimeout(function(){
        $el.css("background-color", originalColor);
      }, 2000);
    }

  },
  components: {
    FilterBar,
    PostList,
    CreatePost,
  },
  mounted(){
    axios.get('/api/users/current')
    .then(response => {
      if (response !== ""){
        this.isSignedIn = true;
      } else {
        this.isSignedIn = false;
      }
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.pickForMeLatitude = position.coords.latitude;
        this.pickForMeLongitude = position.coords.longitude;
        this.marker.position.lat = position.coords.latitude;
        this.marker.position.lng = position.coords.longitude;
      });
    }
    $(function() {
      $('input[name="pickdatetimes"]').daterangepicker({
        timePicker: false,
        startDate: moment().startOf('hour'),
        endDate: moment().startOf('hour').add(32, 'hour'),
        maxDate: moment('2020-02-29', 'YYYY-MM-DD'),
        applyButtonClasses: "btn-dark",
        locale: {
          format: 'YYYY-MM-DD'
        },
        autoApply: true,
      });
    });
  }
};
</script>

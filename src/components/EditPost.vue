<template>
  <div>
      <div class="row">
        <div class="col-lg-3" style="margin-left: 30px; padding: 0px; padding-left: 0px; margin-top: 10px;">
          <img v-if="imageurl === ''" class="card-img" src="https://i.imgur.com/ZY43CVv.png"/>
          <img v-else v-bind:src="imageurl" class="card-img">
        </div>
        <div class="col" style="margin: 0px">
          <div class="card-body mb-0">
            <!-- <p class="card-text mb-0"> -->
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <label class="input-group-text" for="bike-type">Title</label>
                </div>
                <input v-model="title" v-bind:id="'bikeTitle'+id" type="text" class="form-control" aria-labelledby="" placeholder=""/>
              </div>

              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <label class="input-group-text" for="inputGroupSelect01">Bike Type</label>
                </div>
                <select v-model="bikeType" class="custom-select" id="inputGroupSelect01">
                  <option value="Hybrid">🚲Hybrid Bike</option>
                  <option value="Road">🛣️Road Bike</option>
                  <option value="Mountain">⛰️Mountain Bike</option>
                  <option value="Other">Other / Unknown</option>
                </select>
              </div>

                <div class="row">
                  <div class="col" style="margin-left: 1rem;">
                    <div class="row">
                      <div class="input-group mb-3">
                        <div class="input-group-prepend">
                          <label class="input-group-text" for="latitude">Latitude</label>
                        </div>
                        <input v-model="latitude" v-bind:id="'latitude'+id" type="number" class="form-control" aria-labelledby="" placeholder=""/>
                      </div>
                    </div>
                    <div class="row">
                      <div class="input-group mb-3">
                        <div class="input-group-prepend">
                          <label class="input-group-text" for="longitude">Longitude</label>
                        </div>
                        <input v-model="longitude" v-bind:id="'longitude'+id" type="number" class="form-control" aria-labelledby="" placeholder=""/>
                      </div>
                    </div>
                  </div>
                  <div class="col-2" style="display: flex;">
                    <button type="button" class="btn btn-dark" data-toggle="modal" v-bind:data-target="'#latLongModal'+id" style="margin-bottom: 1rem;">
                      Pick with Map
                    </button>
                  </div>
                </div>

                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <label class="input-group-text" for="dailyPrice">Daily Price</label>
                  </div>
                  <input v-model="dailyPrice" id="dailyPrice" type="number" class="form-control" aria-labelledby="" placeholder=""/>
                </div>

                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <label class="input-group-text" for="weeklyPrice">Weekly Price</label>
                  </div>
                  <input v-model="weeklyPrice" id="weeklyPrice" type="number" class="form-control" aria-labelledby="" placeholder=""/>
                </div>

                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <label class="input-group-text" for="monthlyPrice">Monthly Price</label>
                  </div>
                  <input v-model="monthlyPrice" id="monthlyPrice" type="number" class="form-control" aria-labelledby="" placeholder=""/>
                </div>

                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <label class="input-group-text" for="datetimerange">Availablility</label>
                  </div>
                    <input v-bind:id="'datetimerange'+id" type="text" class="form-control" name="datetimes" />
                </div>

                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <label class="input-group-text" for="imageurl">Image URL</label>
                  </div>
                    <input v-model="imageurl" v-bind:id="'imageurl'+id" type="text" class="form-control" aria-labelledby="" placeholder=""/>
                    <!-- make sure it matches [-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*) -->
                </div>

                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <label class="input-group-text" for="imageurl">Damages Fee</label>
                  </div>
                    <input v-model="damageValue" id="damageValue" type="number" class="form-control" aria-labelledby="" placeholder=""/>
                </div>
            <!-- </p> -->
            <span>
              <button v-on:click="editBike" type="button" class="btn btn-dark publishBike">Submit Bike Edit</button>
              <button v-on:click="cancelBikeEdit" type="button" class="btn btn-light publishBike" style="margin-right: 1rem; border: 1px solid rgba(0,0,0,.125)">Cancel</button>
            </span>
          </div>
        </div>
      </div>


    <!-- Modal -->
    <div class="modal fade" v-bind:id="'latLongModal'+id" tabindex="-1" role="dialog" aria-labelledby="latLongModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="latLongModalLabel">Drag Pin to Pick Latitude and Longitude</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body" style="height: 50vh;">
            <GmapMap
            :center="{lat:this.latitude, lng:this.longitude}"
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

  </div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";
import moment from 'moment'
import DateRangePicker from 'vue2-daterange-picker'
//you need to import the CSS manually (in case you want to override it)
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'

export default {
    name: "EditPost",

    props: {
      id: Number,
      title: String,
      bikeType: String,
      latitude: Number,
      longitude: Number,
      dailyPrice: Number,
      weeklyPrice: Number,
      monthlyPrice: Number,
      imageurl: String,
      damageValue: Number,
    },

    data() {
      return {
        marker: {position: {lat: this.latitude, lng: this.longitude}},
      };
    },
    created: function() {

      eventBus.$on("log-in-success", res => {
        this.isSignedIn = true;
        this.username = `${res.data.username}`;
      });

      eventBus.$on("sign-up-success", res => {
        this.isSignedIn = true;
        this.username = `${res.data.username}`;
      });

      eventBus.$on("log-out-success", () => {
        this.isSignedIn = false;
      });

      eventBus.$on("user-logged-in", response => {
        this.isSignedIn = true;
        this.username = `${response}`;
      });
      eventBus.$on("start-edit-bike", () => {
        this.startEditBike();
      });
    },

    mounted: function() {
      $(function() {
        $('input[name="datetimes"]').daterangepicker({
          timePicker: true,
          startDate: moment().startOf('hour'),
          endDate: moment().startOf('hour').add(32, 'hour'),
          maxDate: moment('2020-02-29', 'YYYY-MM-DD'),
          applyButtonClasses: "btn-dark",
          locale: {
            format: 'YYYY-MM-DD hh:mm A'
          }
        });
      });
    },

    methods: {
      getPosition: function(str, m, i) {
        return str.split(m, i).join(m).length;
      },
      editBike: function() {
        let datetimerange = document.getElementById('datetimerange'+this.id).value;
        let startTime = datetimerange.substr(0, datetimerange.indexOf(' '));
        let endTime = datetimerange.substr(this.getPosition(datetimerange, ' ', 4)+1, this.getPosition(datetimerange, ' ', 1));
        let fields = {
                      endTime: endTime,
                      latitude: this.latitude,
                      longitude: this.longitude,
                      dailyPrice: this.dailyPrice,
                      weeklyPrice: this.weeklyPrice,
                      monthlyPrice: this.monthlyPrice,
                      startTime: startTime,
                      type: this.bikeType,
                      title: this.title,
                      imageurl: this.imageurl,
                      damageFee: this.damageValue,
                    };
        axios.put('api/bikes/bike/'+this.id, fields)
        .then(response => {
          eventBus.$emit("bike-updated", response);
        });
      },
      cancelBikeEdit: function(){
        eventBus.$emit("cancel-bike-edit");
      },
      // getCurrentLocation: function() {
      //   if (navigator.geolocation) {
      //     navigator.geolocation.getCurrentPosition(position => {
      //       this.latitude = position.coords.latitude;
      //       this.longitude = position.coords.longitude;
      //       this.marker.position.lat = position.coords.latitude;
      //       this.marker.position.lng = position.coords.longitude;
      //     });
      //   } else {
      //     this.geolocationSupported = false;
      //   }
      // },
      updateCoordinates(location) {
        this.marker.position.lat = location.lat();
        this.marker.position.lng = location.lng();
      },
      updateLatLongtoMarker(){
        this.latitude = this.marker.position.lat
        this.longitude = this.marker.position.lng
        $('#latLongModal' + this.id).modal('hide');
      },
      startEditBike: function(){
        $(function() {
          $('input[name="datetimes"]').daterangepicker({
            timePicker: true,
            startDate: moment().startOf('hour'),
            endDate: moment().startOf('hour').add(32, 'hour'),
            maxDate: moment('2020-02-29', 'YYYY-MM-DD'),
            applyButtonClasses: "btn-dark",
            locale: {
              format: 'YYYY-MM-DD hh:mm A'
            }
          });
        });
      },
    },
    components: {
      DateRangePicker
    }
};
</script>

<style scoped>
</style>

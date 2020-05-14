<template>
  <div class="row" id="filter-bar">
    <div class="col-8" style="margin: 0.5vw;">

      <div class="btn-group" style="margin-left: 0.5vw;">
        <button v-if="currentTypeFilter === 'Bike Type'" type="button" class="btn btn-outline-dark" style="width: 150px">{{this.currentTypeFilter}}</button>
        <button v-else v-on:click="typeFilter('')" type="button" class="btn btn-dark" style="width: 150px">{{this.currentTypeFilter}}</button>
        <button type="button" class="btn btn-outline-dark dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" id="dropdownMenu2" aria-haspopup="true" aria-expanded="false">
          <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu2">
          <button v-on:click="typeFilter('Hybrid')" class="dropdown-item" type="button">🚲Hybrid Bike</button>
          <button v-on:click="typeFilter('Road')" class="dropdown-item" type="button">🛣️Road Bike</button>
          <button v-on:click="typeFilter('Mountain')" class="dropdown-item" type="button">⛰️Mountain Bike</button>
          <button v-on:click="typeFilter('Other')" class="dropdown-item" type="button">Other</button>
        </div>
      </div>

      <div class="btn-group" style="margin-left: 0.5vw;">
        <button v-if="currentPriceFilter === 'Price Range'" type="button" class="btn btn-outline-dark" style="width: 130px">{{this.currentPriceFilter}}</button>
        <button v-else v-on:click="priceFilter('')" type="button" class="btn btn-dark" style="width: 150px">{{this.currentPriceFilter}}</button>
        <button type="button" class="btn btn-outline-dark dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" id="dropdownMenu3" aria-haspopup="true" aria-expanded="false">
          <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu3" style="padding: 10px;">
          <input type="text" class="js-range-slider" name="my_range" value=""/>
        </div>
      </div>

      <div class="btn-group" style="margin-left: 0.5vw;">
        <button v-if="currentAvailabilityFilter === 'Availablility'" type="button" class="btn btn-outline-dark" style="width: 130px">{{this.currentAvailabilityFilter}}</button>
        <button v-else v-on:click="availabilityFilter('')" type="button" class="btn btn-dark" style="width: 150px">{{this.currentAvailabilityFilter}}</button>
        <button type="button" class="btn btn-outline-dark dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" id="dropdownMenu3" aria-haspopup="true" aria-expanded="false">
          <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu3" style="padding: 10px;">
          <input v-model="daterange" id="datetimerange" type="text" class="form-control form-control-sm" name="datetimes" />
          <span class="d-flex justify-content-center">
            <button v-on:click="updateAvailability" class="btn btn-dark"><small>Update Filter</small></button>
          </span>
        </div>
      </div>

      <div v-if="this.showMap" class="btn-group" style="margin-left: 0.5vw;">
        <button v-if="currentLocationFilter === 'Location'" type="button" class="btn btn-outline-dark" style="width: 170px">{{this.currentLocationFilter}}</button>
        <button v-else v-on:click="locationFilter('')" type="button" class="btn btn-dark" style="width: 170px">{{this.currentLocationFilter}}</button>
        <button v-on:click="locationFilter('Location Filter On')" type="button" class="btn btn-outline-dark dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" id="dropdownMenu3" aria-haspopup="true" aria-expanded="false">
          <span class="sr-only">Toggle Dropdown</span>
        </button>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu3" style="padding: 10px;">
          <p> <small>This filters the bike listings to only include those whose locations are visible in the map </small></p>
        </div>
      </div>
    </div>
    <div class="col justify-content-end form-inline" style="margin: 0.5vw;">
      <div class="custom-control custom-switch">
        <input v-on:click="toggleMap()" type="checkbox" class="custom-control-input" id="customSwitches">
        <label class="custom-control-label" for="customSwitches">Toggle Map</label>
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

export default {
  name: "FilterBar",

  data() {
    return {
      showMap: true,
      filters: new Map(),
      currentTypeFilter: "Bike Type",
      currentPriceFilter: "Price Range",
      currentAvailabilityFilter: "Availablility",
      currentLocationFilter: "Location",
      daterange: '',
    };
  },
  mounted(){
    $(".js-range-slider").ionRangeSlider({
        type: "double",
        grid: true,
        min: 0,
        max: 10,
        from: 3,
        to: 7,
        prefix: "$",
        onFinish: this.finishPriceEdit,
    });

    $(function() {
      $('input[name="datetimes"]').daterangepicker({
        timePicker: false,
        startDate: moment().startOf('hour'),
        endDate: moment().startOf('hour').add(32, 'hour'),
        maxDate: moment('2020-02-29', 'YYYY-MM-DD'),
        applyButtonClasses: "btn-dark",
        locale: {
          format: 'MM/DD/YYYY'
        },
        autoApply: true,
      });
    });
  },

  components: {
    DateRangePicker,
  },

  methods: {
    updateValues: function(){
    },
    finishPriceEdit: function (data) {
        // get prices and update them
        this.currentPriceFilter = '$' + (data.from_pretty).toString() + ' - $' + (data.to_pretty).toString()
        this.priceFilter({from: data.from_pretty, to: data.to_pretty})
    },
    locationFilter: function (filter){
      if (filter === ''){
        this.removeFilter("location");
        this.currentLocationFilter = "Location";
      } else {
        this.addFilter("location", filter);
        this.currentLocationFilter = filter;
      }
    },
    typeFilter: function (filter){
      if (filter === ''){
        this.removeFilter("type");
        this.currentTypeFilter = "Bike Type";
      } else {
        this.addFilter("type", filter);
        this.currentTypeFilter = filter;
      }
    },
    priceFilter: function (filter){
      if (filter === ''){
        this.removeFilter("price");
        this.currentPriceFilter = "Price Range";
      } else {
        this.addFilter("price", filter);
      }
    },
    availabilityFilter: function (filter){
      if (filter === ''){
        this.removeFilter("availability");
        this.currentAvailabilityFilter = "Availablility";
      } else {
        this.addFilter("availability", filter);
      }
    },
    getPosition: function(str, m, i) {
      return str.split(m, i).join(m).length;
    },
    updateAvailability: function(){
      let datetimerange = document.getElementById('datetimerange').value;
      let startTime = moment(datetimerange.substr(0, datetimerange.trim().indexOf(' ')));
      let endTime = moment(datetimerange.substr(this.getPosition(datetimerange, ' ', 2)+1, this.getPosition(datetimerange, ' ', 1)));
      this.currentAvailabilityFilter = startTime.format('MM/DD') + ' - ' + endTime.format('MM/DD');
      this.availabilityFilter({start: startTime.format('YYYY-MM-DD'), end: endTime.format('YYYY-MM-DD')})
    },
    toggleMap: function() {
      this.showMap = !this.showMap;
      this.locationFilter('');
      eventBus.$emit("toggle-map", this.showMap);
    },
    addFilter: function(newFilter, newValue) {
        this.filters.set(newFilter, newValue);
        eventBus.$emit("add-filter", [newFilter, newValue]);
    },
    removeFilter: function(filterToRemove) {
        this.filters.delete(filterToRemove);
        eventBus.$emit("remove-filter", filterToRemove);
    },
  },
};
</script>

<style scoped>
/* Add style */
</style>

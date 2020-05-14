<template>
  <div id="app">
    <Navbar/>
    <div style="">
    <router-view/>
    </div>
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue";
import axios from "axios";
import { eventBus } from "./main";

export default {
  name: 'app',
  data () {
    return {
      showMap: true,
    }
  },
  mounted(){
    axios.get('/api/users/current').then(response => {
      if (response !== ""){
        eventBus.$emit("user-logged-in", response.data.username);
      } else {
        eventBus.$emit("user-not-logged-in");
      }
    });
  },
  created: function() {},
  components: {
    Navbar,
  },
};
</script>

<!-- global styles -->
<style>

body{
  overflow-x: hidden;
}

.daterangepicker td.active, .daterangepicker td.active:hover{
  background-color: #8E5572;
}

.daterangepicker td.in-range{
  background-color: #dec9d4;
}

#app{
  font-family: 'Nunito', sans-serif;
}

.btn {
  border-radius: 10px;
}

.btn-info{
  background-color: #e1e5ea;
  color: #435058;
  border-color: #e1e5ea;
}

.btn-info:hover{
  background-color: #d6dce1;
  color: #435058;
  border-color: #e1e5ea;
}

.btn-outline-dark{
  color: #8E5572;
  border-color: #8E5572;
}

.btn-dark, .btn-outline-dark:not(:disabled):not(.disabled).active, .btn-outline-dark:not(:disabled):not(.disabled):active, .show>.btn-outline-dark.dropdown-toggle{
  color: #FFFFFF;
  background: #8E5572;
  border-color: #8E5572;
}

.btn-dark:hover, .btn-dark:disabled {
  color: #FFFFFF;
  background: #9b5d7c;
  border-color: #8E5572;
}

.btn-outline-dark:hover{
  color: #8E5572;
  background: #ede2e8;
  border-color: #8E5572;
}

.navbar{
  padding: 0;
}

.navbar-brand{
  font-family: 'Saira', sans-serif;
}

.bg-dark{
  background-color: #435058 !important;
}

#filter-bar{
  border-bottom: 1.5px solid #C4C4C4;
  border-top: 1.5px solid #C4C4C4;
}

.section{
  border-bottom: 1.5px solid #C4C4C4;
}

.card{
  border-radius: 10px;
  margin-bottom: 10px;
  border: 2px solid rgba(0,0,0,.125);
  font-size: 1.2rem;
  background-color: #f3f3f3;
}

.card-img{
  display: block;
  width: inherit;
  height: inherit;
}

.card-rating{
  display: inline-block;
  float:right;
  color: #8E5572;
}

.card-price{
  display: inline-block;
  float:right;
  color: #8ACB88;
  font-weight: bold;
}

.publishBike{
  display: inline-block;
  float:right;
  margin-bottom: 1rem;
}

.dropdown{
  display:inline-block;
}

#blockColorblindContent, #colorBlindSVG{
  height: 0px;
}

.irs--flat .irs-bar{
    background-color: #8E5572;
}

.irs--flat .irs-from, .irs--flat .irs-to, .irs--flat .irs-single{
    background-color: #8E5572;
}

.irs--flat .irs-handle>i:first-child{
    background-color: #8E5572;
}

.irs--flat .irs-from:before, .irs--flat .irs-to:before, .irs--flat .irs-single:before{
    border-top-color: #8E5572;
}
</style>

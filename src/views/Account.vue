<template>
  <div>
      <div class="row section">
        <div class="col-8" style="margin: 0.5vw; margin-left: 1vw; margin-bottom: 0px;">
          <b v-model="username" style="font-size: 36px;">{{this.username}}</b>
          <p v-model="balance" style="color: rgb(138, 203, 136);">Current Balance: ${{this.balance}}</p>
        </div>
        <div class="col justify-content-end form-inline" style="margin: 0.5vw;">
            <button data-toggle="modal" data-target="#changePasswordModal" class="btn btn-dark" type="button" style="margin-left: 0.5vw;">Change Password</button>
        </div>
      </div>

      <div style="font-size: 30px; padding-left: 1vw; padding-top: 0.25vw;">
        Bikes Owned
      </div>
      <div class="card-deck section" style="padding: 1vw; padding-top: 0px; overflow: scroll;">
        <BikeList
          v-bind:currentUser="username"
        />
      </div>

      <div style="font-size: 30px; padding-left: 1vw; padding-top: 0.25vw;">
        Rides Reserved
      </div>
      <div class="card-deck section" style="padding: 1vw; padding-top: 0px; overflow: scroll;">
        <RideList
          v-bind:currentUser="username" v-bind:userRides="true"
        />
      </div>

      <div style="font-size: 30px; padding-left: 1vw; padding-top: 0.25vw;">
        Rented Rides
      </div>
      <div class="card-deck section" style="padding: 1vw; padding-top: 0px; overflow: scroll;">
        <RideList
          v-bind:currentUser="username" v-bind:userRides="false"
        />
      </div>

      <div class="modal" tabindex="-1" role="dialog" id="newBikeModal">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Add New Bike</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <CreatePost/>
            </div>
          </div>
        </div>
      </div>

      <div class="modal" tabindex="-1" role="dialog" id="changePasswordModal">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Change Password</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label id="sign-up-password-label" for="sign-up-password-text" class="col-form-label">New Password:</label>
                <input v-if="this.newPassword.length >= 8 && this.changePasswordError == ''" v-model="newPassword" type="password" class="form-control is-valid" id="sign-up-password-text" aria-labelledby="sign-up-password-label"/>
                <input v-else-if="this.newPassword.length === 0" v-model="newPassword" type="password" class="form-control" id="sign-up-password-text" aria-labelledby="sign-up-password-label"/>
                <input v-else v-model="newPassword" type="password" class="form-control is-invalid" id="sign-up-password-text" aria-labelledby="sign-up-password-label"/>
                <div id="sign-up-symbol-error" v-if="newPassword.length < 8" class="invalid-feedback row" style="margin-left:10px">
                  Password must be 8 characters or more
                </div>
                <div id="sign-up-error" v-if="this.changePasswordError !== ''" class="invalid-feedback row" style="margin-left:10px">
                  {{this.changePasswordError}}
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button v-on:click="changePassword" type="button" class="btn btn-dark">Change Password</button>
            </div>
          </div>
        </div>
      </div>



  </div>
</template>

<script>
import BikeList from "../components/BikeList.vue";
import RideList from "../components/RideList.vue";
import CreatePost from "../components/CreatePost.vue";
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: 'app',
  data () {
    return {
      username: "Not Logged In",
      newPassword: '',
      changePasswordError: '',
      balance: 0
    }
  },
  mounted(){
    axios.get('/api/users/account/balance')
    .then(response => {
        this.balance = response.data.balance;
    });

    axios.get('/api/users/current')
    .then(response => {
      if (response !== ""){
        this.username = response.data.username;
      } else {
        this.username = "Not Logged In";
      }
    });
  },
  created: function() {
    eventBus.$on("user-logged-in", (res) => {
      this.username = res;
    });
    eventBus.$on("balance-updated", (res) => {
      this.balance -= res;
    });
  },
  methods: {
    changePassword: function(){
      let fields = {password: this.newPassword};
      axios.put('/api/users/account/password', fields)
      .then(response => {
        if (response !== ""){
          $('#changePasswordModal').modal('hide');
        } else {
          this.changePasswordError = response;
        }
      });
    }
  },
  components: {
    CreatePost,
    BikeList,
    RideList,
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
  max-width: 300px;
}

.card-deck{
  margin-left: 0vw;
}

.card-special{
  background-color: rgba(142, 85, 114, 0.5);
}
</style>

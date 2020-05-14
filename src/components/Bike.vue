<template>
  <div>
    <div class="card">
      <div class="col-lg">
        <img v-if="bike.url === ''" class="card-img" src="https://i.imgur.com/ZY43CVv.png"/>
        <img v-else v-bind:src="bike.url" class="card-img">
      </div>
      <div class="card-body">
        <h5 class="card-title">{{this.bike.title}}</h5>
        <p class="card-text">{{ this.bike.type }}</p>
        <p class="card-text"><small class="text-muted">Posted by {{ this.bike.owner }}</small></p>
      </div>
      <div class="row" style="margin-left: 0.5vw; margin-right: 0.5vw; padding-bottom: 5px">
        <div class="col" style="padding: 0px; margin-right: 5px;">
          <button data-toggle="modal" v-bind:data-target="'#editBikeModal'+bike.id" class="btn btn-dark" type="button" style="width: 100%">Edit Bike</button>
        </div>
        <div class="col" style="padding: 0px; margin-left: 5px;">
          <button data-toggle="modal" v-bind:data-target="'#deleteBikeModal'+bike.id" class="btn btn-light" type="button" style="width: 100%; border: 2px solid #e1e5ea;">Delete Bike</button>
        </div>
      </div>
    </div>

    <div class="modal" tabindex="-1" role="dialog" v-bind:id="'editBikeModal'+bike.id">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Bike</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <EditPost
              v-bind:key="bike.id"
              v-bind:id="bike.id"
              v-bind:title="bike.title"
              v-bind:bikeType="bike.type"
              v-bind:latitude="bike.latitude"
              v-bind:longitude="bike.longitude"
              v-bind:dailyPrice="bike.daily"
              v-bind:weeklyPrice="bike.weekly"
              v-bind:monthlyPrice="bike.monthly"
              v-bind:imageurl="bike.url"
              v-bind:damageValue="bike.damagefee"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="modal" tabindex="-1" role="dialog" v-bind:id="'deleteBikeModal'+bike.id">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Bike</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <p for="message-text" class="col-form-label">Are you sure you want to delete this bike?</p>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-light" type="button" data-dismiss="modal" aria-label="Close" style="border: 2px solid #e1e5ea;">No, Go Back</button>
            <button v-on:click="deleteBike" type="button" class="btn btn-dark" data-dismiss="modal">Yes, Delete It</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import EditPost from "./EditPost.vue";
import { eventBus } from "../main";

export default {
  name: "Bike",

  props: {
    bike: Object,
    currentUser: String,
    isSignedIn: Boolean,
  },

  data() {
    return {
      username: "",
    };
  },

  created: function() {
    eventBus.$on("cancel-bike-edit", () => {
      $('#editBikeModal'+this.bike.id).modal('hide');
    });

    eventBus.$on("bike-updated", () => {
      $('#editBikeModal'+this.bike.id).modal('hide');
    });

  },

  methods: {
    deleteBike: function(){
      axios.delete('/api/bikes/'+this.bike.id)
      .then((res) => {
        eventBus.$emit("bike-deleted", res);
      });
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

  components: {
    EditPost,
  }
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

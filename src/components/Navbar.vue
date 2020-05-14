<template>
  <div>
  <nav id="navbar" class="component navbar navbar-dark bg-dark">
      <div class="col-3">
        <a v-on:click="navigateToPath(`Home`)" class="navbar-brand" href="#" style="font-size: 40px;"><b>Wheel Deal</b> <!-- <img src="./logo.svg" style="width: 50px; height: 50px; padding-bottom: 5px;"/> --> </a>
      </div>

      <div class="col">
        <form class="form-inline justify-content-end">
            <div v-if="isSignedIn">
              <button v-on:click="navigateToPath(`Home`)" class="btn btn-dark" type="button" style="margin-left: 10px; font-size: 20px;">Home</button>
              <button v-on:click="navigateToPath(`Account`)" class="btn btn-dark" type="button" style="margin-left: 10px; font-size: 20px;">Account</button>
            </div>
            <div v-else>
              <button class="btn btn-dark" type="button" style="font-size: 20px;" data-toggle="modal" data-target="#signUpModal">Sign Up</button>
            </div>
            <div v-if="isSignedIn">
              <button v-on:click="logOut(); navigateToPath(`Home`);" class="btn btn-dark" type="button" style="margin-left: 10px; font-size: 20px;">Log Out</button>
            </div>
            <div v-else>
              <button data-toggle="modal" data-target="#logInModal" class="btn btn-dark" type="button" style="margin-left: 10px; font-size: 20px;">Log In</button>
            </div>
        </form>
      </div>
  </nav>
  <!-- Sign Up Modal -->
  <div class="modal fade" id="signUpModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Sign Up</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form>
            <!-- Username -->
            <div class="form-group">
              <label id="sign-up-label" for="sign-up-username-text" class="col-form-label">Username:</label>
              <input v-if="this.username === ''" v-model="username" type="text" class="form-control"/>
              <input v-else-if="this.username !== '' && username.match(/^[0-9a-z]+$/i) && !this.signUpError.match(/username/i)" v-model="username" type="text" class="form-control is-valid" id="sign-up-username-text"  aria-labelledby="sign-up-label" aria-describedby="sign-up-symbol-error sign-up-error"/>
              <input v-else v-model="username" type="text" class="form-control is-invalid" />
              <div id="sign-up-symbol-error" v-if="!username.match(/^[0-9a-z]+$/i)" class="invalid-feedback row" style="margin-left:10px">
                Username cannot be blank and can only consist of alphanumeric characters
              </div>
              <div id="sign-up-error" v-if="this.signUpError.match(/username/i)" class="invalid-feedback row" style="margin-left:10px">
                {{this.signUpError}}
              </div>
            </div>
            <!-- Password -->
            <div class="form-group">
              <label id="sign-up-password-label" for="sign-up-password-text" class="col-form-label">Password:</label>
              <input v-if="this.password.length >= 8" v-model="password" type="password" class="form-control is-valid" aria-labelledby="sign-up-password-label"/>
              <input v-else-if="this.password === ''" v-model="password" type="password" class="form-control" aria-labelledby="sign-up-password-label"/>
              <input v-else v-model="password" type="password" class="form-control is-invalid" id="sign-up-password-text" aria-labelledby="sign-up-password-label"/>
              <div id="sign-up-symbol-error" v-if="password.length < 8 && password.length !== 0" class="invalid-feedback row" style="margin-left:10px">
                Password must be 8 characters or more
              </div>
              <div id="sign-up-error" v-if="this.signUpError.match(/password/i)" class="invalid-feedback row" style="margin-left:10px">
                {{this.signUpError}}
              </div>

            </div>

            <!-- Name -->
            <div class="form-group">
              <label id="sign-up-name-label" for="sign-up-name-text" class="col-form-label">Name:</label>
              <input v-if="this.name !== ''" v-model="name" type="text" class="form-control is-valid" aria-labelledby="sign-up-name-label"/>
              <input v-else-if="this.name === ''" v-model="name" type="text" class="form-control" aria-labelledby="sign-up-name-label"/>
              <input v-else v-model="name" type="text" class="form-control is-invalid" aria-labelledby="sign-up-name-label"/>
              <!-- <div id="sign-up-symbol-error" v-if="name === ''" class="invalid-feedback row" style="margin-left:10px">
                Name cannot be blank
              </div> -->
              <div id="sign-up-error" v-if="this.signUpError.match(/name/i)" class="invalid-feedback row" style="margin-left:10px">
                {{this.signUpError}}
              </div>

            </div>

            <!-- Phone -->
            <div class="form-group">
              <label id="sign-up-phone-label" for="sign-up-phone-text" class="col-form-label">Phone Number:</label>
              <input v-if="phone.match(/(^[2-9]\d{2}-\d{3}-\d{4})/) && !this.signUpError.match(/phone/i)" v-model="phone" type="tel" class="form-control is-valid" id="sign-up-phone-text" aria-labelledby="sign-up-phone-label"/>
              <input v-else-if="this.phone === ''" v-model="phone" type="tel" class="form-control" id="sign-up-phone-text" aria-labelledby="sign-up-phone-label"/>
              <input v-else v-model="phone" type="tel" class="form-control is-invalid" id="sign-up-phone-text" aria-labelledby="sign-up-phone-label"/>
              <div id="sign-up-format-error" v-if="!phone.match(/(^[2-9]\d{2}-\d{3}-\d{4})/) && !this.signUpError.match(/phone/i)" class="invalid-feedback row" style="margin-left:10px">
                Phone number must be comprised of digits in format XXX-XXX-XXXX
              </div>
              <div id="sign-up-error" v-if="this.signUpError.match(/phone/i)" class="invalid-feedback row" style="margin-left:10px">
                {{this.signUpError}}
              </div>

            </div>

          </form>
        </div>
        <div class="modal-footer">
          <button v-on:click="signUp" type="button" class="btn btn-dark">Sign Up</button>
          <!-- <button v-else v-on:click="signUp" type="button" class="btn btn-dark" disabled>Sign Up</button> -->
        </div>
      </div>
    </div>
  </div>

  <!-- Log In Modal -->
  <div class="modal fade" id="logInModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Log In</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <label id="log-in-label" for="log-in-username-text" class="col-form-label">Username:</label>
              <input v-if="this.username !== '' && username.match(/^[0-9a-z]+$/i) && !this.logInError.match(/username/i) && !this.logInError.match(/user/i)" v-model="username" type="text" class="form-control" id="log-in-username-text" aria-labelledby="sign-up-label" aria-describedby="log-in-symbol-error log-in-error"/>
              <input v-else-if="this.username === ''" v-model="username" type="text" class="form-control" id="log-in-username-text"/>
              <input v-else v-model="username" type="text" class="form-control is-invalid" id="log-in-username-text"/>
              <div id="log-in-symbol-error" v-if="!username.match(/^[0-9a-z]+$/i)" class="invalid-feedback row" style="margin-left:10px">
                Username cannot be blank and can only consist of alphanumeric characters
              </div>
              <div id="log-in-error" v-if="this.logInError.match(/username/i) || this.logInError.match(/user/i)" class="invalid-feedback row" style="margin-left:10px">
                {{this.logInError}}
              </div>
            </div>
            <div class="form-group">
              <label id="log-in-password-label" for="log-in-password-text" class="col-form-label">Password:</label>
              <input v-if="this.password !== '' && !this.logInError.match(/password/i)" v-model="password" type="password" class="form-control" id="log-in-password-text" aria-labelledby="log-in-password-label"/>
              <input v-else-if="this.password === ''" v-model="password" type="password" class="form-control" id="log-in-password-text" aria-labelledby="log-in-password-label"/>
              <input v-else v-model="password" type="password" class="form-control is-invalid" id="log-in-password-text" aria-labelledby="log-in-password-label"/>
              <div id="log-in-error" v-if="this.logInError.match(/password/i)" class="invalid-feedback row" style="margin-left:10px">
                {{this.logInError}}
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button v-if="username.match(/^[0-9a-z]+$/i) || username === ''" v-on:click="logIn" type="button" class="btn btn-dark">Log In</button>
          <button v-else v-on:click="logIn" type="button" class="btn btn-dark" disabled>Log In</button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import axios from "axios";
import { eventBus } from "../main";
export default {
  name: "Navbar",

  data() {
    return {
      content: '',
      contentState: null,
      username: '',
      password: '',
      name: '',
      phone: '',
      isSignedIn: false,
      signUpError: '',
      logInError: '',
    }
  },
  created: function() {
    eventBus.$on("user-logged-in", () => {
      this.isSignedIn = true;
    });
  },
  methods: {
    navigateToPath: function(pathName){
        this.$router.push({name: pathName});
    },
    createPost: function() {
      const fields = { content: this.content };
      axios.post('/api/freets/', fields)
        .then((res) => {
          eventBus.$emit("create-post-success", res);
        })
        .catch(err => {
          eventBus.$emit("create-post-error", err);
        }).then(() => {
          this.content = "";
        })
    },
    logIn: function() {
      const fields = { username: this.username, password: this.password };
      axios.post('/api/users/signin', fields)
        .then((res) => {
          eventBus.$emit("log-in-success", res);
          this.isSignedIn = true;
          this.username = '';
          this.password = '';
          this.logInError = '';
          $('#logInModal').modal('hide');
        })
        .catch(err => {
          this.logInError = err.response.data.error;
        });
    },
    logOut: function() {
      axios.post('/api/users/signout')
        .then((res) => {
          eventBus.$emit("log-out-success", res);
          this.isSignedIn = false;
        })
        .catch(err => {
          eventBus.$emit("log-out-error", err);
        });
    },
    signUp: function() {
      const fields = { username: this.username, password: this.password, name: this.name, phone: this.phone };
      axios.post('/api/users', fields)
        .then((res) => {
          eventBus.$emit("sign-up-success", res);
          this.isSignedIn = true;
          this.username = '';
          this.password = '';
          this.name = '';
          this.phone = '';
          this.signUpError = '';
          $('#signUpModal').modal('hide');
        })
        .catch(err => {
          this.signUpError = err.response.data.error;
        });
    },
  },
  checkFormValidity() {
    const valid = this.$refs.form.checkValidity()
    this.contentState = valid ? 'valid' : 'invalid'
    return valid
  },
  resetModal() {
    this.content = ''
    this.contentState = null
  },
  handleOk(bvModalEvt) {
    // Prevent modal from closing
    bvModalEvt.preventDefault()
    // Trigger submit handler
    this.handleSubmit()
  },
  handleSubmit() {
    // Exit when the form isn't valid
    if (!this.checkFormValidity()) {
      return
    }
    // Push the content to a post
    this.createPost();
    // Hide the modal manually
    this.$nextTick(() => {
      this.$refs.modal.hide()
    });
  }
}

</script>

<style scoped>
</style>

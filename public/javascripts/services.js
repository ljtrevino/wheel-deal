// Show an object on the screen.
function showObject(obj) {
  const pre = document.getElementById('response');
  const preParent = pre.parentElement;
  pre.innerText = JSON.stringify(obj, null, 4);
  preParent.classList.add('flashing');
  setTimeout(() => preParent.classList.remove('flashing'), 300);
}

// Axios responses have a lot of data. This shows only the most relevant data.
function showResponse(axiosResponse) {
  const fullResponse = axiosResponse.response === undefined
    ? axiosResponse
    : axiosResponse.response;
  const abridgedResponse = {
    data: fullResponse.data,
    status: fullResponse.status,
    statusText: fullResponse.statusText,
  };
  showObject(abridgedResponse);
}

// IT IS UNLIKELY THAT YOU WILL WANT TO EDIT THE CODE ABOVE

// EDIT THE CODE BELOW TO SEND REQUESTS TO YOUR API

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */

/**
 * You can use axios to make API calls like this:
 * const body = { bar: 'baz' };
 * axios.post('/api/foo', body)
 *   .then(showResponse) // on success (Status Code 200)
 *   .catch(showResponse); // on failure (Other Status Code)
 * See https://github.com/axios/axios for more info
 */

// Hint: do not assume a 1:1 mapping between forms and routes

function createUser(fields) {
  axios.post('/api/users', fields)
  .then(showResponse)
  .catch(showResponse);
}

function changePassword(fields) {
  axios.put('/api/users/account/password', fields)
  .then(showResponse)
  .catch(showResponse);
}

function signIn(fields) {
  axios.post('/api/users/signin', fields)
  .then(showResponse)
  .catch(showResponse);
}

function signOut(fields) {
  axios.post('/api/users/signout', fields)
  .then(showResponse)
  .catch(showResponse);
}

// ----- Bikes -----

function viewAllBikes(fields) {
  axios.get('/api/bikes', fields)
  .then(showResponse)
  .catch(showResponse);
}

function viewBikesByLocation(fields) {
  if (fields.latitude.trim() === '') {
    fields.latitude = "Infinity";
  } 
  if (fields.longitude.trim() === '') {
    fields.longitude = "Infinity";
  } 

  axios.get('/api/bikes' + 
  '/location/?' +
    'lat=' + fields.latitude + '&' + 
    'lon=' + fields.longitude, fields)
  .then(showResponse)
  .catch(showResponse);
  //e.g. /api/bikes/location/?lat=0.0&lon=0.0
}

function viewBikesByAvailability(fields) {
  if (fields.startTime.trim() === '') {
    fields.startTime = "Infinity";
  } 
  if (fields.endTime.trim() === '') {
    fields.endTime = "Infinity";
  } 

  axios.get('/api/bikes' + 
  '/availability/?' + 
    'start=' + fields.startTime + '&' + 
    'end=' + fields.endTime, fields)
  .then(showResponse)
  .catch(showResponse);
  //e.g. /api/bikes/availability/?start=2019-11-17&end=2019-11-17
}

function viewBikesByLocationAvailability(fields) {
  if (fields.latitude.trim() === '') {
    fields.latitude = "Infinity";
  } 
  if (fields.longitude.trim() === '') {
    fields.longitude = "Infinity";
  } 
  if (fields.startTime.trim() === '') {
    fields.startTime = "Infinity";
  } 
  if (fields.endTime.trim() === '') {
    fields.endTime = "Infinity";
  } 

  axios.get('/api/bikes' + 
  '/search/?' +
    'lat=' + fields.latitude + '&' + 
    'lon=' + fields.longitude + '&' +
    'start=' + fields.startTime + '&' + 
    'end=' + fields.endTime, fields)
  .then(showResponse)
  .catch(showResponse);
  //e.g. /api/bikes/search/?lat=0.0&lon=0.0&start=2019-11-17&end=2019-11-17
}

function createBike(fields) {
  axios.post('/api/bikes', fields)
  .then(showResponse)
  .catch(showResponse);
}

function setBikeLocation(fields) {
  if (fields.id.trim() === '') {
    fields.id = "-1";
  }

  axios.put('/api/bikes/bike/' + fields.id + '/location', fields)
  .then(showResponse)
  .catch(showResponse);
}

function setBikeAvailability(fields) {
  if (fields.id.trim() === '') {
    fields.id = "-1";
  }

  axios.put('/api/bikes/bike/' + fields.id + '/availability', fields)
  .then(showResponse)
  .catch(showResponse);
}

function setBikePrice(fields) {
  if (fields.id.trim() === '') {
    fields.id = "-1";
  }

  axios.put('/api/bikes/bike/' + fields.id + '/price', fields)
  .then(showResponse)
  .catch(showResponse);
}

function deleteBike(fields) {
  if (fields.id.trim() === '') {
    fields.id = "-1";
  }

  axios.delete('/api/bikes/' + fields.id, fields)
  .then(showResponse)
  .catch(showResponse);
}

// ----- Rides -----

function viewMyRides(fields) {
  axios.get('/api/rides', fields)
  .then(showResponse)
  .catch(showResponse);
}

function createRide(fields) {
  axios.post('/api/rides', fields)
  .then(showResponse)
  .catch(showResponse);
}

function cancelRide(fields) {
  axios.put('/api/rides/cancel/' + fields.id, fields)
  .then(showResponse)
  .catch(showResponse);
}

function useRide(fields) {
  axios.put('/api/rides/use/' + fields.id, fields)
  .then(showResponse)
  .catch(showResponse);
}

// ----- Reviews -----

function viewAllReviews(fields) {
  axios.get('/api/reviews', fields)
  .then(showResponse)
  .catch(showResponse);
}

function viewReviewsByReviewer(fields) {
  if (fields.reviewer.trim() === '') {
    fields.reviewer = "-1";
  } 

  axios.get('/api/reviews/by/' + fields.reviewer, fields)
  .then(showResponse)
  .catch(showResponse);
}

function viewReviewsForEntity(fields) {
  if (fields.entity.trim() === '') {
    fields.entity = "-1";
  } 

  axios.get('/api/reviews/for/' + fields.entity, fields)
  .then(showResponse)
  .catch(showResponse);
}

function viewRatingForEntity(fields) {
  if (fields.entity.trim() === '') {
    fields.entity = "-1";
  } 

  axios.get('/api/reviews/' + fields.entity + '/rating', fields)
  .then(showResponse)
  .catch(showResponse);
}

function createReview(fields) {
  axios.post('/api/reviews', fields)
  .then(showResponse)
  .catch(showResponse);
}

function updateReview(fields) {
  axios.put('/api/reviews/review/' + fields.id, fields)
  .then(showResponse)
  .catch(showResponse);
}

// map form (by id) to the function that should be called on submit
const formsAndHandlers = {
  'create-user': createUser,
  'change-password': changePassword,
  'sign-in': signIn,
  'sign-out': signOut,

  'view-all-bikes': viewAllBikes,
  'view-bikes-by-location': viewBikesByLocation,
  'view-bikes-by-availability': viewBikesByAvailability,
  'view-bikes-by-location-availability': viewBikesByLocationAvailability,
  'create-bike': createBike,
  'set-bike-location': setBikeLocation,
  'set-bike-availability': setBikeAvailability,
  'set-bike-price': setBikePrice,
  'delete-bike': deleteBike,

  'view-my-rides': viewMyRides,
  'create-ride': createRide,
  'cancel-ride': cancelRide,
  'use-ride': useRide,
  
  'view-all-reviews': viewAllReviews,
  'view-reviews-by-reviewer': viewReviewsByReviewer,
  'view-reviews-for-entity': viewReviewsForEntity,
  'view-rating-for-entity': viewRatingForEntity,
  'create-review': createReview,
  'update-review': updateReview
};

// attach handlers to forms
function init() {
  Object.entries(formsAndHandlers).forEach(([formID, handler]) => {
    const form = document.getElementById(formID);
    form.onsubmit = (e) => {
      e.preventDefault();
      const data = {};
      (new FormData(form)).forEach((value, key) => {
        data[key] = value;
      });
      handler(data);
      return false; // don't reload page
    };
  });
}

window.onload = init; // attach handlers once DOM is ready

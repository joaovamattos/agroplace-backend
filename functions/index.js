const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');
const { db } = require('./util/admin');
// const { signup, login, uploadImage, addUserDetails, getAuthenticadUser, getUserDetails, markNotificationsRead } = require('./handlers/users');
const { signup, login, uploadImage, addUserDetails, getUserDetails } = require('./handlers/users');

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.put('/user', FBAuth, addUserDetails);
// app.get('/user', FBAuth, getAuthenticadUser);
app.get('/user/:userId', getUserDetails);
// app.post('/notifications', FBAuth, markNotificationsRead);

// https://baseurl/api/
exports.api = functions.https.onRequest(app);
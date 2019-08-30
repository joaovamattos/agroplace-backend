const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');
const { db } = require('./util/admin');;
const { signup, login, addUserDetails } = require('./handlers/users');

// Users routes
app.post('/signup', signup);
app.post('/login', login);

app.post('/user', FBAuth, addUserDetails);
app.put('/user', FBAuth, addUserDetails);
// https://baseurl/api/
exports.api = functions.https.onRequest(app);
const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');
const { db } = require('./util/admin');
// const { signup, login, uploadImage, addUserDetails, getAuthenticadUser, getUserDetails, markNotificationsRead } = require('./handlers/users');
const { signup, login, uploadImage, addUserDetails, getUserDetails } = require('./handlers/users');
const { postOneProduct, uploadProductImage, updateProduct } = require('./handlers/products');


// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.put('/user', FBAuth, addUserDetails);
// app.get('/user', FBAuth, getAuthenticadUser);
app.get('/user/:userId', getUserDetails);
// app.post('/notifications', FBAuth, markNotificationsRead);

// Product routes
app.post('/product', FBAuth, postOneProduct);
app.post('/product/image', FBAuth, uploadProductImage);
app.put('/product/:productId', FBAuth, updateProduct);
// app.get('/screams', getAllScreams);
// app.get('/scream/:screamId', getScream);
// app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
// app.delete('/scream/:screamId', FBAuth, deleteScream);
// app.get('/scream/:screamId/like', FBAuth, likeScream);
// app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);

// https://baseurl/api/
exports.api = functions.https.onRequest(app);
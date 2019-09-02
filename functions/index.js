const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');
const { db } = require('./util/admin');
const { signup, login, uploadImage, addUserDetails, getUserDetails } = require('./handlers/users');
const { postOneProduct, uploadProductImage, updateProduct, deleteProduct, getAllProducts, getProduct } = require('./handlers/products');


// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.put('/user', FBAuth, addUserDetails);
app.get('/user/:userId', getUserDetails);
// app.get('/user', FBAuth, getAuthenticadUser);
// app.get('/user/logout', FBAuth, logout);
// app.post('/messages', FBAuth, markMessagesRead);

// Product routes
app.post('/product', FBAuth, postOneProduct);
app.post('/product/image', FBAuth, uploadProductImage);
app.put('/product/:productId', FBAuth, updateProduct);
app.get('/products', getAllProducts);
app.get('/product/:productId', getProduct);
app.delete('/product/:productId', FBAuth, deleteProduct);

// https://baseurl/api/
exports.api = functions.https.onRequest(app);

// Triggers
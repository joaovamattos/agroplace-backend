const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');
const { db } = require('./util/admin');
const { signup, login, uploadImage, addUserDetails, getUserDetails, getAuthenticatedUser } = require('./handlers/users');
const { postOneProduct, uploadProductImage, updateProduct, deleteProduct, getAllProducts, getProduct } = require('./handlers/products');
const { sendMessage, getMessages } = require('./handlers/messages');
const { addContact, getContacts } = require('./handlers/contacts');



// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.put('/user', FBAuth, addUserDetails);
app.get('/user/:userId', getUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
// app.get('/user/logout', FBAuth, logout);
// app.post('/messages', FBAuth, markMessagesRead);

// Product routes
app.post('/product', FBAuth, postOneProduct);
app.post('/product/image', FBAuth, uploadProductImage);
app.put('/product/:productId', FBAuth, updateProduct);
app.get('/products', getAllProducts);
app.get('/product/:productId', getProduct);
app.delete('/product/:productId', FBAuth, deleteProduct);

// Message routes
app.post('/message', FBAuth, sendMessage);
app.get('/messages/:recipientId', FBAuth, getMessages);

// Contact routes
app.post('/contact/:contactId', FBAuth, addContact);
app.get('/contacts', FBAuth, getContacts);

// https://baseurl/api/
exports.api = functions.https.onRequest(app);

// Triggers
const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');
const { admin, db } = require('./util/admin');
const firebase = require('firebase');
const { signup, login, uploadImage, addUserDetails, getUserDetails, getAuthenticatedUser, markMessagesRead } = require('./handlers/users');
const { postOneProduct, uploadProductImage, updateProduct, deleteProduct, getAllProducts, getProduct } = require('./handlers/products');
const { sendMessage, getMessages } = require('./handlers/messages');
const { addContact, getContacts } = require('./handlers/contacts');
const { getConversations } = require('./handlers/conversations');

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.put('/user', FBAuth, addUserDetails);
app.get('/user/:userId', getUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.put('/messages', FBAuth, markMessagesRead);

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

// Conversation routes
app.get('/conversations', FBAuth, getConversations);

// https://baseurl/api/
exports.api = functions.https.onRequest(app);

// Triggers
exports.onUserImageChange = functions
  .firestore.document(`/usuarios/{id}`)
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    
    if (change.before.data().urlImagem !== change.after.data().urlImagem){
      const batch = db.batch();
      return db.collection('produtos').where('idVendedor', '==', change.before.data().id).get()
        .then((data) => {
          data.forEach(doc => {
            const produto = db.doc(`/produtos/${doc.id}`);
            batch.update(produto, {urlFotoVendedor: change.after.data().urlImagem });
          });
          return db.collection('contatos').get();
        })
        .then((contacts) => {
          contacts.forEach((doc) => {  
            if(doc.id !== change.before.data().id)   
              batch.update(db.doc(`/contatos/${doc.id}/pessoas/${change.before.data().id}`), { urlImagem: change.after.data().urlImagem });            
          })          
          return db.collection('conversas').get();
        })
        .then((conversations) => {
          conversations.forEach((doc) => {  
            if(doc.id !== change.before.data().id)   
              batch.update(db.doc(`/conversas/${doc.id}/contatos/${change.before.data().id}`), { urlImagem: change.after.data().urlImagem });            
          })          
          return batch.commit();
        })
    } else {
      return true;
    }
  })

exports.deleteImageOnDeleteProduct = functions
  .firestore.document('produtos/{id}')
  .onDelete((snap) => {
    // const produto = db.collection('produtos').doc(snap.id).get();
    const produto = db.collection('produtos').doc(snap.id).get();
    // https://firebasestorage.googleapis.com/v0/b/agroplace-project.appspot.com/o/872265711293.jpeg?alt=media&token=11b1d10c-f74e-4d38-a7c8-fc3d913241a4
    const imageUrl = produto.urlImagem;
    let spltUrl = imageUrl.split('o/');
    let spltUrl2 = spltUrl[1].split('?alt');

    const storage = firebase.storage();
    const storageRef = storage.ref();
    const imageRef = storageRef.child(spltUrl2[0]);

    imageRef.delete()
    .then(() => {
      console.log('Imagem excluida com sucesso!');
    })
    .catch((err) => {
      console.error(err);      
    })
  });

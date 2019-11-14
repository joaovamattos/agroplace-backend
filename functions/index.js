const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");
const { admin, db } = require("./util/admin");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getUserDetails,
  getAuthenticatedUser,
  markMessagesRead,
  updatePassword,
  sendPasswordResetEmail,
  signupGoogle
} = require("./handlers/users");
const {
  postOneProduct,
  uploadProductImage,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProduct
} = require("./handlers/products");
const { sendMessage, getMessages } = require("./handlers/messages");
const { addContact, getContacts } = require("./handlers/contacts");
const {
  getConversations,
  markConversationsRead
} = require("./handlers/conversations");
const cors = require("cors");
app.use(cors({ origin: true }));

// Documentação
const swaggerUi = require('swagger-ui-express');
const swaggerDocument  = require('./swagger.json')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));;

// Users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/signupGoogle", signupGoogle);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.put("/user", FBAuth, addUserDetails);
app.get("/user/:userId", getUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.put("/user/updatePassword", FBAuth, updatePassword);
app.post("/sendPasswordResetEmail", sendPasswordResetEmail);

// Product routes
app.post("/product", FBAuth, postOneProduct);
app.post("/product/image", FBAuth, uploadProductImage);
app.put("/product/:productId", FBAuth, updateProduct);
app.get("/products", getAllProducts);
app.get("/product/:productId", getProduct);
app.delete("/product/:productId", FBAuth, deleteProduct);

// Message routes
app.post("/message", FBAuth, sendMessage);
app.put("/messages", FBAuth, markMessagesRead);
app.get("/messages/:recipientId", FBAuth, getMessages);

// Contact routes
app.post("/contact/:contactId", FBAuth, addContact);
app.get("/contacts", FBAuth, getContacts);

// Conversation routes
app.get("/conversations", FBAuth, getConversations);
app.put("/conversations", FBAuth, markConversationsRead);

// https://baseurl/api/
exports.api = functions.https.onRequest(app);

// Triggers
exports.onUserImageChange = functions
.firestore.document(`/usuarios/{userId}`)
.onUpdate((change) => {
  
  if (change.before.data().urlImagem !== change.after.data().urlImagem){
    console.log('Foto mudou');      
    const batch = db.batch();
    return db.collection('produtos').where('idVendedor', '==', change.before.data().id).get()
      .then((data) => {
        data.forEach(doc => {
          const produto = db.doc(`/produtos/${doc.id}`);
          batch.update(produto, {urlFotoVendedor: change.after.data().urlImagem });
        })
        return db.collection('contatos').get()
      })
      .then((contacts) => {
        contacts.forEach((doc) => {            
          if (doc.id !== change.before.data().id){
            batch.set(db.doc(`/contatos/${doc.id}/pessoas/${change.before.data().id}`), { urlImagem: change.after.data().urlImagem }, { mergeFields: ['urlImagem'] });
          }
        })       
        return db.collection('conversas').get()
      })
      .then((conversations) => {
        conversations.forEach((doc) => {  
          if(doc.id !== change.before.data().id){
            batch.set(db.doc(`/conversas/${doc.id}/contatos/${change.before.data().id}`), { urlImagem: change.after.data().urlImagem }, { mergeFields: ['urlImagem'] });            
          }
        })  
        return batch.commit();
      })
  } else {
    return true;
  }
});


exports.deleteImageOnDeleteProduct = functions.firestore
  .document("produtos/{produtoID}")
  .onDelete(snap => {
    const produtoDeletado = snap.data();

    const imageUrl = produtoDeletado.urlImagem;
    let spltUrl = imageUrl.split("o/");
    let imageName = spltUrl[1].split("?alt")[0];

    const storage = admin.storage();
    const bucket = storage.bucket();
    const file = bucket.file(imageName);

    file
      .delete()
      .then(() => {
        console.log("Imagem excluida com sucesso!");
      })
      .catch(err => {
        console.error(err);
      });
  });

exports.deleteImageOnChangeProductImage = functions.firestore
  .document("produtos/{produtoID}")
  .onUpdate(change => {
    if (change.before.data().urlImagem !== change.after.data().urlImagem) {
      const imageUrl = change.before.data().urlImagem;
      let spltUrl = imageUrl.split("o/");
      let imageName = spltUrl[1].split("?alt")[0];

      const storage = admin.storage();
      const bucket = storage.bucket();
      const file = bucket.file(imageName);

      file
        .delete()
        .then(() => {
          console.log("Imagem excluida com sucesso!");
        })
        .catch(err => {
          console.error(err);
        });
    } else {
      return true;
    }
  });

exports.deleteImageOnChangeUserImage = functions.firestore
  .document("usuarios/{id}")
  .onUpdate(change => {
    if (
      change.before.data().urlImagem !==
        "https://firebasestorage.googleapis.com/v0/b/agroplace-project.appspot.com/o/no-img.png?alt=media" &&
      change.before.data().urlImagem !==
        "https://firebasestorage.googleapis.com/v0/b/agroplace-project.appspot.com/o/no-image.png?alt=media"
    ) {
      if (change.before.data().urlImagem !== change.after.data().urlImagem) {
        const imageUrl = change.before.data().urlImagem;
        let spltUrl = imageUrl.split("o/");
        let imageName = spltUrl[1].split("?alt")[0];

        const storage = admin.storage();
        const bucket = storage.bucket();
        const file = bucket.file(imageName);

        file
          .delete()
          .then(() => {
            console.log("Imagem excluida com sucesso!");
          })
          .catch(err => {
            console.error(err);
          });
      }
    } else {
      return true;
    }
  });

exports.onUserNameChange = functions.firestore
  .document(`/usuarios/{userId}`)
  .onUpdate(change => {
    if (change.before.data().nome !== change.after.data().nome) {
      const batch = db.batch();
      return db
        .collection("produtos")
        .where("idVendedor", "==", change.before.data().id)
        .get()
        .then(data => {
          data.forEach(doc => {
            const produto = db.doc(`/produtos/${doc.id}`);
            batch.update(produto, { vendedor: change.after.data().nome });
          });
          return db.collection("contatos").get();
        })
        .then(contacts => {
          contacts.forEach(doc => {
            if (doc.id !== change.before.data().id) {
              batch.set(
                db.doc(
                  `/contatos/${doc.id}/pessoas/${change.before.data().id}`
                ),
                { nome: change.after.data().nome },
                { merge: true }
              );
            }
          });
          return db.collection("conversas").get();
        })
        .then(conversations => {
          conversations.forEach(doc => {
            if (doc.id !== change.before.data().id) {
              batch.set(
                db.doc(
                  `/conversas/${doc.id}/contatos/${change.before.data().id}`
                ),
                { nome: change.after.data().nome },
                { merge: true }
              );
            }
          });
          return batch.commit();
        });
    } else {
      return true;
    }
  });

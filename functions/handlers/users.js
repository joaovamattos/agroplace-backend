const { admin, db } = require('../util/admin');
const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators')
const firebase = require('firebase');
const config = require('../util/config');
firebase.initializeApp(config);

// Sing users up
exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        name: req.body.name,
        phone: req.body.phone
    };

    const { valid, errors } = validateSignupData(newUser);
    if (!valid) return res.status(400).json(errors);

    const noImage = 'no-image.png';

    let token, userId; 
    firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data => {
            userId = new Buffer(newUser.email).toString('base64');
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredential = {
                nome: newUser.name,
                email: newUser.email,
                urlImagem: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImage}?alt=media`,
                telefone: newUser.phone,
                id: userId
            };
            const emailBase64 = new Buffer(newUser.email).toString('base64');
            db.doc(`/usuarios/${emailBase64}`).set(userCredential)
                .then(() => {
                    return res.status(201).json({
                        token
                    });
                })
                .catch()
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'O e-mail já está em uso!' })
            } else {
                return res.status(500).json({ general: 'Algo deu errado, por favor tente novamente!' })
            }
        })
}

// Log user in
exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    const { valid, errors } = validateLoginData(user);
    if (!valid) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({
                token
            })
        })
        .catch(err => {
            console.error(err);
            return res.status(403).json({
                general: 'Usuário ou senha inválidos! Tente novamente!'
            })
        });
}

// Add user detail
exports.addUserDetails = (req, res) => {
    
    let userDetails = reduceUserDetails(req.body);

    const emailBase64 = new Buffer(req.user.email).toString('base64');
    db.doc(`/usuarios/${emailBase64}`).update(userDetails)
    .then(() => {
        return res.json({ message: 'Telefone adicionado com sucesso!'});
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code });
    })
}

// // Get any user's detais
exports.getUserDetails = (req, res) => {
    let userData = {};
    db.doc(`/usuarios/${req.params.userId}`).get()
    .then((doc) => {
        if(doc.exists) {
            userData.user = doc.data();            
            return res.json(userData);
        } else {
            return res.status(404).json({ error: 'Usuário não encontrado!' })
        }
    }) 
    .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code });
    })
}


// // Get own user details
// exports.getAuthenticadUser = (req, res) => {
//     let userData = {};
//     db.doc(`/users/${req.user.handle}`).get()
//     .then(doc => {
//         if(doc.exists){
//             userData.credentials = doc.data();
//             return db.collection('likes').where('userHandle', '==', req.user.handle).get()
//         }
//     })
//     .then(data => {
//         userData.likes = [];
//         data.forEach(document => {
//             userData.likes.push(document.data());
//         });
//         return db
//             .collection('notifications')
//             .where('recipient', '==', req.user.handle)
//             .orderBy('createdAt', 'desc')
//             .limit(10)
//             .get();
//     })
//     .then((data) => {
//         userData.notifications = [];
//         data.forEach((doc) => {
//             userData.notifications.push({
//                 recipient: doc.data().recipient,
//                 sender: doc.data().sender,
//                 createdAt: doc.data().createdAt,
//                 screamId: doc.data().screamId,
//                 type: doc.data().type,
//                 read: doc.data().read,
//                 notificationId: doc.id
//             })
//         });
//         return res.json(userData);
//     })
//     .catch(err => {
//         console.error(err);
//         return res.status(500).json({ error: err.code })
//     })
// }

// Upload a profile pic
exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');
  
    const busboy = new BusBoy({ headers: req.headers });
  
    let imageToBeUploaded = {};
    let imageFileName;
  
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      console.log(fieldname, file, filename, encoding, mimetype);
      if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
        return res.status(400).json({ error: 'Tipo de arquivo incompatível!' });
      }
      // my.image.png => ['my', 'image', 'png']
      const imageExtension = filename.split('.')[filename.split('.').length - 1];
      // 32756238461724837.png
      imageFileName = `${Math.round(
        Math.random() * 1000000000000
      ).toString()}.${imageExtension}`;
      const filepath = path.join(os.tmpdir(), imageFileName);
      imageToBeUploaded = { filepath, mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
      admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filepath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype
            }
          }
        })
        .then(() => {
          const urlImagem = `https://firebasestorage.googleapis.com/v0/b/${
            config.storageBucket
          }/o/${imageFileName}?alt=media`;
          const emailBase64 = new Buffer(req.user.email).toString('base64');
          return db.doc(`/usuarios/${emailBase64}`).update({ urlImagem });
        })
        .then(() => {
          return res.json({ message: 'Upload realizado com sucesso' });
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: 'Algo deu errado, tente novamente!' });
        });
    });
    busboy.end(req.rawBody);
  };

//   exports.markNotificationsRead = (req, res) => {
//       let batch = db.batch();
//       req.body.forEach(notificationId => {
//           const notification = db.doc(`/notifications/${notificationId}`);
//           batch.update(notification, { read: true });
//       });
//       batch
//         .commit()
//         .then(() => {
//             return res.json({ message: 'Notifications mark read' });
//         })
//         .catch(err => {
//             console.error(err);
//             return res.status(500).json({ erro: err.code });
//         })
//   }
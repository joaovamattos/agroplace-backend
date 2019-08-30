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
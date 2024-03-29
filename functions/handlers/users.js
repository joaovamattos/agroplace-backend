const { admin, db } = require("../util/admin");
const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails
} = require("../util/validators");
const firebase = require("firebase");
const config = require("../util/config");
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

  const noImage = "no-image.png";

  let token, userId;
  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      userId = new Buffer(newUser.email).toString("base64");
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
      const emailBase64 = new Buffer(newUser.email).toString("base64");
      db.doc(`/usuarios/${emailBase64}`)
        .set(userCredential)
        .then(() => {
          return res.status(201).json({
            token
          });
        })
        .catch();
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "O e-mail já está em uso!" });
      } else {
        return res
          .status(500)
          .json({ general: "Algo deu errado, por favor tente novamente!" });
      }
    });
};

exports.signupGoogle = (req, res) => {
  const newUser = {
    email: req.body.email,
    nome: req.body.name,
    urlImagem: req.body.imageUrl
  };

  const userId = new Buffer(newUser.email).toString("base64");

  db.collection("usuarios")
    .doc(userId)
    .get()
    .then(doc => {
      user = doc.data();
      if (user)
        return res.status(200).json({ message: "Usuário existente", user });

      const userCredential = {
        id: userId,
        googleAccount: true,
        ...newUser
      };

      db.doc(`/usuarios/${userCredential.id}`)
        .set(userCredential)
        .then(() => {
          return res.status(201).json({
            message: "Cadastrado com sucesso!",
            userCredential
          });
        })
        .catch();
    })
    .catch(() => {
      return res
        .status(500)
        .json({ message: "Ocorreu um erro, por favor tente novamente" });
    });
};

// Log user in
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({
        token
      });
    })
    .catch(err => {
      console.error(err);
      return res.status(403).json({
        general: "Usuário ou senha inválidos! Tente novamente!"
      });
    });
};

// Add user detail
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  const emailBase64 = new Buffer(req.user.email).toString("base64");
  db.doc(`/usuarios/${emailBase64}`)
    .update(userDetails)
    .then(() => {
      return res.json({ message: "Informações adicionadas com sucesso!" });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: "Erro ao adicionar detalhes, por favor tente novamente!"
      });
    });
};

// // Get any user's detais
exports.getUserDetails = (req, res) => {
  let userData = {};
  db.doc(`/usuarios/${req.params.userId}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection("produtos")
          .where("idVendedor", "==", req.params.userId)
          .orderBy("dataPublicacao", "desc")
          .get();
      } else {
        return res.status(404).json({ error: "Usuário não encontrado!" });
      }
    })
    .then(data => {
      userData.products = [];
      data.forEach(doc => {
        userData.products.push({
          categoria: doc.data().categoria,
          dataPublicacao: doc.data().dataPublicacao,
          descricao: doc.data().descricao,
          idVendedor: doc.data().idVendedor,
          nome: doc.data().nome,
          urlFotoVendedor: doc.data().urlFotoVendedor,
          urlImagem: doc.data().urlImagem,
          valor: doc.data().valor,
          vendedor: doc.data().vendedor,
          idProduto: doc.id
        });
      });
      return res.status(200).json(userData);
    })
    .catch(err => {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Erro ao obter detalhes, por favor tente novamente!" });
    });
};

// Get own user details
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  const emailBase64 = new Buffer(req.user.email).toString("base64");
  db.doc(`/usuarios/${emailBase64}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Usuário não encontrado!" });
      }
      userData = doc.data();
      userData.productId = doc.id;
      return res.status(200).json(userData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: "Erro ao obter usuário logado!" });
    });
};

// Upload a profile pic
exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let imageToBeUploaded = {};
  let imageFileName;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname, file, filename, encoding, mimetype);
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Tipo de arquivo incompatível!" });
    }
    // my.image.png => ['my', 'image', 'png']
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    // 32756238461724837.png
    imageFileName = `${Math.round(
      Math.random() * 1000000000000
    ).toString()}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
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
        const urlImagem = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        const emailBase64 = new Buffer(req.user.email).toString("base64");
        return db.doc(`/usuarios/${emailBase64}`).update({ urlImagem });
      })
      .then(() => {
        return res
          .status(201)
          .json({ message: "Upload realizado com sucesso" });
      })
      .catch(err => {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Algo deu errado, tente novamente!" });
      });
  });
  busboy.end(req.rawBody);
};

exports.markMessagesRead = (req, res) => {
  let batch = db.batch();

  db.collection("mensagens")
    .doc(req.body.recipientId)
    .collection(req.user.id)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const message = db.doc(
          `/mensagens/${req.body.recipientId}/${req.user.id}/${doc.id}`
        );
        batch.update(message, { visualizada: true });
      });

      batch.commit().then(() => {
        return res
          .status(200)
          .json({ message: "Mensagens marcadas como lidas!" });
      });
    })
    .catch(err => {
      console.error(err);
      return res
        .status(500)
        .json({ erro: "Erro ao marcar mensagens como lidas!" });
    });
};

exports.updatePassword = (req, res) => {
  if (req.body.newPassword.trim() === "") {
    return res.status(400).json({ error: "A senha não pode estar em branco!" });
  }
  if (req.body.newPassword !== req.body.confirmNewPassword) {
    return res.status(400).json({ error: "As senhas não coincidem!" });
  }
  admin
    .auth()
    .updateUser(req.user.user_id, {
      password: req.body.newPassword
    })
    .then(() => {
      return res.status(200).json({ message: "Senha atualizada com sucesso!" });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao atualizar a senha!" });
    });
};

exports.sendPasswordResetEmail = (req, res) => {
  if (req.body.email.trim() === "") {
    return res.status(400).json({ error: "O e-mail estar em branco!" });
  }

  firebase
    .auth()
    .sendPasswordResetEmail(req.body.email)
    .then(() => {
      return res.status(200).json({
        message: "E-mail de redefinição de senha enviado com sucesso!"
      });
    })
    .catch(err => {
      console.error(err);
      return res
        .status(500)
        .json({ erro: "Erro ao enviar e-mail de redefinição!" });
    });
};

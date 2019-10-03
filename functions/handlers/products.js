const { db, admin } = require('../util/admin');
const config = require('../util/config');

exports.postOneProduct = (req, res) => {    
    
    if(req.body.name.trim() === ''){
        res.status(400).json({ body: 'O nome do produto não pode estar vazio!' })
    }

    const newProduct = {
        categoria: req.body.category,
        dataPublicacao: new Date().toISOString(),
        descricao: req.body.description,
        idVendedor: req.user.id,
        nome: req.body.name,
        valor: req.body.price,
        urlImagem: req.body.imageUrl,
        urlFotoVendedor: req.user.imageUrl,
        vendedor: req.user.name,
    };

    db.collection('produtos')
    .add(newProduct)
    .then(doc => {
        const resProduct = newProduct;
        resProduct.id = doc.id;
        return res.json( {resProduct} );
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: 'Algo deu errado, por favor tente novamente!'});
    })
}

exports.updateProduct = (req, res) => {    
    
  if(req.body.name.trim() === ''){
      res.status(400).json({ body: 'O nome do produto não pode estar vazio!' })
  }

  const product = {
      categoria: req.body.category,
      dataPublicacao: new Date().toISOString(),
      descricao: req.body.description,
      idVendedor: req.user.id,
      nome: req.body.name,
      valor: req.body.price,
      urlImagem: req.body.imageUrl,
      urlFotoVendedor: req.user.imageUrl,
      vendedor: req.user.name,
  };

  db.collection('produtos')
  .doc(req.params.productId)
  .set(product)
  .then(doc => {
      const resProduct = product;
      resProduct.id = doc.id;
      res.json( {resProduct} );
  })
  .catch(err => {
      res.status(500).json({error: 'Algo deu errado, por favor tente novamente!'});
      console.error(err);
  })
}

exports.uploadProductImage = (req, res) => {
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
        }/o/produtos/${imageFileName}?alt=media`;
        return res.status(201).json({ urlImage: urlImagem });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: 'Algo deu errado, tente novamente!' });
      });
  });
  busboy.end(req.rawBody);
};

exports.deleteProduct = (req, res) => {
  const document = db.doc(`/produtos/${req.params.productId}`);
  document.get()
  .then(doc => {
      if(!doc.exists){
          return res.status(404).json({ error: 'Produto não encontrado!' });
      }
      if(doc.data().userHandle !== req.user.handle){
          return res.status(403).json({ error: 'Não autorizado!' })
      } else {
          return document.delete();
      }
  })
  .then(() => {
      res.json({ message: 'Produto deletado com sucesso!' })
  })
  .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code })
  })
}

exports.getAllProducts = (req, res) => {
  db.collection('produtos')
  .orderBy('dataPublicacao', 'desc')
  .get()
  .then(data => {
      let products = [];
      data.forEach(doc =>{
          products.push({
              categoria: doc.data().categoria,
              dataPublicacao: doc.data().dataPublicacao,
              descricao: doc.data().descricao,
              idVendedor: doc.data().idVendedor,
              nome: doc.data().nome,
              valor: doc.data().valor,
              urlImagem: doc.data().urlImagem,
              urlFotoVendedor: doc.data().urlFotoVendedor,
              vendedor: doc.data().vendedor
          });
      });
      return res.json(products);
  })
  .catch(err => {
      console.error(err)
      res.status(500).json({ error: err.code })
  });
}

exports.getProduct = (req, res) => {
  let productData = {};
  db.doc(`/produtos/${req.params.productId}`)
  .get()
  .then((doc) => {
      if(!doc.exists){
          return res.status(404).json({ error: 'Produto não encontrado!' })
      }
      productData = doc.data();
      productData.productId = doc.id;
      return res.status(200).json(productData);
  })
  .catch(err => {
      return res.status(500).json({ error: err.code });
  })
}

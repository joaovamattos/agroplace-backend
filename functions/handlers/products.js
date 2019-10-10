const { db, admin } = require('../util/admin');
const config = require('../util/config');
const { reduceProductDetails, validateProductData } = require('../util/validators');

exports.postOneProduct = (req, res) => {    
    
    if(req.body.name.trim() === ''){
        res.status(400).json({ body: 'O nome do produto não pode estar vazio!' })
    }
    
    const ref = db.collection('produtos').doc();
    const id = ref.id;
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
        idProduto: id
    };

    const { valid, errors } = validateProductData(newProduct);
    if (!valid) return res.status(400).json(errors);

    db.collection('produtos')
    .doc(id)
    .set(newProduct)
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

  let product = reduceProductDetails(req.body);

  db.collection('produtos')
  .doc(req.params.productId)
  .set(product, {merge: true})
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
        const urlImagem = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
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
          return res.status(403).json({ error: 'Não autorizado, por favor faça login!' })
      } else {
          return document.delete();
      }
  })
  .then(() => {
      res.status(200).json({ message: 'Produto deletado com sucesso!' })
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
              vendedor: doc.data().vendedor,
              idProduto: doc.data().idProduto,
          });
      });
      return res.json(products);
  })
  .catch(err => {
      console.error(err)
      res.status(500).json({ error: 'Erro ao carregar produtos, por favor tente novamente!' })
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
      return res.status(500).json({ error: 'Erro ao obter o produto, por favor tente novamente!' });
  })
}

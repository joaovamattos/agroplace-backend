const { db, admin } = require('../util/admin');
const config = require('../util/config');

exports.postOneProduct = (req, res) => {    
    
    if(req.body.name.trim() === ''){
        res.status(400).json({ body: 'O nome do produto não pode estar vazio!' })
    }
    
    // const emailBase64 = new Buffer(req.user.email).toString('base64');

    const newProduct = {
        categoria: req.body.category,
        dataPublicacao: new Date().toISOString(),
        descricao: req.body.description,
        idVendedor: req.user.id,
        nome: req.body.name,
        price: req.body.price,
        urlImagem: req.body.imageUrl,
        urlFotoVendedor: req.user.imageUrl,
        vendedor: req.user.name,
    };

    db.collection('produtos')
    .add(newProduct)
    .then(doc => {
        const resProduct = newProduct;
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
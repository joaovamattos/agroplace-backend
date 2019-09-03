const { admin, db } = require('../util/admin');

exports.sendMessage = (req, res) => {    
    
    if(req.body.message.trim() === ''){
        res.status(400).json({ body: 'A mensagem não pode estar vazia!' })
    }
    
    // const emailBase64 = new Buffer(req.user.email).toString('base64');

    const newMessage = {
        idUsuario: req.user.id,
        mensagem: req.body.message,
        vizualizada: false,
        dataCriacao: new Date().toISOString()
    };
    const recipient = req.body.recipient;
    const sender = req.user.id;

    db.collection('mensagens')
    .doc(sender)
    .collection(recipient)
    .add(newMessage)
    .then(doc => {
        const resMessage = newMessage;
        resMessage.id = doc.id;
        resMessage.recipient = recipient;
        resMessage.sender = sender;
        return res.status(201).json({resMessage});
    })
    .then(() => {
        
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: 'Algo deu errado, por favor tente novamente!'});
    })
}
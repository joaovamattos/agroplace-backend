const { db } = require('../util/admin');

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
        return resMessage;
    })
    .then((resMessage) => {
        message = resMessage;
        message.vizualizada = true;
        db.collection('mensagens')
        .doc(resMessage.recipient)
        .collection(resMessage.sender)
        .add(message)
        return res.status(201).json({resMessage});
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: 'Algo deu errado, por favor tente novamente!'});
    })
}

exports.getMessages = (req, res) => {
    db.collection('mensagens')
    .doc(req.user.id)
    .collection(req.params.recipientId)
    .orderBy('dataCriacao', 'desc')
    .get()
    .then(data => {
        let messages = [];
        data.forEach(doc =>{
            messages.push({
                dataCriacao: doc.data().dataCriacao,
                id: doc.data().id,
                idUsuario: doc.data().idUsuario,
                mensagem: doc.data().mensagem,
                recipient: doc.data().recipient,
                sender: doc.data().sender,
                vizualizada: doc.data().vizualizada,
            });
        });
        return res.json(messages);
    })
    .catch(err => {
        console.error(err)
        res.status(500).json({ error: err.code })
    });
  }
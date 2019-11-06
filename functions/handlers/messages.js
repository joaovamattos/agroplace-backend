const { db } = require('../util/admin');
const moment = require('moment-timezone');

exports.sendMessage = (req, res) => {    
    
    if(req.body.message.trim() === ''){
       return res.status(400).json({ body: 'A mensagem não pode estar vazia!' })
    }
    
    let newDate = moment(new Date().toISOString());
    let date = newDate.tz('America/Porto_Velho').format();
    const newMessage = {
        idUsuario: req.user.id,
        mensagem: req.body.message,
        visualizada: false,
        dataCriacao: date 
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
        db.collection('conversas')
        .doc(resMessage.sender)
        .collection('contatos')
        .doc(resMessage.recipient)
        .set({
            idUsuario: resMessage.recipient,
            mensagem: resMessage.mensagem,
            nome: req.body.recipientName,
            urlImagem: req.body.recipientImageUrl,
            visualizada: true
        })
        return resMessage;
    })
    .then((resMessage) => {
        db.collection('conversas')
        .doc(resMessage.recipient)
        .collection('contatos')
        .doc(resMessage.sender)
        .set({
            idUsuario: resMessage.sender,
            mensagem: resMessage.mensagem,
            nome: req.user.name,
            urlImagem: req.user.imageUrl,
            visualizada: false
        })
        return resMessage;
    })
    .then((resMessage) => {
        
        db.collection('conversas')
        .doc(resMessage.recipient)
        .set({id: resMessage.idUsuario})

        db.collection('conversas')
        .doc(resMessage.sender)
        .set({id: resMessage.idUsuario})
        
        return resMessage;
    })
    .then((resMessage) => {
        message = resMessage;
        message.visualizada = true;
        db.collection('mensagens')
        .doc(resMessage.recipient)
        .collection(resMessage.sender)
        .add(message)
        return res.status(201).json({resMessage});
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: 'Algo deu errado ao enviar a mensagem, por favor tente novamente!'});
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
                visualizada: doc.data().visualizada,
            });
        });
        return res.status(200).json(messages);
    })
    .catch(err => {
        console.error(err)
        res.status(500).json({ error: 'Erro ao obter as mensagens, por favor tente novamente!' })
    });
  }
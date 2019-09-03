const { db } = require('../util/admin');

exports.addContact = (req, res) => {         
    db.collection('usuarios')
    .doc(req.params.contactId)
    .get()
    .then(contact => {
        const newContact = {
            identificadorUsuario: contact.data().id,
            email: contact.data().email,
            nome: contact.data().nome,
            telefone: contact.data().telefone,
            urlImagem: contact.data().urlImagem
        }
        return newContact;
    }).then(newContact => {
        db.collection('contatos')
        .doc(req.user.id)
        .collection('pessoas')
        .doc(req.params.contactId)
        .set(newContact)
        .then(() => {
            return res.status(201).json({ message: 'Contato adicionado com sucesso!'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: 'Erro ao adicionar contato, por favor tente novamente!'});
        })
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: 'Algo deu errado, por favor tente novamente!'});
    })
}

exports.getContacts = (req, res) => {
    db.collection('contatos')
    .doc(req.user.id)
    .collection('pessoas')
    .on()
    .get()
    .then((data) => {
        if(!data.exists){
            return res.status(404).json({ error: 'Nenhum contato encontrado!' })
        }
        let contacts = [];
        data.forEach(doc =>{
            contacts.push({
                email: doc.data().email,
                identificadorUsuario: doc.data().identificadorUsuario,
                nome: doc.data().nome,
                telefone: doc.data().telefone,
                urlImagem: doc.data().urlImagem
            });
        });
        return res.status(200).json(contacts);
    })
    .catch(err => {
        return res.status(500).json({ error: err.code });
    })
  }
  
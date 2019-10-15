const { db } = require('../util/admin');

exports.getConversations = (req, res) => {
    db.collection('conversas')
    .doc(req.user.id)
    .collection('contatos')
    .get()
    .then((snapshot) => {
        const values = snapshot.docs.map(flattenDoc);
        if(values.length === 0){
            return res.status(404).json({ error: 'Nenhuma conversa encontrado!' })
        }
        return res.status(200).json(values);
    })
    .catch(err => {
        return res.status(500).json({ error: 'Erro ao obter conversas, por favor tente novamente!' });
    })
  }
  
function flattenDoc(doc){
    return { id: doc.id, ...doc.data() };
}



exports.markConversationsRead = (req, res) => {
    let batch = db.batch();
    req.body.forEach(conversationId => {
        const conversation = db.doc(`/conversas/${req.user.id}/contatos/${conversationId}`);
        batch.update(conversation, { visualizada: true });
    });
    batch
      .commit()
      .then(() => {
          return res.status(200).json({ message: 'Conversas marcadas como lidas' });
      })
      .catch(err => {
          return res.status(500).json({ erro: 'Erro com servidor, por favor tente novamente!' });
      })
}
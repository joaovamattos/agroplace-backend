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
        return res.status(500).json({ error: err.code });
    })
  }
  
function flattenDoc(doc){
    return { id: doc.id, ...doc.data() };
}
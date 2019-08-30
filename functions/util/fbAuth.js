const { admin , db} = require('./admin');

module.exports = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('Token não existe')
        return res.status(403).json({ error: 'Não autorizado' })
    }

    admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
        req.user = decodedToken;
        console.log(decodedToken);        
        //Get user
        return db.collection('usuarios')
        .where('id', '==', new Buffer(req.user.email).toString('base64'))
        .limit(1)
        .get();
    })
    .then(data => {
        req.user.id = new Buffer(data.docs[0].data().email).toString('base64');; //Get Base64 email
        req.user.imageUrl = data.docs[0].data().imageUrl; //Get userImage
        return next();
    })
    .catch(err => {
        console.error('Erro durante a verificação de token', err);
        return res.status(403).json(err);
    })
}
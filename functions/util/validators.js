const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}

const isEmail = (email) => {
    const reqEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email.match(reqEx) ? true : false;
}

exports.validateSignupData = (data) => {
    let errors = {};
    
    if(isEmpty(data.email)){
        errors.email = 'O e-mail não pode estar em branco!';
    } else if (!isEmail(data.email)){
        errors.email = 'O endereço de e-mail informado não é válido!';
    }

    if(isEmpty(data.password))  errors.password = 'A senha não pode estar em branco!';
    if (data.password !== data.confirmPassword) errors.confirmPassword = 'As senhas não coincidem!';
    if(isEmpty(data.name))  errors.name = 'O nome não pode estar vazio!';

    return {
        errors, 
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (data) => {
    let errors = {}
    if(isEmpty(data.email)) errors.email = 'O e-mail não pode estar em branco!';
    if(isEmpty(data.password)) errors.password = 'A senha não pode estar em branco!';

    return {
        errors, 
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.reduceUserDetails = (data) => {
    let userDetails = {};
    if(data.telefone)
        if(!isEmpty(data.telefone.trim())) userDetails.telefone = data.telefone;
    if(data.nome)
        if(!isEmpty(data.nome.trim())) userDetails.nome = data.nome;
    if(data.urlImagem)
        if(!isEmpty(data.urlImagem.trim())) userDetails.urlImagem = data.urlImagem;
    return userDetails;
}

exports.reduceProductDetails = (data) => {
    let productDetails = {};
    if(data.name)
        if(!isEmpty(data.name.trim())) productDetails.nome = data.name;
    if(data.category)
        if(!isEmpty(data.category.trim())) productDetails.categoria = data.category;
    if(data.description)
        if(!isEmpty(data.description.trim())) productDetails.descricao = data.description;
    if(data.price)
        if(!isEmpty(data.price.trim())) productDetails.valor = data.price;
    if(data.imageUrl)
        if(!isEmpty(data.imageUrl.trim())) productDetails.urlImagem = data.imageUrl;
    return productDetails;
}

exports.validateProductData = (data) => {
    let errors = {};
    
    if(isEmpty(data.nome)) errors.nome = 'O nome do produto não pode estar em branco!';
    if(isEmpty(data.categoria))  errors.categoria = 'Por favor escolha uma categoria para o produto!';
    if(isEmpty(data.descricao))  errors.descricao = 'Por favor preencha uma descrição para seu produto!';
    if(isEmpty(data.valor))  errors.valor = 'O valor não pode estar vazio!';
    if(isEmpty(data.urlImagem))  errors.urlImagem = 'Por favor envie uma imagem para seu produto!';

    return {
        errors, 
        valid: Object.keys(errors).length === 0 ? true : false
    }
}
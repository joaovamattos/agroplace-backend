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
    if(!isEmpty(data.telefone.trim())) userDetails.telefone = data.telefone;
    return userDetails;
}
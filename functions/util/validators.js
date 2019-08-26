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
        errors.email = 'O campo não pode estar vazio!';
    } else if (!isEmail(data.email)){
        errors.email = 'O endereço de e-mail informado não é válido!';
    }

    if(isEmpty(data.password))  errors.password = 'O campo não pode estar vazio!';
    if (data.password !== data.confirmPassword) errors.confirmPassword = 'As senhas não coincidem!';
    if(isEmpty(data.handle))  errors.handle = 'O campo não pode estar vazio!';

    return {
        errors, 
        valid: Object.keys(errors).length === 0 ? true : false
    }

}

exports.validateLoginData = (data) => {
    let errors = {}
    if(isEmpty(data.email)) errors.email = 'O campo não pode estar vazio!';
    if(isEmpty(data.password)) errors.password = 'O campo não pode estar vazio!';

    return {
        errors, 
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.reduceUserDetails = (data) => {
    // let userDetails = {};

    // if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
    // if(!isEmpty(data.website.trim())){
    //     // https://website.com
    //     if(data.website.trim().substring(0, 4) !== 'http'){
    //         userDetails.website = `http://${data.website.trim()}`;
    //     } else userDetails.website = data.website;
    // }
    // if(!isEmpty(data.location.trim())) userDetails.location = data.location;

    // return userDetails;
}
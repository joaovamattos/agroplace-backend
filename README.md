# agroplace-backend

## Configurando o projeto
Instale o Firebase-Tools globalmente em seu computador

> npm install -g firebase-tools

Após isso faça login no Firebase

> firebase login

Crie dentro da pasta 'utils' um arquivo 'config.js' que exporte as configurações do seu projeto no firebase. Ex:

```
module.exports = {
    apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "xxxx.firebaseapp.com",
    databaseURL: "https://xxxxx.firebaseio.com",
    projectId: "xxxxx",
    storageBucket: "xxxxxx.appspot.com",
    messagingSenderId: "xxxxx",
    appId: "x:xxxxx:xxx:xxxxx"
} 
```

No diretório do seu projeto, inicie o projeto no firebase e faça o deploy
> firebase init

> firebase deploy

## Dependências do projeto
Para instalar as dependências do projeto utilize o comando:

> npm install

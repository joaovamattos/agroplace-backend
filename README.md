<h1 align="center">
    <img alt="Agroplace" src="https://agroplace-project.web.app/static/media/green-agroplace.403f9dca.svg" width="200px" />
</h1>

# agroplace-backend

## Sobre o projeto

O Agroplace é um projeto criado para sanar uma necessidade do cone sul do estado de Rondônia - Brasil. Surgiu como um projeto do CNPq em parceria entre o IFRO - Instituto Federal de Educação, Ciência e Tecnologia de Rondônia campus Vilhena e campus Colorado do Oeste. Além de produto do projeto é meu produto no trabalho de conclusão no CST Análise e Desenvolvimento de Sistemas ofertado pelo IFRO campus Vilhena.

### O que é?

O Agroplace é um Marketplace voltado para produtos rurais do cone sul do estado de Rondônia - Brasil, flexibilizando e agilizando a comunicação entre o produtor e o consumidor final, dispensando intermediários e melhorando a visibilidades dos produtos.

### Funcionalidades

- Manutenção de perfis;
- CRUD de produtos;
- Mensagens em tempo real. 

### Sobre o desenvolvimento

O back-end do Agroplace foi criado utilizando Express e seu deploy foi feito no Firebase.

- Tecnologias utilizadas:
 - Express
 - Cors
 - Firebase
 - Moment
 - Busboy
 - Swagger
 
## Getting Started

### Clonando o projeto

> git clone https://github.com/joaovamattos/agroplace-backend.git

### Configurando o projeto
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

### Dependências do projeto
Para instalar as dependências do projeto utilize o comando:

> npm install

## Licença

A licença de uso escolhida para o projeto foi a MIT e pode ser encontrada em https://github.com/joaovamattos/agroplace-backend/blob/master/LICENSE

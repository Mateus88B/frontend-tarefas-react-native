# ✅ Tarefas - App Mobile

Aplicativo mobile desenvolvido com **React Native + Expo** para consumir uma API própria de tarefas.

O app permite:

- Cadastrar tarefas
- Listar tarefas
- Editar tarefas
- Excluir tarefas
- Marcar tarefas como concluídas ou pendentes

## Tecnologias

- React Native
- Expo
- Axios
- JavaScript

## Estrutura

```text
frontend-tarefas/
├── assets/
├── App.js
├── app.json
├── index.js
├── package.json
└── README.md
```

## Como executar

1. Instale as dependências:

```bash
npm install
```

2. Antes de rodar no celular físico, abra o arquivo `App.js` e altere a URL da API:

```js
const API_URL = 'http://localhost:3000/api/tasks';
```

Troque `localhost` pelo IP do computador onde o backend está rodando. Exemplo:

```js
const API_URL = 'http://192.168.0.10:3000/api/tasks';
```

Para ver o IP no Windows, use no CMD:

```bash
ipconfig
```

Procure por **Endereço IPv4**.

3. Rode o projeto:

```bash
npm start
```

4. Escaneie o QR Code com o Expo Go ou rode no navegador:

```bash
npm run web
```

## Importante

O backend precisa estar rodando antes de usar o aplicativo.

A rota principal consumida pelo app é:

```text
/api/tasks
```

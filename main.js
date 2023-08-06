const readline = require('readline');
const XmppClient = require('./xmppClient')

let cliente;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const xmppOptions = {
  service: "xmpp://alumchat.xyz:5222",
  domain: "alumchat.xyz",
  username: "paodeleon",
  password: "pao",
  tls: {
    rejectUnauthorized: true,
  }
};

async function start() {
  const myClient = new XmppClient("paodeleon@alumchat.xyz", "pao");
  await myClient.connect();
  cliente = myClient;
}

const displayMenu = () => {
  console.log('Menu:');
  console.log('1. Obtener información de contactos');
  console.log('2. Opción 2');
  console.log('3. Salir');
}

const handleChoice = async (choice) => {
  switch (choice) {
    case '1':
      console.log('Mostrando información de contactos...');
      cliente.getRoster();
      displayMenu();
      askForChoice();
      break;
    case '2':
      console.log('Seleccionaste la opción 2');
      displayMenu();
      askForChoice();
      break;
    case '3':
      console.log('Saliendo del programa');
      rl.close();
      await xmpp.desconectar();
      process.exit();
      break;
    default:
      console.log('Opción no válida');
      displayMenu();
      askForChoice();
      break;
  }
}

const askForChoice = () => {
  rl.question('Ingrese el número de opción: ', (choice) => {
    handleChoice(choice);
  });
}

start();
displayMenu();
askForChoice();

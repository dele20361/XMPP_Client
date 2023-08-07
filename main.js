const readline = require('readline');
const XmppClient = require('./xmppClient')
const { xml } = require("@xmpp/client");
const { SimpleXMPP } = require('simple-xmpp');

let cliente;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function start() {
  const myClient = new XmppClient("paodeleon", "pao");
  await myClient.connect();
  cliente = myClient;
}

const displayMenu = () => {
  console.log('\n\n---------------------------------------------');
  console.log('                   MENU');
  console.log('1. Obtener información de contactos');
  console.log('2. Opción 2');
  console.log('3. Salir');
  console.log('---------------------------------------------');
}

const handleChoice = async (choice) => {
  switch (choice) {
    case '1':
      console.log('\n\n\n 1) Mostrando información de contactos...');
      const presenceStanza = xml(
        "presence",
        { from: 'paodeleon@alumchat.xyz' },
        xml("show", {}, "away"), 
        xml("status", {}, "Hola :)") 
      );      
    
      cliente.send(presenceStanza);

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
      // await xmpp.desconectar();
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
  rl.question('>> Ingrese el número de opción: ', (choice) => {
    handleChoice(choice);
  });
}

start();
displayMenu();
askForChoice();


// En resumen, este error "401" indica que el usuario "alumchat.xyz/m1p2b6h33" no tiene las credenciales de autenticación 
// correctas o no está autorizado para realizar la acción que intentó, 
// posiblemente debido a un problema con las credenciales de inicio de sesión o permisos insuficientes en el servidor XMPP.
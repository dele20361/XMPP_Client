const readline = require('readline');
const XmppClient = require('./xmppClient')
const { xml, client } = require("@xmpp/client");
const { SimpleXMPP } = require('simple-xmpp');
const stanzas = require("./stanzas");

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
  console.log('\n\n------------------------------------------');
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

      const petition = stanzas.rosterRequest(this.completeJID);
      await cliente.send(petition);
      roster = cliente.roster;
      const myPresence = stanzas.presenceStanza("available", "hola!!!");
      await cliente.send(myPresence);
  
      for (const jid of roster) {
        console.log(jid);
        const contactStanza = stanzas.getInfoContact(jid);
        await cliente.send(contactStanza);
      }

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
      await cliente.disconnect();
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

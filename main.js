const readline = require('readline');
const XmppClient = require('./xmppClient');
const { xml, client } = require('@xmpp/client');
const { SimpleXMPP } = require('simple-xmpp');

let cliente;
let jid;
let password;
let contactos;

// Función para obtener la entrada del usuario como promesa
function questionAsync(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const displayMainMenu = () => {
  console.log('\n\n---------------------------------------------');
  console.log('                   MENU');
  console.log('1. Contactos y estado');
  console.log('2. Agregar un usuario.');
  console.log('3. Detalles de contacto de un usuario');
  console.log('4. Chat privado');
  console.log('5. Chat grupal');
  console.log('6. Editar mensaje de presencia');
  console.log('7. Cerrar Sesión');
  console.log('---------------------------------------------');
};

const displayLoginMenu = () => {
  console.log('\n\n---------------------------------------------');
  console.log('            MENU DE INICIO');
  console.log('1. Register');
  console.log('2. Login');
  console.log('---------------------------------------------');
};

const handleLoginChoice = async (choice) => {
  switch (choice) {
    case '1':
      // Lógica para crear una cuenta
      // ...
      // Luego de crear la cuenta, continuamos al menú principal
      displayMainMenu();
      askForChoice();
      break;

    case '2':
      (async () => {
        rl.question('>> Ingrese su JID: ', async (jidInput) => {
          jid = jidInput;
          rl.question('>> Ingrese su contraseña: ', async (passwordInput) => {
            password = passwordInput;
            const isConnected = await start();
            if (isConnected === 0) {
              displayMainMenu();
              askForChoice();
            } else {
              rl.close();
              process.exit(0);
            }
          });
        });
      })();
      break;
      

    default:
      console.log('Opción no válida');
      displayLoginMenu();
      askForLoginChoice();
      break;
  }
};

const askForLoginChoice = () => {
  rl.question('>> Ingrese el número de opción: ', (choice) => {
    handleLoginChoice(choice);
  });
};

const handleChoice = async (choice) => {
  switch (choice) {
    case '1':

      console.log('\n\n\n 1) Mostrando información de contactos...');
      
      await cliente.getContactsInfo();

      // Mostrar detalles de presencia
      contactos = cliente.contacts;
      contactos.forEach((contacto) => {
        console.log(`\n •  Detalles de ${contacto.from}:`);
        console.log(`    Estado: ${contacto.state}`);
        console.log(`    Mensaje de estado: ${contacto.bio}`);
      })

      displayMainMenu();
      askForChoice();
      break;

    case '2':
      console.log('Seleccionaste la opción 2');
      displayMainMenu();
      askForChoice();
      break;

    case '3':
      console.log('3) Detalles de contacto de un usuario');

      // Solicitar JID
      const searchJID = await questionAsync(">> Ingrese el JID del usuario a buscar: ");

      // Mostrar info
      await cliente.getContactsInfo();

      const contactos = cliente.contacts;
      contactos.forEach((contacto) => {
        if (contacto.from.split('@')[0] === searchJID) {
          console.log(`\n •  Detalles de ${contacto.from}:`);
          console.log(`    Estado: ${contacto.state}`);
          console.log(`    Mensaje de estado: ${contacto.bio}`);
        }
      });

      displayMainMenu();
      askForChoice();
      break;

    case '5':
      

      displayMainMenu();
      askForChoice();
      break;

    case '7':
      rl.close();
      await cliente.disconnect();
      console.log(`Adiós ${jid}!`);
      process.exit();
      break;

    default:
      console.log('Opción no válida');
      displayMainMenu();
      askForChoice();
      break;
  }
}

const askForChoice = () => {
  rl.question('>> Ingrese el número de opción: ', (choice) => {
    handleChoice(choice);
  });
};

async function start() {
  const myClient = new XmppClient(jid, password);
  const isConnected = await myClient.connect();
  cliente = myClient;

  return isConnected;
}

displayLoginMenu();
askForLoginChoice();
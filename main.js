const readline = require('readline');
const XmppClient = require('./xmppClient');
const { xml, client } = require('@xmpp/client');
const registration = require('./register')

let cliente;
let jid;
let password;

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
  console.log('7. Enviar archivo');
  console.log('8. Cerrar Sesión');
  console.log('9. Eliminar cuenta');
  console.log('---------------------------------------------');
};

const displayLoginMenu = () => {
  console.log('\n\n---------------------------------------------');
  console.log('            MENU DE INICIO');
  console.log('1. Register');
  console.log('2. Login');
  console.log('---------------------------------------------');
};

const displayGroupchatMenu = () => {
  console.log('\n\n    -------------------------------------');
  console.log('                MENU GROUPCHAT ');
  console.log("    1. Añadir amigos");
  console.log("    2. Enviar mensaje");
  console.log("    3. Desconectarte");
  console.log('    -------------------------------------');
}

const handleLoginChoice = async (choice) => {
  switch (choice) {
    case '1':
      const newJID = await questionAsync(">> Ingresa el jid del usuario nuevo: ");
      const newpass = await questionAsync(">> Ingresa la contraseña del usuario nuevo: ");
      await registration.register(newJID, newpass);

      jid = newJID;
      password = newpass;

      const isConnected = await start();
      if (isConnected === 0) {
        displayMainMenu();
        askForChoice();
      } else {
        rl.close();
        process.exit(0);
      }

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

const handleGroupchatChoice = (room) => {
  return new Promise((resolve, reject) => {
    const askForGroupChatChoice = () => {
      rl.question('    >> Ingrese el número de opción: ', async (choice) => {
        await handleGroupchatOption(choice, room);
        if (choice !== '3') {
          askForGroupChatChoice();
        } else {
          resolve();
        }
      });
    };

    askForGroupChatChoice();
  });
};

const handleGroupchatOption = async (choice, room) => {
  switch (choice) {
    case '1':
      // Agregar a un usuario
      const inviteJID = await questionAsync("    >> Ingresa el JID del amigo a invitar: ");
      cliente.sendInvite(inviteJID, room)
      displayGroupchatMenu();
      break;

    case '2':
      displayGroupchatMenu();
      // Lógica para la opción 2
      const message = await questionAsync(">> Ingresa el mensaje que deseas enviar: ");

      await cliente.groupMessage(message, room, jid);

      break;

    case '3':
      console.log('Desconectándote...');
      rl.close();
      break;

    default:
      console.log('\n\n\n Opción no válida');
      displayGroupchatMenu();
      break;
  }
};

const handleChoice = async (choice) => {
  switch (choice) {
    case '1':

      console.log('\n\n\n 1) Mostrando información de contactos...');
      
      await cliente.getContactsInfo();

      // Mostrar detalles de presencia
      const contactos = cliente.contacts;
      contactos.forEach((contacto) => {
        console.log(`\n •  Detalles de ${contacto.from}:`);
        console.log(`    Estado: ${contacto.state}`);
        console.log(`    Mensaje de estado: ${contacto.bio}`);
      })

      displayMainMenu();
      askForChoice();
      break;

    case '2':
      const newFriend = await questionAsync(">> Ingrese el JID del usuario a agregar: ");
      await cliente.sendSubscription(newFriend);
      displayMainMenu();
      askForChoice();
      break;

    case '3':
      console.log('\n\n\n 3) Detalles de contacto de un usuario');

      // Solicitar JID
      const searchJID = await questionAsync(">> Ingrese el JID del usuario a buscar: ");

      async function searchAndPrintContactInfo(searchJID) {
        await cliente.getContactsInfo();
      
        let found = false;
        const contactos = cliente.contacts;
      
        for (const contacto of contactos) {
          const temp = contacto.from.split('@')[0];
          if (temp === searchJID) {
            found = true;
            console.log(`\n •  Detalles de ${contacto.from}:`);
            console.log(`    Estado: ${contacto.state}`);
            console.log(`    Mensaje de estado: ${contacto.bio}`);
            break; // Termina el bucle una vez encontrado el contacto
          }
        }
      
        if (!found) {
          console.log(`\n@! No tienes ningún contacto llamado ${searchJID}.`);
        }
      }

      await searchAndPrintContactInfo(searchJID);


      displayMainMenu();
      askForChoice();
      break;

    case '4':
      const to = await questionAsync(">> Ingresa el destinatario: ");
      const messagePrivate = await questionAsync(">> Ingresa el mensaje que deseas enviar: ");

      await cliente.privateMessage(messagePrivate, to);

      displayMainMenu();
      askForChoice();

      break;

    case '5':
      const room = await questionAsync(">> Ingresa el nombre del room a unirte: ");
      await cliente.createGroupChat(room, jid);

      
      // Activar listener de mensajes
      displayGroupchatMenu();
      // Desactivar listener de mensajes
      (async () => {
        await handleGroupchatChoice(room);
        displayMainMenu();
        askForChoice();
      })();
      break;

    case '6':
      const message = await questionAsync(">> Ingresa el nuevo mensaje: ");
      await cliente.changePresenceMessage(message);
      displayMainMenu();
      askForChoice();

      break;

    case '7':
      const toFile = await questionAsync(">> Ingresa el destinatario: ");
      const filePath = await questionAsync(">> Ingresa el path del archivo: ");

      await cliente.sendFile(toFile, filePath);

      displayMainMenu();
      askForChoice();
      break;

    case '8':
      rl.close();
      await cliente.disconnect();
      console.log(`Adiós ${jid}!`);
      process.exit();
      break;
    
    case '9':
      await cliente.deleteAccount(jid, password);
      rl.close();
      process.exit();

    break;

    default:
      console.log('\n\n\n Opción no válida');
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
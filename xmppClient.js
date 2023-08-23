const { client, xml } = require("@xmpp/client");
const stanzas = require('./stanzas');

class XmppClient {
  constructor(jid, password) {
    // Configuración para deshabilitar el rechazo de certificados no autorizados.
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // Propiedades del cliente XMPP
    this.jid = jid;
    this.password = password;
    this.roster = new Set();
    this.completeJID = "";
    this.contacts = new Set();
  }

  async connect() {
    try {
      // Crear conexión XMPP
      this.xmpp = client({
        service: "xmpp://alumchat.xyz:5222",
        domain: "alumchat.xyz",
        username: this.jid,
        password: this.password,
        tls: {
          rejectUnauthorized: true,
        },
      });

      let estado2;

      // Manejar eventos
      this.xmpp.on('online', async (address) => {
        this.completeJID = address.toString();
      });

      this.xmpp.on("stanza", (stanza) => {
        // Verificar si es un mensaje con cuerpo
        if (stanza.is('message') && stanza.getChild('body')) {
          const from = stanza.attrs.from.split('@')[0];
          const messageBody = stanza.getChildText('body');
          console.log(`\n- - - - - - - - - - - - - - - - - - - - - - - - - - -\n!!! Mensaje de ${from}: ${messageBody}\n- - - - - - - - - - - - - - - - - - - - - - - - - - -`);
        }
        // Verificar si es un mensaje de tipo 'chat'
        else if (stanza.attrs.type === 'chat') {
          const from = stanza.attrs.from.split('@')[0];
          const body = stanza.getChildText('body');

          const coded_data = stanza.getChildText('attachment');
          if (coded_data) {
            const decodedData = Buffer.from(coded_data, 'base64');
            const filepath = `./files/${body}`;
            fs.writeFileSync(filepath, decodedData);
            console.log(`\n- - - - - - - - - - - - - - - - - - - - - - - - - - -\n!!! Archivo recibido de ${from}: ${body}\n- - - - - - - - - - - - - - - - - - - - - - - - - - -`);
          }
        }
        // Verificar si es una stanza de presencia
        else if (stanza.is('presence')) {
          const from = stanza.attrs.from.split('@')[0];
          const show = stanza.getChildText("show");
          let estado2 = "Available";

          if (stanza.attrs.type !== 'unavailable') {
            if (show === "chat") {
              estado2 = "Available";
            } else if (show) {
              estado2 = show;
            }
          }

          if (stanza.attrs.type === 'unavailable') {
            console.log(`\n- - - - - - - - - - - - - - - - - - - - - - - - - - -\n!!! ${from} ahora no está disponible\n- - - - - - - - - - - - - - - - - - - - - - - - - - -`);
          } else if (estado2 === 'Available') {
            console.log(`\n- - - - - - - - - - - - - - - - - - - - - - - - - - -\n!!! ${from} ahora está disponible\n- - - - - - - - - - - - - - - - - - - - - - - - - - -`);
          } else if (stanza.attrs.type === 'subscribe') {
            // send accept subscribe
            const friendStanza = stanzas.acceptRequest(from);
            this.xmpp.send(friendStanza)
            console.log(`\n- - - - - - - - - - - - - - - - - - - - - - - - - - -\n!!! ${from} te ha añadido como amigo!\n- - - - - - - - - - - - - - - - - - - - - - - - - - -`);
          }
        }
      });

      // Iniciar la conexión
      await this.xmpp.start();

      return 0;

    } catch (error) {
      console.error("@! JID o contraseña incorrecta.\n\n", error);

      return 1;
    }
  }


  async disconnect() {
    try {
      if (this.xmpp) {
        const offline = stanzas.offline();
        this.xmpp.send(offline);

        await this.xmpp.stop();
        console.log("Desconectado del servidor.");
      } else {
        console.log("No estás conectado.");
      }
    } catch (error) {
      console.log("@! Error al desconectarse.");
    }
  }


  async send(stanza) {
    this.xmpp.send(stanza);
  }


  sendInvite = (to, room) => {
    return new Promise(async (resolve, reject) => {
      const stanza = stanzas.addUserToRoom(to, room);
      await this.xmpp.send(stanza);
      resolve();
      console.log(`\n!!! Invitación a ${to} para unirse a ${room} enviada exitosamente!`);
    });
  }
  
  sendSubscription = (to) => {
    return new Promise(async (resolve, reject) => {
      const stanza = stanzas.addUser(to);
      await this.xmpp.send(stanza);
      resolve();
      console.log(`\n!!! Invitación a ${to} para ser tu amigo enviada exitosamente!`);
    });
  }


  handleInvitation = (stanza) => {
    if (
      stanza.is("message") &&
      stanza.getChild("x", "http://jabber.org/protocol/muc#user") &&
      stanza.getChild("x", "jabber:x:conference")
    ) {
      const inviteFrom = stanza.getChild("x").getChild("invite").attrs.from;
      const roomJID = stanza.attrs.from;

      console.log(`\n!!! Recibiste una invitación para unirte a la sala ${roomJID} de ${inviteFrom}`);

      // Aceptar la invitación automáticamente
      const acceptStanza = stanzas.acceptGroupInvite(roomJID);
      this.xmpp.send(acceptStanza);

      console.log(`   Invitación aceptada automáticamente para la sala ${roomJID}`);
    }
  };


  getContactsInfo() {
    /*
      Manejo de promesas para opción 1 de menú.
      Función llamada desde menú.
    */
    return new Promise((resolve, reject) => {
      const rosterPromise = this.getRoster();
      const presencePromise = this.sendPresenceRequests();

      Promise.all([rosterPromise, presencePromise])
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }


  handleRoster(stanza) {
    /*
      Handler para añadir contactos a roster.
      Función utilizada en getRoster.
    */
    const stanzaId = stanza.attrs.id;

    if (stanzaId === 'getRoster') {

      const queryElement = stanza.getChild('query', 'jabber:iq:roster');

      if (queryElement) {
        const items = queryElement.getChildren('item');

        // Agregar JID al conjunto de roster
        for (const item of items) {
          const jid = item.attrs.jid;
          this.roster.add(jid);
        }
      }
    }
  }


  getRoster() {
    /*
      Envío de stanza para obtener roster.
      Función utilizada en getContactsInfo.
    */
    return new Promise((resolve, reject) => {
      const petition = stanzas.rosterRequest(this.completeJID);
      this.xmpp.send(petition);

      this.xmpp.on("stanza", (stanza) => {
        if (stanza.is("iq")) {
          this.handleRoster(stanza);
          resolve();
        }
      });
    });
  }


  sendPresenceRequests() {
    /*
      Enviar presencia y obtener presencia de contactos.
      Función utilizada en getContactsInfo.
    */
    return new Promise((resolve, reject) => {
      const myPresence = stanzas.presenceStanza("available", "Hola amigos!");
      this.xmpp.send(myPresence);

      const presenceHandler = (stanza) => {
        if (stanza.is("presence")) {
          this.handlePresenceStanza(stanza);
          resolve();
        }
      };

      this.xmpp.on("stanza", presenceHandler);
    });
  }


  async changePresenceMessage(message) {
    try {
      const myPresence = stanzas.presenceStanza("available", message);
      await this.xmpp.send(myPresence);
      console.log("!!! Cambio de estado a: ", message);
    } catch (error) {
      console.error(`\nXXX Error al enviar la presencia: ${error}`);
    }
  }



  handlePresenceStanza(stanza) {
    /*
      Obtener información de presencia de contactos y alamcenarla.
      Función utilizada en sendPresenceRequest.
    */
    const fromJID = stanza.attrs.from;
    const presenceType = stanza.attrs.type;
    const statusElement = stanza.getChild("status");

    let estado = "";
    if (presenceType === "unavailable") {
      estado = "Offline";
    } else {
      const show = stanza.getChildText("show");
      if (show === "chat") {
        estado = "Available";
      } else if (show) {
        estado = show;
      } else {
        estado = "Available";
      }
    }

    const mensajeEstado = statusElement ? statusElement.getText() : "Sin mensaje de estado";

    // Datos del nuevo contacto
    const newContact = {
      from: fromJID,
      state: estado,
      bio: mensajeEstado
    };

    // Buscar y eliminar el contacto antiguo (si existe)
    let contactToDelete = null;
    this.contacts.forEach(contact => {
      if (contact.from === fromJID) {
        contactToDelete = contact;
      }
    });

    if (contactToDelete !== null) {
      this.contacts.delete(contactToDelete);
    }

    // Agregar el nuevo contacto
    this.contacts.add(newContact);

  }


  async createGroupChat(roomName, jid) {
    return new Promise(async (resolve, reject) => {
      try {
        const createRoomStanza = stanzas.createChatRoomStanza(roomName, jid);
        console.log(createRoomStanza.toString());
        const createConfigStanza = stanzas.generateConfigStanza(roomName);

        await this.xmpp.send(createRoomStanza);
        await this.xmpp.send(createConfigStanza);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }



  async privateMessage(message, to) {
    try {
      const privateMessageStanza = stanzas.privateMessage(message, to);
      await this.xmpp.send(privateMessageStanza);
      console.log("!!! Mensaje enviado",);
    } catch (error) {
      console.error(`\nXXX Error al enviar la presencia: ${error}`);
    }
  }


  async groupMessage(message, room, from) {
    try {
      const groupMessageStanza = stanzas.groupMessage(message, room, from);
      await this.xmpp.send(groupMessageStanza);
      console.log("!!! Mensaje enviado",);
    } catch (error) {
      console.error(`\nXXX Error al enviar la presencia: ${error}`);
    }
  }


  async sendFile(to, filePath) {
    try {
      const sendFileStanza = stanzas.sendFile(to, filePath);
      await this.xmpp.send(sendFileStanza);
      console.log("!!! Archivo enviado",);
    } catch (error) {
      console.error(`\nXXX Error al enviar la presencia: ${error}`);
    }
  }

}


module.exports = XmppClient;

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

      // Manejar eventos
      this.xmpp.on('online', async (address) => {
        this.completeJID = address.toString();
      });

      // Iniciar la conexión
      await this.xmpp.start();
    } catch (error) {
      console.log("@! Error en la conexión.");
    }
  }


  async disconnect() {
    try {
      if (this.xmpp) {
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

      this.xmpp.on("stanza", (stanza) => {
        if (stanza.is("presence")) {
          this.handlePresenceStanza(stanza);
          resolve();
        }
      });

    });
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
}

module.exports = XmppClient;

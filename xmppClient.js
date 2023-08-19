const { client, xml } = require("@xmpp/client");

class XmppClient {
  constructor(jid, password) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    this.jid = jid;
    this.password = password;
    this.roster = new Set();
    this.completeJID = ""
  }

  async connect() {
    try {
      this.xmpp = client({
        service: "xmpp://alumchat.xyz:5222",
        domain: "alumchat.xyz",
        username: this.jid,
        password: this.password,
        tls: {
          rejectUnauthorized: true,
        },
      });

      this.xmpp.on('online', async (address) => {
        this.completeJID = address.toString();
      });

      this.xmpp.on("stanza", (stanza) => {
        // Llamar según tipo de stanza
        // de presencia:
        if (stanza.is("presence")) {
          this.manejarPresencia(stanza);
        }
        // de iq
        else if (stanza.is("iq")) {
          this.getRoster(stanza);
        }
      });

      this.xmpp.start().catch(console.error);
    } catch (error) {
      console.log("@! Error en conección.");
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
      console.log("@! Error al desconectarse:", error);
    }
  }

  async send(stanza) {
    this.xmpp.send(stanza);
  }

  getRoster(stanza) {
    // Verificar id para obtener info de roter
    const stanzaId = stanza.attrs.id;

    if (stanzaId === 'getRoster') {

      const queryElement = stanza.getChild('query', 'jabber:iq:roster');

      if (queryElement) {
        const items = queryElement.getChildren('item');

        // Añadir jid a set de roster
        for (const item of items) {
          const jid = item.attrs.jid;
          this.roster.add(jid);
        }

      }
    }
  }

  manejarPresencia(stanza) {
    const stanzaId = stanza.attrs.id;

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

    console.log(`\n •  Detalles de ${fromJID}:`);
    console.log(`    Estado: ${estado}`);
    console.log(`    Mensaje de estado: ${mensajeEstado}`);
  }

}

module.exports = XmppClient;

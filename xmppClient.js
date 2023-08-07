const { client, xml } = require("@xmpp/client");

class XmppClient {
  constructor(jid, password) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    this.jid = jid;
    this.password = password;
    this.roster = new Set();
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
        console.log(`Conectado! Us uario: ${address.toString()}`);
      });

      this.xmpp.on("roster", (items) => {
        for (const item of items) {
          this.roster.add(item.jid);
        }
      });

      this.xmpp.on("stanza", (stanza) => {
        this.manejarPresencia(stanza);
      });

      this.xmpp.start().catch(console.error);
    } catch (error) {
      console.log("@! Error en conección.");
    }
  }

  async send(stanza) {
    this.xmpp.send(stanza);
  }

  manejarPresencia(stanza) {
    if (stanza.is("presence")) {
      const presenceType = stanza.attrs.type;
      let fromJID;
  
      if (stanza.attrs.from) {
        fromJID = stanza.attrs.from;
      } else if (stanza.parent && stanza.parent.attrs && stanza.parent.attrs.from) {
        fromJID = stanza.parent.attrs.from;
      } else {
        console.log("No se pudo encontrar el JID en la stanza de presencia.");
        return;
      }
  
      const showElement = stanza.getChild("show");
      const statusElement = stanza.getChild("status");
  
      let estado = "";
      if (presenceType === "unavailable") {
        estado = "Offline";
      } else {
        const show = showElement ? showElement.getText() : "";
        if (show === "chat") {
          estado = "Available";
        } else if (show) {
          estado = show;
        } else {
          estado = "Available";
        }
      }
  
      const mensajeEstado = statusElement ? statusElement.getText() : "Sin mensaje de estado";
  
      console.log(` •  Detalles de ${fromJID}:`);
      console.log(`    Estado: ${estado}`);
      console.log(`    Mensaje de estado: ${mensajeEstado}`);
    } else if (stanza.is("iq") && stanza.attrs.type === "result" && stanza.getChild("query", "jabber:iq:roster")) {
      console.log("Llamada a iq handler");
    } else if (stanza.is("presence") && stanza.attrs.type === "error") {
      const errorElement = stanza.getChild("error");
      console.log("Error en la respuesta de roster:", errorElement.toString());
    }
  }
  
  

}

module.exports = XmppClient;

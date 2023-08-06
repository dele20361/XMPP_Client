const { client, xml } = require("@xmpp/client");

class XmppClient {
  constructor(jid, password) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    this.jid = jid;
    this.password = password;
  }

  async connect() {
    console.log("HOLA")
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
      this.xmpp.start().catch(console.error);
      console.log("Conectado! Usuario", this.jid);
    } catch (error) {
      console.log("@! Error en conección.");
    }
  }

  async getRoster () {
    const roster = new Set();
  
    if (this.xmpp) { // Add this undefined check
        console.log("YES")
        const rosterRequest = xml(
            "iq",
            { from: this.jid, to: this.jid, type: "get" },
            xml("query", { xmlns: "jabber:iq:roster" })
        );
        this.xmpp.send(rosterRequest).catch((error) => {
            console.error("Error sending roster request:", error);
        });
  
    }
  }
  
}

module.exports = XmppClient;
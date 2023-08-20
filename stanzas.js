const { xml } = require("@xmpp/client");

const stanzas = {

    presenceStanza: (show, status) => {
        const presenceStanza = xml(
           "presence",
           {
               id: "getContactsInfo",
           },
           xml("show", {}, show),
           xml("status", {}, status)
       )

       return presenceStanza;
    },

    rosterRequest: (jid) => {
        const rosterStanza = xml(
            "iq",
            {
                id: "getRoster",
                to: jid,
                type: "get"
            },
            xml("query", { xmlns: "jabber:iq:roster" })
        )

        return rosterStanza;
    },

    getInfoContact: (jid) => {
        const contactStanza = xml(
            "presence",
            {
                id: "getContactsInfo",
                to: jid,
                type: "get"
            }
        )
        return contactStanza;
    }

};

module.exports = stanzas;
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

    offline: () => {
        const offlineStanza = xml(
            "presence",
            {
                id: "getContactsInfo",
            },
            xml("show", {}, "Offline")
        )

        return offlineStanza;
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
                to: `${jid}@alumchat.xyz`,
                type: "probe"
            }
        )
        return contactStanza;
    },

    joinRoom: (roomJID, userJID) => {
        const joinRoomStanza = xml(
            "presence",
            {
                to: `${roomJID}@conference.alumchat.xyz/${userJID}`,
                from: `${roomJID}@conference.alumchat.xyz/${userJID}`
            }
        );

        const xElement = xml(
            "x",
            {
                xmlns: "http://jabber.org/protocol/muc#user"
            }
        );

        const itemElement = xml(
            "item",
            {
                jid: `${userJID}`,
                affiliation: "owner",
                role: "moderator"
            }
        );

        xElement.append(itemElement);
        joinRoomStanza.append(xElement);

        console.log(joinRoomStanza.toString())
        return joinRoomStanza;
    },

    addUserToRoom: (userJID, roomName) => {
        const stanza = xml(
            "iq",
            {
                to: `${roomName}@conference.alumchat.xyz`,
                type: "set",
                id: "addUserToRoom"
            },
            xml(
                "query",
                {
                    xmlns: "http://jabber.org/protocol/muc#admin"
                },
                xml(
                    "item",
                    {
                        jid: userJID,
                        affiliation: "owner"
                    }
                )
            )
        );

        return stanza;
    },

    acceptGroupInvite: (roomJID) => {
        const acceptStanza = xml(
            "presence",
            {
                to: `${roomJID}@conference.alumchat.xyz`,
            },
            xml("show", {}, "Available"),
        );
        return acceptStanza;
    },



};

module.exports = stanzas;
const XmppClient = require('./xmppClient');
const { xml, client } = require('@xmpp/client');

const registration = {

    register: async (user, password) => {
        const myClient = new XmppClient('admin20361', 'pao');
        const isConnected = await myClient.connect();
        cliente = myClient;

        const stanza = xml(
            'iq',
            { type: 'set', id: 'register1' },
            xml('query', { xmlns: 'jabber:iq:register' },
                xml("username", {}, user),
                xml("password", {}, password),
            ));

        await cliente.send(stanza);
        console.log('Registro realizado exitosamente!');

        cliente.disconnect();
        console.log('Espera un segundo por favor...\n');

    }
}

module.exports = registration;
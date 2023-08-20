const stanzas = require('./stanzas');

const optionHandler = {

    getContactsInfo: async (cliente) => {
        const petition = stanzas.rosterRequest(cliente.completeJID); // Cambio aquí
        await cliente.send(petition);
        roster = cliente.roster;
        
        const myPresence = stanzas.presenceStanza("Available", "Hola amigos!");
        await cliente.send(myPresence);
        
        for (const jid of roster) {
          console.log(jid);
          const contactStanza = stanzas.getInfoContact(jid);
          await cliente.send(contactStanza);
        }
        
        const withPresence = cliente.withPresence;
        const jidNotInWithPresence = new Set(
          [...roster].filter(jid1 => ![...withPresence].some(jid2 => jid2.split("/")[0] === jid1))
        );
        
        for (const jid of jidNotInWithPresence) {
          console.log(`\n •  Detalles de ${jid}:`);
          console.log(`    Estado: Offline`);
        }
    }

}

module.exports = optionHandler;


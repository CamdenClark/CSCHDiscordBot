module.exports = (msg) => {
    if (msg.content.toLowerCase().startsWith('!timezone')) {
        msg.reply('Kevin is in PDT, so all time references from him should be assumed PDT, unless otherwise specified.')
    }
}
    
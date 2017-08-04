module.exports = (msg) => {
    if (msg.content.toLowerCase().startsWith('!timezone')) {
        msg.reply('Kevin is in PDT, so all time references from him should be assumed PDT, unless otherwise specified.\n' +
            'You can convert a time to PDT easily by going to https://www.google.com/search?q=[time]+[your timezone]+to+PDT');
    }


};
    
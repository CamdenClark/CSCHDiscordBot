const { random } = require("lodash");
const Inspiration = require("../models/inspirationModel");

module.exports = (msg) => {
    const splitmsg = msg.content.split(" ");

    const listenChan = productionEnv ? "general" : "bot-development"; 

    function addInspiration() {
        const tempInspiration = new Inspiration({story: splitmsg[2]});
        tempInspiration.save().then(msg.reply("succesfully added your story!"));
    }

    function sendHelpInspiration() {
        msg.reply(`
    Use !inspiration to get some inspiration!
    Use !inspiration add [story] to add your story!
    Stay inspired everyone!
        `);
    }

    function sendInspiration() {
        Inspiration.find()
            .then((allStories) => {
                const randInspiration = random(0, allStories.length - 1);
                msg.reply(`"${allStories[randInspiration].story}"`);
            })
            .catch((err) => console.log(err));
    }
    
    if ((msg.channel.name === listenChan) && msg.content.toLowerCase().startsWith('!inspiration')) {
        if (splitmsg.length >= 3) {
            splitmsg[2] = splitmsg.slice(2).join(" ");
            switch(splitmsg[1].toLowerCase()) {
                case 'add':
                    addInspiration();
                    break;
                default:
                    sendHelpInspiration();
                    break;
            }
        } else if (splitmsg.length === 1) {
            sendInspiration();
        } else {
            sendHelpInspiration();
        }
    }
}

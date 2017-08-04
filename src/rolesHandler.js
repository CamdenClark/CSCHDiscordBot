const {map, filter, difference} = require("lodash");

module.exports = function handleRoles(msg, prod) {
    const listenChan = productionEnv ? process.env.ROLES_PROD_CHAN : process.env.DEV_CHAN;

    programmingRoles = ['C++', 'C', 'C#', 'Go', 'Haskell', 'Java', 'Javascript', 'Lisp', 'Lua',
        'Objective-C', 'PHP', 'Python', 'R', 'Ruby', 'Rust', 'Scala', 'SQL', 'Swift'];

    seniorityRoles = ['Student', 'Intern', 'Junior Developer', 'Mid-level Developer', 'Senior Developer'];

    miscRoles = ['Notifications', 'Interview Notifications'];

    var splitmsg = msg.content.split(" ");

    //output only
    function sendHelpRoles() {
        msg.reply(`
    Use "!role add [role]" to add a role.
    Use "!role remove [role]" to delete a role.
    Use "!role clear" to clear your roles.
    Must be exactly as displayed.

    Don't abuse the programming language tags, please, be reasonable!
    Programming Language Roles:
        ${programmingRoles.join('\n        ')}
        
    You are only allowed one seniority role. Select the role that best reflects where you're at in your career.
    Seniority Roles:
        ${seniorityRoles.join('\n        ')}
    
    Miscellaneous Roles:
        Notifications
            - Opt in to global notifications
        Interview Notifications
            - Opt in to interview notifications

        `);
    }

    function confirmAddedRole() {
        msg.reply(`added ${splitmsg[2]} to your roles.`);
    }

    function notValidRole() {
        msg.reply(`${splitmsg[2]} is not a valid role.`);
    }

    function duplicateRole() {
        msg.reply(`${splitmsg[2]} is already in your role list.`);
    }

    function duplicateSeniorityRole() {
        msg.reply(`you already have a seniority role.`);
    }

    //actions with output
    /**
     * attempts to remove this role from the user.
     * If the user does not currently have that role assigned,
     * this will fail and notify the user.
     **/
    function removeRole(role) {
        msg.guild.fetchMember(msg.author).then((user) => {
            if (user.roles.array().includes(stringToRole(role)) && (programmingRoles.includes(role) || seniorityRoles.includes(role) || miscRoles.includes(role))) {
                user.removeRole(stringToRole(role)).then(() => {
                    msg.reply(`successfully removed role ${role}.`);
                }).catch(() => {
                    msg.reply(`failed to remove role ${role}.`);
                });
            } else if (!user.roles.array().includes(stringToRole(role))) {
                msg.reply(`The ${role} role is not currently assigned to you.`);
            }
        });
    }

    /**
     * clears the user's currently assigned roles
     **/
    function clearRoles() {
        const bigRoles = map(['DaBosses', 'mods', 'Interviewers', 'Recruiter', 'Hiring Manager', 'Bot Creation'], stringToRole);
        msg.guild.fetchMember(msg.author).then((user) => {
            user.removeRoles(difference(user.roles.array(), bigRoles))
                .then(() => msg.reply('successfully cleared all your roles'));
        });
    }

    //internal use only
    function stringToRole(role) {
        const stringRoles = map(msg.guild.roles.array(), (i) => i.name);
        const index = stringRoles.indexOf(role);
        return msg.guild.roles.array()[index];
    }

    /**
     * returns true if the user has no seniority role assigned, and thus
     * is elegible to have a seniority role assigned.
     * return false otherwise
     **/
    function seniorityRoleBlank(user) {
        return filter(seniorityRoles, (roleName) => user.roles.array().includes(stringToRole(roleName))).length === 0;
    }

    function addRole(role) {
        msg.guild.fetchMember(msg.author).then((user) => {
            if (user.roles.array().includes(stringToRole(role))) {
                duplicateRole();
            } else if (programmingRoles.includes(role) || miscRoles.includes(role)) {
                user.addRole(stringToRole(role)).then(() => {
                    confirmAddedRole();
                }).catch(() => {
                    msg.reply(`failed to add role ${role}.`);
                });
            } else if (seniorityRoles.includes(role)) {
                if (seniorityRoleBlank(user)) {
                    user.addRole(stringToRole(role)).then(() => {
                        confirmAddedRole();
                    }).catch(() => {
                        msg.reply(`failed to add role ${role}.`);
                    });
                } else {
                    duplicateSeniorityRole();
                }
            } else {
                notValidRole();
            }
        })
    }

    //parses input
    if ((msg.channel.name === listenChan) && msg.content.toLowerCase().startsWith('!role')) {
        if (splitmsg.length === 2) {
            switch(splitmsg[1].toLowerCase()) {
                case 'clear':
                    clearRoles();
                    break;
                default:
                    sendHelpRoles();
                    break;
            }
        } else if (splitmsg.length > 2) {
            splitmsg[2] = splitmsg.slice(2).join(" ");
            switch (splitmsg[1].toLowerCase()) {
                case 'add':
                    addRole(splitmsg[2]);
                    break;
                case 'remove':
                    removeRole(splitmsg[2]);
                    break;
                default:
                    sendHelpRoles();
                    break;
            }
        } else {
            sendHelpRoles();
        }
    }
};

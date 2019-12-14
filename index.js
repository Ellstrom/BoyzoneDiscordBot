//Setup the discord bot
const Discord = require('discord.js');
const bot = new Discord.Client();

// For reading .txt file code block
var fs = require("fs");
const token = fs.readFileSync("./../token.txt").toString();

/* 
Useful Links:
    Youtube Guide: https://www.youtube.com/watch?v=X_qg0Ut9nU8
    Discord Bot Commands: https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584
*/

//Users
const userName_ellstrom44 = 'ellstrom44';
const userName_Anders13254 = 'Anders13254';
const userName_Peakman = 'Peakman';
const userName_Valacka = 'Valacka';
const userName_huto29 = 'huto29';
const userName_Lazy_Shyguy = 'Lazy_Shyguy';

console.log("token="+token);

//Login the bot
bot.login(token);

//If the bot is online
bot.on('ready', () =>{
    console.log('This bot is online!');
})

//If a message is written
bot.on('message', message=>{

    //Retreives the username of the author of the message
    var userName = message.author.username;

    //Logs the userName for debugging
    console.log("userName="+userName);   

    if(message.content === "HELLO" ){
        //Reacts to the message written
        message.react(getCustomEmoji(message, userName_ellstrom44));

        //Replies to the message written
        message.reply('HELLO '+userName+' '+getCustomEmoji(message, userName));
    } else if(message.content === "MemeMachine"){
        message.react(getCustomEmojiBasedOnEmojiName(message, 'ck_Genius'));

        message.reply(getCustomEmoji(message, '5253_BonesDancer') +'www.bit.ly/3231YVs' +getCustomEmoji(message, '5253_BonesDancer'));
    }
})

bot.on('voiceStateUpdate', (oldMember, newMember) =>{

    var oldUserChannel = oldMember.voiceChannel;
    var newUserChannel = newMember.voiceChannel;

    if(oldUserChannel === undefined && newUserChannel !== undefined) {
        //User joins a voice channel
        console.log("A user joined a voice channel!");

        const voiceChannels = newMember.guild.channels.filter(channel => channel.type === 'voice');
        var membersInChannels = []; 
        var numberOfMembersInVoiceChannels = 0;
        
        //Use for test
        //membersInChannels.push("Test Testsson");
        //numberOfMembersInVoiceChannels++;        

        for (const [channelID, channel] of voiceChannels) {
            for (const [memberID, member] of channel.members) {
                
                if(member.selfMute){
                    console.log("Muted User="+member.user.username);
                }else{
                    console.log("Not Muted User="+member.user.username);
                    membersInChannels.push(member.user.username);
                    numberOfMembersInVoiceChannels++;
                }
                
            }
        }

        var messageToSend = "A user joined a voice channel! Unmuted users in channels ("+numberOfMembersInVoiceChannels+") = ";

        console.log("number of users in voice channels= "+numberOfMembersInVoiceChannels);

        var numTimesInLoop = 0;
        for(const userName of membersInChannels){
            numTimesInLoop++;
            console.log("user in channel= "+userName);

            if((numTimesInLoop == numberOfMembersInVoiceChannels) && (numberOfMembersInVoiceChannels != 1)){
                messageToSend += ' and ';
            }else if(numTimesInLoop != 1){
                messageToSend += ', ';
            }
            messageToSend += userName;
        }
        messageToSend += '.';

        if(numberOfMembersInVoiceChannels == 5){
            messageToSend += ' TIME FOR CSGO!!??';
        }
        
        console.log("messageToSend= "+messageToSend);

        var channelName = 'notifications';
        const notificationChannel = newMember.guild.channels.find('name', channelName)

        //Clear previous messages
        async function clear() {
            const fetched = await notificationChannel.fetchMessages({limit: 99});
            notificationChannel.bulkDelete(fetched);
            console.log("cleared notificationChannel");
        }
        clear();

        notificationChannel.send(messageToSend)

    } else if(newUserChannel === undefined){
        //User leaves a voice channel
        console.log("A user left a voice channel!");
    }

})

//Returns emoji based on input userName
function getCustomEmoji(message, userName){
    //Assign user to emoji
    if(userName == userName_ellstrom44){
        return message.guild.emojis.find(emoji => emoji.name === 'Ellstrm_agent');
    }else if(userName == userName_Anders13254){
        return message.guild.emojis.find(emoji => emoji.name === 'Klint_glad');
    }else if(userName == userName_Peakman){
        return message.guild.emojis.find(emoji => emoji.name === 'Krille_coolt');
    }else if(userName == userName_Valacka){
        return message.guild.emojis.find(emoji => emoji.name === 'Valo_vad');
    }else if (userName == userName_huto29){
        return message.guild.emojis.find(emoji => emoji.name === 'Hugo_antifa');
    }else if (userName == userName_Lazy_Shyguy){
        return message.guild.emojis.find(emoji => emoji.name === 'Ludvig_pinsamt');
    }else{
        //Default case, no userName match
        return message.guild.emojis.find(emoji => emoji.name === '5253_BonesDancer');
    }
}

//Returns emoji based on input emojiName
function getCustomEmojiBasedOnEmojiName(message, emojiName){
    return message.guild.emojis.find(emoji => emoji.name === emojiName);
}
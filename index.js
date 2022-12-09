//Setup the discord bot
const Discord = require('discord.js');
const bot = new Discord.Client();

// For reading .txt file code block
var fs = require("fs");
const token = fs.readFileSync("./../token.txt").toString();
const shellytoken = fs.readFileSync("./../shellytoken.txt").toString().replace(/[^a-zA-Z0-9 ]/g, "");

const snekfetch = require('snekfetch');
const axios = require('axios');

/* 
Useful Links:
    Youtube Guide: https://www.youtube.com/watch?v=X_qg0Ut9nU8
    Discord Bot Commands: https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584
    Official Discord.js docs: https://readthedocs.org/projects/discordjs/downloads/pdf/latest/
*/

//Users
const userName_ellstrom44 = 'ellstrom44';
const userName_Anders13254 = 'Anders13254';
const userName_Peakman = 'Peakman';
const userName_Valacka = 'Valacka';
const userName_huto29 = 'huto29';
const userName_Lazy_Shyguy = 'Lazy_Shyguy';
const userName_Fabars = 'Fabars';

//Excluded channels for notifications
const excludedChannelTarkov = 'Tarkov';

console.log("token="+token);

//Login the bot
bot.login(token);

//If the bot is online
bot.on('ready', () =>{
    console.log('This bot is online!');
})

//If a message is written
bot.on('message', message=>{
    console.log("-------------------------------");
    console.log("bot.on.message=");

    //Retreives the username of the author of the message
    var userName = message.author.username;
    var displayName = message.member.displayName; 

    //Logs the userName for debugging
    console.log("displayName="+displayName);

    if(message.content === "HELLO" ){
        //Reacts to the message written
        message.react(getCustomEmoji(message, userName_ellstrom44));

        //Replies to the message written
        message.reply('HELLO '+displayName+' '+getCustomEmoji(message, userName));
    } else if(message.content === "meme me"){
        message.react(getCustomEmojiBasedOnEmojiName(message, 'ck_Genius'));
        message.reply(getCustomEmoji(message, '5253_BonesDancer') + getCustomEmoji(message, '5253_BonesDancer')+ getCustomEmoji(message, '5253_BonesDancer'));

        async function memeGenerator(message){
            try {
                const { body } = await snekfetch
                    .get('https://www.reddit.com/r/comedyheaven+dankmemes+okbuddyretard.json?sort=top&t=week')
                    .query({ limit: 20 });
                const allowed = message.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
                
                if (!allowed.length) return message.channel.send('It seems we are out of fresh memes!, Try again later.');
                const randomnumber = Math.floor(Math.random() * allowed.length)
                const embed = new Discord.RichEmbed()
                .setColor(0x00A2E8)
                .setTitle(allowed[randomnumber].data.title)
                .setDescription("Posted by: " + allowed[randomnumber].data.author)
                .setImage(allowed[randomnumber].data.url)
                .addField("Other info:", "Up votes: " + allowed[randomnumber].data.ups + " / Comments: " + allowed[randomnumber].data.num_comments)
                .setFooter("Episka memes från Reddit")
                message.channel.send(embed)
            } catch (err) {
                return console.log(err);
            }
        }

        memeGenerator(message);

    }
})

bot.on('voiceStateUpdate', (oldMember, newMember) =>{
    console.log("bot.on.voiceStateUpdate=");
    console.log("-------------------------------");
    var oldUserChannel = oldMember.voiceChannel;
    var newUserChannel = newMember.voiceChannel;

    if(oldUserChannel === undefined && newUserChannel !== undefined && newUserChannel.name !== excludedChannelTarkov) {
        //User joins a voice channel
        userJoinedDiscord(newMember);
    } else if(newUserChannel === undefined && oldUserChannel.name !== excludedChannelTarkov){
        //User leaves a voice channel
        userLeftDiscord(newMember);
    } else if(oldUserChannel !== undefined && newUserChannel !== undefined){
        if(oldMember.selfMute === false && newMember.selfMute === true  && newUserChannel.name !== excludedChannelTarkov){
            console.log("User muted");
            var membersInChannels = getAllNonMutedUsersInVoiceChannels(newMember);
            var numberOfMembersInVoiceChannels = membersInChannels.length;
            var messageToSend = "A user muted himself. Unmuted users in channels ("+numberOfMembersInVoiceChannels+")";

            messageToSend += (numberOfMembersInVoiceChannels == 0) ? '. Boyzone is silent' : ' = ';
            messageToSend += getUsersInChannelString(membersInChannels, numberOfMembersInVoiceChannels);

            var notificationChannel = getChannelByMemberAndChannelName(newMember, 'notifications');
            clearMessagesInChannel(notificationChannel);

            console.log("messageToSend= "+messageToSend);
            notificationChannel.send(messageToSend);

            if (numberOfMembersInVoiceChannels === 0) {
                toggleShellyDevice("off");
            }
        }else if(oldMember.selfMute === true && newMember.selfMute === false  && newUserChannel.name !== excludedChannelTarkov){
            console.log("User unmuted");
            var membersInChannels = getAllNonMutedUsersInVoiceChannels(newMember);
            var numberOfMembersInVoiceChannels = membersInChannels.length;
            var messageToSend = "A user unmuted himself! Unmuted users in channels ("+numberOfMembersInVoiceChannels+") = ";
            messageToSend += (numberOfMembersInVoiceChannels == 5) ? ' TIME FOR CSGO!!??' : '';
            messageToSend += getUsersInChannelString(membersInChannels, numberOfMembersInVoiceChannels);

            var notificationChannel = getChannelByMemberAndChannelName(newMember, 'notifications');
            clearMessagesInChannel(notificationChannel);

            console.log("messageToSend= "+messageToSend);
            notificationChannel.send(messageToSend);

            toggleShellyDevice("on");
        }else{
            if(newUserChannel.name === excludedChannelTarkov){
                //User went to excluded channel
                userLeftDiscord(newMember);
            }else if(oldUserChannel.name === excludedChannelTarkov){
                //User went from excluded channel to non-excluded channel
                userJoinedDiscord(newMember)
            }
        }
    }

})

function userJoinedDiscord(newMember){
    console.log("A user joined a voice channel!");

    var membersInChannels = getAllNonMutedUsersInVoiceChannels(newMember);
    var numberOfMembersInVoiceChannels = membersInChannels.length;
    var messageToSend = "A user joined a voice channel! Unmuted users in channels ("+numberOfMembersInVoiceChannels+") = ";
    messageToSend += getUsersInChannelString(membersInChannels, numberOfMembersInVoiceChannels);
    messageToSend += (numberOfMembersInVoiceChannels == 5) ? ' TIME FOR CSGO!!??' : '';

    var notificationChannel = getChannelByMemberAndChannelName(newMember, 'notifications');
    clearMessagesInChannel(notificationChannel);

    console.log("messageToSend= "+messageToSend);
    notificationChannel.send(messageToSend);

    toggleShellyDevice("on");
}

function userLeftDiscord(newMember){
    console.log("A user left a voice channel.");

    var membersInChannels = getAllNonMutedUsersInVoiceChannels(newMember);
    var numberOfMembersInVoiceChannels = membersInChannels.length;
    var messageToSend = "A user left a voice channel! Unmuted users in channels ("+numberOfMembersInVoiceChannels+")";
    messageToSend += (numberOfMembersInVoiceChannels == 0) ? '. Boyzone is silent' : ' = ';
    messageToSend += getUsersInChannelString(membersInChannels, numberOfMembersInVoiceChannels);

    var notificationChannel = getChannelByMemberAndChannelName(newMember, 'notifications');
    clearMessagesInChannel(notificationChannel);

    console.log("messageToSend= "+messageToSend);
    notificationChannel.send(messageToSend);

    if (numberOfMembersInVoiceChannels === 0) {
        toggleShellyDevice("off");
    }
}

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
    }else if (userName == userName_Fabars){
        return message.guild.emojis.find(emoji => emoji.name === 'Pedro_fuhrer');    
    }else{
        //Default case, no userName match
        return message.guild.emojis.find(emoji => emoji.name === '5253_BonesDancer');
    }
}

//Returns emoji based on input emojiName
function getCustomEmojiBasedOnEmojiName(message, emojiName){
    return message.guild.emojis.find(emoji => emoji.name === emojiName);
}

//Returns all voice channels based on input member
function getAllVoiceChannels(newMember){
    return newMember.guild.channels.filter(channel => channel.type === 'voice');
}

//Clear previous messages //https://stackoverflow.com/questions/41574971/how-does-bulkdelete-work
async function clearMessagesInChannel(channel) {
    const fetched = await channel.fetchMessages({limit: 99});
    channel.bulkDelete(fetched);
}

function getChannelByMemberAndChannelName(member, channelName){
    return member.guild.channels.find('name', channelName);
}

function getUsersInChannelString(membersInChannels, numberOfMembersInVoiceChannels){
    var numTimesInLoop = 0;
    var messageToReturn = "";
    for(const displayName of membersInChannels){
        numTimesInLoop++;
        console.log("user in channel= "+displayName);

        if((numTimesInLoop == numberOfMembersInVoiceChannels) && (numberOfMembersInVoiceChannels != 1)){
            messageToReturn += ' and ';
        }else if(numTimesInLoop != 1){
            messageToReturn += ', ';
        }
        messageToReturn += displayName;
    }
    messageToReturn += '.';
    
    return messageToReturn;
}

function getAllNonMutedUsersInVoiceChannels(newMember){
    var membersInChannelsToReturn = []; 
    for (const [channelID, channel] of getAllVoiceChannels(newMember)) {
        for (const [memberID, member] of channel.members) {
            if(member.user.username != 'Groovy'){
                //Exclude muted users and in excluded channel.
                if(!member.selfMute && channel.name !== excludedChannelTarkov){
                    membersInChannelsToReturn.push(member.displayName);
                }
            }
        }
    }
    return membersInChannelsToReturn;
}

function toggleShellyDevice(turn) {
    const HEADER = {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    }
    const DATA = {
        auth_key: shellytoken,
        id: '577eb5',
        channel: 0,
        turn: turn
    }
    axios
        .post('https://shelly-53-eu.shelly.cloud/device/relay/control', DATA, HEADER)
        .then((response) => {
            if (response.status === 201) {
                console.log('Req body:', response.data)
                console.log('Req header :', response.headers)
            }
        })
        .catch((e) => {
            console.error(e)
        })
}

const findFirstDiff = (str1, str2) =>
  str2[[...str1].findIndex((el, index) => el !== str2[index])];

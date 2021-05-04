require('dotenv').config();

const Discord = require('discord.js');
const fetch = require('node-fetch');
const prefix = '$';

const bot = new Discord.Client();
const TOKEN = process.env.DISCORD_TOKEN;
const API_KEY = process.env.API_KEY_FINANCIALMODELINGPREP;

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async message => {

	if (!message.content.startsWith(prefix) || message.author.bot) return;

  message.content = message.content.toLowerCase();

  var str = message.content;
  str = str.substring(1);
  var splitted = str.split(" ");

  if(message.content == '$about' || message.content == '$help'){ 
    message.channel.send({embed: {
    title: 'Stock-market-discord-bot',
    url: 'https://github.com/vipeeerr/Stock-crypto-discord-bot',
    fields: [{
      name: `Hello! Thank you for using this bot.`,
      value: `To obtain information about a stock or a cryptocurrency, you only need to prefix a "$" to its ticker or abbreviation. In the case of cryptocurrencies, you must also add a currency (fiat) at the end to make the conversion. `,
      inline: false
    },
    {
      name: `Examples of use.`,
      value: `$GME $AAPL $AMC $BTCUSD $ADAUSD $ETHUSD`,
      inline: false
    },
     {
      name: `My code is open source!`,
      value: `Following the link at the top of this card, you can find the repository with the source code of this bot. You don't need to set up a server with the bot yourself, you can use the one I already have running for all of you. `,
      inline: false
    },
       {
      name: `How can I help you?`,
      value: `You can do a pull/push/merge request in the repository to add it to the master branch. If programming is not your thing, any kind of donation is welcome, currently the bot costs about 30 dollars per month between server and the license to get the information we use. All information can be found by following the link at the beginning of this message.`,
      inline: false
    },
    ],
      timestamp: new Date(),
      footer: {
        text: `${bot.user.tag}`
      },
    }
    });

    return;
  }

  if(splitted.length > 1){
    splitted[0] = splitted[0].toUpperCase();
    if(splitted[1] == 'news'){
      var numberOfNews;
      if(splitted.length >= 2){
        numberOfNews = splitted[2];
        numberOfNews = parseInt(numberOfNews,10);
        if(numberOfNews < 1 || numberOfNews > 5 || numberOfNews == null || numberOfNews == undefined ||  isNaN(numberOfNews) ){
          numberOfNews = 2;
        }
      }else{
        numberOfNews = 2;
      }
      const result = await fetch('https://financialmodelingprep.com/api/v3/stock_news?tickers='+splitted[0]+'&limit='+numberOfNews+'&apikey='+API_KEY).then(response => response.json());
      // const result = await fetch('https://financialmodelingprep.com/api/v3/stock_news?tickers='+splitted[0]+'&limit='+numberOfNews+'&apikey=demo').then(response => response.json());

      if(result == null || result == undefined || !result || result == '[]' || result.arrayLength == 0){
          message.channel.send(splitted[0]+' news not found');
      }else{
        result.forEach(function(entry) {
          message.channel.send({embed: {
            title: entry.title.toString(),
            url: entry.url.toString(),
            fields: [
            {
              name: `${entry.site.toString()}`,
              value: `${entry.text.toString()}`,
              inline: false
            },
            ],
            image: {
              url: `${entry.image.toString()}`,
            },
            timestamp: new Date(),
            footer: {
              text: "© StockMarket Bot"
            },
            }
          });
        });
      }
      return;
    }
  }

  if(splitted.length > 0){
    splitted[0] = splitted[0].toUpperCase();

    const result = await fetch('https://financialmodelingprep.com/api/v3/quote/'+splitted[0]+'?apikey='+API_KEY).then(response => response.json());
    //const result = await fetch('https://financialmodelingprep.com/api/v3/quote/'+splitted[0]+'?apikey=demo').then(response => response.json());
    stockEncoded = result[0];

    if(stockEncoded == null || stockEncoded == undefined || !stockEncoded || !stockEncoded.change){
        message.channel.send('$'+splitted[0]+' not found');
    }else{
      let change = stockEncoded.change;
      var gainColor = '';
      change = change.toString();
      if(! change.startsWith('-')){
        change = '+'+change;
        gainColor = `#57D125`;
      }else{
        gainColor = `#FF0000`;
      }
      var changePerc = stockEncoded.changesPercentage;
      changePerc = changePerc.toString();
      if(! changePerc.startsWith('-')){
        changePerc = '+'+changePerc;
      }

      var companyName = stockEncoded.name.split(" ");
      companyName[0] = companyName[0].replace('.com','');
      companyName[0] = companyName[0].replace('-','');
      companyName[0] = companyName[0].replace(',','');
      companyName[0] = companyName[0].replace('_','');
      companyName[0] = companyName[0].replace('.','');
      companyName[0] = companyName[0].replace(' ','');
      message.channel.send({embed: {
          color: gainColor,
          author: {
            name: stockEncoded.symbol.toString(),
            icon_url: 'https://logo.clearbit.com/'+companyName[0]+'.com'
          },
          title: stockEncoded.name.toString(),
          url: 'https://www.google.com/search?q='+companyName[0]+'',
          fields: [
            {
              name: "Price",
              value: `${stockEncoded.price.toString()}`,
              inline: true

            },
            {
              name: "Change $",
              value: `${change.toString()}`,
              color: gainColor,
              inline: true
            },
            {
              name: "Change %",
              value: `${changePerc.toString()}`,
              color: gainColor,
              inline: true
            },
            {
              name:  '\u200B',
              value: '\u200B'
            },
            {
              name: "Day High",
              value: `${stockEncoded.dayHigh.toString()}`,
              inline: true
            },
            {
              name: "Day Low",
              value: `${stockEncoded.dayLow.toString()}`,
              inline: true
            },
            {
              name:  '\u200B',
              value: '\u200B'
            },
            {
              name: "365 High",
              value: `${stockEncoded.yearHigh.toString()}`,
              inline: true
            },
            {
              name: "365 Low",
              value: `${stockEncoded.yearLow.toString()}`,
              inline: true
            },
    
          ],
          image: {
            url: 'https://logo.clearbit.com/'+companyName[0]+'.com',
          },
          footer: {
            text: "© StockMarket Bot"+"\u3000".repeat(8)+"|"
          },
          timestamp: new Date(),
        }
      });
    }
    return;
  }
  
  message.channel.send('Syntax error');
  return;

});


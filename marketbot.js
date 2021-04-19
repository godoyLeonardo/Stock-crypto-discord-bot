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
        message.channel.send(splitted[0]+' not found');
    }else{
      var change = stockEncoded.change;
      change = change.toString();
      if(! change.startsWith('-')){
        change = '+'+change;
        var gainColor = '65280';
      }else{
        var gainColor = '16711680';
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
    
      console.log(companyName[0]);
      console.log(stockEncoded.name.toString());
      console.log(gainColor);
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


module.exports = async (_y, args) => {
  const {User} = require('../models/index');
  const cards = require('../data/cards');
  const uid = _y.message.author.id;
  const user = await User.findOne({where: {uid: uid}});
  const y = require('../core/base');
  const D = y.Discord;
  const cmd = args[0];
  const curr = _y.currency;
  const balance = curr.getBalance(uid);
  
  if(cmd === 'price' || cmd === 'prices' || !cmd){
    const {
      createCanvas, loadImage
    } = require('canvas');

    const w = 1280;
    const h = 500;

    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    const types = require('../data/pack/types');

    ctx.font = 'bold 30pt monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#eee';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 16;

    let [posX, posY] = [128, 8];
    let resetX = true;
    for (let i = 10; i > 0; i--) {
      if (i < 6) {
        posY = 180;
        if (resetX) {
          posX = 128;
          resetX = false;
        }
      }
      const type = types[i];
      const path = `./images/pack/${type.image}.png`;
      const img = await loadImage(path);
      ctx.strokeText(
        type.price + '$', posX - 5, posY + 60
      );
      ctx.fillText(
        type.price + '$', posX - 5, posY + 60
      );
      ctx.drawImage(img, posX, posY, 128, 128);
      posX += 256;
    }

    ctx.fillStyle = "#eee";
    ctx.fillRect(0, 340, canvas.width, 8);

    ctx.font = 'bold 50pt serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = "#fffe4c";
    
    ctx.fillText("Market Prices", 400, 420);
    
    const coinpath = `./commands/currency_Item_COIN.png`;
    const coinimg = await loadImage(coinpath);
    ctx.drawImage(coinimg, 230, 370, 128, 128);

    const buffer = canvas.toBuffer('image/png');
    const attachment = new D.Attachment(buffer, 'x.png');
    _y.reply({files: [attachment]});
  };


  if (cmd === 'sell') {
    const data = require('../data/pack/values');
    const id = args[1];
    const amount = Number(args[2]);
    if (!id) {
      return _y.reply('Id required, see `$pack info`.');
    }
    if (!amount || amount < 1) {
      return _y.reply('Amount number needed!');
    }
    const pack = await user.getPack(id);
    if (!pack || !pack.amount) {
      return _y.reply(
        `You don't have ${data[id][2]} player.`
      );
    }
    if (amount > pack.amount) {
      return _y.reply(
        `You only have **${pack.amount}**.`
        + ` ${data[id][2]} player`
      );
    }
    const price = data[id][1];
    await user.addPack(id, amount);
    curr.add(uid, price * amount);
    return _y.reply(`You get $${price * amount} coins!`);
  }
  
  if (cmd === 'buy') {
    const data = require('../data/pack/buy');
    const id = args[1];
    const amount = Number(args[2]);
    const price = data[id][1];
    const cost = price * amount;

    if (!id) {
      return _y.reply('Id required, see `$pack info`.');
    }
    if (!amount || amount < 1) {
      return _y.reply('Amount number needed!');
    }
    if (cost > balance) {
      return _y.reply('You don\'t have enough coins!');
    }
    if(amount > 1 || amount === 1){
    const pack = await user.getPack(id);
    await user.addPack(id, -amount);
    curr.add(uid, -1 * price * amount);
     if(amount === 1)
     {
         let players = [];
  for (let i = 0; i < data.length; i++) {
    if (!data[i].length) continue;
    const [multiplier,, player] = data[i];
    for (let j = 0; j < multiplier; j++) {
      players.push({id: i, type: player});
    }
  }

  const choosen = players[
    Math.floor(Math.random() * players.length)
  ];
  const card = cards[choosen.id][
    Math.floor(Math.random() * cards[choosen.id].length)
  ];
   const title = `You got a ${choosen.type} player`;
   const url =
    'https://fifa-mobile.github.io/images/cards/'
    +
    `${card}.png`
  ;
       const embed = new D.RichEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setImage(url)
    .setURL(url)
  ;
	_y.reply(embed);
     }
      if(amount > 1){
    return _y.reply(
      `You purchased ${amount} ${data[id][2]} players.`
    );
     }
    }
    }
}

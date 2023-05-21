import { Contact, Message, ScanStatus, WechatyBuilder, log } from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';

let isLogin = false;

function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = ['https://wechaty.js.org/qrcode/', encodeURIComponent(qrcode)].join('');
    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl);

    qrcodeTerminal.generate(qrcode, { small: true }); // show qrcode on console
  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status);
  }
}

async function onLogin(user: Contact) {
  isLogin = true;
  console.log(await user.name(), await user.alias(), user.id);
  log.info('StarterBot', '%s login', user);
}

function onLogout(user: Contact) {
  log.info('StarterBot', '%s logout', user);
}

async function onMessage(msg: Message) {
  log.info('StarterBot', msg.toString());

  if (msg.text() === 'ding') {
    await msg.say('dong');
  }
}

const bot = WechatyBuilder.build({
  name: 'ding-dong-bot',
});

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);

bot
  .start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch((e) => log.error('StarterBot', e));

export async function say(alias: string, message: string) {
  try {
    if (isLogin) {
      const contact = await bot.Contact.find({ alias });
      if (contact) {
        await contact.say(message);
      } else {
        console.log('no c');
      }
    }
  } catch (error) {
    
  }
}

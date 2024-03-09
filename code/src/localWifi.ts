import { exec } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';

const delay = (n: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, n);
  });
};
const timePath = './data/time.json';
(async () => {
  let itemList = [];

  while (true) {
    await delay(1000)
    if (existsSync(timePath)) {
      itemList = JSON.parse(readFileSync(timePath, { encoding: 'utf-8' })) as any[];
    }
    const canRestartWifi = itemList.some((item) => {
      return item?.restart === true;
    });
    if (canRestartWifi) {
      writeFileSync(
        timePath,
        JSON.stringify(
          itemList.map((item) => {
            return { ...item, restart: false };
          })
        ),
        { encoding: 'utf-8' }
      );
      console.log('重启wifi', new Date().toString());
      exec('netsh interface set interface name="WLAN" admin=disable', (err, stdout, stderr) => {
      });
      await delay(5 * 1000);
      exec('netsh interface set interface name="WLAN" admin=enable', (err, stdout, stderr) => {
      });
    }
  }
})();

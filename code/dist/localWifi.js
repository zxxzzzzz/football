"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const delay = (n) => {
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
        await delay(1000);
        if ((0, fs_1.existsSync)(timePath)) {
            itemList = JSON.parse((0, fs_1.readFileSync)(timePath, { encoding: 'utf-8' }));
        }
        const canRestartWifi = itemList.some((item) => {
            return item?.restart === true;
        });
        if (canRestartWifi) {
            (0, fs_1.writeFileSync)(timePath, JSON.stringify(itemList.map((item) => {
                return { ...item, restart: false };
            })), { encoding: 'utf-8' });
            console.log('重启wifi', new Date().toString());
            (0, child_process_1.exec)('netsh interface set interface name="WLAN" admin=disable', (err, stdout, stderr) => {
                console.log(err, stdout, stderr);
            });
            await delay(5 * 1000);
            (0, child_process_1.exec)('netsh interface set interface name="WLAN" admin=enable', (err, stdout, stderr) => {
                console.log(err, stdout, stderr);
            });
        }
    }
})();

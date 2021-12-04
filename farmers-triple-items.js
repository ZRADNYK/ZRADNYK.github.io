// ==UserScript==
// @name         Farmers World Bot
// @namespace    http://tampermonkey.net/
// @version      0.2.5
// @description  Let's farm easy way
// @author       ZRADNYK
// @match        https://play.farmersworld.io
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==


const loginButton = document.querySelector("#root > div > div > div > button");
let firstItem;
let secondItem;
let thirdItem;
let goldIcon;
let repairButton;
let mineButton;
let timeSelector;
let homeButton;
let durability;
let mapButton;
let firstLogIn = true;

const delay = ms => new Promise(res => setTimeout(res, ms));
let miningTimeLeft, buildingTimeLeft, mineId;

async function start() {
    if(firstLogIn) {
        await delay(15000);
        await checkAuthorize();
        firstLogIn = false;
    }
    await initItems();
    miningTimeLeft =  await getMiningCooldown();
    buildingTimeLeft = await buildIfNeeded();
    let timeLeftMillis = stringToTime(miningTimeLeft);
    let buildTimeMillis = stringToTime(buildingTimeLeft);
    setTimeout(start, buildTimeMillis);
    if(timeLeftMillis === 0) {
        await goHome();
        await useItems();
        console.log('mined at ' + new Date());
        let cd = await getMiningCooldown();
        let cdInMillis = stringToTime(cd);
        let nextMineAt = new Date(Date.now() + cdInMillis);
        console.log('Next mine at ' + nextMineAt);
        mineId = setTimeout(start, cdInMillis);
    }
    else {
        console.log('waiting for ', miningTimeLeft);
        mineId = setTimeout(start, timeLeftMillis);
    }
}


async function goHome() {
    if(!homeButton.classList.contains('active')) {
        homeButton.click();
        await delay(2000);
    }
}

async function useItems() {
    if(firstItem !== undefined && secondItem !== undefined) {
        await mine(firstItem);
        await mine(secondItem);
        await mine(thirdItem);
        firstItem.click();
    }
}


async function mine(item) {
    if(item !== undefined) {
        item.click();
        await delay(3000);
        await repairIfNeeded();
        mineButton.click();
        await delay(7000);

        goldIcon.click();
        await delay(2000);
    } else {
        alert('Cannot find your item!');
    }
}

async function repairIfNeeded() {
    if(durability < 50 && repairButton.classList.contains('disabled') === false) {
        repairButton.click();
    }
    await delay(7000);
}

async function getMiningCooldown() {
    firstItem.click();
    await delay(1000);
    let firstItemTimeLeft = timeSelector.innerText;
    let fitlMillis = stringToTime(firstItemTimeLeft);
    secondItem.click();
    await delay(1000);
    let secondItemTimeLeft = timeSelector.innerText;
    let sitlMillis = stringToTime(secondItemTimeLeft);
    thirdItem.click();
    await delay(1000);
    let thirdItemTimeLeft = timeSelector.innerText;
    let titlMillis = stringToTime(thirdItemTimeLeft);

    switch(Math.max(fitlMillis, sitlMillis, titlMillis)) {
        case fitlMillis:
            return firstItemTimeLeft;
        case sitlMillis:
            return secondItemTimeLeft;
        case titlMillis:
            return thirdItemTimeLeft;
    }
}

async function buildIfNeeded() {
    mapButton.click();
    await delay(2000);
    let cooldownSelector = document.querySelector("body > div.modal-wrapper > div > section > div.modal-map-content > div:nth-child(3) > div > div > div.map-component-progress > div > div.progress-bar-countdown > div")
    let buildPlotButton = document.querySelector("body > div.modal-wrapper > div > section > div.modal-map-content > div:nth-child(3) > div > div > div.build-btn__wrapper > button:nth-child(1) > div");
    if(buildPlotButton.innerText === 'Build') {
        buildPlotButton.click();
        await delay(5000);
    }
    let cooldown = cooldownSelector.innerText;
    await goHome();
    return cooldown;
}


function stringToTime(str) {
    let timeArray = str.split(':');
    return (Number.parseInt(timeArray[0]) * 60 * 60 + Number.parseInt(timeArray[1]) * 60 + Number.parseInt(timeArray[2])) * 1000;
}

async function checkAuthorize() {
    console.log('Trying to login to your .wam account');
    if (loginButton !== null) {
        loginButton.click();
        await delay(2000);
    }
    let waxWalletAccount = document.querySelector("#root > div > div > div:nth-child(2) > div.login-modal-container > button:nth-child(2)");

    if(waxWalletAccount !== null) {
        waxWalletAccount.click();
        await delay(10000);
        console.log('logged in successfully');
    } else {
        alert('Wax session is expired! Please log in manually!');
    }
}

async function initItems() {
    firstItem = document.querySelector("#root > div > div > div > div.wapper > section > div > section > img");
    secondItem = document.querySelector("#root > div > div > div > div.wapper > section > div > section > img:nth-child(2)");
    thirdItem = document.querySelector("#root > div > div > div > div.wapper > section > div > section > img:nth-child(3)");
    goldIcon = document.querySelector("#root > div > div > div > section.container__header > div:nth-child(1) > i > img");
    mineButton = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.info-section > div.home-card-button__group > div:nth-child(1) > button > div")
    repairButton = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.info-section > div.home-card-button__group > div:nth-child(2) > button > div")
    timeSelector = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.info-section > div.info-time > div");
    homeButton = document.querySelector("#root > div > div > div > section.navbar-container > div:nth-child(1)");
    durability = Number.parseInt(document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.card-section > div.card-number > div.content").innerText.split('/')[0]);
    mapButton = document.querySelector("#root > div > div > div > section.navbar-container > div:nth-child(5) > img");
}

start();

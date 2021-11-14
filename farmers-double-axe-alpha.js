// ==UserScript==
// @name         Farmers World Bot
// @namespace    http://tampermonkey.net/
// @version      0.1.9
// @description  Let's farm easy way
// @author       ZRADNYK
// @match        https://play.farmersworld.io
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==


const loginButton = document.querySelector("#root > div > div > div > button");
let firstItem;
let secondItem;
let singleItem;
let goldIcon;
let mineButton;
let timeSelector;
let homeButtonSelector;
let firstLogIn = true;

const delay = ms => new Promise(res => setTimeout(res, ms));
let timeLeft, id;

async function start() {
    if(firstLogIn) {
        await delay(15000);
        await checkAuthorize();
        firstLogIn = false;
    }
    await initItems();
    timeLeft =  await getCooldown();
    let timeLeftMillis = stringToTime(timeLeft);
    console.log(new Date().toString() + ' Current cooldown : ' + timeLeft);
    if(timeLeftMillis === 0) {
        await goHome();
        await useItems();
        console.log('mined at ' + new Date());
        let cd = await getCooldown();
        let cdInMillis = stringToTime(cd);
        let nextMineAt = new Date(Date.now() + cdInMillis);
        console.log('Next mine at ' + nextMineAt);
        id = setTimeout(start, cdInMillis);
    }
    else {
        console.log('waiting for ', timeLeft);
        id = setTimeout(start, timeLeftMillis);
    }
}

async function goHome() {
    if(!homeButtonSelector.classList.contains('active')) {
        homeButtonSelector.click();
        await delay(2000);
    }
}

async function useItems() {
    if(firstItem !== undefined && secondItem !== undefined) {
        await mine(firstItem);
        await mine(secondItem);
    }
    if(singleItem !== undefined && (firstItem === undefined && secondItem === undefined)) {
        await mine(singleItem);
    }
}


async function mine(item) {
    if(item !== undefined) {
        item.click();
        await delay(3000);

        mineButton.click();
        await delay(7000);

        goldIcon.click();
        await delay(2000);
    } else {
        alert('Cannot find your item!');
    }
}


 if(firstItem !== undefined && secondItem !== undefined) {
        await mine(firstItem);
        await mine(secondItem);
    }
    if(singleItem !== undefined && (firstItem === undefined && secondItem === undefined)) {
        await mine(singleItem);
    }


async function getCooldown() {
     if(firstItem !== undefined && secondItem !== undefined && singleItem == undefined) {
        firstItem.click();
        await delay(1000);
        let firstItemTimeLeft = timeSelector.innerText;
        secondItem.click();
        await delay(1000);
        let secondItemTimeLeft = timeSelector.innerText;
        firstItemTimeLeft > secondItemTimeLeft ? timeLeft = firstItemTimeLeft : timeLeft = secondItemTimeLeft;     
     }
    else if(singleItem !== undefined && firstItem == undefined && secondItem == undefined) {
        singleItem.click();
        await delay(1000);
        timeLeft = timeSelector.innerText;
    }
    return timeLeft;
}

function stringToTime(str) {
    let timeArray = str.split(':');
    return (Number.parseInt(timeArray[0]) * 60 * 60 + Number.parseInt(timeArray[1]) * 60 + Number.parseInt(timeArray[2])) * 1000;
}

async function checkAuthorize() {
    console.log('Trying to login to your .wam account');
    if (loginButton !== undefined) {
        loginButton.click();
        await delay(2000);
    }
    let waxWalletAccount = document.querySelector("#root > div > div > div:nth-child(2) > div.login-modal-container > button:nth-child(2)");

    if(waxWalletAccount !== undefined) {
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
    singleItem = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.card-section > div.card-img > img");
    goldIcon = document.querySelector("#root > div > div > div > section.container__header > div:nth-child(1) > i > img");
    mineButton = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.info-section > div.home-card-button__group > div:nth-child(1) > button > div")
    timeSelector = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.info-section > div.info-time > div");
    homeButtonSelector = document.querySelector("#root > div > div > div > section.navbar-container > div:nth-child(1)");
}

start();

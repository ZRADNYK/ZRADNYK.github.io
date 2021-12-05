// ==UserScript==
// @name         Farmers World Bot
// @namespace    http://tampermonkey.net/
// @version      0.3.1
// @description  Let's farm easy way
// @author       ZRADNYK
// @match        https://play.farmersworld.io
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==


const loginButton = document.querySelector("#root > div > div > div > button");
let firstItem, secondItem, thirdItem;
let timeSelector;
let goldIcon, homeButton, mapButton, mineButton, repairButton;
let durability;
let food, energy;
let firstLogIn = true;


const delay = ms => new Promise(res => setTimeout(res, ms));
let miningTimeLeft, mineTimeoutId, cropTimeoutId;

async function start() {
    if(firstLogIn) {
        await delay(15000);
        await checkAuthorize();
        firstLogIn = false;
    }
    await initItems();
    await fillEnergy();
    miningTimeLeft =  await getMiningCooldown();
    let miningTimeLeftMillis = stringToTime(miningTimeLeft);
    if(miningTimeLeftMillis === 0) {
        await goHome();
        await useItems();
        let cd = await getMiningCooldown();
        let cdInMillis = stringToTime(cd);
        let nextMineAt = new Date(Date.now() + cdInMillis);
        console.log('Next mine at ' + nextMineAt);
        mineTimeoutId = setTimeout(start, cdInMillis);
    }
    else {
        console.log('Mining - waiting for ', miningTimeLeft);
        mineTimeoutId = setTimeout(start, miningTimeLeftMillis);
    }
    let cropTimeLeft = await getCropCooldown();
    if(stringToTime(cropTimeLeft) === 0) {
        await waterCrops();
        clearTimeout(cropTimeoutId);
    }
    else {
        console.log('Planting - waiting for ', cropTimeLeft);
        cropTimeoutId = setTimeout(waterCrops, stringToTime(cropTimeLeft));
    }
}

async function fillEnergy() {
    if(energy <= 100) {
        let foodNeeded = (500 - energy) / 5;
        if(food > 0) {
            if(food - foodNeeded >= 0) {
                console.log('Energy - eating ' + foodNeeded + ' food');
                await eatFood(foodNeeded);
            }
            else {
                console.log('Energy - eating ' + food + ' food');
                await eatFood(food);
            }
        }
        else {
            console.log('Energy - no food to eat!');
        }
    }
}

async function eatFood(foodNumber) {
    let restoreEnergyButton = document.querySelector("#root > div > div > div > section.container__header > div:nth-child(5) > div.resource-energy > img");
    restoreEnergyButton.click();
    await delay(2000);
    let plusSignButton = document.querySelector("body > div.modal-wrapper > div > div.modal-body > img:nth-child(3)");
    for (let i = 0; i < foodNumber; i++) {
        plusSignButton.click();
        await delay(100);
    }
    let exchangeFood = document.querySelector("body > div.modal-wrapper > div > div.modal-close-button.tooltip > button > div")
    exchangeFood.click();
    await delay(5000);
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

async function goToMining() {
    mapButton.click();
    await delay(1000);
    let mineMap = document.querySelector("body > div.modal-wrapper > div > section > div.modal-map-content > div:nth-child(1) > span");
    mineMap.click();
    await delay(2000);
}

async function goToCrop() {
    mapButton.click();
    await delay(1000);
    let cropMap = document.querySelector("body > div.modal-wrapper > div > section > div.modal-map-content > div:nth-child(3) > span")
    cropMap.click();
    await delay(2000);
}

async function waterCrops() {
    await goToCrop();
    for(let i = 1; i < 9; i++) {
        let cornSelector = document.querySelector("#root > div > div > div.game-content > div.wapper > section > div > section > img:nth-child(" + i + ")");
        cornSelector.click();
        await delay(500);
        let waterCropButton = document.querySelector("#root > div > div > div.game-content > div.wapper > section > div > div > div.info-section > div.home-card-button__group > div:nth-child(1) > button > div");
        if(waterCropButton.innerText === 'Water') {
            waterCropButton.click();
            await delay(5000);
            await fillEnergy();
            console.log('Planting - Crop  ' + i + ' has been watered');
        }
    }
    await goToMining();
}

async function getCropCooldown() {
    await goToCrop();
    let maxCd = '00:00:00';
    let maxCdMillis = 0;
    for(let i = 1; i < 9; i++) {
        let cornSelector = document.querySelector( "#root > div > div > div.game-content > div.wapper > section > div > section > img:nth-child(" + i + ")");
        cornSelector.click();
        await delay(500);
        let cornTimeLeft = document.querySelector("#root > div > div > div.game-content > div.wapper > section > div > div > div.info-section > div.info-time > div").innerText;
        console.log('Crop ' + i + ' - ' + cornTimeLeft);
        let cornTimeLeftMillis = stringToTime(cornTimeLeft);
        if(maxCdMillis <= cornTimeLeftMillis) {
            maxCdMillis = cornTimeLeftMillis;
            maxCd = cornTimeLeft;
        }
    }
    await goToMining();
    return maxCd;
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
    homeButtonSelector = document.querySelector("#root > div > div > div > section.navbar-container > div:nth-child(1)");
    durability = Number.parseInt(document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.card-section > div.card-number > div.content").innerText.split('/')[0]);
    energy = Number.parseFloat(document.querySelector("#root > div > div > div > section.container__header > div:nth-child(5) > div.resource-number > div").innerText);
    food = Number.parseFloat(document.querySelector("#root > div > div > div > section.container__header > div:nth-child(4) > div > div").innerText);
    mapButton = document.querySelector("#root > div > div > div > section.navbar-container > div:nth-child(5) > img");
}

start();

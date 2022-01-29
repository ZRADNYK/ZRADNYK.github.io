// ==UserScript==
// @name         Farmers World Bot
// @namespace    http://tampermonkey.net/
// @version      0.3.14
// @description  Let's farm easy way
// @author       ZRADNYK
// @match        https://play.farmersworld.io
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

// user variables
let useMining = false;
let usePlant = true;
//


const loginButton = document.querySelector("#root > div > div > div > button");
let timeSelector;
let goldIcon;
let homeButtonSelector;
let firstLogIn = true;
let scriptInterval = 0;

const delay = ms => new Promise(res => setTimeout(res, ms));

async function start() {
    if(firstLogIn) {
        await delay(15000);
        await checkAuthorize();
        firstLogIn = false;
    }
    await initItems();
    await fillEnergy();
    await mineAndCrop();
}

async function mineAndCrop() {
    await goHome();
    if(useMining) {
        await useItems();
    }
    if(usePlant) {
       await waterCrops();
    }
}

async function fillEnergy() {
    let restoreEnergyButton = document.querySelector("#root > div > div > div > section.container__header > div:nth-child(5) > div.resource-energy > img");
    await restoreEnergyButton.click();
    await delay(2000);
    let plusSignButton = document.querySelector("body > div.modal-wrapper > div > div.modal-body > img:nth-child(3)");
    let foodInput = document.querySelector("body > div.modal-wrapper > div > div.modal-body > input");
    let foodBefore = 0;
    let foodAfter = 0;
    do {
        foodBefore = Number.parseInt(foodInput.value);
        await plusSignButton.click();
        await delay(500);
        foodAfter = Number.parseInt(foodInput.value);
        if(Number.parseInt(foodInput.value) == foodBefore) {
            break;
        }
    }while (foodAfter > foodBefore);

    if(foodAfter > 0) {
        let exchangeFood = document.querySelector("body > div.modal-wrapper > div > div.modal-close-button.tooltip > button > div")
        exchangeFood.click();
        console.log('clicked');
        await delay(5000);
    }
    let goldIcon = document.querySelector("#root > div > div > div > section.container__header > div:nth-child(1) > i > img");
    goldIcon.click();
}


async function goHome() {
    if(!homeButtonSelector.classList.contains('active')) {
        homeButtonSelector.click();
        await delay(2000);
    }
}

async function useItems() {
    let itemSelector = '#root > div > div > div > div.wapper > section > div > section > img';
    let firstItem = document.querySelector(itemSelector);
    if(firstItem !== undefined) {
        fillEnergy();
        await mine(firstItem, 1);
        let hasNextItem = true;
        let nextItemNumber = 2;
        while (hasNextItem) {
            let nextItemSelector = itemSelector + ':nth-child(' + nextItemNumber + ')';
            let nextItem = document.querySelector(nextItemSelector);
            if(nextItem !== null) {
                firstItem.click();
                await mine(nextItem, nextItemNumber);
                nextItemNumber++;
            }
            else {
                hasNextItem = false;
            }
        }
        firstItem.click();
    }
}


async function mine(item, number) {
    item.click();
    await delay(3000);
    await repairIfNeeded();
    let mineButton = document.querySelector("#root > div > div > div.game-content > div.wapper > section > div > div > div.info-section > div.home-card-button__group > div:nth-child(1) > button > div");
    if(mineButton.innerText === 'Mine') {
        mineButton.click();
        goldIcon.click();
        await delay(3000);
        let itemName = document.querySelector("#root > div > div > div.game-content > div.wapper > section > div > div > div.info-section > div.info-text__section > div.info-title > div.info-title-name").innerText;
        console.log(itemName, ' ', number, ' mined at ', new Date().toLocaleTimeString());
    }
}

async function repairIfNeeded() {
    let repairButton = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.info-section > div.home-card-button__group > div:nth-child(2) > button > div");
    let durability = Number.parseInt(document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.card-section > div.card-number > div.content")
        .innerText.split('/')[0]);
    if(durability < 50 && repairButton.classList.contains('disabled') === false) {
        repairButton.click();
        await delay(10000);
    }
}


async function goToMining() {
    let mapButton = document.querySelector("#root > div > div > div.game-content > section.navbar-container > div:nth-child(5) > img");
    mapButton.click();
    await delay(10000);
    let mineMap = document.querySelector("body > div.modal-wrapper > div > section > div.modal-map-content > div:nth-child(1) > span");
    if(mineMap !== null) {
        mineMap.click();
    }
    else {
        await delay(5000);
        mineMap = document.querySelector("body > div.modal-wrapper > div > section > div.modal-map-content > div:nth-child(1) > span");
        mineMap.click();
    }
}

async function goToCrop() {
    let mapButton = document.querySelector("#root > div > div > div.game-content > section.navbar-container > div:nth-child(5) > img");
    mapButton.click();
    await delay(7000);
    let cropMap = document.querySelector("body > div.modal-wrapper > div > section > div.modal-map-content > div:nth-child(3) > span");
    if(cropMap !== null) {
        cropMap.click();
    }
    else {
        await delay(5000);
        cropMap = document.querySelector("body > div.modal-wrapper > div > section > div.modal-map-content > div:nth-child(3) > span");
        cropMap.click();
    }
}

async function waterCrops() {
    await goToCrop();
    for(let i = 1; i < 9; i++) {
        let cornSelector = document.querySelector("#root > div > div > div.game-content > div.wapper > section > div > section > img:nth-child(" + i + ")");
        if(cornSelector !== null) {
            await cornSelector.click();
            await delay(1000);
            await fillEnergy();
            let waterCropButton = document.querySelector("#root > div > div > div.game-content > div.wapper > section > div > div > div.info-section > div.home-card-button__group > div:nth-child(1) > button > div");
            if(waterCropButton.innerText === 'Water') {
                waterCropButton.click();
                await delay(7000);
                console.log('Planting - Crop  ' + i + ' has been watered');
            }
            else {
                let cornTimeLeft = document.querySelector("#root > div > div > div.game-content > div.wapper > section > div > div > div.info-section > div.info-time > div").innerText;
                console.log('Crop ' + i + ' - ' + cornTimeLeft);
            }
        }
    }
   // await goToMining();
}

async function checkAuthorize() {
    console.log('Trying to login to your .wam account');
    if (loginButton !== null) {
        loginButton.click();
        await delay(10000);
    }
    let waxWalletAccount = document.querySelector("#root > div > div > div:nth-child(2) > div.login-modal-container > button:nth-child(2)")

    if(waxWalletAccount !== null) {
        waxWalletAccount.click();
        await delay(20000);
        console.log('logged in successfully');
    }
}

async function initItems() {
    goldIcon = document.querySelector("#root > div > div > div > section.container__header > div:nth-child(1) > i > img");
    timeSelector = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.info-section > div.info-time > div");
    homeButtonSelector = document.querySelector("#root > div > div > div > section.navbar-container > div:nth-child(1)");
    let miningItemsSelector = '#root > div > div > div > div.wapper > section > div > section > img';
    if(document.querySelector(miningItemsSelector) == null) {
        useMining = false;
        console.log('Mining - disabled');
    }
}

start();
setInterval(start, 1 * 60 * 1000);
setTimeout(function() {
    window.location.reload(1);
}, 0.5 * 60 * 60 * 1000);

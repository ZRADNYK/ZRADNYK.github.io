let firstItem = document.querySelector("#root > div > div > div > div.wapper > section > div > section > img");
let secondItem = document.querySelector("#root > div > div > div > div.wapper > section > div > section > img:nth-child(2)");
let goldIcon = document.querySelector("#root > div > div > div > section.container__header > div:nth-child(1) > i > img");
let mineButton = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.info-section > div.home-card-button__group > div:nth-child(1) > button > div")
let timeSelector = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.info-section > div.info-time > div");
const delay = ms => new Promise(res => setTimeout(res, ms));
let timeLeft, id;

async function start() {
    timeLeft =  await getCooldown();
    let timeLeftMillis = stringToTime(timeLeft);
    console.log(new Date().toString() + ' Current cooldown : ' + timeLeft);
    if(timeLeftMillis === 0) {
        await mine(firstItem);
        await mine(secondItem);
        console.log('mine!');
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

async function mine(item) {
    if(item !== undefined) {
        item.click();
await delay(3000);

        mineButton.click();
        await delay(7000);

        goldIcon.click();
        await delay(2000);
    }
}

async function getCooldown() {
    firstItem.click();
    await delay(1000);
    let firstItemTimeLeft = timeSelector.innerText;
    secondItem.click();
    await delay(1000);
    let secondItemTimeLeft = timeSelector.innerText;
    firstItemTimeLeft > secondItemTimeLeft ? timeLeft = firstItemTimeLeft : timeLeft = secondItemTimeLeft;
    return timeLeft;
}

function stringToTime(str) {
    let timeArray = str.split(':');
  console.log(timeArray);
  let millis = (Number.parseInt(timeArray[0]) * 60 * 60 + Number.parseInt(timeArray[1]) * 60 + Number.parseInt(timeArray[2])) * 1000;
  console.log('millis: ', millis);
    return millis;
}

start();

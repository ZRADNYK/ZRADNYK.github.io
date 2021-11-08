let firstItem = document.querySelector("#root > div > div > div > div.wapper > section > div > section > img");
let secondItem = document.querySelector("#root > div > div > div > div.wapper > section > div > section > img:nth-child(2)");
let goldIcon = document.querySelector("#root > div > div > div > section.container__header > div:nth-child(1) > i > img");
let mineButton = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.info-section > div.home-card-button__group > div:nth-child(1) > button > div")
let timeSelector = document.querySelector("#root > div > div > div > div.wapper > section > div > div > div.info-section > div.info-time > div");
const delay = ms => new Promise(res => setTimeout(res, ms));
let timeLeft;

async function start() {
	timeLeft =  await checkTime();
	console.log('time left: ', timeLeft);
	if(timeLeft == '00:00:00') {
		await mine(firstItem);
		await mine(secondItem);
		console.log('mined at ' + new Date());
		let nextMineAt = new Date();
		nextMineAt.setHours(nextMineAt.getHours() + 1);
		console.log('Next mine at ' + nextMineAt); 	
		setTimeout(start, 60 * 61 * 1000);
	}
	else {
		console.log('waiting for ', timeLeft);
		let timeArray = timeLeft.split(':');
		let mils = (timeArray[0] * 60 * 60 + timeArray[1] * 60 + timeArray[2]) * 1000;
		setTimeout(start, mils);
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

async function checkTime() {
	firstItem.click();
	await delay(1000);
	let firstItemTimeLeft = timeSelector.innerText;
	secondItem.click();
	await delay(1000);
	let secondItemTimeLeft = timeSelector.innerText;
	firstItemTimeLeft > secondItemTimeLeft ? timeLeft = firstItemTimeLeft : timeLeft = secondItemTimeLeft;
	return timeLeft;
}

start();


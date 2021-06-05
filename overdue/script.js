
const grey = '#444444';
const bodyBack = '#6e6e6e';
const header = '#151515'

function setHeader(node) {
	node.style.backgroundColor = header
	if (!node.children) return;
	for (const child of node.children) {
		setHeader(child)
	}
}

function monthAsInt(month) {
	return monthAsIntHelper(month) - 1;
}

function monthAsIntHelper(month) {
	
	switch (month) {
		case 'january':
			return 1;
		case 'february':
			return 2;
		case 'march':
			return 3;
		case 'april':
			return 4;
		case 'may':
			return 5;
		case 'june':
			return 6;
		case 'july':
			return 7;
		case 'august':
			return 8;
		case 'september':
			return 9;
		case 'october':
			return 10;
		case 'november':
			return 11;
		case 'december':
			return 12;
		
		default:
			return -1;
	}
}

function func() { // TODO: only remove old overdue
	
	const url = document.URL;
	const page = (url.includes("home")) ? 'home' : 'other';
	
	console.log("overdue remover just ran!")
	let overdueTab = document.getElementById("overdue-submissions");
	
	if (overdueTab) {
		overdueTab.getElementsByClassName("h3-med")[0].textContent = 'Overdue (Last Week)'
		const list = overdueTab.getElementsByClassName("upcoming-list")[0]
		let remove = false;
		
		const date = new Date();
		const newChildren = []
		const dateRegex = /[a-z]+, ([a-z]+) ([0-9]+), ([0-9]+)/;
		let removedDays = 0;
		for (const child of list.children) {
			if (child.classList.contains("date-header")) {
				const text = child.children[0].textContent.toLowerCase().trim();
				const match = text.match(dateRegex);
				const dueDate = new Date(parseInt(match[3]), monthAsInt(match[1]), parseInt(match[2]));
				const diffTime = Math.abs(date - dueDate);
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				
				remove = (diffDays > 7);
				if (remove) removedDays++;
			}
			
			if (!remove) {
				newChildren.push(child)
			}
		}
		list.innerHTML = '';
		if (removedDays > 0) {
			const removeCounter = document.createElement('h4')
			removeCounter.textContent = `~${removedDays} days removed`;
			list.appendChild(removeCounter)
		}
		for (const child of newChildren) {
			list.appendChild(child)
		}
	}
	
	/*document.body.style.backgroundColor = bodyBack;
	
	for (const className of [(page !== 'home') ? 'main-content-wrapper' : null, 'main-inner', 'center-top', 'main']) {
		if (!className) continue
		const elem = document.getElementById(className);
		console.log(elem, `${grey}`)
		if (elem) elem.style.cssText = `background-color: ${grey} !important;`;
	}
	
	setHeader(document.getElementById("header"))
	
	for (const tagName of ['a', 'h3', 'h4', 'span', 'div']) {
		const elems = document.getElementsByTagName(tagName)
		for (const elem of elems) {
			elem.style.color = "white";
		}
	}
	
	upcoming: {
		let upcomingEvents = document.getElementsByClassName("upcoming-events");
		let upcomingTab = upcomingEvents[0]
		
		if (!upcomingTab) break upcoming;
		
		upcomingTab.style.backgroundColor = grey
		upcomingTab.style.borderRadius = "20px"
		upcomingTab.style.border = "2px solid white"
		upcomingTab.style.color = "orange"
		
		for (const tagName of ['h3', 'h4', 'span', 'div']) {
			const elems = upcomingTab.getElementsByTagName(tagName)
			for (const elem of elems) {
				elem.style.color = "white";
			}
		}
		
		const links = upcomingTab.getElementsByTagName('a')
		for (const link of links) {
			link.style.color = "orange";
		}
	}*/
}


function receiveMessage(msg, sender, sendResponse) {
	
	if (msg.command === 'run') {
		func()
	}
}


chrome.runtime.onMessage.addListener(receiveMessage)


if (document.readyState === 'complete') {
	func()
} else {
	document.onreadystatechange = () => {
		console.log(`on change ${document.readyState}`)
		if (document.readyState === 'complete') {
			func()
		}
	}
}

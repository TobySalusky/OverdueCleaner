
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

async function func() { // TODO: only remove old overdue
	
	const url = document.URL;
	const page = (url.includes("home")) ? 'home' : 'other';
	
	console.log("overdue remover just ran!")
	let overdueTab = document.getElementById("overdue-submissions");
	
	if (overdueTab) {
		// overdueTab.getElementsByClassName("h3-med")[0].textContent = 'Overdue (Last Week)'
		const list = overdueTab.getElementsByClassName("upcoming-list")[0]
		
		let dismissed;
		
		const storeValName = "OverdueRemover_Storage";
		
		const addDismissedName = (dismissed, name) => {
			if (!dismissed.includes(name)) {
				dismissed.push(name);
				chrome.storage.sync.set({[storeValName] : dismissed});
			}
		}
		const removeDismissedName = (dismissed, name) => {
			dismissed.splice(dismissed.indexOf(name), 1);
			chrome.storage.sync.set({[storeValName] : dismissed});
		}
		
		const updateUI = () => {
			const removeEntries = [];
			for (const child of list.children) {
				if (child.classList.contains("upcoming-event") && !child.classList.contains("hidden")) {
					//if (child.style.display !== "hidden") child.style.display = "flex";
					const innerH4 = child.children[0];
					innerH4.style.display = "flex";
					const name = innerH4.children[0].children[1].textContent;
					console.log(name);
					
					if (!dismissed.includes(name)) {
						if (innerH4.children.length === 1) {
							const removeButton = document.createElement('h2');
							removeButton.textContent = 'X';
							removeButton.className = 'overdue-extension-delete';
							
							innerH4.appendChild(removeButton);
							removeButton.style.display = "inline-block";
							child.addEventListener("click", () => {
								
								const popup = document.createElement('div');
								popup.className = 'overdue-extension-popup';
								
								const header = document.createElement('h1');
								header.textContent = `Dismiss ${name}?`
								
								const span = document.createElement('span');
								span.className = 'overdue-extension-span';
								
								const yes = document.createElement('h1');
								yes.textContent = 'Yes';
								yes.className = 'overdue-extension-confirm';
								yes.addEventListener("click", () => {
									addDismissedName(dismissed, name);
									updateUI();
									popup.remove();
								});
								
								const no = document.createElement('h1');
								no.textContent = 'No';
								no.className = 'overdue-extension-confirm';
								no.addEventListener("click", () => {
									popup.remove();
								});
								
								span.appendChild(yes);
								span.appendChild(no);
								
								popup.appendChild(header);
								popup.appendChild(span);
								
								document.body.appendChild(popup);
							});
						}
					} else {
						removeEntries.push(child);
					}
				}
			}
			for (const child of removeEntries) {
				child.remove();
			}
			
			const removeHeaders = [];
			
			for (const child of list.children) {
				if (child.classList.contains("date-header")) {
					const next = child.nextSibling;
					if (next === null || next.classList.contains("date-header")) {
						removeHeaders.push(child);
					}
				}
			}
			for (const child of removeHeaders) {
				child.remove();
			}
			
			if (dismissed.length > 0) {
				const dismissedCounter = document.createElement('h4');
				dismissedCounter.className = 'overdue-extension-clickable';
				dismissedCounter.id = 'dismissedCounter';
				dismissedCounter.textContent = `${dismissed.length} ${dismissed.length === 1 ? 'entry' : 'entries'} dismissed...`;
				
				dismissedCounter.addEventListener("click", () => {
					const popup = document.createElement('div');
					popup.className = 'overdue-extension-popup';
					
					const removeArea = document.createElement('div');
					removeArea.className = 'overdue-extension-x-area';
					const removeButton = document.createElement('h1');
					removeButton.className = 'overdue-extension-x';
					removeButton.textContent = 'X';
					removeButton.addEventListener("click", () => {
						popup.remove();
					});
					removeArea.appendChild(removeButton);
					popup.appendChild(removeArea);
					
					for (const dismissedName of dismissed) {
						const nameEntry = document.createElement('h2');
						nameEntry.className = 'overdue-extension-entry';
						nameEntry.textContent = dismissedName;
						
						nameEntry.addEventListener("click", () => {
							removeDismissedName(dismissed, dismissedName);
							updateUI();
							nameEntry.remove();
							
							if (dismissed.length === 0) popup.remove();
						});
						
						popup.appendChild(nameEntry);
					}
					
					document.body.appendChild(popup);
				});
				
				const currDismissed = document.getElementById('dismissedCounter');
				if (currDismissed != null) {
					currDismissed.replaceWith(dismissedCounter);
				} else {
					list.prepend(dismissedCounter);
				}
			} else {
				const currDismissed = document.getElementById('dismissedCounter');
				currDismissed?.remove();
			}
		}
		
		await chrome.storage.sync.get(storeValName, (val) => {
			if (val[storeValName] === undefined) {
				chrome.storage.sync.set({[storeValName] : []});
				dismissed = [];
				console.log("Setting up storage for first time user")
			} else {
				dismissed = val[storeValName];
				console.log("recieved data!");
				console.log(dismissed);
			}
			
			updateUI();
		});
		
			/*	if (child.classList.contains("date-header")) {
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
		}*/
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


let refreshRequired = false;

async function func() { // TODO: only remove old overdue
	
	let overdueTab = document.getElementById("overdue-submissions");
	
	if (overdueTab) {
		
		const storeValName = "OverdueCleaner_Storage";
		const addDismissedName = (arr, name) => {
			if (!arr.includes(name)) {
				arr.push(name);
				chrome.storage.sync.set({[storeValName] : arr});
			}
		}
		const removeDismissedName = (arr, name) => {
			arr.splice(arr.indexOf(name), 1);
			chrome.storage.sync.set({[storeValName] : arr});
		}
		
		let dismissed;
		
		
		const updateUI = () => {
			const list = overdueTab.getElementsByClassName("upcoming-list")[0]
			
			if (refreshRequired) overdueTab.children[0].textContent = "Overdue ⟳";
			
			const removeEntries = [];
			for (const child of list.children) {
				if (child.classList.contains("upcoming-event") && !child.classList.contains("hidden")) {
					//if (child.style.display !== "hidden") child.style.display = "flex";
					const innerH4 = child.children[0];
					innerH4.style.display = "flex";
					const name = innerH4.children[0].children[1].textContent;
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
							refreshRequired = true;
							
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
		
		chrome.storage.sync.get(storeValName, (val) => {
			if (val[storeValName] === undefined) {
				chrome.storage.sync.set({[storeValName] : []});
				chrome.storage.sync.set({OverdueCleaner_Instance: 0});
				dismissed = [];
				console.log("Setting up OverdueCleaner extension storage for first time user");
			} else {
				dismissed = val[storeValName];
			}
			
			updateUI();
		});

	}
	
}

if (document.readyState === 'complete') {
	func();
} else {
	document.onreadystatechange = () => {
		if (document.readyState === 'complete') {
			func();
		}
	}
}

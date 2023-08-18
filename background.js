// Installation / Service Worker life cycle file


// A small helper function to read local storage originally from:
// https://stackoverflow.com/questions/59440008/how-to-wait-for-asynchronous-chrome-storage-local-get-to-finish-before-continu
const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            if (result[key] === undefined) {
                reject();
            } 
            else {
                resolve(result[key]);
            }
        });
    });
};

// A function to initiate our local storage values
// it runs asynchronously, and retrieves a single
// data object as opposed to two individual integers
async function initVals() {
    // Passing the data from the promise to the then function
    readLocalStorage('damping_data').then((data) => { 
        // Need to do null checks in JS, in case the storage has not been initialized
        if (data == undefined) {
            // if this state is reached, we simply set values such that the rest of the
            // function will run normally
            data = {'page_changes': 0, 'link_clicks': 0};
        }
        // helper variables
        page_changes = data['page_changes'];
        // More null checks
        links_clicked = data['link_clicks'];
        if (page_changes == null || page_changes == undefined || page_changes == NaN) {
            page_changes = 0;
            data['page_changes'] = page_changes;
        }    
        if (links_clicked == null || links_clicked == undefined || links_clicked == NaN) {
            links_clicked = 0;
            data['links_clicked'] = links_clicked;
        }
        // sets the data properly
        chrome.storage.local.set({'damping_data': data}, () => {});
        // More null checks to ensure execution doesn't stop
        // as we want to be gather data as correctly as possible
        // and avoid unexpected behavior
    }).catch(() => { 
        data = {'page_changes': 0, 'link_clicks': 0};
        chrome.storage.local.set({'damping_data': data}, () => {
            console.log("catching");
        });
    });
}

// We set a listener on installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('inited');
    // On installation, we run our helper function
    // with an extra null check to be safe
    initVals().catch(() => {
        data = {'page_changes': 0, 'link_clicks': 0};
        chrome.storage.local.set({'damping_data': data}, () => {
            console.log("catching");
        });
    });
});


// The majority of the extension.
// We both inject code into our pages to check for link clicks
// and increase the page changes variable whenever the page/tab
// changes for any reason.

// A discussion of the limitations of the "onUpdated" event
// can be found in the Limitations subsection
// https://developer.chrome.com/docs/extensions/reference/tabs/#event-onUpdated
// gives the meager documentation provided by Google on the event
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
        readLocalStorage('damping_data').then((data) => {
            // Very similar to the initiation but with fewer null checks
            page_changes = data['page_changes'];
            links_clicked = data['link_clicks'];
            data['page_changes'] = data['page_changes'] + 1;
            chrome.storage.local.set({'damping_data': data}, () => {
                console.log("Set values correctly.");
            });
        });
        // Injecting the link click logging script
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ["/content.js"]
        })
        .then(() => {
            console.log("Script injected successfully.");
        });
    }
})
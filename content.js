// A small helper function to read local storage originally from:
// https://stackoverflow.com/questions/59440008/how-to-wait-for-asynchronous-chrome-storage-local-get-to-finish-before-continu
// Named strangely to avoid naming conflicts with JS on pages it is being injected to.
// A small discussion of the issue of naming conflicts can be found in the Limitation subsection.

const readLocalStorageARBITRARYEXTENSIONabc = async (key) => {
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

// A function that increments the stored number of links clicked by one
async function grabNewLinks() {
    // Reads the current data
    readLocalStorageARBITRARYEXTENSIONabc('damping_data').then((data) => {
        // adds 1
        data['link_clicks'] = data['link_clicks'] + 1;
        // sets new value
        chrome.storage.local.set({'damping_data': data}, () => {
        });
    })
}

async function setUp() {
    // Logs the ability to affect storage on the page
    // A discussion of the issue of storage bugs can be found in the Limitations subsection.
    console.log(chrome.storage);

    // Whenever a click anywhere on the page occurs, we call the following function
    document.addEventListener("click", (event) => {
        // We simply check that the target of the click has a href value
        // which means the user will follow the value to another website
        // A discussion of the issue of this as a criterion for a link click can be found in
        // the Limitations subsection.
        if (event.target.href != '' && event.target.href != null && event.target.href != undefined) {
            // increment the number of links clicked
            grabNewLinks().catch(e => console.log(e));
        }
    })
}

// Calling the set up function on the page we inject it to
setUp().catch(e => console.log(e));
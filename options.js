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

// A small function to initiate the values for our options page, which displays the data gathered.
async function init() {
    readLocalStorage('damping_data').then((data) => {
        page_changes = data['page_changes'];
        links_clicked = data['link_clicks'];
        // Simply setting the HTML of the page
        $('#total_link_clicks')[0].innerHTML = "Total Link Clicks: " + links_clicked;
        $('#total_page_changes')[0].innerHTML = "Total Page Changes: " + page_changes;
        $('#damping_coeff')[0].innerHTML = "Damping Factor: " + links_clicked/page_changes;
        console.log("Successful Initiation!");    
    }).catch(e => console.log(e));
}

init().catch(e => console.log(e));
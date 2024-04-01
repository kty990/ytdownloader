const closeBtn = document.getElementById("close");
const minBtn = document.getElementById("minimize");

const url = document.getElementById("search");
const title = document.getElementById("title");
const author = document.getElementById("author");
const display = document.getElementById("display");

var downloading = false;

closeBtn.addEventListener("click", () => {
    window.api.send("close");
})

minBtn.addEventListener("click", () => {
    window.api.send("minimize");
})

window.addEventListener("keydown", (e) => {
    if (e.key == "t" && e.ctrlKey) {
        window.api.send("toggle-dev-tools")
    } else if (e.key == "r" && e.ctrlKey) {
        window.api.send("dev-refresh");
    }
})

// --------------------------------------------------------------------------------------------------
// ==================================================================================================
// --------------------------------------------------------------------------------------------------




// --------------------------------------------------------------------------------------------------
// ==================================================================================================
// --------------------------------------------------------------------------------------------------

url.addEventListener("keydown", async function (event) {
    if (downloading) {
        e.preventDefault();
        return;
    }
    if (event.code === 'Enter') {
        event.preventDefault();
        url.blur();
    }
});

url.addEventListener("blur", () => {
    if (downloading) return;
    downloading = true;
    window.api.send("download", url.value);
    url.value = "";
})

window.api.on("setData", (dict) => {
    title.textContent = dict.title;
    author.textContent = dict.author;
    display.src = dict.icon;
})

window.api.on("downloaded", () => {
    title.textContent += " .. Downloaded!"
    setTimeout(() => {
        title.textContent = ``;
        author.textContent = ``;
        display.src = "../images/transparent.webp";
        downloading = false;
    }, 3000)
})

window.api.on("downloadError", (err) => {
    downloading = false;
    title.textContent = `Error`;
    author.textContent = err;
    display.src = "../images/transparent.webp";
    setTimeout(() => {
        title.textContent = ``;
        author.textContent = ``;
        display.src = "../images/transparent.webp";
    }, 3000)
})

//window.api.send("setData", { title: info.videoDetails.title, author: info.videoDetails.author.name, icon: info.videoDetails.icon })
const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');

const electron = require("electron");

function sanitizeFileName(fileName) {
    // Remove or replace characters that are not allowed in file names
    return fileName.replace(/[^\w.-]/g, '_'); // Replace non-word characters except for '.', '-' with '_'
}

async function download(window, url) {

    ytdl.getInfo(url).then(async info => {

        // Log video information
        console.log('Video Title:', info.videoDetails.title);
        console.log('Video Author:', info.videoDetails.author.name);
        console.log('Video Description:', info.videoDetails.description);

        window.webContents.send("setData", { title: info.videoDetails.title, author: info.videoDetails.author.name, icon: info.videoDetails.thumbnails[0].url })

        // Create directory if it doesn't exist
        const dir = path.join(__dirname, 'downloads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        let result = await electron.dialog.showSaveDialog(window, {
            properties: ['openFile'],
            defaultPath: sanitizeFileName(path.join(__dirname, `${info.videoDetails.title}_${info.videoDetails.author.name}.mp4`)),
            filters: [
                { name: 'MP3', extensions: ['mp3'] },
                { name: 'MP4', extensions: ['mp4'] }
            ]
        }).catch(err => {
            console.error('Error opening file dialog:', err);
        });

        let filePath = result.filePath;
        if (!(filePath.toLowerCase().endsWith(".mp4") || filePath.toLowerCase().endsWith(".mp3"))) {
            filePath += ".mp4";
        }
        // Download video
        const fileStream = fs.createWriteStream(filePath);

        ytdl(url)
            .pipe(fileStream)
            .on('finish', () => {
                console.log('Video downloaded successfully!');
                window.webContents.send("downloaded");
            })
            .on('error', (err) => {
                console.error('Error downloading video:', err);
                window.webContents.send("downloadError");
            });
    }).catch(e => {
        console.log(url, e);
        window.webContents.send("downloadError", e);
    });
}

module.exports = { download };

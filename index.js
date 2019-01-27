import express from 'express';
import bodyParser from 'body-parser';

var rp = require('request-promise');
var moment = require('moment');

const app = express()
const io = require('socket.io-client');
const socket = io('http://127.0.0.1:4001');

const moodifyPlaylist = "7AV39MOazXzbDENBye2EXX";
const userId = "leocheng96";

let prevCategory = "";
let currCategory = "";
let songVolume = 50;
let soundVolume = 150;
let lastSoundChange = moment();

const oathToken =
"BQDK_CmsgAsof8iMp1yOlhJYtcS6wqgiXGLuof16buc90I5WrTLcxjRVijmd1qjyImlAq_DsujPWJVr_LWdWPmiWSWEREBClmkdeclfBKN9niEGcTlWHILwdL4img-6NRxiMKur4r9isq_rABkneSSZtiDFpoehYVoi5hj_CfwBhyOYYXZqcjLJjFAAqjxfK-8XUgT-YYqz603rBkgHu3iQT_Zdx6NC7wUXjaX7LD6ULge7iigbF2y-YLgxqAcyPWhzRhaNyk416fcCd2VM";


app.set('port', process.env.PORT || 1025);
app.use(bodyParser.json());

app.get('/', (req, res) => {
    // res.send('Hello World!')
    res.sendStatus(200);
});

app.post('/', (req, res) => {
    const body = req.body;
    const mood = body.mood;

    let category;

    switch(mood) {
        case "happy":
            category = "pop";
            break;
        case "sad":
            category = "sleep";
            break;
        case "angry":
            category = "rock";
            break;
        case "surprised":
            category = "edm_dance";
            break;
        case "excited":
            category = "party";
            break;
        default:
            category = "jazz";
    }

    currCategory = category;

    getPlaylistId(category);
    res.sendStatus(200);
});

socket.on("test", data => {
    //quieting down
    if (moment().diff(lastSoundChange, 'seconds') >= 10) {
        lastSoundChange = moment();

        if (soundVolume - data >= 50) {
            songVolume = songVolume - 30;
            soundVolume = data;
            changeVolume(songVolume);
        } else if (data - soundVolume > 100) {
            soundVolume = data;
            songVolume = songVolume + 30;
            changeVolume(songVolume);
        }

    }


    console.log(data);
});

app.listen(app.get('port'), () => {
    console.log(`Server listening on port ${app.get('port')}`);
});

function playSong() {
    const options = {
        method: 'PUT',
        uri: 'https://api.spotify.com/v1/me/player/play',
        body: {
            "context_uri": "spotify:user:" + userId + ":playlist:" + moodifyPlaylist,
        },
        qs: {
            access_token: oathToken
        },
        json: true
    };

    rp(options)
        .then(function (parsedBody) {
            console.log("Playing song!");
        })
        .catch(function (err) {
            console.log("Unable to play song!");
        });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function changeVolume(volume) {
    if (volume > 100) {
        volume = 100;
        songVolume = 100;
    } else if (volume < 0) {
        volume = 0;
        songVolume = 0;
    }
    const url = "https://api.spotify.com/v1/me/player/volume?volume_percent=" + volume;

    const options = {
        method: 'PUT',
        uri: url,
        qs: {
            access_token: oathToken
        },
        body: {},
        json: true
    };

    rp(options)
        .then(function (parsedBody) {
            console.log("Volume changed!");
        })
        .catch(function (err) {
            console.log("Unable to Change Volume!");
        });
}

function addTrackToPlaylist(trackURI) {
    const url = "https://api.spotify.com/v1/playlists/" + moodifyPlaylist + "/tracks?position=0&uris=" + trackURI;

    const options = {
        method: 'POST',
        uri: url,
        qs: {
            access_token: oathToken
        },
        body: {
        },
        json: true
    };

    rp(options)
        .then(function (parsedBody) {
            if (prevCategory != currCategory) {
                playSong();
            } else {
                prevCategory = currCategory;
            }

            console.log("Added to Playlist!");
        })
        .catch(function (err) {
            console.log("Unable to Add to Playlist");
        });
}

function getTrackURI(playlistId) {
    const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";

    const options = {
        uri: url,
        qs: {
            access_token: oathToken
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    rp(options)
        .then(function (response) {
            const tracks = response.items;
            if (tracks.length > 0) {
                console.log(tracks[0].track.uri);
                const index = getRandomInt(0, tracks.length - 1);

                addTrackToPlaylist(tracks[index].track.uri);

                return tracks[0].track.uri;
            }
        })
        .catch(function (err) {
            console.log("Failed to retrieve track URI");
        });

    return "";
}

function getPlaylistId(category) {
    console.log(category);
    const url = "https://api.spotify.com/v1/browse/categories/" + category + "/playlists?offset=0&limit=20";

    const options = {
        uri: url,
        qs: {
            access_token: oathToken
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    rp(options)
        .then(function (response) {
            const playlists = response.playlists.items;
            console.log(response);
            if (playlists.length > 0) {
                const index = getRandomInt(0, playlists.length - 1);
                console.log(playlists[index].id);
                getTrackURI(playlists[index].id);

                return playlists[0].id;
            }
        })
        .catch(function (err) {
            console.log("Failed to retrieve playlist id");
        });

    return "";
}
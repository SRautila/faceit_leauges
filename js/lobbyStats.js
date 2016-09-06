/**
 * Created by Sebastian on 2016-09-06.
 */

function drawUserStats(userId) {

    var userInfo = new XMLHttpRequest();
    userInfo.onload = function () {

        var info = JSON.parse(userInfo.responseText).payload;

        var createdAt = new Date(info.created_at);
        var nick = info.nickname;

        var userStats = new XMLHttpRequest();
        userStats.onload = function () {

            var stats = JSON.parse(userStats.responseText);

            var matchesPlayed = stats.lifetime.m1;
            var winRate = stats.lifetime.k6;
            var headshotPercentage = stats.lifetime.k8;
            var kdr = stats.lifetime.k5;

            var div = document.createElement('div');
            div.innerHTML = '<hr /><table>' +
                '<tr><td>Member since</td><td>' + createdAt.getDate() + '/' + (createdAt.getMonth() + 1) + ' ' + createdAt.getFullYear() + '</td></tr>' +
                '<tr><td>Matches Played</td><td>' + matchesPlayed + '</td></tr>' +
                '<tr><td>Win rate</td><td id="LST-WR-' + nick +'">' + winRate + '</td></tr>' +
                '<tr><td>HS %</td><td id="LST-HS-' + nick +'">' + headshotPercentage + '</td></tr>' +
                '<tr><td>KDR</td><td id="LST-KDR-' + nick +'">' + kdr + '</td></tr>' +
                '</table>';
            div.className = "lobbyStats";

            var playerHTMLList = document.getElementsByClassName("match-team-member match-team-member--team");
            Array.prototype.forEach.call(playerHTMLList, function (playerHTML) {
                if (nick === playerHTML.getElementsByClassName("match-team-member__details__name")[0].getElementsByTagName("strong")[0].innerHTML) {
                    playerHTML.appendChild(div);
                }
            });

            var userHistory = new XMLHttpRequest();
            userHistory.onload = function () {

                var recentGames = JSON.parse(userHistory.responseText);
                var recentWins = 0;
                var recentKills = 0;
                var recentDeaths = 0;
                var recentHeadshots = 0;

                for (var i = 0; i < recentGames.length; i++) {
                    recentWins += parseInt(recentGames[i].i10, 10);
                    recentKills += parseInt(recentGames[i].i6, 10);
                    recentDeaths += parseInt(recentGames[i].i8, 10);
                    recentHeadshots += parseInt(recentGames[i].i13, 10);
                }

                var recentWinRate = (recentWins / recentGames.length)*100;
                var recentKDR = recentKills / recentDeaths;
                var recentHeadshotPercentage = (recentHeadshots / recentKills)*100;

                document.getElementById("LST-WR-" + nick).textContent += ' (' + recentWinRate.toFixed(0) + ')';
                document.getElementById("LST-HS-" + nick).textContent += ' (' + recentHeadshotPercentage.toFixed(0) + ')';
                document.getElementById("LST-KDR-" + nick).textContent += ' (' + recentKDR.toFixed(2) + ')';

            };

            userHistory.open('GET', "https://api.faceit.com/stats/api/v1/stats/time/users/" + userId + "/games/csgo?page=0&size=30");
            userHistory.send();

        };

        userStats.open('GET', "https://api.faceit.com/stats/api/v1/stats/users/" + userId + "/games/csgo");
        userStats.send();

    };

    userInfo.open('GET', "https://api.faceit.com/api/users/" + userId);
    userInfo.send();

}

function drawLobbyStats() {

    var matchData = new XMLHttpRequest();
    matchData.onload = function () {

        var json = JSON.parse(matchData.responseText);
        json[0].teams[0].players.forEach(function (player) {
            drawUserStats(player.playerId);
        });

        json[0].teams[1].players.forEach(function (player) {
            drawUserStats(player.playerId);
        });
    };

    var matchID = window.location.pathname.split("/").pop();
    matchData.open('GET', "https://api.faceit.com/stats/api/v1/stats/matches/" + matchID);
    matchData.send();
}

var draw = function () {

    var elem = document.getElementsByClassName("stat__detail__value")[3];
    if (typeof elem !== 'undefined') {
        if (elem.textContent.length > 0) {
            updateStats();
            document.removeEventListener('DOMSubtreeModified', draw, false);
        }
    }
};

document.addEventListener('DOMSubtreeModified', draw, false);

var draw = function () {

    var elem = document.getElementsByClassName("match-team-member__details__name")[4];
    if (typeof elem !== 'undefined') {
        if (elem.textContent.length > 0) {
            drawLobbyStats();
            document.removeEventListener('DOMSubtreeModified', draw, false);
        }
    }
};

document.addEventListener('DOMSubtreeModified', draw, false);



var teamLogoUrl = "https://static.nfl.com/static/site/img/logos/svg/teams/{code}.svg";
var boxScoreFeed = 'https://neulionsmbnyc-a.akamaihd.net/fs/nfl/nfl/stats/boxscores/{season}/{id}.xml';
var pbpFeed = 'https://neulionsmbnyc-a.akamaihd.net/fs/nfl/nfl/pbp/{season}/{id}.xml';
var playerProfilePrefix = "https://imagecomposer.nfl.com/?f=png&l=http://static.nfl.com/static/content/public/static/img/fantasy/transparent/512x512/{eliasId}.png%3Acover()&w=70&h=70";
var liveStateFeed = 'https://neulionsmbnyc-a.akamaihd.net/fs/nfl/nfl/stats/scores/{season}/{gameType}_{week}.xml';
var edlPrefix = 'https://neulionsmbnyc-a.akamaihd.net/fs/nfl/nfl/edl/';
var scheduleAPI = "/schedule?format=json&season={season}&gametype={gameType}&week={week}";
var liveStatsInterval = 15;
var checkGamesInterval = 6 * 60;
var gameSolrPrefix = 'https://solrcloud2.neulion.com/solr/nfl_game/';
var currentSeason = 2018;

var teams = {
    'ARI': {
        code: "ARI",
        city: 'Arizona',
        name: 'Cardinals',
        division: '8',
        statCode: "ARZ",
        color: "#97233F",
        secondaryColor: "#000000",
        tertiaryColor: "#FFFFFF"
    },
    'ATL': {
        code: "ATL",
        city: 'Atlanta',
        name: 'Falcons',
        division: '7',
        color: "#A71930",
        secondaryColor: "#000000",
        tertiaryColor: "#FFFFFF"
    },
    'BAL': {
        code: "BAL",
        city: 'Baltimore',
        name: 'Ravens',
        division: '2',
        statCode: "BLT",
        color: "#241773",
        secondaryColor: "#9E7C0C",
        tertiaryColor: "#000000"
    },
    'BUF': {
        code: "BUF",
        city: 'Buffalo',
        name: 'Bills',
        division: '1',
        color: "#00338D",
        secondaryColor: "#C60C30",
        tertiaryColor: "#FFFFFF"
    },
    'CAR': {
        code: "CAR",
        city: 'Carolina',
        name: 'Panthers',
        division: '7',
        color: "#0085CA",
        secondaryColor: "#000000",
        tertiaryColor: "#BFC0BF"
    },
    'CHI': {
        code: "CHI",
        city: 'Chicago',
        name: 'Bears',
        division: '6',
        color: "#0B162A",
        secondaryColor: "#C83803",
        tertiaryColor: "#FFFFFF"
    },
    'CIN': {
        code: "CIN",
        city: 'Cincinnati',
        name: 'Bengals',
        division: '2',
        color: "#FB4F14",
        secondaryColor: "#000000",
        tertiaryColor: "#FFFFFF"
    },
    'CLE': {
        code: "CLE",
        city: 'Cleveland',
        name: 'Browns',
        division: '2',
        statCode: "CLV",
        color: "#FF3C00",
        secondaryColor: "#311D00",
        tertiaryColor: "#FFFFFF"
    },
    'DAL': {
        code: "DAL",
        city: 'Dallas',
        name: 'Cowboys',
        division: '5',
        color: "#002244",
        secondaryColor: "#B0B7BC",
        tertiaryColor: "#FFFFFF"
    },
    'DEN': {
        code: "DEN",
        city: 'Denver',
        name: 'Broncos',
        division: '4',
        color: "#002244",
        secondaryColor: "#FB4F14",
        tertiaryColor: "#FFFFFF"
    },
    'DET': {
        code: "DET",
        city: 'Detroit',
        name: 'Lions',
        division: '6',
        color: "#0076B6",
        secondaryColor: "#B0B7BC",
        tertiaryColor: "#000000"
    },
    'GB': {
        code: "GB",
        city: 'Green Bay',
        name: 'Packers',
        division: '6',
        color: "#203731",
        secondaryColor: "#FFB612",
        tertiaryColor: "#FFFFFF"
    },
    'HOU': {
        code: "HOU",
        city: 'Houston',
        name: 'Texans',
        division: '3',
        statCode: "HST",
        color: "#03202F",
        secondaryColor: "#A71930",
        tertiaryColor: "#FFFFFF"
    },
    'IND': {
        code: "IND",
        city: 'Indianapolis',
        name: 'Colts',
        division: '3',
        color: "#002C5F",
        secondaryColor: "#FFFFFF",
        tertiaryColor: "#A5ACAF"
    },
    'JAC': {
        code: "JAC",
        city: 'Jacksonville',
        name: 'Jaguars',
        statCode: "JAX",
        color: "#9F792C",
        secondaryColor: "#000000",
        tertiaryColor: "#FFFFFF"
    },
    'JAX': {
        code: "JAX",
        city: 'Jacksonville',
        name: 'Jaguars',
        division: '3',
        color: "#9F792C",
        secondaryColor: "#000000",
        tertiaryColor: "#FFFFFF"
    },
    'KC': {
        code: "KC",
        city: 'Kansas City',
        name: 'Chiefs',
        division: '4',
        color: "#E31837",
        secondaryColor: "#FFB612",
        tertiaryColor: "#FFFFFF"
    },
    'LA': {
        code: "LA",
        city: 'Los Angeles',
        name: 'Rams',
        division: '8',
        color: "#002244",
        secondaryColor: "#B3995D",
        tertiaryColor: "#FFFFFF"
    },
    'LAC': {
        code: "LAC",
        city: 'Los Angeles',
        name: 'Chargers',
        division: '4',
        color: "#002A5E",
        secondaryColor: "#0080C6",
        tertiaryColor: "#FFC20E"
    },
    'MIA': {
        code: "MIA",
        city: 'Miami',
        name: 'Dolphins',
        division: '1',
        color: "#008E97",
        secondaryColor: "#F58220",
        tertiaryColor: "#FFFFFF"
    },
    'MIN': {
        code: "MIN",
        city: 'Minnesota',
        name: 'Vikings',
        division: '6',
        color: "#4F2683",
        secondaryColor: "#FFC62F",
        tertiaryColor: "#FFFFFF"
    },
    'NE': {
        code: "NE",
        city: 'New England',
        name: 'Patriots',
        division: '1',
        color: "#002244",
        secondaryColor: "#C60C30",
        tertiaryColor: "#FFFFFF"
    },
    'NO': {
        code: "NO",
        city: 'New Orleans',
        name: 'Saints',
        division: '7',
        color: "#D3BC8D",
        secondaryColor: "#000000",
        tertiaryColor: "#FFFFFF"
    },
    'NYG': {
        code: "NYG",
        city: 'New York',
        name: 'Giants',
        division: '5',
        color: "#0B2265",
        secondaryColor: "#A71930",
        tertiaryColor: "#FFFFFF"
    },
    'NYJ': {
        code: "NYJ",
        city: 'New York',
        name: 'Jets',
        division: '1',
        color: "#003F2D",
        secondaryColor: "#FFFFFF",
        tertiaryColor: "#B1B3B6"
    },
    'OAK': {
        code: "OAK",
        city: 'Oakland',
        name: 'Raiders',
        division: '4',
        color: "#000000",
        secondaryColor: "#A5ACAF",
        tertiaryColor: "#FFFFFF"
    },
    'PHI': {
        code: "PHI",
        city: 'Philadelphia',
        name: 'Eagles',
        division: '5',
        color: "#004C54",
        secondaryColor: "#A5ACAF",
        tertiaryColor: "#FFFFFF"
    },
    'PIT': {
        code: "PIT",
        city: 'Pittsburgh',
        name: 'Steelers',
        division: '2',
        color: "#000000",
        secondaryColor: "#FFB612",
        tertiaryColor: "#FFFFFF"
    },
    'SD': {
        code: "SD",
        city: 'San Diego',
        name: 'Chargers',
        color: "#002A5E",
        secondaryColor: "#0080C6",
        tertiaryColor: "#FFC20E"
    },
    'SEA': {
        code: "SEA",
        city: 'Seattle',
        name: 'Seahawks',
        division: '8',
        color: "#002244",
        secondaryColor: "#A5ACAF",
        tertiaryColor: "#69BE28"
    },
    'SF': {
        code: "SF",
        city: 'San Francisco',
        name: '49ers',
        division: '8',
        color: "#AA0000",
        secondaryColor: "#B3995D",
        tertiaryColor: "#FFFFFF"
    },
    'STL': {
        code: "STL",
        city: 'St. Louis',
        name: 'Rams',
        statCode: "SL",
        color: "#002244",
        secondaryColor: "#B3995D",
        tertiaryColor: "#FFFFFF"
    },
    'TB': {
        code: "TB",
        city: 'Tampa Bay',
        name: 'Buccaneers',
        division: '7',
        color: "#D50A0A",
        secondaryColor: "#34302B",
        tertiaryColor: "#000000"
    },
    'TEN': {
        code: "TEN",
        city: 'Tennessee',
        name: 'Titans',
        division: '3',
        color: "#002244",
        secondaryColor: "#4B92DB",
        tertiaryColor: "#C60C30"
    },
    'WAS': {
        code: "WAS",
        city: 'Washington',
        name: 'Redskins',
        division: '5',
        color: "#5A1414",
        secondaryColor: "#FFB612",
        tertiaryColor: "#FFFFFF"
    },
    // Pro Bowl
    'AFC': {
        code: "AFC",
        city: '',
        name: 'AFC',
        color: "#D50A0A",
        secondaryColor: "#FFFFFF",
        tertiaryColor: "#D50A0A"
    },
    'NFC': {
        code: "NFC",
        city: '',
        name: 'NFC',
        color: "#013369",
        secondaryColor: "#FFFFFF",
        tertiaryColor: "#013369"
    },
    'RIC': {
        code: "RIC",
        city: 'Team Rice',
        name: 'Team Rice',
        color: "#f36c20",
        secondaryColor: "#f36c20",
        tertiaryColor: "#f36c20"
    },
    'CRT': {
        code: "CRT",
        city: 'Team Carter',
        name: 'Team Carter',
        color: "#e0e326",
        secondaryColor: "#e0e326",
        tertiaryColor: "#e0e326"
    },
    'IRV': {
        code: "IRV",
        city: 'Team Irvin',
        name: 'Team Irvin',
        color: "#ff7a43",
        secondaryColor: "#ff7a43",
        tertiaryColor: "#ff7a43"
    },
    'SAN': {
        code: "SAN",
        city: 'Team Sanders',
        name: 'Team Sanders',
        color: "#dfe225",
        secondaryColor: "#dfe225",
        tertiaryColor: "#dfe225"
    }
};

var pbpTeamStatCodeMap = {};
for (var code in teams) {
    pbpTeamStatCodeMap[teams[code].statCode || code] = code;
}

var tagsShows = ["A Football Life", "America's Game", "Hard Knocks", "Sound FX", "Super Bowl Archive", "The Timeline", "Undrafted"];
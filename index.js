import groups from "./data/groups.json" assert { type: "json" };
import { groupStageMatches, stagesDefinitions, teamInitStatistics } from "./definitions/definitions.js";
import { sortGroupTeams, sortTeams } from "./utils/utils.js";

const groupsKeys = Object.keys(groups)

const teams = {};
groupsKeys.forEach(group => groups[group].forEach(team => 
    teams[team.ISOCode] = {...team, group}
))

const tournament = {
    tournament: "Olympic Games Basketball 2024",
    startDate: "2024-07-05",
    endDate: "2024-08-08",
    totalTeam: 12,
    winner: "",
    stages: {
        groupStage: [], 
        quarterFinals: [],
        semiFinals: [],
        finals: [] 
    }, 
    teams: {...teams}
} 




const updateTeamStats = (tournament, team, update, stage) => {
    if(!Object.values(stagesDefinitions).includes(stage)){
        throw new Error("Invalid stage!")
    }
    if(!Object.values(teams).find(t => t.ISOCode === team)){
        throw new Error("Invalid team asdfasdf!")
    }

    let groupStageStats = tournament.teams[team]?.groupStageStats 
                            ? {...tournament.teams[team].groupStageStats}
                            : {...teamInitStatistics, points:0}
    let overallStats = tournament.teams[team]?.overallStats
                            ? {...tournament.teams[team].overallStats}
                            : {...teamInitStatistics}
    
    tournament.teams = tournament.teams || {};
    tournament.teams[team] = tournament.teams[team] || {};

    if(stage===stagesDefinitions.groupStage){
        for(let key in update){
            if(groupStageStats.hasOwnProperty(key)){
                groupStageStats[key] += update[key]
            }
        }
        tournament.teams[team].groupStageStats = groupStageStats; 
    }
    for(let key in update){
        if(overallStats.hasOwnProperty(key)){
            overallStats[key] += update[key]
        }
    }
    tournament.teams[team].overallStats = overallStats;
}


const addMatch = (tournament, match, stage) => {
    const { groupStage, quarterfinals, semifinals, finals } = stagesDefinitions;
    if(!Object.values(stagesDefinitions).includes(stage)){
        throw new Error("Invalid stage!")
    }
    if(stage === groupStage){
        let group = match.info?.group;
        let round = match.info?.round;
        if(!group || !round || !groupsKeys.includes(group)){
            throw new Error("Invalid group stage info!")
        }
    }

    tournament.stages = tournament.stages || {};
     
    switch(stage){
        case groupStage: {
            tournament.stages[groupStage] = tournament.stages[groupStage] || {};
            tournament.stages[groupStage].push(match);
            break;
        };
        case quarterfinals: {
            tournament.stages[quarterfinals] = tournament.stages[quarterfinals] || [];
            tournament.stages[quarterfinals].push(match);
            break;
        };
        case semifinals: {
            tournament.stages[semifinals] = tournament.stages[semifinals] || [];
            tournament.stages[semifinals].push(match);
            break;
        }
        case finals: {
            tournament.stages[finals] = tournament.stages[finals] || [];
            tournament.stages[finals].push(match);
            break;
        }
    }
}


const match = (team1, team2, tournament, info) => {
    const max = 80;
    const min = 70;
    const{stage} = info

    let disqualification = Math.ceil(Math.random()*100)
    let t1Points, t2Points;
    let t1PointsScored, t2PointsScored;
    if(disqualification===1){
        t1Points = 0;
        t2Points = 2;
        t1PointsScored = 0;
        t2PointsScored = 20;
    }else if(disqualification===2){
        t1Points = 2;
        t2Points = 0;
        t1PointsScored = 20;
        t2PointsScored = 0;
    }else{ 
        t1PointsScored = Math.ceil(Math.random()*(max-min)+min)
        t2PointsScored = Math.ceil(Math.random()*(max-min)+min)
        t1Points = t1PointsScored > t2PointsScored ? 2 : 1;
        t2Points = t1PointsScored < t2PointsScored ? 2 : 1
    }
 
    let team1Update = {
        games:1,
        wins: t1Points>t2Points ? 1 : 0,
        loses: t1Points<t2Points ? 1 : 0,
        pointsScored: t1PointsScored,
        pointsConceded: t2PointsScored,
        pointDifference: t1PointsScored-t2PointsScored
    }
    let team2Update = {
        games:1,
        wins: t2Points>t1Points ? 1 : 0,
        loses: t2Points<t1Points ? 1 : 0,
        pointsScored: t2PointsScored,
        pointsConceded: t1PointsScored,
        pointDifference: t2PointsScored-t1PointsScored
    }

    if(stage==="groupStage"){
        team1Update = {...team1Update, points: t1Points}
        team2Update = {...team2Update, points: t2Points}
    }

    updateTeamStats(tournament, team1.ISOCode, team1Update, stage)
    updateTeamStats(tournament, team2.ISOCode, team2Update, stage)

    let matchData = {
        [team1.ISOCode]:{
            team: team1.Team,
            score: t1PointsScored
        },
        [team2.ISOCode]:{
            team: team2.Team,
            score: t2PointsScored
        },
        info
    }

    addMatch(tournament, matchData, stage)
}

 
groupStageMatches.forEach((round,i) => {
    round.forEach((positions) => 
        groupsKeys.forEach(g => 
            match(
                groups[g][positions[0]-1], 
                groups[g][positions[1]-1], 
                tournament, 
                {stage: stagesDefinitions.groupStage, round:i+1, group:g }
            )
        )
    )
})

const sortedGroupTeams = sortGroupTeams(tournament)

const firstInGroups = [];
const secondInGroups = [];
const thirdInGroups = [];

sortedGroupTeams.forEach(g => {
    firstInGroups.push(g[0]);
    secondInGroups.push(g[1]);
    thirdInGroups.push(g[2]);
})

const storedBetweenGroups = [firstInGroups,secondInGroups,thirdInGroups];

const groupStageList = {};
let i = 1;
storedBetweenGroups.forEach(g => {
    let sortedTeams = sortTeams(g);
    sortedTeams.forEach(s => {
        groupStageList[i]=s;
        i++;
    })
}) 

console.log("groupStageList",groupStageList) 

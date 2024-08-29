import groups from "./data/groups.json" assert { type: "json" };
import { groupStageMatches, stagesDefinitions, teamInitStatistics, tournamentStages } from "./definitions/definitions.js";

// console.log(groups)
  

const groupsKeys = Object.keys(groups)
console.log(groupsKeys)

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
        groupStage: {
            "A": [],
            "B": [],
            "C": []
        }, 
        quarterFinals: [],
        semiFinals: [],
        finals: [] 
    }, 
    teams
} 



const matchesData = [];

const updateTeamStats = (tournament, team, update, stageInfo) => {
    if(!Object.values(tournamentStages).includes(stageInfo.stage)){
        throw new Error("Invalid stage!")
    }
    if(stageInfo.stage === "group"){
        if(!groupsKeys.includes(stageInfo.group) || ![1,2,3].includes(stageInfo.phase)){
            throw new Error("Invalid group stage info!")
        }
    }
    
    // let overalStats = tournament.teams[team]?.overalStats; 
    // if(!overalStats){
    //     overalStats = {...teamInitStatistics}
    // }


    let groupStageStats = tournament.teams[team]?.groupStageStats 
                            ? {...tournament.teams[team].groupStageStats}
                            : {...teamInitStatistics}

    switch(stageInfo.stage){
        case stagesDefinitions.group: {
            for(let key in update){
                if(groupStageStats.hasOwnProperty(key)){
                    groupStageStats[key] += update[key]
                }
            }
            tournament.teams = tournament.teams || {};
            tournament.teams[team] = tournament.teams[team] || {};
            tournament.teams[team].groupStageStats = groupStageStats;
            //overallStats
            break;
        }
        
    } 

}


const addMatch = (tournament, match, stageInfo) => {
    const { group, quarterfinals, semifinals, finals } = stagesDefinitions;
    if(!Object.values(tournamentStages).includes(stageInfo.stage)){
        throw new Error("Invalid stage!")
    }
    if(stageInfo.stage === group){
        if(!groupsKeys.includes(stageInfo.group) || ![1,2,3].includes(stageInfo.round)){
            throw new Error("Invalid group stage info!")
        }
    }
    tournament.stages = tournament.stages || {};
     
    switch(stageInfo.stage){
        case group: {
            tournament.stages[group] = tournament.stages.groupStage || {};
            tournament.stages[group][stageInfo.group] = tournament.stages.groupStage[stageInfo.group] || [];
            tournament.stages[group][stageInfo.group].push(match);
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


const match = (team1, team2, tournament, stageInfo) => {
    console.log("team1", team1)
    console.log("team2", team2)
    const max = 80;
    const min = 70;

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
        //Pazi ovde da ne može da se nađe isti rezultat
        t1PointsScored = Math.ceil(Math.random()*(max-min)+min)
        t2PointsScored = Math.ceil(Math.random()*(max-min)+min)
        t1Points = t1PointsScored > t2PointsScored ? 2 : 1;
        t2Points = t1PointsScored < t2PointsScored ? 2 : 1
    }
 
    let team1Update = {
        wins: t1Points>t2Points ? 1 : 0,
        loses: t1Points<t2Points ? 1 : 0,
        pointsScored: t1PointsScored,
        pointsConceded: t2PointsScored,
        pointDifference: t1PointsScored-t2PointsScored
    }
    let team2Update = {
        wins: t2Points>t1Points ? 1 : 0,
        loses: t2Points<t1Points ? 1 : 0,
        pointsScored: t2PointsScored,
        pointsConceded: t1PointsScored,
        pointDifference: t2PointsScored-t1PointsScored
    }

    updateTeamStats(tournament, team1.ISOCode, team1Update, stageInfo)
    updateTeamStats(tournament, team2.ISOCode, team2Update, stageInfo)

    let matchData = {
        [team1.ISOCode]:{
            team: team1.Team,
            score: t1PointsScored
        },
        [team2.ISOCode]:{
            team: team2.Team,
            score: t2PointsScored
        },
        stageInfo
    }
    addMatch(tournament, matchData, stageInfo)
}


// groupStageMatches.forEach((round,i) => {
//     console.log(`round: ${i+1} ///////////////////`)
//     round.forEach((positions) => {
//         groups.forEach(g => 
//         {
//             matchesData.push( { ...match(groups[g][positions[0]-1], groups[g][positions[1]-1]), group: g, round:i+1}  )
//         })
//     })
// } )


// const groupStageStatistics = groupStageMatchesData.reduce((a,b)=>{
    
// })



// console.log("groupStageMatches", matchesData)
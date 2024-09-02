import groups from "./data/groups.json" assert { type: "json" };
import { groupStageMatches, pots, stagesDefinitions, teamInitStatistics } from "./definitions/definitions.js";
import { display, displayEliminationPhase, displayGroupStageMatches, displayGroupStageStats, displayPots, getResultRange, pairTeams, sortGroupTeams, sortTeams } from "./utils/utils.js";

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
        quarterfinals: [],
        semifinals: [],
        finals: [] 
    }, 
    teams: JSON.parse(JSON.stringify(teams))
} 




const updateTeamStats = (tournament, team, update, stage) => {
    if(!Object.values(stagesDefinitions).includes(stage)){
        throw new Error("Invalid stage!")
    }
    if(!Object.values(teams).find(t => t.ISOCode === team)){
        throw new Error(`Invalid ISOCode: ${team}`)
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
    let [team1Min, team1Max] = getResultRange(team1,tournament);
    let [team2Min,team2Max] = getResultRange(team2,tournament);
    const luckFactor = Math.floor(Math.random()*10);
    team1Max += team1Max<=team2Min ? team2Min-team1Max+luckFactor : 0;
    team2Max += team2Max<=team1Min ? team1Min-team2Max+luckFactor : 0;

    const{stage} = info
    if(!stage){
        throw new Error ("Invalid stage data!")
    }

    let disqualification = Math.ceil(Math.random()*100)

    let t1Score, t2Score;
    let t1Points, t2Points;
    let winnerTeam, looserTeam;

    if(disqualification===1){ 
        t1Score = 0;
        t2Score = 20;
        t1Points = 0;
        t2Points = 2;
    }else if(disqualification===2){
        t1Score = 20;
        t2Score = 0;
        t1Points = 2;
        t2Points = 0;
    }else{ 
        t1Score = Math.ceil(Math.random()*(team1Max-team1Min)+team1Min)
        t2Score = Math.ceil(Math.random()*(team2Max-team2Min)+team2Min)
        if(t1Score===t2Score){
            t1Score += team1.FIBARanking < team2.FIBARanking ? 1 : -1; 
        }
        t1Points = t1Score > t2Score ? 2 : 1;
        t2Points = t1Score < t2Score ? 2 : 1
    }

    const [winnerScored,looserScored] = [t1Score,t2Score].sort((a,b)=>b-a)
    const [winnerPoints,looserPoints] = [t1Points,t2Points].sort((a,b)=>b-a)

    let winnerUpdate = {
        games:1,
        wins: 1,
        pointsScored: winnerScored,
        pointsConceded: looserScored,
        pointDifference: winnerScored-looserScored
    }
    let looserUpdate = {
        games:1,
        loses: 1,
        pointsScored: looserScored,
        pointsConceded: winnerScored,
        pointDifference: looserScored-winnerScored
    }

    if(stage===stagesDefinitions.groupStage){
        winnerUpdate = {...winnerUpdate, points: winnerPoints}
        looserUpdate = {...looserUpdate, points: looserPoints}
    }

    if(t1Score>t2Score){
        winnerTeam = {...team1}
        looserTeam = {...team2}
    }else{
        winnerTeam = {...team2}
        looserTeam = {...team1}
    }

    updateTeamStats(tournament, winnerTeam.ISOCode, winnerUpdate, stage);
    updateTeamStats(tournament, looserTeam.ISOCode, looserUpdate, stage);

    let matchData = {
        winner: {
            team: winnerTeam.Team,
            ISOCode: winnerTeam.ISOCode,
            score: winnerScored
        },
        looser: {
            team: looserTeam.Team,
            ISOCode: looserTeam.ISOCode,
            score: looserScored
        },
        info
    }
    addMatch(tournament, matchData, stage)
}

 

const playTournament = (tournament) => {
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

    displayGroupStageMatches(tournament.stages.groupStage)
    displayGroupStageStats(sortedGroupTeams);
    
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
     
    displayPots(pots, groupStageList)

    const quarterFinalsMatches = pots.map(pairPots => pairTeams(pairPots, groupStageList, tournament.stages.groupStage))
    quarterFinalsMatches.forEach((pot,i) => {
        pot.forEach(m => {
            let team1 = groupStageList[m[0]]
            let team2 = groupStageList[m[1]]
            match(team1,team2,tournament,{pot:i+1, stage: stagesDefinitions.quarterfinals})
        })
    })

    displayEliminationPhase("Eliminaciona faza",tournament.stages.quarterfinals,false);
    displayEliminationPhase("Četvrtfinale",tournament.stages.quarterfinals,true);
    
    const semifinalists1=[];
    const semifinalists2=[];
    tournament.stages.quarterfinals.forEach(match => {
        if(match.info.pot===1){
            semifinalists1.push(teams[match.winner.ISOCode])
        }else{
            semifinalists2.push(teams[match.winner.ISOCode])
        }
    })
    match(...semifinalists1, tournament, {stage:stagesDefinitions.semifinals})
    match(...semifinalists2, tournament, {stage:stagesDefinitions.semifinals})
    displayEliminationPhase("Polufinale",tournament.stages.semifinals,true);

    
    const finalists = [];
    const thirdPlace = [];
    tournament.stages.semifinals.forEach(match => {
        finalists.push(teams[match.winner.ISOCode]);
        thirdPlace.push(teams[match.looser.ISOCode]);
    })
    match(...finalists, tournament, {stage: stagesDefinitions.finals})
    match(...thirdPlace, tournament, {stage: stagesDefinitions.finals, thirdPlace:true})
    const finals = tournament.stages?.finals;
    const thirdPlaceMatch = finals.filter(f => f.info?.thirdPlace)
    const finalsMatch = finals.filter(f => !f.info?.thirdPlace)
    displayEliminationPhase("Utakmica za treće mesto",thirdPlaceMatch,true);
    displayEliminationPhase("Finale",finalsMatch,true);
    
    let standings = "Medalje: \n";
    finals.forEach(match => {
      if(!match.info.thirdPlace) {
        standings += `1. ${match.winner?.team} \n`;
        standings += `2. ${match.looser?.team} \n`;
      } else {
        standings += `3. ${match.looser?.team} \n`;
      }
    });
    tournament.standings = standings
    display(tournament.standings)

}

playTournament(tournament)


// console.log("tournament",tournament)



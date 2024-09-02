import groups from "../data/groups.json" assert { type: "json" };
import exibitions from "../data/exibitions.json" assert { type: "json" };
import { getTeams, romanNumber, stagesDefinitions, teamInitStatistics } from "../definitions/definitions.js";

export const groupsKeys = Object.keys(groups)


// ==========================
// Tournament Management
// ==========================

// Update Team Statistics
// Updates the statistics for a team in the tournament object.
export const updateTeamStats = (tournament, team, update, stage) => {
    if(!Object.values(stagesDefinitions).includes(stage)){
        throw new Error("Invalid stage!")
    }
    if(!Object.values(getTeams()).find(t => t.ISOCode === team)){
        throw new Error(`Invalid ISOCode: ${team}`)
    }
    // Initialize or copy the existing group stage and overall statistics for the team.
    let groupStageStats = tournament.teams[team]?.groupStageStats 
                            ? {...tournament.teams[team].groupStageStats}
                            : {...teamInitStatistics, points:0}
    let overallStats = tournament.teams[team]?.overallStats
                            ? {...tournament.teams[team].overallStats}
                            : {...teamInitStatistics}
    
    tournament.teams = tournament.teams || {};
    tournament.teams[team] = tournament.teams[team] || {};
    //Update groupStageStats and overall statistics
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


// Add Match
// Add match to the appropriate stage in the tournament object
export const addMatch = (tournament, match, stage) => {
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


// Match
// Simulates a match between two teams, updates the tournament, and records the match result.
export const match = (team1, team2, tournament, info) => {
    let [team1Min, team1Max] = getResultRange(team1,tournament.teams);
    let [team2Min,team2Max] = getResultRange(team2,tournament.teams);
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
    // Handle disqualification cases.
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
        // Simulate the actual scores based on the result ranges.
        t1Score = Math.ceil(Math.random()*(team1Max-team1Min)+team1Min)
        t2Score = Math.ceil(Math.random()*(team2Max-team2Min)+team2Min)
        if(t1Score===t2Score){
            t1Score += team1.FIBARanking < team2.FIBARanking ? 1 : -1; 
        }
        // Assign points based on the match results.
        t1Points = t1Score > t2Score ? 2 : 1;
        t2Points = t1Score < t2Score ? 2 : 1
    }
    // Define the winner and looser scores and points.
    const [winnerScored,looserScored] = [t1Score,t2Score].sort((a,b)=>b-a)
    const [winnerPoints,looserPoints] = [t1Points,t2Points].sort((a,b)=>b-a)
    // Define the update objects for the winner and looser.
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
    // If the stage is the group stage, update the points.
    if(stage===stagesDefinitions.groupStage){
        winnerUpdate = {...winnerUpdate, points: winnerPoints}
        looserUpdate = {...looserUpdate, points: looserPoints}
    }
    // Determine which team is the winner and which is the looser.
    if(t1Score>t2Score){
        winnerTeam = {...team1}
        looserTeam = {...team2}
    }else{
        winnerTeam = {...team2}
        looserTeam = {...team1}
    }
    // Update the team statistics for both the winner and looser.
    updateTeamStats(tournament, winnerTeam.ISOCode, winnerUpdate, stage);
    updateTeamStats(tournament, looserTeam.ISOCode, looserUpdate, stage);
    // Prepare the match data and add it to the tournament.
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




// ==========================
// Team Sorting Functions
// ==========================

// Sort Group Teams
// Sort all teams inside each group
export const sortGroupTeams = (tournament) => {
    return groupsKeys.map(key => {
        let group = Object.values(tournament.teams).filter(t => t.group===key)
        group.sort((a,b) => {
            if(a.groupStageStats.points < b.groupStageStats.points) return 1;
            if(a.groupStageStats.points > b.groupStageStats.points) return -1;
            const headToHeadResult = findMatchResults(a.ISOCode, b.ISOCode, tournament.stages.groupStage);
            if (headToHeadResult) {
                return headToHeadResult;
            }
            if(a.groupStageStats.pointDifference < b.groupStageStats.pointDifference) return 1;
            if(a.groupStageStats.pointDifference > b.groupStageStats.pointDifference) return -1;
            return 0;
        })
        return group
    })
}


//Find match results
//Find match result for two teams in the group stage, and return 1, -1, 0 depending match result.
export const findMatchResults = (team1,team2,groupStage) => {
    let match = groupStage.find(match => match.hasOwnProperty(team1) && match.hasOwnProperty(team2)) 
    if(match){
        if(match[team1].score > match[team2].score){
            return -1
        }else if(match[team1].score < match[team2].score){
            return 1
        }
    }
    return 0;
}


// Sort tems
// Sorts an array of teams based on their performances in the group stage (points, point difference, points scored)
export const sortTeams = (team) => { 
    team.sort((a,b) => {
        if(a.groupStageStats.points < b.groupStageStats.points) return 1;
        if(a.groupStageStats.points > b.groupStageStats.points) return -1;
        if(a.groupStageStats.pointDifference < b.groupStageStats.pointDifference) return 1;
        if(a.groupStageStats.pointDifference > b.groupStageStats.pointDifference) return -1;
        if(a.groupStageStats.pointScored < b.groupStageStats.pointScored) return 1;
        if(a.groupStageStats.pointScored > b.groupStageStats.pointScored) return -1;
        return 0;
    })
    return team;
}




// ==========================
// Team Pairing Functions
// ==========================

// Pair teams function
// Pair teams from pots, ensuring they haven't been matched before.
export const pairTeams = (pairPots, groupStageList, groupStage) => {
    //Randomly pair teams between two groups of pots.
    let i = Math.floor(Math.random()*2)
    let j = i===0 ? 1 : 0
    const potsArr = Object.values(pairPots)
    let pairedPositions1 = [potsArr[0][i], potsArr[1][i]];
    let pairedPositions2 = [potsArr[0][j], potsArr[1][j]]; 
    // If the teams haven't been matched before, return the current pairings, otherwise switch them
    return !areMatchedBefore(pairedPositions1,groupStageList,groupStage)
            ? [pairedPositions1,pairedPositions2] 
            : [[potsArr[0][i], potsArr[1][j]], [potsArr[0][j], potsArr[1][i]] ]
}


// Are matched before
// Checks if two teams have been matched before in the group stage.
export const areMatchedBefore = (pairedPositions, groupStageList, groupStage) => {
    if(pairedPositions.length!==2){
        throw new Error("Invalid team positions!")
    }
    const team1 = groupStageList[pairedPositions[0]]?.ISOCode;
    const team2 = groupStageList[pairedPositions[1]]?.ISOCode;
    if(!team1 || !team2){
        throw new Error("Invalid team positions!")
    }
    // Check if a match between team1 and team2 already exists in the group stage
    return groupStage.some( match =>
        match.hasOwnProperty(team1) &&
        match.hasOwnProperty(team2)
    )
}




// ==========================
// Calculate result range
// ==========================

// Get result range
// Calculates the score range for a given team based on their exhibition match results and overall tournament statistics.
export const getResultRange = (team,teams) => {
    let totalExibitionsScored = 0;
    let totalExibitionsAgaints = 0;
    let totalExibitionsMatches = 0;
    // Iterate through each exhibition match
    exibitions[team.ISOCode].forEach((match,i) => {
        const[pointsScored, pointsAgainst] = match.Result.split('-').map(Number)
        totalExibitionsScored += pointsScored;
        totalExibitionsAgaints += pointsAgainst;
        totalExibitionsMatches = i+1;
    })
    // Get the team's overall stats
    const teamStats = teams[team.ISOCode]?.overallStats || {};
    const teamScored = (teamStats.pointsScored || 0) + totalExibitionsScored;
    const teamGames = (teamStats.games || 0) + totalExibitionsMatches;
    const teamPointDifference = (teamStats.pointDifference || 0) + totalExibitionsScored - totalExibitionsAgaints;
    const teamAvgScored = teamScored ? Math.floor(teamScored/teamGames) : 0;
    // Calculate deduction and addition percentages based on FIBA ranking and average points scored
    const deductionPercent = Math.floor(0.5*team.FIBARanking) + (teamAvgScored<=60 ? 0 : 5)
    const additionPercent = (teamPointDifference>1 ? 1 : 0) + teamAvgScored>=100 ? 5 : 10;
    // Calculate the minimum and maximum score range
    const min = teamAvgScored - Math.floor(teamAvgScored*deductionPercent/100);
    const max = teamAvgScored + Math.floor(teamAvgScored*additionPercent/100);
    return [min,max]
}




// ==========================
// Display functions
// ==========================

// Display
export const display = (output) => {
    console.log(output+"\n")
}

// Display groupstage matches
export const displayGroupStageMatches = (matches) => {
    let output = '';
    for(let i=1; i<=3; i++){
        output += `Grupna faza - ${romanNumber[i-1]} kolo: \n`
        groupsKeys.forEach(group => {
            output += `\t Grupa ${group}: \n`;
            const groupMatches = matches.filter(m => m.info.group === group && m.info.round===i) || {}
            groupMatches.forEach(match=>{
                output += `\t\t ${match.winner?.team} - ${match.looser?.team} (${match.winner?.score}:${match.looser?.score}) \n`    
            })
        })
        output += `\n`;
    }
    display(output)
}


// Display group stage statistics
export const displayGroupStageStats = (groups) => {
    let output = "";
    groups.forEach((group, index) => {
        output += `Grupa ${groupsKeys[index]}: \n`;
        output += "Tim                | Pobede | Porazi | Bodovi | Postignuti koševi | Primljeni koševi | Koš razlika \n";
        output += "----------------------------------------------------------------------------------------------------- \n";
        
        group.forEach(team => {
            const stats = team.groupStageStats;
            output +=
                `${team.Team.padEnd(18)} | ` +
                `${stats.wins.toString().padEnd(6)} | ` +
                `${stats.loses.toString().padEnd(6)} | ` +
                `${stats.points.toString().padEnd(6)} | ` +
                `${stats.pointsScored.toString().padEnd(17)} | ` +
                `${stats.pointsConceded.toString().padEnd(16)} | ` +
                `${stats.pointDifference.toString().padEnd(17)} \n`
            ;
        });
        output += "\n";
    });
    display(output)
}


// Display pots
export const displayPots = (pots,groupStageList) => {
    let listPots = {}
    pots.forEach(pot => {
        for(let key in pot){
            listPots[key] = pot[key]
        }
    })
    const potsKeys = Object.keys(listPots)
    const sortedPots = potsKeys
        .sort()
        .reduce((acc, key) => {
            acc[key] = listPots[key];
            return acc;
        }, {});
    let output = "Šeširi: \n"; 
    potsKeys.forEach( key => {
        const pot = sortedPots[key] || [];
        output += `\t Šešir ${key} \n`;
        output += `\t\t  ${groupStageList[pot[0]].Team} \n`;
        output += `\t\t  ${groupStageList[pot[1]].Team} \n`;
    })
    display(output)
}


// Display elimination phase
export const displayEliminationPhase = (title,phase,result) => {
    let output = `${title}: \n`;
    let prevPot;
    let pot;
    phase.forEach( match => {
        const team1 = match.winner?.team;
        const team2 = match.looser?.team;
        const team1Score = match.winner?.score;
        const team2Score = match.looser?.score;
        const scores = `(${team1Score}:${team2Score})`;
        pot = match.info?.pot;
        output += prevPot && pot && prevPot!==pot ? "\n" : "";
        prevPot = pot ? pot : prevPot
        output += `\t ${team1} - ${team2} ${result ? scores : ""} \n`;
    })
    display(output)
}


// Display standings
export const displayStandings = (finals) => {
    let standings = "Medalje: \n";
    standings = finals.reduce((acc,match) => {
      if(!match.info.thirdPlace) {
        acc += `1. ${match.winner?.team} \n`;
        acc += `2. ${match.looser?.team} \n`;
      } else {
        acc += `3. ${match.looser?.team} \n`;
      }
      return acc;
    }, standings);
    display(standings)
}
import groups from "../data/groups.json" assert { type: "json" };
import exibitions from "../data/exibitions.json" assert { type: "json" };
import { romanNumber } from "../definitions/definitions.js";

export const groupsKeys = Object.keys(groups)

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

//Sort all teams inside each group
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


export const shuffleArray = (array) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

export const pairTeams = (pairPots, groupStageList, groupStage) => {
    let i = Math.floor(Math.random()*2)
    let j = i===0 ? 1 : 0
    const potsArr = Object.values(pairPots)
    let pairedPositions1 = [potsArr[0][i], potsArr[1][i]];
    let pairedPositions2 = [potsArr[0][j], potsArr[1][j]]; 
    return !areMatchedBefore(pairedPositions1,groupStageList,groupStage)
            ? [pairedPositions1,pairedPositions2] 
            : [[potsArr[0][i], potsArr[1][j]], [potsArr[0][j], potsArr[1][i]] ]
}

export const areMatchedBefore = (pairedPositions, groupStageList, groupStage) => {
    if(pairedPositions.length!==2){
        throw new Error("Invalid team positions!")
    }
    const team1 = groupStageList[pairedPositions[0]]?.ISOCode;
    const team2 = groupStageList[pairedPositions[1]]?.ISOCode;
    if(!team1 || !team2){
        throw new Error("Invalid team positions!")
    } 
    return groupStage.some( match =>
        match.hasOwnProperty(team1) &&
        match.hasOwnProperty(team2)
    )
}

export const getResultRange = (team,tournament) => {
    let totalExibitionsScored = 0;
    let totalExibitionsAgaints = 0;
    let totalExibitionsMatches = 0;

    exibitions[team.ISOCode].forEach((match,i) => {
        const[pointsScored, pointsAgainst] = match.Result.split('-').map(Number)
        totalExibitionsScored += pointsScored;
        totalExibitionsAgaints += pointsAgainst;
        totalExibitionsMatches = i+1;
    })

    const teamStats = tournament.teams[team.ISOCode]?.overallStats || {};
    const teamScored = (teamStats.pointsScored || 0) + totalExibitionsScored;
    const teamGames = (teamStats.games || 0) + totalExibitionsMatches;
    const teamPointDifference = (teamStats.pointDifference || 0) + totalExibitionsScored - totalExibitionsAgaints;
    const teamAvgScored = teamScored ? Math.floor(teamScored/teamGames) : 0;
    const teamAvgPointDifference = Math.floor(teamPointDifference/teamGames);

    const deductionPercent = Math.floor(0.5*team.FIBARanking) + (teamAvgScored<=60 ? 0 : 5)
    const additionPercent = (teamPointDifference>1 ? 1 : 0) + teamAvgScored>=100 ? 5 : 10;
    
    const min = teamAvgScored - Math.floor(teamAvgScored*deductionPercent/100);
    const max = teamAvgScored + Math.floor(teamAvgScored*additionPercent/100);
    return [min,max]
}

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
    console.log(output)
}

export const displayGroupStageStats = (groups) => {
    groups.forEach((group, index) => {
        console.log(`Grupa ${String.fromCharCode(65 + index)}:`);
        console.log("Tim                | Pobede | Porazi | Bodovi | Postignuti koševi | Primljeni koševi | Koš razlika");
        console.log("-----------------------------------------------------------------------------------------------------");
        
        group.forEach(team => {
            const stats = team.groupStageStats;
            console.log(
                `${team.Team.padEnd(18)} | ` +
                `${stats.wins.toString().padEnd(6)} | ` +
                `${stats.loses.toString().padEnd(6)} | ` +
                `${stats.points.toString().padEnd(6)} | ` +
                `${stats.pointsScored.toString().padEnd(17)} | ` +
                `${stats.pointsConceded.toString().padEnd(16)} | ` +
                `${stats.pointDifference.toString().padEnd(17)} `
            );
        });
        console.log("\n");
    });
}


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
    console.log(output)
}


export const displayEliminationPhase = (title,phase,result) => {
    let output = `${title}: \n`;
    phase.forEach( match => {
        const team1 = match.winner?.team;
        const team2 = match.looser?.team;
        const team1Score = match.winner?.score;
        const team2Score = match.looser?.score;
        const scores = `(${team1Score}:${team2Score})`;
        output += `\t ${team1} - ${team2} ${result ? scores : ""} \n`;
    })
    output += "\n";
    console.log(output)
}

export const display = (output) => {
    console.log(output)
}
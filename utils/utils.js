import groups from "../data/groups.json" assert { type: "json" };

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

export const pairTeams = (pots, groupStageList, groupStage) => {
    let i = Math.floor(Math.random()*2)
    let j = i===0 ? 1 : 0
    let pairedPositions1 = [pots[0][i], pots[1][i]];
    let pairedPositions2 = [pots[0][j], pots[1][j]];
    return !areMatchedBefore(pairedPositions1,groupStageList,groupStage)
            ? [pairedPositions1,pairedPositions2] 
            : [[pots[0][i], pots[1][j]], [pots[0][j], pots[1][i]] ]
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
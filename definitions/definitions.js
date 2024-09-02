import groups from "../data/groups.json" assert { type: "json" };

export const groupsKeys = Object.keys(groups);

export const getTeams = () => {
    const teams = {};
    groupsKeys.forEach(group => groups[group].forEach(team => 
        teams[team.ISOCode] = {...team, group}
    ))
    return teams;
}

export const groupStageMatches = [
    [[1,4], [2,3]], 
    [[1,3], [2,4]],
    [[1,2], [3,4]]
]


export const pots = [
    {D:[1,2], G:[7,8]},
    {E:[3,4], F:[5,6]}
]

export const teamInitStatistics = {
    games:0,
    wins:0,
    loses:0,
    pointsScored:0,
    pointsConceded:0,
    pointDifference:0
}

export const stagesDefinitions = {
    groupStage: "groupStage",
    quarterfinals: "quarterfinals",
    semifinals: "semifinals",
    finals: "finals"
}

export const romanNumber = ["I","II","III"]
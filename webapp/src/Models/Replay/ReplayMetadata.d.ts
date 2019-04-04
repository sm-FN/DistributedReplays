interface ReplayMetadata {
    demos?: Demo[]
    frames: number
    gameServerId: string
    goals?: Goal[]
    id: string
    length: number
    map: string
    matchGuid?: string
    name: string
    playlist: string
    primaryPlayer?: { id: string }
    score: { team0Score: number; team1Score: number }
    serverName: string
    teamSize: number
    time: string
    version: number
}

interface Demo {
    attackerId: { id: string }
    frameNumber: number
    victimId: { id: string }
}

interface Goal {
    frameNumber: number
    playerId: { id: string }
}

import {
    Button,
    CardContent,
    CircularProgress,
    Grid,
    TextField,
    Typography
} from "@material-ui/core"
import Slider from "@material-ui/lab/Slider"
import * as React from "react"
import { FPSClock, Replay } from "../../../Models"
import { getReplayViewerData, getReplayViewerProto } from "../../../Requests/Replay"
import { ReplayControls } from "./ReplayControls"
import { Scoreboard } from "./Scoreboard"
import { ThreeScene } from "./ThreeScene"

interface OwnProps {
    replay: Replay
}

type Props = OwnProps

interface State {
    replayData?: ReplayDataResponse
    replayProto?: any
    clock: FPSClock
    activeCamera?: string
    gameTime: number
    play: boolean
    team0Score: number
    team1Score: number
    playerTeamMap: Record<string, number>
}

export class ReplayViewer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            clock: new FPSClock([]),
            gameTime: 300,
            team0Score: 0,
            team1Score: 0,
            play: false,
            playerTeamMap: {}
        }
    }

    public async componentDidMount() {
        await this.getReplayPositions()
        await this.getReplayProto()
        if (this.state.replayData) {
            const clock = FPSClock.convertReplayToClock(this.state.replayData)
            clock.addCallback(this.onFrameUpdate)
            this.setState({ clock })
        }
        // console.log(this.state.replayData)
    }

    public componentDidUpdate(_: Readonly<Props>, prevState: Readonly<State>) {
        if (this.state.replayProto !== prevState.replayProto) {
            this.getPlayerTeamMap()
        }
    }

    public render() {
        if (!this.state.replayData) {
            return (
                <CardContent>
                    <Grid container justify="center">
                        <CircularProgress size={36} />
                    </Grid>
                </CardContent>
            )
        }

        const setActiveCamera = (playerName: string) => {
            this.setState({ activeCamera: playerName })
        }

        const { clock, replayData, team0Score, team1Score, activeCamera } = this.state

        return (
            <CardContent>
                <Grid container spacing={24}>
                    <Grid item xs={12}>
                        {clock ? (
                            <>
                                <Scoreboard
                                    team0Score={team0Score}
                                    team1Score={team1Score}
                                    gameTime={this.getGameTimeString()}
                                />
                                <ThreeScene
                                    clock={clock}
                                    replayData={replayData}
                                    activeCamera={activeCamera}
                                />
                            </>
                        ) : (
                            <Typography variant="title" align="center">
                                Loading...
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={12} container>
                        <Grid item xs={6}>
                            <ReplayControls
                                players={replayData.names.filter(
                                    (_, index: number) => replayData.colors[index]
                                )}
                                onPlayerSelected={(playerName) => setActiveCamera(playerName)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <ReplayControls
                                players={replayData.names.filter(
                                    (_, index: number) => !replayData.colors[index]
                                )}
                                onPlayerSelected={(playerName) => setActiveCamera(playerName)}
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} container>
                        <Grid item xs={4} container justify="space-around">
                            <Typography align="center">Playback Controls</Typography>
                            <Button variant="outlined" onClick={() => this.setPlayback(true)}>
                                Play
                            </Button>
                            <Button variant="outlined" onClick={() => this.setPlayback(false)}>
                                Pause
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography>Frame:</Typography>
                            <TextField
                                type="number"
                                value={clock.currentFrame}
                                onChange={this.setCurrentFrame}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <Typography>
                                Ball Position:
                                {replayData.ball[clock.currentFrame][0]},
                                {replayData.ball[clock.currentFrame][1]},
                                {replayData.ball[clock.currentFrame][2]}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Slider
                            value={clock.currentFrame}
                            min={0}
                            max={replayData.frames.length - 1}
                            step={1}
                            onChange={this.onSliderChange}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        )
    }

    private readonly getReplayPositions = async (): Promise<void> => {
        const replayData: ReplayDataResponse = await getReplayViewerData(this.props.replay.id) // TODO: type replayData
        this.setState({ replayData })
    }

    private readonly getReplayProto = async (): Promise<void> => {
        const replayProto: any = await getReplayViewerProto(this.props.replay.id) // TODO: type replayProto.
        this.setState({ replayProto })
    }

    private readonly getPlayerTeamMap = () => {
        const playerTeamMap: Record<string, number> = {}
        this.state.replayProto.teams.forEach((team: any, i: number) => {
            team.playerIds.forEach((player: any) => {
                playerTeamMap[player.id] = i
            })
        })
        this.setState({ playerTeamMap })
    }

    private readonly onFrameUpdate = (frame: number) => {
        if (this.state.replayData && this.state.clock) {
            if (frame >= this.state.replayData.frames.length - 1) {
                this.setState({ play: false })
                this.state.clock.pause()
            } else {
                this.updateGameTime()
                this.updateGameScore()
            }
        }
    }

    private readonly setCurrentFrame: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const currentFrame: number = Number(event.target.value)
        this.state.clock!.setFrame(currentFrame)
    }

    private readonly onSliderChange = (_: any, value: number): void => {
        this.state.clock!.setFrame(value)
    }

    private readonly updateGameTime = (): void => {
        // Update game time
        const frame: any = this.state.replayData!.frames[this.state.clock.currentFrame] // Specify any.
        const time: number = parseFloat(frame[1])
        if (time !== this.state.gameTime) {
            this.setState({ gameTime: time })
        }
    }

    private readonly getGameTimeString = (): string => {
        const seconds: number = this.state.gameTime % 60
        const minutes: number = (this.state.gameTime - seconds) / 60
        const secondsString: string | number = seconds < 10 ? `0${seconds}` : seconds
        return `${minutes}:${secondsString}`
    }

    private readonly updateGameScore = (): void => {
        const currentFrame = this.state.clock.currentFrame
        const goals = this.state.replayProto.gameMetadata.goals
        let team0Score = 0
        let team1Score = 0
        goals.forEach((goal: any) => {
            // TODO: Specify replayProto type as we"re doing extensive work with it.
            if (goal.frameNumber <= currentFrame) {
                if (this.state.playerTeamMap[goal.playerId.id] === 0) {
                    // Where is playerTeamMap
                    team0Score++
                } else {
                    team1Score++
                }
            }
        })
        if (team0Score !== this.state.team0Score || team1Score !== this.state.team1Score) {
            this.setState({ team0Score, team1Score })
        }
    }

    private readonly setPlayback = (play: boolean): void => {
        if (this.state.clock) {
            if (!this.state.play && play) {
                this.state.clock.play()
            } else if (!play) {
                this.state.clock.pause()
            }
            this.setState({ play })
        }
    }
}

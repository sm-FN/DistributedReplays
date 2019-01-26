import { Grid } from "@material-ui/core"
import Button from "@material-ui/core/Button"
import * as React from "react"

interface Props {
    players: string[]
    onPlayerSelected: (playerName: string) => void
}

export class ReplayControls extends React.PureComponent<Props> {
    public render() {
        return (
            <Grid container spacing={8} justify="center">
                {this.props.players.map((name: string, index: number) => {
                    return (
                        <Grid item key={index}>
                            <Button
                                variant="outlined"
                                onClick={() => this.props.onPlayerSelected(name)}
                            >
                                {name}
                            </Button>
                        </Grid>
                    )
                })}
            </Grid>
        )
    }
}

import React, { Component, PureComponent } from "react";
import { AppConfig } from "../interop/config";
import "../styles/log.css";

interface Level {
    name: string;
    value?: number;
    resourceBundleName?: string;
}

interface Record {
    level: Level;
    sequenceNumber?: number;
    sourceClassName?: string;
    sourceMethodName?: string;
    message: string;
    threadID?: number;
    millis?: any;
    loggerName?: string;
}

interface LogData {
    json: Record[],
    stdout: string,
    stderr: string
}

type State = {
    records: Record[],
    follow: boolean
}

/** 
 * The log component bellow the editors
*/
export class Logger extends Component<{}, State> {

    timerId: number | undefined;
    capacity = 20;
    loggerRef = React.createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.toggleFollowing = this.toggleFollowing.bind(this);
    }

    componentDidMount() {
        this.timerId = window.setInterval(this.refresh, 500);
    }

    state = {
        records: [] as Record[],
        follow: true
    }

    //Calls to the backend to obtain latest logs
    refresh() {
        fetch(`${AppConfig.getServerUrl()}/log`).then(resp => resp.json()).then((data: LogData) => {
            if (data.json.length > 0 || data.stderr.length > 0 || data.stdout.length > 0) {
                this.setState(old => {
                    let r: Record[] = [];
                    if (old.records.length > 0) {
                        r.push(...old.records);
                    }
                    if (data.json.length > 0) {
                        r.push(...data.json);
                    }
                    if (data.stdout.length > 0) {
                        r.push({ level: { name: "STDOUT" }, message: data.stdout });
                    }
                    if (data.stderr.length > 0) {
                        r.push({ level: { name: "STDERR" }, message: data.stderr });
                    }
                    r = r.slice(-this.capacity)
                    return {
                        records: r
                    }
                }, () => {
                    if (this.state.follow && this.loggerRef.current){
                        const ref = this.loggerRef.current;
                        ref.scrollTop  = ref.scrollHeight;
                    }
                });

            }
        });
    }

    componentWillUnmount() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }

    toggleFollowing() {
        this.setState(old => ({
            follow: !old.follow
        }));
    }

    render() {
        const logs = this.state.records.map((rec, i) => <Log key={`log_${i}`} record={rec} />) as JSX.Element[];
        return <div id="logger" ref={this.loggerRef}>
            <h3>Test suite logs</h3> | <a href="#" onClick={this.toggleFollowing}>{this.state.follow ? "Stop following logs" : "Follow logs"}</a>
            {...logs}
        </div>;
    }

}

class Log extends Component<{ record: Record }, {}> {

    render() {
        const r = this.props.record;
        return <div>
            <div className={`logger-${r.level.name.toLowerCase()}`}>
                {r.message.split("\n").map(str => <p style={{ marginLeft: (str.match(/\t/g) || []).length * 20 + "px" }}>{str}</p>)}
            </div>
        </div>
    }

}
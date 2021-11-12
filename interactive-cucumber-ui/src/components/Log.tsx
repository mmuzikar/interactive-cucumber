import ReactList from "react-list";
import { useCounter, useInterval, useList, useToggle } from "react-use";
import { fetchAPI } from "../utils/Utils";
import { withLineBreaks } from "../utils/textutils";

type LogLevel = 'INFO' | 'WARNING' | 'STACKTRACE' | 'ERROR'

type LogItem = {
    message: string
    timestamp: Date,
    level: LogLevel
}

export const Log = () => {

    const UPDATE_DELAY = 250;

    const [list, { insertAt, set: setList }] = useList<LogItem>([]);
    const [size, { set: setSize }] = useCounter(25, null, 10)
    const push = insertAt.bind(list, 0)
    const [update, toggleUpdate] = useToggle(true)

    const logIsPresent = (message: string) => list.find(log => log.message === message)

    useInterval(() => {
        fetchAPI('log').then(resp => resp.json()).then(data => {
            if (data.json && data.json.length > 0) {
                data.json.forEach((log: any) => {
                    let date = new Date(0)
                    date.setUTCSeconds(log.instant.seconds)
                    console.log(log.level.name)
                    push({ level: log.level.name as LogLevel, message: `${log.sourceClassName}#${log.sourceMethodName}: ${log.message}`, timestamp: date })
                })
            }
            if (data.stdout && !logIsPresent(data.stdout)) {
                push({ message: data.stdout, timestamp: new Date(), level: 'INFO' })
            }
            if (data.stderr && !logIsPresent(data.stderr)) {
                push({ message: data.stderr, timestamp: new Date(), level: 'ERROR' })
            }

            if (list.length > size) {
                setList(list.slice(size))
            }
        })
    }, update ? UPDATE_DELAY : null)

    const renderLog = (i: number, key: string | number) => (
        <div className={`log-${list[i].level.toLowerCase()} code-text`} key={`log-${i}`}>
            {list[i].timestamp.toLocaleTimeString()}{'> '}
            {withLineBreaks(list[i].message)}
        </div>
    )

    return (
        <div className='grid-item'>
            <strong>Application logs</strong>
            <div className='align-right'>
                <label>Max log size</label>
                <input type="number" value={size} onChange={(val) => setSize(val.target.valueAsNumber)} />
                <input type="button" onClick={toggleUpdate} value={update ? 'Stop updating' : 'Start updating'} />
            </div>
            <div style={{ maxHeight: "100%", overflow: 'auto' }}>
                <ReactList itemRenderer={renderLog} length={list.length} />
            </div>
        </div>
    )
}
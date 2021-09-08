import ReactList from "react-list";
import { useCounter, useInterval, useList, useToggle } from "react-use";
import { fetchAPI } from "../config/Utils";
import { withLineBreaks } from "../utils/textutils";

type LogItem = {
    message: string
    timestamp: Date,
    level: 'INFO' | 'WARNING' | 'STACKTRACE' | 'ERROR'
}

export const Log = () => {

    const UPDATE_DELAY = 250;

    const [list, { insertAt, set : setList }] = useList<LogItem>([]);
    const [size, { set : setSize }] = useCounter(25, null, 10)
    const push = insertAt.bind(list, 0)
    const [update, toggleUpdate] = useToggle(true)
    useInterval(() => {
        fetchAPI('log').then(resp => resp.json()).then(data => {
            if (data.stdout) {
                push({ message: data.stdout, timestamp: new Date(), level: 'INFO' })
            }
            if (data.stderr) {
                push({ message: data.stderr, timestamp: new Date(), level: 'ERROR' })
            }
            if (data.json && data.json.length > 0) {
                push({ message: 'todo handle json logs', timestamp: new Date(), level: 'WARNING' })
                console.log(data.json);
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
                <input type="number" value={size} onChange={(val) => setSize(val.target.valueAsNumber)}/>
                <input type="button" onClick={toggleUpdate} value={update ? 'Stop updating' : 'Start updating'} />
            </div>
            <div style={{ maxHeight: "100%", overflow: 'auto' }}>
                <ReactList itemRenderer={renderLog} length={list.length} />
            </div>
        </div>
    )
}
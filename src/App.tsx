import { useCallback, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { appWindow } from "@tauri-apps/api/window";

const minutesToTime = (minutes: number) => minutes * 60 * 1000;
let timerInterval: any;

const timeToMinutesAndSeconds = (time: number) => {
  const minutes = Math.floor(time / 60000);
  const seconds = ((time % 60000) / 1000).toFixed(0);
  return (
    (Number(minutes) < 10 ? "0" : "") +
    minutes +
    ":" +
    (Number(seconds) < 10 ? "0" : "") +
    seconds
  );
};
let isSubmit = false;
function App() {
  const [workMinutes, setWorkMinutes] = useState("20");
  const [customWorkMinute, setCustomWorkMinute] = useState();
  const [restMinutes, setRestMinutes] = useState("5");
  const [customRestMinute, setCustomRestMinute] = useState();

  const onChange = (e: any, action: Function) => {
    action(e?.currentTarget?.value);
  };
  const [timer, setTimer] = useState<number[]>([]);
  const [time, setTime] = useState<number>();
  const [action, setAction] = useState<string>("work");
  const handlerInterval = useCallback(
    (time: number, timer: number[], callBack: Function[]) => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      let action = time === timer[0] ? "work" : "rest";
      callBack[1](action);
      timerInterval = setInterval(() => {
        time = time - 1000;
        if (time <= 0) {
          action = action === "work" ? "rest" : "work";
          callBack[1](action);
          time = action === "work" ? timer[0] : timer[1];
          toggleFullScreen();
        }
        callBack[0](time);
        console.log(time, timer);
      }, 1000);
    },
    []
  );
  async function toggleFullScreen() {
    const isFullscreen: boolean = await appWindow.isFullscreen();
    if (action === "rest" && isFullscreen !== false) {
      return;
    }
    appWindow.setFullscreen(!isFullscreen);
  }
  const submit = () => {
    if (isSubmit) return;
    isSubmit = true;
    let workDuration = minutesToTime(
      Number(customWorkMinute) > 0
        ? Number(customWorkMinute)
        : Number(workMinutes)
    );
    let restDuration = minutesToTime(
      Number(customRestMinute) > 0
        ? Number(customRestMinute)
        : Number(restMinutes)
    );
    console.log(workDuration, restDuration);
    setTimer([workDuration, restDuration]);
    let time = workDuration;
    setTime(time);
    handlerInterval(time, [workDuration, restDuration], [setTime, setAction]);
    isSubmit = false;
  };

  if (!timer.length)
    return (
      <div className="container">
        <div className="row">
          <div className="form-item">
            <label>work minutes 💻: </label>
            <div>
              <select
                onChange={(e) => onChange(e, setWorkMinutes)}
                defaultValue={workMinutes}
              >
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="30">40</option>
                <option value="90">60</option>
                <option value="90">90</option>
              </select>
              <input
                id="greet-input"
                placeholder="custom minute"
                onChange={(e) => onChange(e, setCustomWorkMinute)}
              />
            </div>
          </div>

          <div className="form-item">
            <label>break minutes ☕️: </label>
            <div>
              <select
                onChange={(e) => onChange(e, setWorkMinutes)}
                defaultValue={restMinutes}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="60">60</option>
              </select>
              <input
                id="greet-input"
                onChange={(e) => onChange(e, setCustomRestMinute)}
                placeholder="custom minute"
              />
            </div>
          </div>
          <button className="submit" onClick={submit}>
            start
          </button>
        </div>
      </div>
    );
  return action !== "rest" ? (
    <div className="work">
      <h1>{timeToMinutesAndSeconds(time!)}</h1>
      <button
        onClick={() => {
          setTimer([]);
          setTime(0);
          clearInterval(timerInterval);
        }}
      >
        reset
      </button>
    </div>
  ) : (
    <div className="rest">
      <h2>Have A Rest Now 👀 </h2>
      <h1>{timeToMinutesAndSeconds(time!)}</h1>
      <button
        onClick={() => {
          appWindow.setFullscreen(false);
          handlerInterval(timer[0], timer, [setTime, setAction]);
        }}
      >
        close
      </button>
    </div>
  );
}

export default App;

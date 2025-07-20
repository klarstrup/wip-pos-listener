import { exec } from "child_process";
import ws from "isomorphic-ws";
import simpleDDP from "simpleddp";
import { promisify } from "util";

const execPromise = promisify(exec);

const linuxPlayCommand = (path: string, volume: number, rate: number) =>
  `DISPLAY=:0.0 ffplay -autoexit -volume ${volume} ${path}`;

/* MAC PLAY COMMAND */
const macPlayCommand = (path: string, volume: number, rate: number) =>
  `afplay \"${path}\" -v ${volume} -r ${rate}`;

/* WINDOW PLAY COMMANDS */
const addPresentationCore = `Add-Type -AssemblyName presentationCore;`;
const createMediaPlayer = `$player = New-Object system.windows.media.mediaplayer;`;
const loadAudioFile = (path) => `$player.open('${path}');`;
const playAudio = `$player.Play();`;
const stopAudio = `Start-Sleep 1; Start-Sleep -s $player.NaturalDuration.TimeSpan.TotalSeconds;Exit;`;

const windowPlayCommand = (path: string, volume: number, rate?: number) =>
  `powershell -c ${addPresentationCore} ${createMediaPlayer} ${loadAudioFile(
    path
  )} $player.Volume = ${volume}; ${playAudio} ${stopAudio}`;

async function play(path: string, volume = 0.5, rate = 1) {
  const playCommand =
    process.platform === "linux" || process.platform === "darwin"
      ? linuxPlayCommand(path, volume * 100, rate)
      : process.platform === "win32"
      ? windowPlayCommand(path, volume)
      : null;

  if (!playCommand) {
    console.warn(
      `tried to play sound on unsupported platform: ${process.platform}`
    );
  }

  await execPromise(playCommand, { windowsHide: true });
}

const server = new (simpleDDP as unknown as typeof simpleDDP.default)({
  endpoint: "wss://pos.wip.bar/websocket",
  SocketConstructor: ws,
  reconnectInterval: 1000,
});
console.log("Connecting to WIP POS DDP");
await server.connect();
console.log("Connected to WIP POS DDP");

let salesSub = server.subscribe("sales", {
  from: new Date(2025, 6),
  to: new Date(2025, 9),
});
await salesSub.ready();
let lastCount = server.collection("sales").fetch({}).length;

console.log({ count: null, lastCount });
server.collection("sales").onChange(async (_event) => {
  const count = server.collection("sales").fetch({}).length;

  console.log({ count, lastCount });

  if (lastCount && count && count > lastCount) {
    await play("Money.wav", 1);
  }
  lastCount = count;
});

import ws from "isomorphic-ws";
import simpleDDP from "simpleddp"; // ES6
import playSound from "play-sound"; // ES6
const player = playSound({});

player.play("Money.wav", console.error);

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
server.collection("sales").onChange(async (d) => {
  // console.log(d);
  const count = server.collection("sales").fetch({}).length;

  console.log({ count, lastCount });

  if (lastCount && count && count > lastCount) {
    player.play("Money.wav", console.error);
  }
  lastCount = count;
});

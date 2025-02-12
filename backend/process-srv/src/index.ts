import { connectRedis, connectRabbit } from "./common";
import { handleEvents } from "./event-handling";

console.log("Processor has started!");

connectRedis();
connectRabbit(handleEvents);
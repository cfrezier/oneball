import {router, server} from './router';
import {wss} from './wss';

console.log(`** Router: ${router.report}`);
console.log(`** Server address: ${server.address()}`);
console.log(`** Wss address: ${wss.address()}`);

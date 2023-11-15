import * as fs from "fs";
import {Handler, Req, Res} from "find-my-way";
import * as http from "http";

const router = require('find-my-way')({
  defaultRoute: (req: Req<any>, res: Res<any>) => {
    res.statusCode = 404;
    res.end();
  },
  onBadUrl: (path: string, req: Req<any>, res: Res<any>) => {
    res.statusCode = 400;
    res.end(`Bad path: ${path}`);
  },
  ignoreTrailingSlash: true
});

const port: number = 8000;
const host: string = 'localhost';

function readPayload(req: Req<any>) {
  return new Promise((resolve) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      let body = '';
      req.on('data', function (data) {
        body += data.toString();
        if (body.length > 1e6) req.connection.destroy();
      });
      req.on('end', function () {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    } else {
      resolve(null);
    }
  });
}

function readQuery(req: Req<any>) {
  const splitted = (req.url?.split('?')[1] ?? '').split('&');
  const query = {} as { [key: string]: string };
  splitted.forEach((split) => {
    const [key, value] = split.split('=');
    query[key] = value;
  });
  return query;
}

const makeResponseOk = (res: Res<any>, toBeSent: any, code?: number) => {
  const sendCode = !!code ? code : 200;
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Authorization, File-Content-Type'
  );
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.writeHead(sendCode);
  return res.end(JSON.stringify(toBeSent));
};

router.on(['OPTIONS', 'GET'], '/version', (req: Req<any>, res: Res<any>, params: {
  [k: string]: string | undefined
}) => {
  makeResponseOk(res, (JSON.parse(fs.readFileSync('.package.json', 'utf8')) ?? {version: "???"}).version);
});

const staticRoute = (req: Req<any>, res: Res<any>, params: { [k: string]: string | undefined }) => {
  const ext = params['resource']?.substring(params.resource.lastIndexOf('.') + 1);
  let type = ext === 'html' ? 'text/html' :
    ext === 'js' ? 'text/javascript' :
      ext === 'css' ? 'text/css' :
        ext === 'json' ? 'application/json' :
          'text/plain';
  let fileContents;
  try {
    console.log(`Try Serving ${params.resource}, type: ${type}`);
    fileContents = fs.readFileSync(`./static/${params.resource}`, 'utf8');
    console.log(`Serving ${params.resource}, type: ${type}`);
  } catch (e) {
    fileContents = fs.readFileSync(`./static/404.html`, 'utf8');
    type = 'text/html';
    console.log(`Serving 404.html, type: ${type}`);
  }
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Authorization, File-Content-Type'
  );
  res.setHeader('Content-Type', type);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.writeHead(200);
  res.end(fileContents);
}

router.on('GET', '/', (req: Req<any>, res: Res<any>, params: { [k: string]: string | undefined }) => {
  return staticRoute(req, res, {...params, resource: 'player.html'});
});

router.on('GET', '/:resource', staticRoute);

const server = http.createServer((req, res) => {
  router.lookup(req, res);
});
server.listen(port, host, undefined, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

export {server, router};

import * as fs from "fs";
import {Req, Res} from "find-my-way";
import * as http from "http";

const router = require('find-my-way')({
  defaultRoute: (req: Req<any>, res: Res<any>) => {
    console.log('url', req.url);
    const fileOpts = ['./static' + req.url, './static' + req.url + '.html'];
    let found = false;
    fileOpts.forEach((file) => {
      try {
        const data = fs.readFileSync(file, {encoding: 'utf8'});
        res.statusCode = 200;
        res.end(data);
        found = true;
        console.log('Serving', file);
      } catch (err) {
        //console.log(err);
      }
    });
    if (!found) {
      res.statusCode = 400;
      res.end();
    }
  },
  onBadUrl: (path: string, req: Req<any>, res: Res<any>) => {
    res.statusCode = 400;
    res.end(`Bad path: ${path}`);
  },
  ignoreTrailingSlash: true
});

const port: number = 8080;

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

const server = http.createServer((req, res) => {
  router.lookup(req, res);
});
server.listen(port, undefined, undefined, () => {
  console.log(`Server is running on http://...:${port}`);
});

export {server, router};

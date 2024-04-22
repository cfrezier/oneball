import * as fs from "fs";
import {Req, Res} from "find-my-way";
import * as http from "http";
import {CONFIG} from "../browser/common/config";

function getContentType(file: string) {
  if (file.endsWith('.html')) {
    return 'text/html';
  }
  if (file.endsWith('.js')) {
    return 'text/javascript';
  }
  if (file.endsWith('.json')) {
    return 'application/json';
  }
  if (file.endsWith('.png')) {
    return 'image/png';
  }
  if (file.endsWith('.svg')) {
    return 'image/svg+xml';
  }
  return 'text/plain';
}

const start = () => {
  const router = require('find-my-way')({
    defaultRoute: (req: Req<any>, res: Res<any>) => {
      console.log('url', req.url);
      const fileOpts = ['./static' + req.url, './static' + req.url + '.html'];
      let found = false;
      fileOpts.forEach((file) => {
        try {
          const contentType = getContentType(file);
          const data = fs.readFileSync(file, contentType.startsWith('image') ? {} : {encoding: 'utf8'});
          res.statusCode = 200;
          res.setHeader('Content-Type', contentType);
          res.end(data);
          found = true;
          console.log('Serving', file);
        } catch (err) {
          //console.log(err);
        }
      });
      if (!found) {
        console.error('not found', fileOpts);
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
  server.listen(CONFIG.SERVER_PORT, '0.0.0.0', undefined, () => {
    console.log(`Server is running on http://...:${CONFIG.SERVER_PORT}`);
  });

  return {server, router};
}

export {start};

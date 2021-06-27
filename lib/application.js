let http = require("http");
let EventEmitter = require("events");
let context = require("./context");
let request = require("./request");
let response = require("./response");
let Stream = require("stream");

class Koa extends EventEmitter {
  constructor() {
    super();
    this.middlewares = [];
    this.context = context;
    this.request = request;
    this.response = response;
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  createContext(req, res) {
    //创建ctx
    const ctx = Object.create(this.context);
    const request = (ctx.request = Object.create(this.request));
    const response = (ctx.response = Object.create(this.response));
    //交叉赋值
    ctx.req = request.req = response.req = req;
    ctx.res = request.res = response.res = res;
    request.ctx = response.ctx;
    request.response = response;
    response.request = request;
    return ctx;
  }

  compose(mids) {
    return (ctx) => {
      //默认调用第一个函数
      //支持用户手动向下调用
      let dispatch = (i) => {
        let fn = mids[i];
        if (!fn) {
          return Promise.resolve();
        }
        let next = () => {
          return dispatch(i + 1);
        };
        return Promise.resolve(fn(ctx, next));
      };
      return dispatch(0);
    };
  }

  async handleRequest(req, res) {
    //创建一个处理请求的函数
    res.statusCode = 404;
    let ctx = this.createContext(req, res); //创建了ctx
    const fn = this.compose(this.middlewares);
    await fn(ctx);
    // this.fn(ctx);
    if (typeof ctx.body === "object") {
      res.setHeader("Content-Type", "application/json;charset=utf8");
      res.end(JSON.stringify(ctx.body));
    } else if (ctx.body instanceof Stream) {
      ctx.body.pipe(res); //处理流类型
    } else if (typeof ctx.body === "string" || Buffer.isBuffer(ctx.body)) {
      res.setHeader("Content-Type", "text/html;charset=utf8");
      res.end(ctx.body);
    } else {
      res.end("Not found");
    }
  }

  listen(...args) {
    let server = http.createServer(this.handleRequest.bind(this));
    server.listen(...args);
  }
}

module.exports = Koa;

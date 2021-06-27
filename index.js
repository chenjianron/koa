let myKoa = require("./lib/application");
let app = new myKoa();

let sleep = (num = 2000) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, num);
  });

let logger = async (ctx, next) => {
  const start = Date.now();
  console.log(`start:${start}`);
  await next();
  const end = Date.now();
  console.log(`请求 ${ctx.url},耗时:${end - start}`);
};

// app.use((ctx) => {
//   console.log(ctx.req.url);
//   console.log(ctx.request.req.url);
//   console.log(ctx.response.req.url);
//   console.log(ctx.request.url);
//   console.log(ctx.response.url);
//   console.log(ctx.url);
//   console.log(ctx.path);
//   ctx.body = {
//     name: "wn",
//     age: 19,
//   };
//   console.log(ctx.body);
// });

app.use(logger);

app.use(async (ctx, next) => {
  ctx.body = "1";
  await sleep();
  await next();
  ctx.body += "2";
});

app.use(async (ctx, next) => {
  ctx.body += "3";
  await next();
  ctx.body += "4";
});

app.use(async (ctx, next) => {
  ctx.body += "5";
});

app.listen(3000);

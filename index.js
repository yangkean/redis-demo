const Koa = require('koa');
const Router = require('koa-router');
const views = require('koa-views');
const path = require('path');
const koaBody = require('koa-body');
const serve = require('koa-static');
const redis = require('redis');
// const Promise = require("bluebird");
// const client = Promise.promisifyAll(redis.createClient()); // add promise support
const promisify = require('util').promisify; // add promise support, node should >= 8
const client = redis.createClient();
const app = new Koa();
const router = new Router();

app.use(views(path.join(__dirname, '/views'), {
  extension: 'ejs'
}));

app.use(serve(path.join(__dirname, '/public')));

app.use(koaBody());

router.get('/', index)
      .post('/', toList);

app.use(router.routes());

async function index(ctx) {
  let lists = '';

  // const obj = await client.hgetallAsync('todo:samyang');
  const hgetall = promisify(client.hgetall).bind(client);
  const obj = await hgetall('todo:samyang');

  if(obj) {
    lists = obj;
  }

  await ctx.render('index', {lists: lists});
}

async function toList(ctx) {
  const list = ctx.request.body.list.trim();
  const field = list.replace(' ', '-');

  //await client.hset('todo:samyang', field, list);
  const hset = promisify(client.hset).bind(client);
  await hset('todo:samyang', field, list);

  ctx.redirect('/');
}

app.listen(3000);
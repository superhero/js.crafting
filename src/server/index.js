require.main.filename = __filename

const
  CoreFactory = require('superhero/core/factory'),
  coreFactory = new CoreFactory,
  core        = coreFactory.create(process.env.BRANCH)

core.add('@superhero/core.websocket/src/server')
core.add('@superhero/core.handlebars')
core.add('@superhero/core.resource')
  
core.add('schema', __dirname + '/../schema')
core.add('server', __dirname + '/../server')

core.load()

async function bootstrap()
{
  await core.locate('core/bootstrap').bootstrap()

  core.locate('core/http/server').listen(process.env.HTTP_PORT ||   80)
  core.locate('websocket/server').listen(process.env.WS_PORT   || 8080)

  core.locate('core/console').log('	✔ http server, port:      ' + (process.env.HTTP_PORT ||   80))
  core.locate('core/console').log('	✔ websocket server, port: ' + (process.env.WS_PORT   || 8080))

  return core
}

module.exports = { bootstrap, core }
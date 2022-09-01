/**
 * @namespace Server
 */
module.exports =
{
  core:
  {
    locator:
    {
      'crafting' : __dirname + '/domain/crafting'
    },
    http:
    {
      server:
      {
        routes:
        {
          'resource':
          {
            url         : '/resource/.+',
            endpoint    : '@superhero/core.resource',
            input       : false,
            permission  : '*'
          },
          'configuration':
          {
            url         : '/_configuration',
            method      : 'get',
            endpoint    : 'api/configuration',
            view        : 'core/http/server/view/json',
            input       : false,
            output      : false
          },
          'read':
          {
            url         : '.*',
            method      : 'get',
            endpoint    : 'api/read',
            view        : '@superhero/core.handlebars',
            template    : 'view/template/layout',
            input       : false,
            output      : false
          }
        }
      }
    },
    websocket:
    {
      routes:
      {
        'write':
        {
          event       : 'write',
          endpoint    : 'api/component-state-changed'
        }
      }
    },
    resource:
    {
      'directory' : 'view/public'
    }
  },
  websocket:
  {
    gateway:
    {
      debug:false 
    }
  },
  view:
  {
    websocket:
    {
      protocol  : process.env.WS_PROTOCOL,
      host      : process.env.WS_HOST,
      port      : process.env.WS_PORT
    }
  }
}
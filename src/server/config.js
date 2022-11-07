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
    color: 
    {
      // graph: [ '#fff', '#ddd', '#bbb', '#999', '#777' ],
      // graph: [ '#f2f3ae', '#edd382', '#fc9e4f', '#f4442e', '#020122' ],
      // graph: [ '#ccccc4', '#80a8a7', '#f3f1e5', '#f08e37', '#203a49', '#eec84b', '#bdc24c' ],
      // graph: [ '#76f9f9', '#5dccf3', '#4688ce', '#2d227d', '#2b134a', '#606b71' ],
      graph: [ '#feffbe', '#d7ebba', '#9ad2cb', '#79a9d1', '#7d8ca3', '#59544b', '#36311f' ],
      // graph: [ '#70c1b3', '#247ba0', '#ffe066', '#f25f5c', '#50514f' ],
      // graph: [ '#293241', '#ee6c4d', '#e0fbfc', '#98c1d9', '#98c1d9', '#3d5a80' ],
      label: '#efe9f4'
    },
    websocket:
    {
      protocol  : process.env.WS_PROTOCOL,
      host      : process.env.WS_HOST,
      port      : process.env.WS_PORT
    }
  }
}
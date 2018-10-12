const chalk = require('chalk'),

      Transport = require('./yoml.transport')
      ;

class Console extends Transport{

  static get colors() { return  { error: 'red', warn: 'yellow', info: 'green' } }

  color( level, message ){
    var color = Console.colors[ level ];
    if( color ){ return chalk[color]( message ) }else{ return message }
  }

  emitLog( level, message ){
    if( typeof message !== 'string' )
      message = JSON.stringify( message, null, 2);

    console.log( this.color( level, [ new Date().toISOString(), level.toUpperCase(), message ].join( ':' ) ) );

    if( level == 'error' ) console.trace();
  }
}

module.exports = Console;

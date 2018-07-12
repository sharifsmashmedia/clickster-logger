var chalk = require('chalk'),
    _ = require('lodash');

var logger = {
  _times: {},
  _operations: {},
  debugLevel: process.env.LOG_LEVEL || 'debug',
  levels: [ 'error', 'warn', 'info', 'op', 'slow', 'time', 'debug' ],
  colors: { error: 'red', warn: 'yellow', info: 'green' },
  color: function( level, message ){
    var color = logger.colors[ level ];
    if( color ){ return chalk[color]( message ) }else{ return message }
  },
  showLogLevel: function( level ){
    return logger.levels.indexOf( level ) <= logger.levels.indexOf( logger.debugLevel.toLowerCase() );
  },
  log: function( level, message ){
    if( logger.showLogLevel( level ) ){
      logger.emitLog( level, message );
    } else {
      // It gets on an operation only if it has not been logged previously
      _.each( logger._operations, ( value, key ) => { value.push( [ level.toUpperCase(), message ] ); })
    }
  },
  emitLog: function( level, message ){
    if( typeof message !== 'string' ) message = JSON.stringify( message, null, 2);
    console.log( logger.color( level, [ new Date().toISOString(), level.toUpperCase(), message ].join( ':' ) ) );
    if( level == 'error' ) console.trace();
  },
  startTimer: function( label ){
    logger._times[ label ] = Date.now();
  },
  durationTimer: function( label ){
    var time = logger._times[ label ];
    if( time )
      return Date.now() - time;
    else
      return 0;
  },
  op: function( label ){
    logger.startTimer( label );
    logger._operations[ label ] = [];
  },
  opEnd: function( label, options ){
    var opLog = logger._operations[ label ],
        duration = logger.durationTimer( label ),
        show = false;

    if( _.get( options, 'slow', 0) < duration ) show = true;
    if( show ) _.each( opLog, (l) => { l.splice( 0, 0, label ); logger.log( 'op', l.join(":")) } );

    delete logger._operations[label]
  },
  time: function( label ){
    logger.startTimer( label );
  },
  timeEnd: function( label, options ){
    var duration = logger.durationTimer( label )
    if( duration > 0 ){
      if( _.get( options, 'slow', 0 ) > duration ) logger.log( 'slow', label + ": " + duration + "ms" );
      logger.log( 'time', label + ": " + duration + "ms" );
    }
  }
}

logger.levels.forEach( function( lvl ){
  if( ! _.includes( [ 'time', 'op'] , lvl ) )
    logger[ lvl ] = function( message ){ logger.log( lvl, message ) };
})

module.exports = logger;

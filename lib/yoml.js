var chalk = require('chalk'),
    _ = require('lodash'),

    Console = require( './yoml.console' ),
    Slack   = require( './yoml.slack' )
    Redis   = require( './yoml.redis' )
    ;

class Logger {
  static get levels(){
    return Console.levels;
  }

  constructor( options = {} ){
    this._times = []
    this._operations = []
    this._transports = this.configureTransports( options );
  }
  configureTransports( options ){
    var _return = [],
        transports = _.has( options, 'transports' ) ?
                        options['transports'] :
                        { 'console': options };

    _.each( transports, ( transport_options, transport ) => {
      var module;
      switch( transport ){
        case 'console':
          module = new Console( transport_options );
          break;
        case 'slack':
          module = new Slack( transport_options );
          break;
        case 'redis':
          module = new Redis( transport_options );
          break;
        default:
          break;
      }
      if( module ) _return.push( module );
    });
    return _return;
  }
  log( level, message, options ){
    _.each( this._transports, t => t.log( level, message, options ) );
  }
  startTimer( label ){
    this._times[ label ] = new Timer( label );
  }
  time( label ){
    this.startTimer( label );
  }
  durationTimer( label ){
    try{
      return this._times[ label ].duration();
    } catch( e ){
      return 0;
    }
  }
  timeEnd( label, options ){
    var timer = this._times[ label ];

    if( timer ){
      if( timer.duration() > 0 ){
        if( timer.isSlow( _.get( options, 'slow', 0 ) ) )
          this.log( 'slow', timer.toString() );

        this.log( 'time', timer.toString() );
      }
    }
  }
  op( label ){
    this._operations[ label ] = new Operation();
  }
  opEnd( label, options ){
    var show = false,
        operation = this._operations[ label ];

    if( operation ){
      if( _.has( options, 'slow' ) )
        show = operation.isSlow( _.get( options, 'slow', 0 ) )

      if( show )
        _.each( operation.logs(), l => this.log( 'op', l ) )
    }

    delete this._operations[label]
  }
}

class Timer {
  constructor( name ){
    this.name  = name;
    this._start = Date.now();
  }
  toString(){
    return this.name + ':' + this.duration() + 'ms';
  }
  duration(){
    return Date.now() - this._start;
  }
  isSlow( slow ){
    return this.duration > slow;
  }
}

class Operation extends Timer{
  constructor(){
    super();
    this._operations = [];
  }
  add( level, message ){
    this._operations.push( [ level, message ] )
  }
  logs(){
    return _.each( this._operations, op => op.join( ':' ) )
  }
}

Logger.levels.forEach( function( lvl ){
  if( ! _.isFunction( Logger.prototype[ lvl ] ) )
    Logger.prototype[ lvl ] = function( message, options ){ this.log( lvl, message, options ) };
})

module.exports = Logger;

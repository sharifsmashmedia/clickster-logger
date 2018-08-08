const _  = require('lodash'),
      os = require('os')

class Transport {
  static get levels(){
    return [ 'error', 'warn', 'info', 'slow', 'op', 'time', 'debug' ];
  }
  constructor( options = {} ){
    this.logLevel = options.logLevel || 'debug';
  }
  levelIndex( level ){
    return Transport.levels.indexOf( level )
  }
  showLevel( level ){
    return this.levelIndex( level ) <= this.levelIndex( this.logLevel.toLowerCase() );
  }
  log( level, message, options ){
    if( this.showLevel( level ) ){
      this.emitLog( level, message, options );
    } else {
      // It gets on an operation only if it has not been logged previously
      _.each( this._operations, op => op.add( level.toUpperCase(), message ) )
    }
  }
  emitLog(){ }

  hostname(){
    return os.hostname();
  }

}

module.exports = Transport

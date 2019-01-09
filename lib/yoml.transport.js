const _  = require('lodash'),
      os = require('os')

class Transport {
  static get levels(){
    return [ 'error', 'warn', 'info', 'slow', 'op', 'time', 'debug' ];
  }
  constructor( options = {} ){
    this.logLevel = options.logLevel || 'debug';
    this.unfiltered = false;
  }
  levelIndex( level ){
    return Transport.levels.indexOf( level )
  }
  showLevel( level ){
    return this.levelIndex( level ) <= this.levelIndex( this.logLevel.toLowerCase() );
  }
  log( level, message, options ){
    if( this.unfiltered ) {
      this.emitLog( level, message, options );
    } else if( this.showLevel( level ) ){
      var lastRepeat = this.repeat,
          lastRepeatLevel = this.lastLevel,
          lastRepeatMessage = this.lastMessage,
          lastRepeatOptions = this.lastOptions,
          isRepeat = this.isRepeat( level, message );

      if( ! isRepeat ){
        if( lastRepeat > 0 ){
          this.emitRepeat( lastRepeatLevel, lastRepeat, _.merge( {}, lastRepeatOptions, {originalMessage: lastRepeatMessage} ) );
        }
        this.emitLog( level, message, options );
      }
    } else {
      // It gets on an operation only if it has not been logged previously
      _.each( this._operations, op => op.add( level.toUpperCase(), message ) )
    }
  }
  emitRepeat( level, times, options ){
    var message = options.originalMessage;
    delete( options.originalMessage );
    this.emitLog( level, `${message} (repeated ${times} time${(times==1?'':'s')})`, options );
  }
  emitLog(){ }

  hostname(){
    return os.hostname();
  }
  isRepeat( level, message, options ){
    var isRepeat = this.lastLevel == level  && this.lastMessage == message;
    if( isRepeat ){ this.repeat++; } else { this.repeat = 0; }
    this.lastLevel = level;
    this.lastMessage = message;
    this.lastOpetions = options;

    return isRepeat;
  }

}

module.exports = Transport

const SlackNode  = require( 'slack-node' ),
      request    = require( 'request' ),
      _          = require( 'lodash' ),

      Transport  = require( './yoml.transport' )
      ;

class Slack extends Transport {
  static get icons(){
    return {
      'error': 'http://icons.iconarchive.com/icons/gakuseisean/ivista-2/256/Alarm-Error-icon.png',
      'info' : 'http://icons.iconarchive.com/icons/gakuseisean/ivista-2/256/Alarm-Info-icon.png',
    }
  }
  set format( value ){
    this._format_string = value
    if( value ) this._format = _.template( value )  
  }
  get format(){
    return this._format_string  
  }
  constructor( options ){
    super( options );
    this.uploadhook = 'https://slack.com/api/files.upload'
    this.hook = webhook;
    this.format = _.get( options, 'format' )
    this.token  = _.get( options, 'token' )
    this.hook   = _.get( options, 'webhook' );
    this.client = new SlackNode();
    this.client.setWebhook( this.hook )
  }
  getIcon( level ){
    return Slack.icons[ level ] || Slack.icons['info']  
  }
  emitLog( level, message, options ){
    if( _.has( options,  'attachment' ) ){
      this.sendAttachment( level, message, options.attachment )
    } else {
      this.sendMessage( level, message );      
    }
  }
  sendMessage( level, message ){
    this.client.webhook({
      channel: channel,
      username: this.hostname(), 
      icon_emoji: this.getIcon( level ),
      text: message
    })  
  }
  sendAttachment( level, message, attachment ){
    var content;

    if( ! _.isString( attachment.data ) )
      attachment.data = JSON.stringify( attachment.data, null, 2 );


    content = _.isFunction( this._format ) ? 
                this._format( attachment ) :
                attachment.data;

    request.post({
      url: this.uploadhook,
      headers: {
        'Content-Type': 'multipart/form-data'  
      },
      form: {
        token: this.token,
        channels: channel,
        content:  content,
        filename: attachment.file_name,
        filetype: attachment.filetype,
        title:    attachment.title
      },
    })
  }
}

module.exports = Slack

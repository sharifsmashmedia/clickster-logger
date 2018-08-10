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
    this.unfiltered = true;
    this.uploadhook = 'https://slack.com/api/files.upload'
    this.hook    = _.get( options, 'webhook' );
    this.channel = _.get( options, 'channel' );
    this.format  = _.get( options, 'format' )
    this.token   = _.get( options, 'token' )
    this.hook    = _.get( options, 'webhook' );
    this.topics  = _.get( options, 'topics' );
    this.client  = new SlackNode();
    this.client.setWebhook( this.hook )
  }
  getIcon( level ){
    return Slack.icons[ level ] || Slack.icons['info'];
  }
  getChannels( level, options ){
    var channels = [];
    if( this.channel && this.showLevel( level ) ) channels.push( this.channel );
    if( this.topics && _.has( this.topics, level ) ) channels.push( this.topics[ level ] );
    if( options.topic ) channels.push( _.get( this.topics, options.topic ) );

    return _.compact( channels );
  }
  emitLog( level, message, options ){
    var channel_list = this.getChannels( level, options || {} );

    _.each( channel_list, ( channel ) => {
      if( _.has( options,  'attachment' ) ){
        this.sendAttachment( channel, level, message, options.attachment )
      } else {
        this.sendMessage( channel, level, message );
      }
    });
  }
  sendMessage( channel, level, message ){
    this.client.webhook({
      channel: this.channel,
      username: this.hostname(),
      icon_emoji: this.getIcon( level ),
      text: message
    }, ()=>{})
  }
  sendAttachment( channel, level, message, attachment ){
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
        channels: this.channel,
        content:  content,
        filename: attachment.file_name,
        filetype: attachment.filetype,
        title:    attachment.title
      },
    })
  }
}

module.exports = Slack

var chai        = require('chai'),
    expect      = chai.expect,
    sinon       = require('sinon'),
    sinon_chai  = require('sinon-chai'),
    rewire      = require('rewire'),

    Slack       = rewire('../lib/yoml.slack')
    ;

chai.use( sinon_chai );

describe('Slack', () => {
  describe("constructor", ()=>{
    it("has a client", ()=>{
      var subject = new Slack();
      expect( subject.client ).not.to.be.undefined;
    })
    it("sets the webhook to the client", ()=>{
      var slack_node = Slack.__get__( 'SlackNode' ),
          setWH = sinon.stub( slack_node.prototype, 'setWebhook' ),
          subject = new Slack( { webhook: 'http://testhook'})

      expect( setWH ).to.be.called
      expect( setWH.firstCall.calledWith( 'http://testhook' ) ).to.be.true
    })
  })
  describe( "getChannels", ()=>{
    describe( "with channel configured", ()=>{
      var subject;
      beforeEach(()=>{
        subject = new Slack( {channel: 'test_channel' });
      })
      it( "returns channel", ()=>{
        var response = subject.getChannels( 'info', {} )
        expect( response ).to.include( "test_channel" );
        expect( response ).to.have.lengthOf( 1 );
      })
    })
    describe( "with topics configured for level", ()=>{
      var subject;
      beforeEach(()=>{
        subject = new Slack( { topics: { 'info': 'info_channel' }});
      })
      it( "returns channel", ()=>{
        var response = subject.getChannels( 'info', {} )
        expect( subject.getChannels( 'info', {} )).to.include( "info_channel" );
        expect( response ).to.have.lengthOf( 1 );
      })
    })
    describe( "with topic specified", ()=>{
      var subject;
      beforeEach(()=>{
        subject = new Slack( { topics: { 'topic': 'topic_channel' }});
      })
      it( "returns channel", ()=>{
        var response = subject.getChannels( 'info', { topic: 'topic' } )
        expect( response ).to.include( "topic_channel" );
        expect( response ).to.have.lengthOf( 1 );
      })
    })
  })
  describe( "emit", ()=>{
    describe( "sending message", ()=>{
      var subject, webhook, slack_node;
      beforeEach(()=>{
        slack_node = Slack.__get__( 'SlackNode' );
        webhook = sinon.stub( slack_node.prototype, 'webhook' );
        subject = new Slack( { channel: "test", topics: { topic: 'test_topic' } });
      })
      afterEach(()=>{
        slack_node.prototype.webhook.restore();
      })
      it( "calls webhook from slack-node", ()=>{
        subject.emitLog( 'info', 'test' )
        expect( webhook ).to.be.called
        expect( webhook.firstCall.calledWith( sinon.match.has( 'text','test' ) ) ).to.be.true
      })
      it( "calls webhook twice with the right parameters when topic specified", ()=>{
        subject.emitLog( 'info', 'test', { topic: 'topic' } );
        expect( webhook ).to.be.calledTwice
        expect( webhook.firstCall.calledWith( sinon.match.has( 'text','test' ) ) ).to.be.true

      })
      it( "send hostname as username", ()=>{
        subject.emitLog( 'info', 'test' )
        expect( webhook.firstCall.calledWith( sinon.match.has( 'username',subject.hostname() ) ) ).to.be.true
      } )
    })
    describe( "sending attachment", ()=>{
      var subject, request, post
      beforeEach(()=>{
        request = Slack.__get__( 'request' )
        post = sinon.stub( request, 'post' )
        subject = new Slack( { channel: 'test', token: "test_token" })
      })
      afterEach(()=>{
        request.post.restore();
      })
      it( "calls post on request", ()=>{
        subject.emitLog( 'info', 'test', {attachment: { data: "test"} } )
        expect( post ).to.be.called
        expect(
          post.firstCall.calledWith(
            sinon.match.has( 'form',
              sinon.match.has( 'content', 'test' ) ) )
        ).to.be.true
      })
      it( "sends data as content", ()=>{
        subject.emitLog( 'info', 'test', {attachment: { data: "test"} } )
        expect( 
          post.firstCall.calledWith( 
            sinon.match.has( 'form', 
              sinon.match.has( 'content', 'test' ) ) ) 
        ).to.be.true
      })
      it( "applies a formatter if specified", ()=>{
        subject.format = '<%= other %>, <%= data %>';
        subject.emitLog( 'info', 'test', { attachment: { other: 'foo', data: "test"} } )
        expect( 
          post.firstCall.calledWith( 
            sinon.match.has( 'form', 
              sinon.match.has( 'content', "foo, test"
              ) ) ) 
        ).to.be.true
      })
      it( "sends token", ()=>{
        subject.emitLog( 'info', 'test', { attachment: { data: "test"} } )
        expect( post ).to.be.called
        expect(
          post.firstCall.calledWith(
            sinon.match.has( 'form',
              sinon.match.has( 'token', "test_token"
              ) ) ) 
        ).to.be.true
      })
    })
  })
})

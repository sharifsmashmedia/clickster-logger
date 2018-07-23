var chai        = require('chai'),
    expect      = chai.expect,
    sinon       = require('sinon'),
    sinon_chai  = require('sinon-chai'),
    rewire      = require('rewire'),

    Redis       = rewire('../lib/yoml.redis')
    ;

describe('Redis', ()=>{
  var redis;
  before(() => {
    redis = Redis.__get__('redis')
    sinon.stub( redis, 'createClient' ).returns( sinon.mock() );
  })
  describe( "constructor", ()=>{
    it( "has a client", ()=>{
      var subject = new Redis( { channel: 'test_channel' } )
      expect( subject.client ).not.to.be.undefined
      expect( subject.channel ).to.equal( 'test_channel' )
    })
  })
  describe( "emitLog", ()=>{
    var subject, client, trim;
    beforeEach(()=>{
      subject = new Redis( { channel: 'test_channel', cap: 10 });
      subject.client.lpush = sinon.stub()
      subject.client.ltrim = sinon.stub()
      subject.client.publish = sinon.stub()
    })
    it( "calls push on client", ()=>{
      subject.emitLog( 'info', 'test_log' )
      expect( subject.client.lpush ).to.be.calledWith( 'test_channel', 'info:test_log' )
      expect( subject.client.ltrim ).to.be.calledWith( 'test_channel', 0, 9 )
      expect( subject.client.publish ).to.be.calledWith( 'test_channel', 'info:test_log' )
    })
  })
})

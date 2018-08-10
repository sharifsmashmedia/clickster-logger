var chai        = require('chai'),
    expect      = chai.expect,
    sinon       = require('sinon'),
    sinon_chai  = require('sinon-chai'),
    Transport   = require('../lib/yoml.transport');

chai.use( sinon_chai );

describe('Transport', () => {
  describe( "hostname", ()=>{
    var subject,emit;
    beforeEach( ()=>{
      subject = new Transport();
    })
    it( "returns a string", ()=>{
      expect( subject.hostname() ).to.be.a('string')
    })
  })
  describe( "emit", ()=>{
    var subject, emit, sandbox;
    beforeEach( ()=>{
      sandbox = sinon.createSandbox();
      subject = new Transport( { logLevel: 'info' });
      emit = sandbox.spy( subject, 'emitLog' )
    });
    afterEach(()=>{
      sandbox.restore();
    })
    it( "doesn't emit if level doesn't correspond", ()=>{
      subject.log( 'debug', 'test' );
      expect( emit ).to.not.have.been.called;
    })
    it( "emit if level correspond", ()=>{
      subject.log( 'info', 'test' );
      expect( emit ).to.have.been.calledWith( 'info', 'test' );
    })
    it( "calls emit if prefilter disabled", ()=>{
      subject.unfiltered = true;
      subject.log( 'debug', 'test' );
      expect( emit ).to.have.been.calledWith( 'debug', 'test' );
    })
  })
})

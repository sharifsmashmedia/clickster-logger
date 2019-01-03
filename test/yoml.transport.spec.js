var chai        = require('chai'),
    expect      = chai.expect,
    sinon       = require('sinon'),
    sinon_chai  = require('sinon-chai'),
    Transport   = require('../lib/yoml.transport');

chai.use( sinon_chai );

describe.only('Transport', () => {
  describe( "hostname", ()=>{
    var subject,emit;
    beforeEach( ()=>{
      subject = new Transport();
    })
    it( "returns a string", ()=>{
      expect( subject.hostname() ).to.be.a('string')
    })
  })
  describe( "isRepeat", ()=>{
    var subject, sandbox;
    beforeEach( ()=>{
      sandbox = sinon.createSandbox();
      subject = new Transport( { logLevel: 'info' });
      emit = sandbox.spy( subject, 'emitLog' )
    });
    it( "adds one to repeat if message is equal", ()=>{
      subject.isRepeat('info', 'test');
      subject.isRepeat('info', 'test');
      expect( subject.repeat ).to.equal( 1 );
    })
    it( "adds resets counter when different message", ()=>{
      subject.isRepeat('info', 'test');
      subject.isRepeat('info', 'test');
      subject.isRepeat('info', 'end');
      expect( subject.repeat ).to.equal( 0 );
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
    describe.only("repeat", ()=>{
      it("keep equal messages from displaying", ()=>{
        [...Array(5)].forEach(_ => subject.log( 'info', 'test') );
        subject.log( 'info', 'end' );
        expect( emit.firstCall ).to.have.been.calledWithExactly( 'info', 'test', undefined );
        expect( emit.secondCall ).to.have.been.calledWithExactly( 'info', 'repeated 4 times', undefined );
        expect( emit.thirdCall ).to.have.been.calledWithExactly( 'info', 'end', undefined );
      })
    })
  })
})

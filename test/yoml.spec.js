'use strict'

var chai        = require('chai'),
    expect      = chai.expect,
    sinon       = require('sinon'),
    sinon_chai  = require('sinon-chai'),
    Logger      = require('../lib/yoml');

chai.use( sinon_chai );

describe('yoml', () => {

  describe( 'functions', () => {
    var subject;
    beforeEach( () => {
      subject = new Logger();
    })
    it( 'should have an info function' , () => {
      expect( subject.info ).to.be.a('function');
    })
    it( 'should have an error function' , () => {
      expect( subject.error ).to.be.a('function');
    })
    it( 'should have an warn function' , () => {
      expect( subject.warn ).to.be.a('function');
    })
  })

  describe( 'log', () => {
    var subject, emit;
    beforeEach( ()=> {
      subject = new Logger();
      emit    = sinon.spy( subject, 'log' );
    })
    it("has one transport with default values", ()=>{
      expect( subject._transports ).to.have.lengthOf( 1 );
    })
    it("logs when calling with info", ()=>{
      subject.info( 'test' );
      expect( emit ).to.be.calledWith( 'info', 'test' )
    })
    it("logs when calling with debug", ()=>{
      subject.debug( 'test' );
      expect( emit ).to.be.calledWith( 'debug', 'test' )
    })
  })

  describe( 'timer', () => {
    var subject, emit;
    beforeEach( ()=> {
      subject = new Logger( { logLevel: 'time' } );
      emit    = sinon.spy( subject, 'log' );
    })
    it('starts a timer', ()=>{
      subject.time('test')
      expect( subject._times ).to.have.key( 'test' )
      expect( subject._times['test'].name ).to.equal( 'test' )
    })
    it('emits when ending the timer', ()=>{
      subject.time('test')
      // Fake time
      subject._times['test']._start = new Date( (new Date()).getTime() - 5000 );
      subject.timeEnd( 'test' )
      expect( emit ).to.have.been.calledWith( 'time', sinon.match( /test:\d+ms/ ) )
    })
  })
})

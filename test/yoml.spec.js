'use strict'

var chai        = require('chai'),
    expect      = chai.expect,
    sinon       = require('sinon'),
    sinon_chai  = require('sinon-chai'),
    rewire      = require('rewire'),
    Logger      = rewire('../lib/yoml'),

    Console     = Logger.__get__( 'Console' ),
    Redis       = Logger.__get__( 'Redis' ),
    Slack       = Logger.__get__( 'Slack' )
    ;



chai.use( sinon_chai );

describe('yoml', () => {

  describe( 'functions', () => {
    var subject, emit;
    beforeEach( () => {
      subject = new Logger();
    })
    it( 'should have a console transport initialized by default', ()=>{
      expect( subject._transports[ 0 ] ).to.be.instanceOf( Console );
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
    describe( "comodity functions call log with proper log level", () => {
      var emit;
      beforeEach(()=>{
        emit    = sinon.stub( subject, 'log' );
      })
      it("info calls log with proper log level", ()=>{
        subject.info("test");
        expect( emit ).to.have.been.calledWith( "info", "test" );
      })
      it("error calls log with proper log level", ()=>{
        subject.error("test");
        expect( emit ).to.have.been.calledWith( "error", "test" );
      })
      it("warn calls log with proper log level", ()=>{
        subject.warn("test");
        expect( emit ).to.have.been.calledWith( "warn", "test" );
      })
    })
    describe( "comodity functions pass options", () => {
      var emit;
      beforeEach(()=>{
        emit    = sinon.stub( subject, 'log' );
      })
      it("info calls log with proper log level", ()=>{
        subject.info("test", { attachment: "" });
        expect( emit ).to.have.been.calledWithExactly( "info", "test", {attachment: ""});
      })
      it("error calls log with proper log level", ()=>{
        subject.error("test", { attachment: "" });
        expect( emit ).to.have.been.calledWithExactly( "error", "test", {attachment: ""});
      })
      it("warn calls log with proper log level", ()=>{
        subject.warn("test", { attachment: "" });
        expect( emit ).to.have.been.calledWith( "warn", "test", {attachment: ""});
      })
    })
  })

  describe( 'configureTransports', ()=>{
    var subject;
    beforeEach( () => {
      subject = new Logger();
    })
    it( 'instantiate a console transport by default', ()=>{
      var transports = subject.configureTransports()
      expect( transports[0] ).to.be.instanceOf(Console);
    })
    it( 'instantiate a console transport', ()=>{
      var transports = subject.configureTransports( { transports: { console: {} }} )
      expect( transports[0] ).to.be.instanceOf(Console);
    })
    it( 'instantiate a slack transport', ()=>{
      var transports = subject.configureTransports( { transports: { slack: {} }} )
      expect( transports[0] ).to.be.instanceOf(Slack);
    })
    it( 'instantiate a redis transport', ()=>{
      var transports = subject.configureTransports( { transports: { redis: {} }} )
      expect( transports[0] ).to.be.instanceOf(Redis);
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

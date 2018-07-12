'use strict'

var expect = require('chai').expect,
    logger = require('./yoml');

describe('Logger', () => {
  describe( 'functions', () => {
    it( 'should have an info function' , () => {
      expect( logger.info ).to.be.a('function');
    })
    it( 'should have an error function' , () => {
      expect( logger.error ).to.be.a('function');
    })
    it( 'should have an warn function' , () => {
      expect( logger.warn ).to.be.a('function');
    })
  })

  describe( 'timer', () => {
    it('starts a timer', ()=>{

    })
  })
})

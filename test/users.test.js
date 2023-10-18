const chai = require('chai');
const chaiHttp = require( 'chai-http');
const usersController = require('../controllers/users.controller')

chai.should();
chai.use(chaiHttp);

describe('Register a user', () => {
    it('should successfully register user', async () => {
      const accesses = await AcessesUseCases.getAllAccess(dependencies)();
      accesses.should.be.an('array');
      accesses.length.should.equal(1);
    });
  });
const express_server = require("./express_server");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

// Test 5
describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:3000/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:3000");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
});

// Test 1
describe("Login and Redirect Control Test", () => {
  it('should return 302 status code for redirection to "http://localhost:3000/login" ', () => {
    const agent = chai.request.agent("http://localhost:3000");
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        return agent.get("http://localhost:3000/login").then((accessRes) => {
          expect(accessRes).to.have.status(302);
        });
      });
  });
});

//Test 2
describe("New Login and Redirect Control Test", () => {
  it('should return a 302 status code and redirect to "http://localhost:3000/login" if they are not logged in.', () => {
    const agent = chai.request.agent("http://localhost:3000");
    return agent.get("/urls/new").then((res) => {
      expect(res).to.redirectTo("http://localhost:3000/login");
    });
  });
});

//Test 3
describe("Error if not logged in Control Test", () => {
  it('should return a 404 status code redirect for not being authorized to access  "http://localhost:3000/urls/NOTEXISTS"', () => {
    const agent = chai.request.agent("http://localhost:3000");
    return agent.get("/urls/:id").then((res) => {
      expect(accessRes).to.have.status(404);
    });
  });
});

//Test 4
describe("Error if URL does not exist Control Test", () => {
  it('should return a 403 status code for not owning the URL at "http://localhost:3000/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:3000");
    return agent.get("/urls/:id").then((res) => {
      expect(accessRes).to.have.status(403);
    });
  });
});

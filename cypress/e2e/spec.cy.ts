import { WebSocket, Server } from 'mock-socket';
import { initServer } from "./server.js"

describe('template spec', () => {

  it('passes', () => {
    cy.visit('http://localhost:3000/',
    {
      onBeforeLoad(win) {
        // initServer();
        // Call some code to initialize the fake server part using MockSocket
        // cy.stub(win, "WebSocket", url =>{
        //   var MockServer = new Server('ws://localhost:8080');
        //   MockServer.stop();
        //   MockServer = new Server('ws://localhost:8080');
        //   return MockServer
        // }) 
      }
    })
    // cy.intercept(
    //   {
    //     method: 'GET', // Route all GET requests
    //     url: '/', // that have a URL that matches '/users/*'
    //   },
    //   {
    //     statusCode : 204,
    //     body: {
    //       location: "/login"
    //     }
    //   } // and force the response to be: []
    // ).as('skip/fail persistent_login') // and assign an alias
    
    // cy.intercept(
    //   {
    //     method: 'GET', // Route all GET requests
    //     url: '/login/*', // that have a URL that matches '/users/*'
    //   },
    //   {
    //     statusCode : 200,
    //     body: {
    //       userID: "test_cy1"
    //     }
    //   } // and force the response to be: []
    // ).as('login') // and assign an alias
    
    // cy.intercept(
    //   {
    //     method: 'POST', // Route all GET requests
    //     url: '/login', // that have a URL that matches '/users/*'
    //   },
    //   {
    //     statusCode : 200,
    //     body: {}
    //   }
    // ).as('new user POST request') // and assign an alias
    
    // // we set the response to be the activites.json fixture
    // cy.intercept('GET', '/api/convID*', { fixture: 'convIDs.json' })
    // .as('requesting server stored convIDs')
    
    // cy.intercept('GET', '/api/chatHist*', {})

    // Login
    cy.get('#username_input').type('test_cy1')
  
    cy.get('button').contains('Login').click()


    // enter new recipient, ensure recipient is updated
    cy.get('#recipient_input').type("recipient1{enter}")
    cy.get('#left_column').should("contain", "recipient1")
    
    cy.get('#recipient_input').type("recipient2{enter}")
    cy.get('#left_column').should("contain", "recipient2")
    
    // enter a chat window
    cy.get('#recipient1').click()
    
    // send message, ensure message is populated on screen
    cy.get("#input_box").type("test message 1{enter}")
    cy.get("#input_box").type("test message 2{enter}")
    
    // cy.get("#PrevTexts").should('have.ordered.members', [1, 2])
    cy.get("#PrevTexts").should('contain', "test message 1")
    cy.get("#PrevTexts").should('contain', "test message 2")
    
    // switch conversation and switch back, ensure message is still present
    cy.get('#recipient2').click()
    cy.get("#PrevTexts").should('not.contain', "test message 1")
    cy.get("#PrevTexts").should('not.contain', "test message 2")
    
    cy.get('#recipient1').click()
    cy.get("#PrevTexts").should('contain', "test message 1")
    cy.get("#PrevTexts").should('contain', "test message 2")
  })


})

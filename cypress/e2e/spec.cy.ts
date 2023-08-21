import { WebSocket, Server } from 'mock-socket';
import { initServer } from "./server.js"

describe('end 2 end spec', () => {
  var ownUserID = 'test_cy1'
  var recipientID_1 = "recipient1"
  var recipientID_2 = "recipient2"
  

  it('two conv, sending to one conversation should not affect the other', () => {
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
    cy.get('#username_input').type(ownUserID)
    cy.get('button').contains('Login').click()

    // enter new recipient, ensure recipient is updated
    cy.get('#recipient_input').type(recipientID_1+"{enter}")
    cy.get('#left_column').should("contain", recipientID_1)

    cy.get('#recipient_input').type(recipientID_2+"{enter}")
    cy.get('#left_column').should("contain", recipientID_2)
    cy.get('#selector').children().its('length').should('eq', 2)

    // enter a chat window
    cy.get('#'+recipientID_1).click()
    cy.get('#RecipientTitle').should('contain', recipientID_1)

    // send message, ensure message is populated on screen
    cy.get("#input_box").type("test message 1{enter}")
    cy.get("#input_box").type("test message 2{enter}")

    // cy.get("#PrevTexts").should('have.ordered.members', [1, 2])
    cy.get("#PrevTexts").should('contain', "test message 1")
    cy.get("#PrevTexts").should('contain', "test message 2")
    cy.get('#PrevTexts').children().its('length').should('eq', 2)

    // switch conversation, ensure message is no longer on screen
    cy.get('#'+recipientID_2).click()
    cy.get('#RecipientTitle').should('contain', recipientID_2)
    cy.get("#PrevTexts").should('not.contain', "test message 1")
    cy.get("#PrevTexts").should('not.contain', "test message 2")
    cy.get('#PrevTexts').children().should('have.length', 0);
    
    // switch back conversation, ensure message is populated again
    cy.get('#'+recipientID_1).click()
    cy.get('#RecipientTitle').should('contain', recipientID_1)
    cy.get("#PrevTexts").should('contain', "test message 1")
    cy.get("#PrevTexts").should('contain', "test message 2")
    cy.get('#PrevTexts').children().its('length').should('eq', 2)
  })
  
  
  it("make sure recipient recieved messaged", ()=>{
    cy.visit('http://localhost:3000/')
    
    cy.get('#username_input').type(recipientID_1)
    cy.get('button').contains('Login').click()
    
    cy.get('#'+ownUserID).click()
    cy.get('#RecipientTitle').should('contain', ownUserID)
    cy.get("#PrevTexts").should('contain', "test message 1")
    cy.get("#PrevTexts").should('contain', "test message 2")
    cy.get('#PrevTexts').children().its('length').should('eq', 2)
  })

  it("inputting recipientID should switch", ()=>{
    cy.visit('http://localhost:3000/')
    
    cy.get('#username_input').type(ownUserID)
    cy.get('button').contains('Login').click()
    
    // click on one conversation
    cy.get('#'+recipientID_1).click()
    cy.get('#RecipientTitle').should('contain', recipientID_1)
    cy.get("#PrevTexts").should('contain', "test message 1")
    cy.get("#PrevTexts").should('contain', "test message 2")
    cy.get("#PrevTexts").should('contain', "test message 1")
    cy.get("#PrevTexts").should('contain', "test message 2")
    cy.get('#PrevTexts').children().its('length').should('eq', 2)
    
    // use input to switch to different conversation
    cy.get('#recipient_input').type(recipientID_2+"{enter}")
    cy.get('#left_column').should("contain", recipientID_2)
    cy.get('#selector').children().its('length').should('eq', 2)
    cy.get('#RecipientTitle').should('contain', recipientID_2)
    cy.get("#PrevTexts").should('not.contain', "test message 1")
    cy.get("#PrevTexts").should('not.contain', "test message 2")
    
    // send message, ensure message is populated on screen
    cy.get("#input_box").type("test message 3{enter}")
    cy.get("#input_box").type("test message 4{enter}")
    cy.get("#PrevTexts").should('contain', "test message 3")
    cy.get("#PrevTexts").should('contain', "test message 4")
  })
})

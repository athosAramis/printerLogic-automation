/// <reference types="cypress" />
import { randomStringGenerator, alternateCharCase } from "../../support/utils";
import { MOBILE_RESOLUTIONS, DESKTOP_RESOLUTION } from "../../support/constants";
describe('PrinterLogic Sign-In Page', () => {

    before(() => {

        const invalidUsernames = [" ", "unknownUsername", "a", "1"]
        const invalidPasswords = [" ", "incorrectPassword", alternateCharCase(Cypress.config().userPassword)]
        const userEmail = randomStringGenerator(6) + '@email.com'
        const invalidUserEmails = [" ", "domain", "@email", "domain.email"]

        cy.wrap(userEmail).as("userEmail")
        cy.wrap(invalidUsernames).as("invalidUsernames")
        cy.wrap(invalidPasswords).as("invalidPasswords")
        cy.wrap(invalidUserEmails).as("invalidUserEmails")
    })

    describe('PrinterLogic Sign-In Page: Postive Test Cases', () => {

        beforeEach(() => {
            cy.intercept('GET', 'https://qaautohw.printercloud.com/admin/start-session').as("getSession");
            cy.intercept('POST', 'https://qaautohw.printercloud.com/lib/common/browse_complete.php').as("postBrowser");
            cy.intercept('POST', 'https://qaautohw.printercloud.com/admin/query/verify_login.php').as("postLogin");
            cy.intercept('GET', 'https://qaautohw.printercloud.com/admin/password/reset/').as("getPasswordReset");
            cy.intercept('POST', 'https://qaautohw.printercloud.com/admin/password/reset/').as("postPasswordReset");
            cy.intercept('GET', /^https:\/\/rum-collector-2.pingdom.net/).as("getPrivacyPolicy");

            cy.clearLocalStorage()
            cy.clearCookies()
            cy.visit('/admin/index.php');
        })

        var i = Math.floor(Math.random() * (MOBILE_RESOLUTIONS.length))
        var mobileResolution = MOBILE_RESOLUTIONS[i]
        const resolutions = [
            DESKTOP_RESOLUTION,
            mobileResolution
        ]
        resolutions.forEach((resolution) => {

            it(`T3 - User is able to login with valid Username and Password on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                cy.wait("@getSession").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })
                cy.get('#relogin_user').type(Cypress.config().userId).type('{esc}')
                cy.get('#relogin_password').type(Cypress.config().userPassword, { log: false }).type('{esc}')
                    .should($el => {
                        if ($el.val() !== Cypress.config().userPassword) {
                            throw new Error('Different value of typed password')
                        }
                    })
                cy.get('#admin-login-btn > .ui-button-text').should('not.be.disabled').click()
                cy.wait("@postLogin").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })
                cy.wait(["@getSession", "@postBrowser"]).spread(
                    (getSession, postBrowser) => {
                        expect(getSession.response.statusCode).to.eq(200)
                        expect(postBrowser.response.statusCode).to.eq(200)
                    })
                cy.url().should('eq', Cypress.config().baseUrl + '/admin/index.php')
            });

            it(`T4 - User is able to reset password on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                cy.get('[aria-labelledby="ui-dialog-title-modal-login"] > .ui-dialog-buttonpane > #forgot-password-container > #forgot-password').click()
                cy.wait("@getPasswordReset").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                    var resetUrl = xhr.response.url
                    cy.url().should('eq', resetUrl)
                })
                cy.get('.ui-dialog-title').should('contain.text', "Forgot Password")
                cy.get('#email').type(this.userEmail).type('{esc}')
                cy.get('[type="submit"]').should('not.be.disabled').click()
            });

            it(`T6 - User is able to retry logging in after failed attempt on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                var i = Math.floor(Math.random() * (this.invalidUsernames.length))
                var k = Math.floor(Math.random() * (this.invalidPasswords.length))
                var uUsername = this.invalidUsernames[i]
                var uPassword = this.invalidPasswords[k]

                cy.get('#relogin_user').type(uUsername).type('{esc}')
                cy.get('#relogin_password').type(uPassword, { log: false }).type('{esc}')
                cy.get('#admin-login-btn > .ui-button-text').should('not.be.disabled').click()
                cy.get('#logintext').should('have.text', "Invalid username or password.")
                cy.wait("@postLogin").then(xhr => {
                    expect(xhr.response.body).to.contain("Invalid")
                })
                cy.get('#relogin_user').clear().type(Cypress.config().userId).type('{esc}')
                cy.get('#relogin_password').clear().type(Cypress.config().userPassword, { log: false }).type('{esc}')
                cy.get('#admin-login-btn > .ui-button-text').should('not.be.disabled').click()
                cy.wait(["@getSession", "@postLogin"]).spread(
                    (getSession, postLogin) => {
                        expect(getSession.response.statusCode).to.eq(200)
                        expect(postLogin.response.statusCode).to.eq(200)
                    })
            });

            it(`T7 - User is able to cancel resetting password process on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                cy.get('[aria-labelledby="ui-dialog-title-modal-login"] > .ui-dialog-buttonpane > #forgot-password-container > #forgot-password').click()
                cy.wait("@getPasswordReset").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                    var resetUrl = xhr.response.url
                    cy.url().should('eq', resetUrl)
                })
                cy.get('.ui-dialog-title').should('contain.text', "Forgot Password")
                cy.get('[type="button"]').should('contain.text', "Cancel").click()
                cy.url().should('eq', Cypress.config().baseUrl + '/admin/')
            });

            it(`T8 - User is able to login with case-insensitive username on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                cy.wait("@getSession").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })
                var altCaseId = alternateCharCase(Cypress.config().userId)
                cy.log(altCaseId)
                cy.get('#relogin_user').type(altCaseId).type('{esc}')
                cy.get('#relogin_password').type(Cypress.config().userPassword, { log: false }).type('{esc}')
                    .should($el => {
                        if ($el.val() !== Cypress.config().userPassword) {
                            throw new Error('Different value of typed password')
                        }
                    })
                cy.get('#admin-login-btn > .ui-button-text').should('not.be.disabled').click()
                cy.wait("@postLogin").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })
            })
        })
    })

    describe('PrinterLogic Sign-In Page: Negative Test Cases', () => {

        beforeEach(() => {
            cy.intercept('GET', 'https://qaautohw.printercloud.com/admin/start-session').as("getSession");
            cy.intercept('POST', 'https://qaautohw.printercloud.com/lib/common/browse_complete.php').as("postBrowser");
            cy.intercept('POST', 'https://qaautohw.printercloud.com/admin/query/verify_login.php').as("postLogin");
            cy.intercept('GET', 'https://qaautohw.printercloud.com/admin/password/reset/').as("getPasswordReset");
            cy.intercept('POST', 'https://qaautohw.printercloud.com/admin/password/reset/').as("postPasswordReset");
            cy.intercept('GET', /^https:\/\/rum-collector-2.pingdom.net/).as("getPrivacyPolicy");

            cy.clearLocalStorage()
            cy.clearCookies()
            cy.visit('/admin/');
        })

        var i = Math.floor(Math.random() * (MOBILE_RESOLUTIONS.length))
        var mobileResolution = MOBILE_RESOLUTIONS[i]
        const resolutions = [
            DESKTOP_RESOLUTION,
            mobileResolution
        ]
        resolutions.forEach((resolution) => {

            it(`T9 - User is unable to login without valid Username on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                var k = Math.floor(Math.random() * (this.invalidPasswords.length))
                var invalidPassword = this.invalidPasswords[k]

                cy.wait("@getSession").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })

                cy.get('#relogin_user').type(Cypress.config().userId).type('{esc}')
                cy.get('#relogin_password').type(invalidPassword, { log: false }).type('{esc}')
                cy.get('#admin-login-btn > .ui-button-text').should('not.be.disabled').click()
                cy.wait("@postLogin").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                    expect(xhr.response.body).to.include("Invalid")
                })
                cy.get('#logintext').should('have.text', "Invalid username or password.")
                cy.url().should('eq', Cypress.config().baseUrl + '/admin/')
            });

            it(`T10 - User is unable to login without entering Username on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                cy.wait("@getSession").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })
                cy.get('#relogin_password').type(Cypress.config().userPassword, { log: false }).type('{esc}')
                cy.get('#admin-login-btn > .ui-button-text').should('not.be.disabled').click()

                cy.shouldBeCalled("@postLogin", 0)
                cy.get('#logintext').should('have.text', "Please enter your username and password:")
                cy.url().should('eq', Cypress.config().baseUrl + '/admin/')
            });

            it(`T11 - User is unable to login without valid Password on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                var i = Math.floor(Math.random() * (this.invalidUsernames.length))
                var invalidUsername = this.invalidUsernames[i]

                cy.wait("@getSession").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })

                cy.get('#relogin_user').clear().type(invalidUsername).type('{esc}')
                cy.get('#relogin_password').type(Cypress.config().userPassword, { log: false }).type('{esc}')

                cy.get('#admin-login-btn > .ui-button-text').should('not.be.disabled').click()
                cy.wait("@postLogin").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                    expect(xhr.response.body).to.include("Invalid")
                })
                cy.get('#logintext').should('have.text', "Invalid username or password.")
                cy.url().should('eq', Cypress.config().baseUrl + '/admin/')
            });

            it(`T12 - User is unable to login without entering Password on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                cy.wait("@getSession").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })

                cy.get('#relogin_user').type(Cypress.config().userId).type('{esc}')
                cy.get('#admin-login-btn > .ui-button-text').should('not.be.disabled').click()

                cy.shouldBeCalled("@postLogin", 0)
                cy.get('#logintext').should('have.text', "Please enter your username and password:")
                cy.url().should('eq', Cypress.config().baseUrl + '/admin/')
            });

            it(`T13 - User is unable to login without entering Username and Password on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                var i = Math.floor(Math.random() * (this.invalidUsernames.length))
                var invalidUsername = this.invalidUsernames[i]

                cy.wait("@getSession").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })

                cy.get('#admin-login-btn > .ui-button-text').should('not.be.disabled').click()
                cy.shouldBeCalled("@postLogin", 0)
                cy.get('#logintext').should('have.text', "Please enter your username and password:")
                cy.url().should('eq', Cypress.config().baseUrl + '/admin/')
            });

            it(`T14 - User is unable to login without valid Username and password on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                var k = Math.floor(Math.random() * (this.invalidPasswords.length))
                var i = Math.floor(Math.random() * (this.invalidUsernames.length))
                var invalidUsername = this.invalidUsernames[i]
                var invalidPassword = this.invalidPasswords[k]

                cy.wait("@getSession").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })
                cy.get('#relogin_user').type(invalidUsername).type('{esc}')
                cy.get('#relogin_password').type(invalidPassword, { log: false }).type('{esc}')
                cy.get('#admin-login-btn > .ui-button-text').should('not.be.disabled').click()
                cy.wait("@postLogin").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                    expect(xhr.response.body).to.include("Invalid")
                })
                cy.get('#logintext').should('have.text', "Invalid username or password.")
                cy.url().should('eq', Cypress.config().baseUrl + '/admin/')
            });

            it(`T15 - User is unable to initiate password-reset process with invalid email address on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                var i = Math.floor(Math.random() * (this.invalidUserEmails.length))
                var invalidEmail = this.invalidUserEmails[i]
                cy.wait("@getSession").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })
                cy.get('[aria-labelledby="ui-dialog-title-modal-login"] > .ui-dialog-buttonpane > #forgot-password-container > #forgot-password').click()
                cy.wait("@getPasswordReset").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                    var resetUrl = xhr.response.url
                    cy.url().should('eq', resetUrl).and('eq', Cypress.config().baseUrl + '/admin/password/reset/')
                })
                cy.get('.ui-dialog-title').should('contain.text', "Forgot Password")
                cy.get('#email').type(invalidEmail).type('{esc}')
                cy.get('[type="submit"]').should('not.be.disabled').click()

                cy.on('window:alert', (txt) => {
                    expect(txt).to.contain("Please enter a part followed by '@'");
                })
                cy.url().should('eq', Cypress.config().baseUrl + '/admin/password/reset/')

            });

            it(`T16 - User is unable to initiate password-reset process with unregistered email address on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                cy.wait("@getSession").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                })
                cy.get('[aria-labelledby="ui-dialog-title-modal-login"] > .ui-dialog-buttonpane > #forgot-password-container > #forgot-password').click()
                cy.wait("@getPasswordReset").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                    var resetUrl = xhr.response.url
                    cy.url().should('eq', resetUrl).and('eq', Cypress.config().baseUrl + '/admin/password/reset/')
                })
                cy.get('.ui-dialog-title').should('contain.text', "Forgot Password")
                cy.get('#email').type(this.userEmail).type('{esc}')
                cy.get('[type="submit"]').should('not.be.disabled').click()
                cy.wait("@getPasswordReset").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                    var resetUrl = xhr.response.url
                    cy.url().should('eq', resetUrl).and('eq', Cypress.config().baseUrl + '/admin/password/reset/')
                })
                cy.get('.error').should('contain.text', "We can't find a user with that email address.")
                cy.url().should('eq', Cypress.config().baseUrl + '/admin/password/reset/')
            });
        })
    })
})

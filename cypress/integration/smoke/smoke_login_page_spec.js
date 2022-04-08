/// <reference types="cypress" />
import { MOBILE_RESOLUTIONS, DESKTOP_RESOLUTION } from "../../support/constants";

describe('PrinterLogic Sign-In Page', () => {

    beforeEach(() => {
        cy.intercept('GET', 'https://qaautohw.printercloud.com/admin/start-session').as("getSession");

        cy.clearLocalStorage()
        cy.clearCookies()
        cy.visit('/admin/');
    })

    const lines = [
        { id: "T1", name: 'byAll', description: 'PrinterLogic Sign-in page is available and functional' }
    ]

    var i = Math.floor(Math.random() * (MOBILE_RESOLUTIONS.length))
    var mobileResolution = MOBILE_RESOLUTIONS[i]
    const resolutions = [
        DESKTOP_RESOLUTION,
        mobileResolution
    ]
    resolutions.forEach((resolution) => {
        lines.forEach((line) => {
            it(`${line.id} - PrinterLogic Sign-in modal is available and functional on ${resolution.type}`, function () {
                cy.viewport(resolution.viewportWidth, resolution.viewportHeight)
                cy.wait("@getSession").then(xhr => {
                    expect(xhr.response.statusCode).to.eq(200)
                    expect(xhr.response.statusMessage).to.eq("OK")
                    expect(xhr.response.url).to.eq("https://qaautohw.printercloud.com/admin/start-session")
                    expect(xhr.response.body.meta.message).to.eq("Session started")

                })
                cy.get('.ui-widget-overlay').should('exist').and('be.visible')
                cy.get('[aria-labelledby="ui-dialog-title-modal-login"]').find('*[id^="ui-dialog-title-modal-login"]').should('have.text', "Login")
                cy.get('[aria-labelledby="ui-dialog-title-modal-login"]').should('exist').and('be.visible').then($loginModal => {
                    cy.get($loginModal).find('*[class^="login-brand-img"]').find('img')
                        .should('have.attr', 'src', "https://qaautohw.printercloud.com/assets/images/admin/vasion/printer-logic-vasion-solution-logo.svg")
                    cy.get($loginModal).find('#loginmenu > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > div:nth-child(2) > label')
                        .should('have.text', "Username")
                    cy.get($loginModal).find('#relogin_user')
                        .should('have.attr', 'autocapitalize', "off")
                        .should('have.attr', 'autocorrect', "off")
                    cy.get($loginModal).find('#loginmenu > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > div.login-inputs.form-field.password')
                        .should('contain.text', "Password")
                    cy.get($loginModal).find('#relogin_password')
                        .should('have.attr', 'autocapitalize', "off")
                        .should('have.attr', 'autocorrect', "off")
                    cy.get($loginModal).find('#forgot-password-container > a')
                        .should('have.attr', 'href', "/admin/password/reset/")
                        .and('have.text', "Lost Password")
                    cy.get($loginModal).find('#admin-login-btn')
                        .should('have.attr', 'type', "button")
                        .and('have.text', "Log In")
                        .and('not.be.disabled')
                    cy.get($loginModal).find('#privacy-policy-container > a')
                        .should('have.attr', 'href', "https://www.printerlogic.com/privacy-policy/")
                        .and('have.attr', 'target', "_blank")
                        .and('have.text', "Privacy Policy")
                })

            })

        })
    })
})
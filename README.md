# PrinterLogic Regression Suite
---
## Overivew
This repos contains a preliminary automated, regression-testing suite written in Cypress for the PrinterLogic application.

Currently, the suite covers a sample of smoke and e2e testing for the sign-in page. 

---
### Running
The steps below will provide instruction on how to install and use Cypress.

Note: It is assumed that you have already installed node and git.

   1. Install Cypress
   
        `cd /your/project/path`
        
        `npm install cypress@9.5.3 --save-dev`
        
      See [Installing Cypress](https://docs.cypress.io/guides/getting-started/installing-cypress) for more details.
  
   2. Run Tests
   
	     In the project directory, you can run:
         
         * `npx cypress open` 
	    
	     This command will open the Cypress test runner. There, you can run tests separately or altogether. 
       
         * `npx cypress run` 
	       
       This command will run all the tests headless within your terminal.
  
### Features
Listed below are some of the major features of this suite:

 * cross-browser CI testing across chrome, edge, and firefox 
 * re-try logic 
 * test-type tagging
 * mobile-view testing across various popular mobile types
 * detailed test case comments with steps and assertions


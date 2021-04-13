chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    if( request.message === 'injectgradesjs' ){
        chrome.tabs.executeScript( null, {
            file: 'grades.js'
        }, () => {
            // console.log( "injected" );
        } );
        
    }
    else if( request.message === 'injecthomejs' ){
        chrome.tabs.executeScript( null, {
            file: 'home.js'
        }, () => {
            // console.log( "injected" );
        } );  
    }
    else if( request.message === 'injectassignmentsjs' ){
        chrome.tabs.executeScript( null, {
            file: 'assignments.js'
        }, () => {
            // console.log( "injected" );
        } );  
    }
} )

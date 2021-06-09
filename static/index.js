const Identity = require("@iota/identity-wasm/node")
const { CLIENT_CONFIG } = require("../config")

function handleFormSubmit(event) {
    event.preventDefault();
    
    const data = new FormData(event.target);
    
    const formJSON = Object.fromEntries(data.entries());
  
    // for multi-selects, we need special handling
    formJSON.snacks = data.getAll('snacks');
    
    const results = document.querySelector('.results pre');
    results.innerText = JSON.stringify(formJSON, null, 2);
  }

  function sendData(event) {
    const XHR = new XMLHttpRequest();

    // Bind the FormData object and the form element
    const FD = new FormData( event.target );
    const formJSON = Object.fromEntries(FD.entries());

    // Define what happens on successful data submission
    XHR.addEventListener( "load", function(event) {
      alert( event.target.responseText );
    } );

    // Define what happens in case of error
    XHR.addEventListener( "error", function( event ) {
      alert( 'Oops! Something went wrong.' );
    } );

    // Set up our request
    XHR.open( "POST", "http://localhost:3001" );

    // The data sent is what the user provided in the form
    const results = document.querySelector('.results pre');
    results.innerText = JSON.stringify(formJSON, null, 2);
    XHR.send( results );
  }

function generateUser(name) {
      
    const { doc, key } = new Document(KeyType.Ed25519)

    return {
      key,
      doc,
      name,
    }
  }
  
  const form = document.querySelector('.contact-form');
  const did = document.querySelector('.contact-form1');
  form.addEventListener('submit', handleFormSubmit, sendData);
  did.addEventListener('submit',generateUser);
  const user1 = generateUser();
  console.log("User (user1): ", user1);
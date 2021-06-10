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
  
const form = document.querySelector('.contact-form');
form.addEventListener('submit', handleFormSubmit);
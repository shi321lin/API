let user_info = JSON.parse(localStorage.getItem("user_info")) || {};

function login() {
    // Get the email and password values from the HTML form
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    console.log(user_info); 
    // log in 
    if (user_info[email] && user_info[email].password === password) {
        localStorage.setItem("loggedInUser", user_info[email].firstName);
        document.signin.action = "image.html";
    // sign up
    } else {
        document.signin.action = "error.html";
    }
}

function signup() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let firstName = document.getElementById("firstName").value;
  let lastName = document.getElementById("lastName").value;

  // add new user information to user_info
  user_info[email] = {
      "password": password,
      "firstName": firstName,
      "lastName": lastName
  };
  // save user_info to localStorage
  localStorage.setItem("user_info", JSON.stringify(user_info));
  console.log(user_info);

  // log in again
  document.signin.action = "signin2.html";    
}

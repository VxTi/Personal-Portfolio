

const serverAddress = "http://localhost:8080/";

const minPassLength = 8;
const minLowercaseCount = 1;
const minUppercaseCount = 1;
const minSpecialCount = 1;

const ResponseMessages = {
    emailIncorrectFmt: "Email must be in format name@domain.com",
    passwordTooShort: `Password must be at least ${minPassLength} characters long`,
    passwordTooFewUpper: `Password must contain at least ${minUppercaseCount} uppercase character(s)`,
    passwordTooFewLower: `Password must contain at least ${minLowercaseCount} lowercase character(s)`,
    passwordTooFewSpecial: `Password must contain at least ${minSpecialCount} special character(s)`,
    passwordNotSame: "Please repeat the same password as typed above"
}


// Method which initializes the required functions on load
document.addEventListener("DOMContentLoaded", () => {

    // Get the page data from the meta tag in the document
    let identifier = document.getElementById("page-identifier").dataset.identifier;

    // Check if the retrieved meta-data is of type 'function', if so, call the function.
    if (typeof window[identifier] === "function")
        window[identifier]();
});

/*
 *  Method for initializing the login page's code
 */
function login() {
    console.log("login page loaded");
}

/*
 *  Method for initializing the registration code
 */
function register() {
    document.getElementById("reg-email")
        .addEventListener("input", (event) => {
            let target = document.querySelector(".reg-email-response");
            let valid = Input.isEmail(event.target.value);
            validateUserInput(event.target, valid, true);
            target.innerText = valid ? "" : ResponseMessages.emailIncorrectFmt;
        });
    document.getElementById("reg-password")
        .addEventListener("input", (event) => {
            let passStrength = document.querySelector(".pass-strength");

            let target = document.querySelector(".reg-pass-response");
            let valid = true;

            if (valid && !(valid = !(event.target.value.length < minPassLength)))
                target.innerText = ResponseMessages.passwordTooShort;
            if (valid && !(valid = !(Input.lowercaseCount(event.target.value) < minLowercaseCount)))
                target.innerText = ResponseMessages.passwordTooFewLower;
            if (valid && !(valid = !(Input.uppercaseCount(event.target.value) < minUppercaseCount)))
                target.innerText = ResponseMessages.passwordTooFewUpper;
            if (valid && !(valid = !(Input.specialCharCount(event.target.value) < minSpecialCount)))
                target.innerText = ResponseMessages.passwordTooFewSpecial;
            if (valid)
                target.innerText = "";
            validateUserInput(event.target, valid, true);
        });

    document.getElementById("reg-password-rep")
        .addEventListener("input", (event) => {
            let target = document.querySelector(".reg-pass-rep-response");
            let valid = document.getElementById("reg-password").value === (event.target.value);
            validateUserInput(event.target, valid, event.target.value.length > 0);
            target.innerText = (valid || event.target.value.length === 0) ? "" : ResponseMessages.passwordNotSame;
        })

    let registerButton = document.getElementById("register-button");

    registerButton.addEventListener("click", (event) => attemptRegister(registerButton, event));
    registerButton.addEventListener("touchend", (event) => attemptRegister(registerButton, event));
}

function validateUserInput(element, valid, shouldRender) {
    element.classList.remove('input-box-content-valid', 'input-box-content-invalid');
    if (shouldRender)
        element.classList.add(valid ? 'input-box-content-valid' : 'input-box-content-invalid');
}

async function attemptRegister(element, event) {
    let email = document.getElementById('reg-email').value;
    let pass  = document.getElementById('reg-password').value;
    let result = await postJsonData(`${serverAddress}`, {email: email, password: pass});

}

/*
 | Method for attempting to send a login request.
 */
async function attemptLogin(email, password) {
    return await fetch(serverAddress, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: email, password: password})
    });
}
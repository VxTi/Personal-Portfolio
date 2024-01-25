const serverUrl = "http://localhost:8080";

const Input = {
    isString: (input) => typeof input === "string",
    isEmail: (input) => Input.isString(input) && (/[A-Za-z]+@[A-Za-z]+\.[A-Za-z]+/g).test(input),
    specialCharCount: (input) => (input.match(/[!@#$%^&*()-=_+[\]{};'\\:"|,.<>/?]+/g) || []).length,
    lowercaseCount: (input) => (input.match(/[a-z]+/g) || []).length,
    uppercaseCount: (input) => (input.match(/[A-Z]+/g) || []).length,
    digitCount: (input) => (input.match(/[0-9]+/g) || []).length,
}

/**
 * When the document has loaded, we want to add some nice functionality.
 * Functionality such as, adding clicking functionality to navigator buttons,
 * scrolling functionality to animation elements, etc.
 */
document.addEventListener("DOMContentLoaded", async () => {

    await loadCards(document.getElementById('projects'));

    // Add click functionality to navigator elements
    // If they have a 'scroll-target' property, scroll to said element when clicked (if it exists).
    document.querySelectorAll('.navigator-element').forEach(element => {
        if (element.dataset.hasOwnProperty('scrollTarget')) {
            element.addEventListener('click', () =>
                document.getElementById(element.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth' }));
        }
    });

    // Add the background images for the programming languages.
    document.querySelectorAll('.programming-language').forEach(item => {
        if (item.dataset.hasOwnProperty('image')) {
            item.style.backgroundImage = `url(./assets/images/${item.dataset.image})`;
        }
    })


    // Add the card transform effect.
    document.querySelectorAll('.card').forEach(item => {
        item.onmousemove = (event) => {
            // Whenever we hover over the card, we want to rotate it towards the mouse cursor.
            // This is done by calculating the difference between the mouse cursor and the center of the card.
            // We then use this difference to calculate the angle of the skew.
            let rect = item.getBoundingClientRect();
            let dX = event.clientX - rect.left - rect.width / 2;
            let dY = event.clientY - rect.top - rect.height / 2;
            item.style.setProperty('--card-rotate-x', `${dY / rect.height  * 10}deg`);
            item.style.setProperty('--card-rotate-y', `${dX / rect.width * 10}deg`);
        }
        item.onmouseout = () => {
            item.style.setProperty('--card-rotate-x', `0`);
            item.style.setProperty('--card-rotate-y', `0`);
        };
    });

    addScrollInAnimation('.animate');

    document.querySelectorAll('.back-arrow').forEach((item) =>
        item.onclick = () => window.location.href = item.dataset.href);
});

/**
 * Adds animation functionality for the provided selectors.
 * For more information, see the documentation of the 'checkScrollIn' method.
 * @param {string} selectors The selectors for which to add the functionality to.
 * @see checkScrollIn
 */
function addScrollInAnimation(selectors) {
    let elements = document.querySelectorAll(selectors);
    checkScrollIn(elements);
    document.addEventListener('scroll', (event) => checkScrollIn(elements));
}

/**
 * Checks whether the provided list of elements is visible on screen or not.
 * Method checks for various attributes in HTML elements to determine whether
 * the element should be animated or not.
 * These attributes are as followed:
 * animate-visibility   - The minimum visibility fraction for the element to be animated, relative to the screen height.
 * animate-immediately  - If this tag is present, the element will be animated immediately,
 * continuous-scrolling - Adds continuity to the animation, by setting the scroll percentage to the visibility.
 * reanimate            - Allows animations to replay themselves when re-entering the screen.
 * animation-delay      - The delay in milliseconds before the element is animated.
 *
 * @param {NodeList} selectors The selectors to check for visibility.
 */
function checkScrollIn(selectors) {
    // Check whether the element is in view.
    for (let child of selectors) {
        let rect = child.getBoundingClientRect();

        let animateImmediately = child.dataset.hasOwnProperty('animateImmediately');

        // Check if the element is visible on screen, or it has 'animateImmediately' as a property.
        // If the 'animateImmediately' property is present, it doesn't matter whether the element is visible or not,
        // it'll just execute the animation.
        if (rect.bottom < window.innerHeight || rect.top > 0 || animateImmediately) {

            let minVisibility = 0.0;
            let visibility = (window.innerHeight - rect.bottom) / window.innerHeight;

            // Check whether the property 'animateVisibility' is present.
            // If this is the case, set the required visibility to the value of the property.
            if (child.dataset.hasOwnProperty('animateVisibility'))
                minVisibility = parseFloat(child.dataset.animateVisibility);

            // If the property 'continuousScrolling' is present, set the scroll percentage to the visibility.
            // This allows for continuous scrolling animations.
            if (child.dataset.hasOwnProperty('continuousScrolling'))
                child.style.setProperty('--scroll-percentage', `${visibility}`);


            // Check whether the element is visible enough on screen, based on the visibility fraction
            // If the 'animateImmediately' property is present, it doesn't matter whether the element is visible or not.
            if ((visibility < minVisibility || visibility > 1) && child.dataset.hasOwnProperty('reanimate') && !animateImmediately) {

                // Element is not visible on screen, remove the animation class.
                child.classList.remove('animated');
                child.classList.remove('animation-timed');
                continue;
            }

            // Check if the element has class 'animated' present
            if (!child.classList.contains('animated')) {

                // Check whether the element does not have 'animateImmediately' as a property.
                // If it doesn't, it will be animated with a delay, once the element becomes visible.
                if (!animateImmediately) {

                    // If this is the case, add 'animation-timed' to the class list
                    // and set a timeout to add the 'animated' class
                    if (!child.classList.contains('animation-timed')) {
                        child.classList.add('animation-timed');
                        setTimeout(() => child.classList.add('animated'),
                            child.dataset.hasOwnProperty('animationDelay') ?
                                parseInt(child.dataset.animationDelay) : 0);
                    }
                } else {
                    // Animate immediately when element is loaded
                    child.classList.add('animated');
                }
            }

            // Element is not visible on screen anymore.
        } else {

            // If the element has the attribute 'reanimate', remove the classes when they're not visible
            // anymore. This allows for replaying animations when scrolling back up or down.
            if (child.dataset.hasOwnProperty('reanimate')) {

                // Remove classes for replaying the animation
                child.classList.remove('animated');
                child.classList.remove('animation-timed');
            }
        }
    }
}

/**
 * Loads the cards from the server.
 */
async function loadCards(container) {
    await fetch(`${serverUrl}/api/content`, {
        method: 'POST',
        cors: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: "{\"content\": \"projects\"}"
    })
        .then(res => res.json())
        .then(res => JSON.parse(res).forEach(item => createCard(item, container)))
        .catch(err => {
            createCard({description: "Failed to load projects", title: "Error"}, container);
        });
}

/**
 * Method for creating a new card
 * @param {object} object
 * @param {HTMLElement} destination
 */
function createCard(object, destination) {
    let card = document.createElement('div');

    // Main card element (With image)
    card.classList.add('card');
    card.style.backgroundImage = `url(${object.thumbnail})`;//§ || 'none';
    card.onmouseup = () => window.location.href = object.url || '#';

    // Description of the card (Bottom part)
    let description = document.createElement('span');
    description.classList.add('card-description');
    description.innerText = object.description;

    // Title of the card (Top part)
    let title = document.createElement('span');
    title.classList.add('card-title');
    title.innerText = `${object.title || 'Untitled'}`

    destination.appendChild(card);
    card.appendChild(title);
    card.appendChild(description);
}

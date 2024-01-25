/*
 | Class for referring to an HTMLElement being observed by the Observer class
 */
class Observed {
    element;
    horizontalVisibilityFraction;
    visible;
    _callback;
    constructor(element) {
        this.element = element;
        this.horizontalVisibilityFraction = 0;
        this.visible = false;
    }

    callback(func) {
        this._callback = func;
    }
}

/*
 | Class for observing intersections of HTMLElements in the Window.
 | Another reference element can also be provided for intersection detection.
 */
class Observer {

    #referenceElement;
    _observed = [];

    _dy;

    constructor() {
        document.addEventListener("scroll", () => {
            if (Math.abs(this._dy - (this._dy = window.scrollY)) < 1)
                return;

            for (let i = 0; i < (this._observed || []).length; i++) {
                let observant = this._observed[i];

                let targetBounds = this.#boundaries;
                let elementBounds = observant.element.getBoundingClientRect();

                let vVisibility =
                    (Math.min(targetBounds.bottom, elementBounds.bottom) - Math.max(targetBounds.top, elementBounds.top)) / elementBounds.height;

                // Clamp the value between 0 and 1
                vVisibility = Math.min(1, Math.max(0, 1 - vVisibility));

                observant.visibilityFraction = vVisibility;
                observant._callback(observant);
            }
        });
    }

    // Method for setting the reference element for testing intersection
    set reference(ref) {
        if (!(ref instanceof Element))
            throw new Error("Provided argument is not of type Element");

        this.#referenceElement = ref;
    }

    get #boundaries() {
        return this.#referenceElement != null ?
            this.#referenceElement.getBoundingClientRect() :
            new DOMRect(window.scrollX, window.scrollY, window.innerWidth, window.innerHeight);
    }

    // Method for observing an element
    observe(observer) {
        if (!(observer instanceof Element))
            throw new Error("Provided parameter is not of type Element");

        let product = new Observed(observer);

        this._observed.push(product);
        return product;
    }
}
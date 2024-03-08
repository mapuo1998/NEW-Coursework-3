<template>
    <div class="parent-component">
        <h1 class="app-title">
            <img src="https://afterschoolapp-env.eba-pyudtvba.us-east-1.elasticbeanstalk.com/images/school-icon.svg"
                alt="School Icon" class="school-icon"> After School App
        </h1>
        <div class="main-container">
            <!-- Sorting section on the left -->
            <div class="left-panel">
                <label><b>Sort By:</b></label>
                <!-- Sorting options using radio buttons -->
                <div v-for="sortOpt in sortOpts" :key="sortOpt.value">
                    <input type="radio" :id="sortOpt.id" v-model="selSortAttr" :value="sortOpt.value">
                    <label :for="sortOpt.id">{{ sortOpt.label }}</label>
                </div>
                <label><b>Sort Order:</b></label>
                <!-- Radio buttons -->
                <div>
                    <input type="radio" id="ascSort" v-model="selSortOrder" value="asc">
                    <label for="ascSort">Ascending</label>
                </div>
                <div>
                    <input type="radio" id="descSort" v-model="selSortOrder" value="desc">
                    <label for="descSort">Descending</label>
                </div>
                <div>
                    <a :href="api">
                        <button>API Link</button>
                    </a>
                </div>
            </div>

            <!-- Shopping cart and lessons section -->
            <div class="right-panel">
                <component :is="currentUI"
                    :cartItems="cartItems"
                    @remove="removeFromCart"
                    @checkout="handleCheckout"
                    :api="api"
                    :searchTerm="searchTerm"
                    :lessons="filteredLessons"
                    @add="addToCart"
                    @search="searchTerm = $event"
                    @empty-cart="emptyCart"
                />
                    
                <div class="view-cart">
                    <button @click="toggleCartView" :disabled="!showCart && cartItems.length === 0">
                        {{ showCart ? 'Back to Lessons' : (cartItems.length === 0 ? 'Cart is Empty' : 'View Cart') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CheckoutComponent from './CheckoutComponent.vue';
import ClassesComponent from './ClassesComponent.vue';

export default {
    components: {
        CheckoutComponent,
        ClassesComponent
    },
    data() {
        return {
            sortOpts: [
                { id: "sortTitle", value: "title", label: "Subject" },
                { id: "sortLocation", value: "location", label: "Location" },
                { id: "sortPrice", value: "price", label: "Price" },
                { id: "sortSpaces", value: "spaces", label: "Availability" },
            ],
            api: "https://afterschoolapp-env.eba-pyudtvba.us-east-1.elasticbeanstalk.com/api",
            cartItems: [],
            name: "",
            phone: "",
            nameErr: false,
            phoneErr: false,
            selSortAttr: "title",
            selSortOrder: "asc",
            lessons: [],
            searchTerm: '',
            searchResults: [],
            showCart: false,
            canCheckout: false,
        };
    },
    computed: {
        // filter and sort lessons
        filteredLessons() {
            if (this.searchTerm.trim() !== '') {
                return this.sortLessons(this.searchResults); // use the same sorting logic for searchResults
            }
            return this.sortLessons(this.lessons).filter((lesson) => {
                const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
                return (
                    lesson.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                    lesson.location.toLowerCase().includes(lowerCaseSearchTerm)
                );
            });
        },
        currentUI() {
            return this.showCart ? 'CheckoutComponent' : 'ClassesComponent';
        }
    },
    // fetch classes from the API
    created() {
        this.fetchClasses();
    },
    watch: {
        searchTerm() {
            this.searchClasses();
        }
    },
    methods: {
        // fetch classes from the API
        async fetchClasses() {
            try {
                const response = await fetch(`${this.api}/classes`);
                const data = await response.json();
                console.log("Fetched data:", data);
                this.lessons = data;
            } catch (error) {
                console.error("Error fetching classes:", error);
            }
        },
        async searchClasses() {
            try {
                const response = await fetch(`${this.api}/search?searchFor=${this.searchTerm}`);
                const searchData = await response.json();

                // check if items are already in the cart
                const cartItemTitles = this.cartItems.map(item => item.title);
                this.searchResults = searchData.map(item => {
                    const lastIndex = cartItemTitles.lastIndexOf(item.title);
                    const isInCart = lastIndex !== -1;
                    return isInCart ? this.cartItems[lastIndex] : item;
                });
            } catch (error) {
                console.error('Error searching classes:', error);
            }
        },
        // sort lessons
        sortLessons(lessons) {
            return lessons.slice().sort((a, b) => {
                const attr = this.selSortAttr;
                const order = this.selSortOrder === "asc" ? 1 : -1;

                if (attr === "location") {
                    const numA = parseInt(a.location.match(/\d+/)[0]);
                    const numB = parseInt(b.location.match(/\d+/)[0]);
                    return (numA - numB) * order;
                }

                return (a[attr] < b[attr] ? -1 : 1) * order;
            });
        },
        // add lesson to the cart
        addToCart(lessonInCart) {
            if (lessonInCart.spaces > 0) {
                lessonInCart.spaces -= 1;
                this.cartItems.push({ ...lessonInCart });

                // update the spaces in the lessons array
                this.lessons = this.lessons.map(lessonInLessonsArray => {
                    if (lessonInLessonsArray._id === lessonInCart._id) {
                        return { ...lessonInLessonsArray, spaces: lessonInCart.spaces };
                    }
                    return lessonInLessonsArray;
                });
            }

            this.updateCheckoutButton();
        },
        // remove lesson from cart
        removeFromCart(index) {
            const item = this.cartItems[index];
            this.cartItems.splice(index, 1);
            const lesson = this.lessons.find((lesson) => lesson.title === item.title);
            if (lesson) {
                lesson.spaces += 1;
            }
            this.updateCheckoutButton();
        },
        // empty shopping cart
        emptyCart() {
            for (const item of this.cartItems) {
                const lesson = this.lessons.find((lesson) => lesson.title === item.title);
                if (lesson) {
                    lesson.spaces += 1;
                }
            }
            this.cartItems = [];
            this.updateCheckoutButton();
        },
        // toggle between cart and lessons view
        toggleCartView() {
            this.showCart = !this.showCart;
        },
        // validate name input
        validateName() {
            this.nameErr = !/^[A-Za-z\s]+$/.test(this.name);
            this.updateCheckoutButton();
        },
        // validate phone input
        validatePhone() {
            this.phoneErr = !/^\d+$/.test(this.phone);
            this.updateCheckoutButton();
        },
        // update checkout button
        updateCheckoutButton() {
            this.canCheckout =
                this.name.length > 0 &&
                !this.nameErr &&
                this.phone.length > 0 &&
                !this.phoneErr &&
                this.cartItems.length > 0;
        },
        // checkout process
        handleCheckout(data) {
            this.name = data.name;
            this.phone = data.phone;
            this.checkout();
        },

        async checkout() {
            if (!this.canCheckout || this.canCheckout) {
                const phoneInt = Number(this.phone);

                const orderData = {
                    name: this.name,
                    phone: this.phone,
                    cartItems: this.cartItems.map((item) => ({
                        title: item.title,
                        spaces: item.spaces,
                    })),
                };
                try {
                    const response = await fetch(this.api + "/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(orderData),
                    });

                    if (response.ok) {
                        // call the new PUT route to update spaces
                        await this.updateAvailableSpaces(orderData.cartItems);

                        alert("Thank You for your order, click OK to go the Home page.");
                        location.reload();
                    } else {
                        console.error("Error during checkout:", response.statusText);
                        alert("Error during checkout. Please try again.");
                    }
                } catch (error) {
                    console.error("Error during checkout:", error);
                    alert("Error during checkout. Please try again.");
                }
            }
        },
        // update available spaces in the lessons collection
        async updateAvailableSpaces(cartItems) {
            try {
                for (const cartItem of cartItems) {
                    const lesson = this.lessons.find((l) => l.title === cartItem.title);
                    if (lesson) {
                        lesson.spaces -= cartItem.spaces;
                        if (lesson.spaces < 0) {
                            lesson.spaces = 0;
                        }
                    }
                }

                const orderId = await this.getLatestOrderId();
                const response = await fetch(this.api + `/orders/${orderId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cartItems }),
                });

                if (!response.ok) {
                    console.error("Error updating available spaces:", response.statusText);
                }
            } catch (error) {
                console.error("Error updating available spaces:", error);
            }
        },
        // latest order ID
        async getLatestOrderId() {
            try {
                const response = await fetch(this.api + "/orders");
                const orders = await response.json();
                return orders.length > 0 ? orders[orders.length - 1]._id : null;
            } catch (error) {
                console.error("Error fetching latest order ID:", error);
                return null;
            }
        },
    },
};
</script>
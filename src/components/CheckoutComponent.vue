<template>
    <ol class="cart">
        <div class="checkout">
            <h2>Your Cart</h2>
            <ul>
                <li v-for="(item, index) in cartItems" :key="index">
                    {{ index + 1 }}. {{ item.title }}
                    <button @click="removeFromCart(index)">Remove from Cart</button>
                </li>
            </ul>
            <div>
                <label for="name">Name:</label>
                <input type="text" id="name" v-model="name" placeholder="Enter your name" @input="validateName">
                <p v-if="nameErr" class="error">Name should contain letters only</p>
            </div>
            <div>
                <label for="phone">Phone Number:</label>
                <input type="text" id="phone" v-model="phone" placeholder="Enter your phone number" @input="validatePhone">
                <p v-if="phoneErr" class="error">Phone should contain numbers only</p>
            </div>
            <button @click="checkout" :disabled="!canCheckout" class="checkout-button">Checkout</button>
            <button @click="emptyCart" class="empty-cart-button">Empty Cart</button>
        </div>
    </ol>
</template>
  
<script>
export default {
    data() {
        return {
            name: '',
            phone: '',
            nameErr: false,
            phoneErr: false,
        };
    },
    props: {
        cartItems: {
            type: Array,
            default: () => [],
        },
        name: {
            type: String,
            default: ""
        },
        phone: {
            type: String,
            default: ""
        },
    },
    computed: {
        canCheckout() {
            return (
                this.name.length > 0 &&
                !this.nameErr &&
                this.phone.length > 0 &&
                !this.phoneErr &&
                this.cartItems.length > 0
            );
        },
    },
    methods: {
        removeFromCart(index) {
            this.$emit('remove', index);
        },
        validateName() {
            this.nameErr = !/^[A-Za-z\s]+$/.test(this.name);
        },
        validatePhone() {
            this.phoneErr = !/^\d+$/.test(this.phone);
        },
        checkout() {
            if (this.canCheckout) {
                //event to trigger checkout
                this.$emit('checkout', { name: this.name, phone: this.phone });
            }
        },
        
        emptyCart() {
            // event to empty cart
            this.$emit('empty-cart');
        },
    },
};
</script>
  
<style scoped>
.error {
    color: red;
}
</style>
  
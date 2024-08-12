import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_4TbuOe7CRe0s8XjCh2S8sf9D'); // Default Stripe test key

const TiffinMenu = () => {
    const [items, setItems] = useState([]);
    const [email, setEmail] = useState('');
    const [total, setTotal] = useState(0);
    const stripe = useStripe();
    const elements = useElements();

    const handleOrder = async (event) => {
        event.preventDefault();
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });
        if (!error) {
            try {
                const { data } = await axios.post('http://localhost:5000/api/order', {
                    items,
                    email,
                    payment_method: paymentMethod.id,
                });
                console.log('Order successful', data);
                alert('Order placed successfully!');
            } catch (error) {
                console.error('Error placing order', error.response?.data || error);
                alert(`Error placing order: ${error.response?.data?.error || error.message}`);
            }
        } else {
            console.error('Stripe error:', error);
            alert(`Payment error: ${error.message}`);
        }
    };

    const addItem = (item) => {
        setItems([...items, item]);
        setTotal(total + item.price);
    };

    return (
        <div>
            <h1>Tiffin Menu</h1>
            <div>
                <button onClick={() => addItem({ name: 'Veg Meal', price: 100 })}>Add Veg Meal - $100</button>
                <button onClick={() => addItem({ name: 'Non-Veg Meal', price: 150 })}>Add Non-Veg Meal - $150</button>
            </div>
            <h2>Total: ${total}</h2>
            <form onSubmit={handleOrder}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <CardElement />
                <button type="submit" disabled={!stripe}>
                    Pay
                </button>
            </form>
        </div>
    );
};

const App = () => (
    <Elements stripe={stripePromise}>
        <TiffinMenu />
    </Elements>
);

export default App;

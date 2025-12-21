
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

type PaymentMethod = 'credit_card' | 'crypto';

const CheckoutPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { plan, price } = location.state || { plan: 'Pro', price: 20 };
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');

    const handlePayment = () => {
        // In a real app, this would trigger the payment processing logic
        // with Stripe, Coinbase Commerce, etc.
        // For now, we simulate a successful payment and redirect.
        alert(`Payment successful for ${plan} plan!`);
        if(user?.role === 'Property Owner') {
            navigate('/dashboard');
        } else if (user?.role === 'Material Supplier') {
            navigate('/supplier-dashboard');
        } else {
            navigate('/');
        }
    }

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            <Header />
            <main className="container mx-auto px-6 py-10 flex-grow flex justify-center items-center">
                <div className="w-full max-w-3xl">
                    <Card>
                        <h1 className="text-3xl font-bold text-white text-center mb-2">Checkout</h1>
                        <p className="text-gray-400 text-center mb-8">Complete your subscription to unlock premium features.</p>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Payment Details */}
                            <div>
                                <h2 className="text-xl font-semibold text-brand-gold mb-4">Payment Method</h2>
                                <div className="space-y-3">
                                    <button onClick={() => setPaymentMethod('credit_card')} className={`w-full text-left p-4 rounded-lg border-2 flex items-center gap-4 ${paymentMethod === 'credit_card' ? 'border-brand-gold bg-brand-gold/10' : 'border-gray-600'}`}>
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                                        <span>Credit Card</span>
                                    </button>
                                     <button onClick={() => setPaymentMethod('crypto')} className={`w-full text-left p-4 rounded-lg border-2 flex items-center gap-4 ${paymentMethod === 'crypto' ? 'border-brand-gold bg-brand-gold/10' : 'border-gray-600'}`}>
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.14-5.86l2.14-2.14 2.14 2.14 1.41-1.41-2.14-2.14 2.14-2.14-1.41-1.41-2.14 2.14-2.14-2.14-1.41 1.41 2.14 2.14-2.14 2.14z"/></svg>
                                        <span>Tether (USDT)</span>
                                    </button>
                                </div>

                                {paymentMethod === 'credit_card' && (
                                    <div className="mt-6 space-y-4">
                                        <Input label="Card Number" id="cardNumber" placeholder="0000 0000 0000 0000" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Expiry Date" id="expiry" placeholder="MM/YY" />
                                            <Input label="CVC" id="cvc" placeholder="123" />
                                        </div>
                                        <Input label="Name on Card" id="cardName" placeholder="John Doe" />
                                    </div>
                                )}
                                {paymentMethod === 'crypto' && (
                                    <div className="mt-6 p-4 bg-brand-dark rounded-lg text-center">
                                        <h3 className="text-lg font-semibold text-brand-light mb-2">Pay with Tether (USDT)</h3>
                                        <p className="text-gray-400 text-sm mb-3">Send the exact amount to the wallet address below. Use the TRC-20 Network.</p>
                                        <div className="w-32 h-32 bg-white p-2 rounded-md mx-auto mb-3">
                                            {/* QR Code Placeholder */}
                                            <div className="w-full h-full bg-gray-300"></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-1">WALLET ADDRESS</p>
                                        <p className="font-mono text-sm break-all bg-brand-gray p-2 rounded">TAbCDeFgHiJkLmNoPqRsTuVwXyZ123456</p>
                                    </div>
                                )}
                            </div>
                            {/* Order Summary */}
                            <div className="bg-brand-gray p-6 rounded-lg">
                                <h2 className="text-xl font-semibold text-brand-gold mb-6 border-b border-gray-700 pb-4">Order Summary</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-300">
                                        <span>Plan:</span>
                                        <span className="font-semibold">{plan}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-300">
                                        <span>Billing Cycle:</span>
                                        <span className="font-semibold">Monthly</span>
                                    </div>
                                    <div className="flex justify-between text-gray-300">
                                        <span>Price:</span>
                                        <span className="font-semibold">${price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-300">
                                        <span>Tax (Est.):</span>
                                        <span className="font-semibold">$0.00</span>
                                    </div>
                                    <div className="border-t border-gray-700 my-4"></div>
                                    <div className="flex justify-between text-white text-xl font-bold">
                                        <span>Total:</span>
                                        <span>${price.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button onClick={handlePayment} className="w-full mt-8">Confirm and Pay ${price.toFixed(2)}</Button>
                                <p className="text-xs text-gray-500 mt-4 text-center">By clicking, you agree to our Terms of Service. Subscriptions automatically renew.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default CheckoutPage;

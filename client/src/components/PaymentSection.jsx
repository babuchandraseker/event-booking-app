import { useState } from 'react';

export default function PaymentSection() {
  const [paymentId, setPaymentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    const options = {
      key: 'rzp_test_YourTestKeyHere', // Replace with your Razorpay test key
      amount: 179900, // 30% of ₹5,999 = ₹1,799 in paise
      currency: 'INR',
      name: 'WonderOne-Suprises',
      description: 'Event Booking Advance (30%)',
      image: '/themes/romantic/romantic1.jpg',
      handler: function (response) {
        setPaymentId(response.razorpay_payment_id);
        setLoading(false);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#c9a84c'
      },
      modal: {
        ondismiss: () => setLoading(false)
      }
    };

    if (!window.Razorpay) {
      // Dynamically load Razorpay script if not present
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        setLoading(false);
        alert('Could not load payment gateway. Please try again.');
      };
      document.body.appendChild(script);
    } else {
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  };

  return (
    <div className="payment-section" style={{ marginTop: '16px' }}>
      {paymentId ? (
        <div style={{
          background: 'rgba(50,200,100,0.1)',
          border: '1px solid rgba(50,200,100,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '16px'
        }}>
          ✅ Payment successful! ID: <strong style={{ color: 'var(--gold)' }}>{paymentId}</strong>
        </div>
      ) : null}
      <button
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '14px 32px', opacity: loading ? 0.7 : 1 }}
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? '⏳ Opening Payment…' : '💳 Pay ₹1,799 Advance (Razorpay)'}
      </button>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
        Secure payment via Razorpay · Test mode
      </p>
    </div>
  );
}

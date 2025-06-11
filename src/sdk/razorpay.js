// Load Razorpay SDK
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v2/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Initialize payment
export const initializeRazorpayPayment = async ({
  amount,
  currency = "INR",
  name,
  description,
  orderId,
  email,
  contact,
}) => {
  const res = await loadRazorpayScript();

  if (!res) {
    return {
      status: false,
      error: {
        code: "SCRIPT_LOAD_ERROR",
        description: "Razorpay SDK failed to load. Please check your internet connection."
      }
    };
  }

  return new Promise((resolve) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100, // Amount in smallest currency unit (paise for INR)
      currency,
      name,
      description,
      order_id: orderId,
      prefill: {
        name,
        email,
        contact,
      },
      theme: {
        color: "#4338CA",
      },
      handler: function (response) {
        // This function will be called on successful payment
        console.log("Payment successful:", response);
        resolve({
          status: true,
          data: {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          }
        });
      },
      modal: {
        ondismiss: function() {
          // This function will be called when user closes the payment modal
          console.log("Payment modal closed by user");
          resolve({
            status: false,
            error: {
              code: "PAYMENT_CANCELLED",
              description: "Payment was cancelled by the user"
            }
          });
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    
    paymentObject.on("payment.failed", function (response) {
      console.log("Payment failed:", response.error);
      resolve({
        status: false,
        error: {
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason
        }
      });
    });

    // Open Razorpay modal
    try {
      paymentObject.open();
    } catch (error) {
      console.error("Error opening Razorpay:", error);
      resolve({
        status: false,
        error: {
          code: "RAZORPAY_OPEN_ERROR",
          description: "Failed to open payment modal"
        }
      });
    }
  });
};

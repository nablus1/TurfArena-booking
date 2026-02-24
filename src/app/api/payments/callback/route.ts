export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📥 M-Pesa Callback Received:", JSON.stringify(body, null, 2));

    // Safaricom returns the result inside ResultCode
    const resultCode = body?.Body?.stkCallback?.ResultCode;
    const checkoutRequestID = body?.Body?.stkCallback?.CheckoutRequestID;

    if (resultCode === 0) {
      console.log("✅ Payment Successful:", checkoutRequestID);

      // TODO: update database booking set as paid
    } else {
      console.log("❌ Payment Failed:", resultCode);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Callback error:", error);
    return new Response("Error", { status: 500 });
  }
}

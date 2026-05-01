const SECRET_KEY = process.env.KHIPU_SECRET_KEY || ""
const API_URL = process.env.KHIPU_API_URL || "https://payment-api.khipu.com/v3/payments"

export interface CreateKhipuPaymentResult {
  paymentUrl: string
  paymentId: string
}

export async function createKhipuPayment({
  amount,
  subject,
  appointmentId,
  payerName,
  payerEmail,
  returnUrl,
  cancelUrl,
  notifyUrl,
}: {
  amount: number
  subject: string
  appointmentId: string
  payerName?: string
  payerEmail?: string
  returnUrl: string
  cancelUrl: string
  notifyUrl?: string
}): Promise<CreateKhipuPaymentResult> {
  const transactionId = `T${Date.now()}${Math.random().toString(36).substring(2, 9)}`

  const payload: Record<string, unknown> = {
    amount,
    currency: "CLP",
    subject,
    transaction_id: transactionId,
    custom: appointmentId,
    return_url: returnUrl,
    cancel_url: cancelUrl,
  }

  if (payerName) payload.payer_name = payerName
  if (payerEmail) payload.payer_email = payerEmail
  if (notifyUrl) payload.notify_url = notifyUrl

  console.log("[khipu] creating payment:", { amount, subject, transactionId })

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SECRET_KEY,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("[khipu] API error:", response.status, error)
    throw new Error(`Khipu API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  console.log("[khipu] payment created:", data.payment_id)

  return {
    paymentUrl: data.payment_url,
    paymentId: data.payment_id,
  }
}

export async function getKhipuPaymentStatus(paymentId: string): Promise<"pending" | "verifying" | "done" | "failed"> {
  try {
    const response = await fetch(`${API_URL}/${paymentId}`, {
      headers: { "x-api-key": SECRET_KEY },
    })
    if (!response.ok) return "failed"
    const data = await response.json()
    return data.status ?? "failed"
  } catch {
    return "failed"
  }
}

export function verifyKhipuSignature(
  rawBody: string,
  signature: string
): boolean {
  const crypto = require("crypto")
  const hmac = crypto.createHmac("sha256", SECRET_KEY)
  hmac.update(rawBody)
  const expected = hmac.digest("base64")
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

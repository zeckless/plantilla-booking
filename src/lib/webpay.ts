import {
  WebpayPlus,
  Environment,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Options,
} from "transbank-sdk"

const commerceCode =
  process.env.WEBPAY_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS
const apiKey = process.env.WEBPAY_API_KEY || IntegrationApiKeys.WEBPAY
const env =
  process.env.WEBPAY_ENV === "production"
    ? Environment.Production
    : Environment.Integration

export const webpay = new WebpayPlus.Transaction(
  new Options(commerceCode, apiKey, env)
)

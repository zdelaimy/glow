declare module 'braintree-web-drop-in' {
  interface DropinCreateOptions {
    authorization: string
    container: HTMLElement | string
    card?: {
      overrides?: {
        styles?: Record<string, Record<string, string>>
      }
    }
  }

  export interface DropinInstance {
    requestPaymentMethod(): Promise<{ nonce: string; type: string }>
    teardown(): Promise<void>
  }

  export function create(options: DropinCreateOptions): Promise<DropinInstance>
}

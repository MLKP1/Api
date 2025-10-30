export class UnableToSendEmailError extends Error {
  constructor() {
    super('Unable to send email.')
  }
}
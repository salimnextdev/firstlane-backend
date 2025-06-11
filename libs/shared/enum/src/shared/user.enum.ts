export enum RideStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELIVERED = 'delivered',
  
  CANCELED = 'canceled',
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PENDING = 'pending',
}

export enum RideType {
  PICKUP = 'pickup',
  DISPATCH = 'dispatch',
  RIDE = 'ride',
}

export enum UserType {
  USER = 'user',
  Rider = 'rider',
  ADMIN = 'admin',
}

export enum OtpType {
  EMAIL_VERIFICATION = 'EmailVerification',
  PASSWORD_RESET = 'PasswordReset',
  TWO_FACTOR_AUTHENTICATION = '2FA',
}

export enum OtpChannel {
EMAIL = 'email',
SMS = 'sms',
}




export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}




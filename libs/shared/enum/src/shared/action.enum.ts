export enum Action {
  Manage = 'Manage',
  Create = 'Create',
  Read = 'Read',
  Update = 'Update',
  Delete = 'Delete',
  Event = 'Event',

  // Delete = 'delete',
  // Delete = 'delete',
}
// ['pending', 'active', 'completed', 'cancelled'] 
export enum InvestmentType {
  SHORT_TERM = 'short-term',
  LONG_TERM = 'long-term',
  FIXED_DEPOSIT = 'fixed-deposit',
  SAVINGS = 'savings',
  RETIREMENT = 'retirement',
}

export enum RepaymentInterval{  
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  

}

export enum RepaymentIntervalIDays{  

"thirty" = "30",
  "sixty" = "60",
  "ninety" = "90",
  "one-eighty" = "180",
  "three-sixty-five" = "365",
  
  


}

export enum InvestmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  
}

export enum LoanStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  APPROVED = 'approved',
  PREAPPROVE = 'pre-approve',
  REJECTED = 'rejected',
  PAID = 'paid',
  OVERDUE = 'overdue',
  UNDERWRITING = 'underwriting',
  DISBURSED = 'disbursed',
}
export enum LoanType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  EMPLOYEE = 'employee',
  ASSETFINANCE = 'asset-finance',
}

export enum UserInvestmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  
}
export enum AppTypeEnum {
  LOAN = 'loan',
  INVESTMENT = 'investment',
  
}





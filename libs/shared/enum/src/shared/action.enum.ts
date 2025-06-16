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


export enum InvestmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  
}

export enum UserInvestmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  
}



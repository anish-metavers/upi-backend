export const AccessConfig = {
  READ_ACCESS: 'Read User',
  CREATE_ACCESS: 'Create User',
  UPDATE_ACCESS: 'Update User',
  DELETE_ACCESS: 'Delete User',
};

export const ErrorConfig = {
  INTERNAL_SERVER_ERROR: {
    errorCode: 'E-0001',
    message: 'Something went wrong on our End',
  },

  API_BODY_BASIC_VALIDATION: {
    errorCode: 'E-0002',
  },

  EMAIL_NOT_FOUND: {
    errorCode: 'E-0010',
    message: 'No User found with this Email!!',
  },

  INVALID_EMAIL_PASSWORD: {
    errorCode: 'E-0011',
    message: 'Incorrect Email Address OR Password!!',
  },

  PASSWORD_VALIDATION_FAILED: { errorCode: 'E-0012' },

  USER_ALREADY_EXISTS: {
    errorCode: 'E-0013',
    message: 'User Already Exist with this Email!!',
  },

  CONFIRM_PASS_NOT_MATCH: {
    errorCode: 'E-0014',
    message: 'New Password and Confirm Password does not match',
  },

  INVALID_OLD_PASS: {
    errorCode: 'E-0015',
    message: 'Invalid Old Password',
  },

  NEW_PASS_CURRENT_PASS_MUST_DIFFERENT: {
    errorCode: 'E-0016',
    message: 'New Password must not be same as your Current Password!!',
  },

  BET_GREATER_THAN_ZERO: {
    errorCode: 'E-0020',
    message: 'Bet Amount must be greater than Zero.',
  },

  GAME_NOT_FOUND_OR_BETTING_CLOSED: {
    errorCode: 'E-0021',
    message: 'No Game Found Or Betting Closed.',
  },

  NOT_ENOUGH_BALANCE: {
    errorCode: 'E-0022',
    message: 'Not Enough Balance',
  },

  NO_TOKEN_FOUND: {
    errorCode: 'E-0030',
    message: 'Unauthenticated, no token found',
  },

  NO_USER_FOUND: {
    errorCode: 'E-0031',
    message: 'No User Found!!',
  },

  INVALID_TOKEN: {
    errorCode: 'E-0032',
    message: 'Invalid Token or Token Expired!!',
  },

  BANK_NOT_FOUND: {
    errorCode: 'E-0041',
    message: 'Bank Account not Found!!',
  },

  BANK_ALREADY_EXIST: {
    errorCode: 'E-0042',
    message: 'Bank Account already Exist!!',
  },
  GAME_CLIENT_TOKEN_NOT_FOUND: {
    errorCode: 'E-0045',
    message: 'Unauthenticated, no game client token found',
  },
  GAME_CLIENT_TOKEN_INVALID: {
    errorCode: 'E-0043',
    message: 'Game Client Token Invalid!!',
  },
  GAME_CLIENT_SECRET_INVALID: {
    errorCode: 'E-0044',
    message: 'Secret invalid!! State your origin you imposter!!',
  },
};

export const GameTypeConfig = {
  REGULAR_TEEN_PATTI: 'Regular Teen Patti',
  MUFLISS_TEEN_PATTI: 'Mufliss Teen Patti',
  AK47_TEEN_PATTI: 'AK47 Teen Patti',
  ONE_DAY_DRAGON: 'One Day Dragon',
  ROULETTE_GAME: 'Roulette Game',
};

export const ROULETTE_GAME_OPTIONS_ALL = {
  ['Column 1']: 0,
  ['Column 2']: 0,
  ['Column 3']: 0,
  ['Dozen 1']: 0,
  ['Dozen 2']: 0,
  ['Dozen 3']: 0,
  ['Even']: 0,
  ['Odd']: 0,
  ['Black']: 0,
  ['Red']: 0,
  ['First Eighteen']: 0,
  ['Second Eighteen']: 0,
  ['Single']: 1,
  ['Split']: 2,
  ['Triple']: 3,
  ['Four Way']: 4,
  ['Six Way']: 6,
};

export const ROULETTE_GAME_OPTIONS_DECLARABLE = {
  ['Column 1']: 0,
  ['Column 2']: 0,
  ['Column 3']: 0,
  ['Dozen 1']: 0,
  ['Dozen 2']: 0,
  ['Dozen 3']: 0,
  ['Even']: 0,
  ['Odd']: 0,
  ['Black']: 0,
  ['Red']: 0,
  ['First Eighteen']: 0,
  ['Second Eighteen']: 0,
};

export const ROULETTE_GAME_OPTIONS_NON_DECLARABLE = {
  ['Single']: 1,
  ['Split']: 2,
  ['Triple']: 3,
  ['Four Way']: 4,
  ['Six Way']: 6,
};

export const PAGINATION = {
  LIMIT: 0,
  PAGE: 1,
};

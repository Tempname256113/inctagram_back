export enum USER_ERRORS {
  NOT_FOUND = 'User not found',
  EMAIL_OR_PASSWORD_INCORRECT = 'The email or password are incorrect. Try again please',
  PASSWORD_MUST_CONTAIN_SPECIAL_SYMBOLS = 'Password must contain 0-9, a-z, A-Z, ! " # $ % &\n\' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _` { | } ~',
}

export enum CHANGE_PASSWORD_REQUEST_ERRORS {
  NOT_FOUND = 'Change password request not found',
}

export enum AUTH_ERRORS {
  PASSWORD_TOKEN_EXPIRED = 'Password token expired',
}

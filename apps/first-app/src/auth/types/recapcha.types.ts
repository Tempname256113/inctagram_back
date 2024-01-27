export type RecaptchaResponseType =
  | {
      success: true;
      challenge_ts: Date | string;
      hostname: string;
    }
  | {
      success: false;
      'error-codes': Array<string>;
    };
